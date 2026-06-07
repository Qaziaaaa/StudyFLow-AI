import { Router, Request, Response } from "express";
import { callGroq, GroqApiError, GROQ_SYSTEM_PROMPT } from "../groqClient";
import { isValidGroqResponse } from "../validation";
import { computePriority } from "../priorityEngine";
import { buildSchedule } from "../scheduleBuilder";
import type { StudyPlan } from "@studyflow/shared";

export const generatePlanRouter = Router();

function isNonBlankString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isValidISODate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const ts = Date.parse(value);
  if (isNaN(ts)) return false;
  const d = new Date(ts);
  const [year, month, day] = value.split("-").map(Number);
  return d.getUTCFullYear() === year && d.getUTCMonth() + 1 === month && d.getUTCDate() === day;
}

/**
 * Detects gibberish input. Returns true if the text looks like real content.
 * Checks: minimum meaningful word count, not all same characters, not random keysmash.
 */
function isMeaningfulText(text: string): boolean {
  const cleaned = text.trim();
  if (cleaned.length < 8) return false;

  // Must have at least 2 words that are 3+ characters
  const realWords = cleaned.split(/\s+/).filter(w => /[a-zA-Z]{3,}/.test(w));
  if (realWords.length < 2) return false;

  // Reject if more than 60% of characters are repeated (e.g. "aaaaaaa", "jdjdjdjd")
  const charFreq: Record<string, number> = {};
  for (const ch of cleaned.toLowerCase()) charFreq[ch] = (charFreq[ch] || 0) + 1;
  const maxFreq = Math.max(...Object.values(charFreq));
  if (maxFreq / cleaned.length > 0.5) return false;

  // Reject known test/junk patterns
  const junkPatterns = /^(test|jojo|asdf|qwer|zxcv|lorem|foo|bar|baz|aaa|bbb|xxx|lol|wtf|idk)\b/i;
  if (junkPatterns.test(cleaned)) return false;

  return true;
}

generatePlanRouter.post("/generate-plan", async (req: Request, res: Response): Promise<void> => {
  const { title, description, dueDate, subject, wordCount, assignmentType } = req.body ?? {};

  // ── 1. Basic field validation ──
  const invalidFields: string[] = [];
  if (!isNonBlankString(title)) invalidFields.push("title");
  if (!isNonBlankString(description)) invalidFields.push("description");
  if (!isNonBlankString(dueDate) || !isValidISODate(dueDate)) invalidFields.push("dueDate");

  if (invalidFields.length > 0) {
    res.status(400).json({ error: "Validation failed", fields: invalidFields, code: "validation_failed" });
    return;
  }

  // ── 2. Junk input detection (before wasting an API call) ──
  const titleOk = isMeaningfulText(title as string);
  const descOk = isMeaningfulText(description as string);

  if (!titleOk || !descOk) {
    res.status(400).json({
      error: !titleOk
        ? "Your assignment title doesn't look like a real assignment. Please describe what you're actually working on."
        : "Your description is too vague. Tell us what the assignment actually requires — topic, type, requirements.",
      code: "junk_input",
      fields: !titleOk ? ["title"] : ["description"],
    });
    return;
  }

  // ── 3. Build a rich user message with all available context ──
  const contextLines: string[] = [
    `Assignment title: ${title}`,
    `Description: ${description}`,
    `Due date: ${dueDate}`,
  ];
  if (subject) contextLines.push(`Subject: ${subject}`);
  if (assignmentType) contextLines.push(`Assignment type: ${assignmentType}`);
  if (wordCount && wordCount > 0) contextLines.push(`Expected word count: ${wordCount} words`);

  const userMessage = contextLines.join("\n");

  // ── 4. Call Groq ──
  try {
    const { rawText } = await callGroq({
      model: "llama-3.3-70b-versatile",
      systemPrompt: GROQ_SYSTEM_PROMPT,
      userMessage,
    });

    let parsed: unknown;
    try {
      parsed = JSON.parse(rawText);
    } catch {
      res.status(502).json({ error: "AI returned an unreadable response. Please try again.", code: "upstream_error" });
      return;
    }

    if (!isValidGroqResponse(parsed)) {
      res.status(502).json({ error: "AI response didn't match expected format. Please try again.", code: "upstream_error" });
      return;
    }

    const priority = computePriority(dueDate as string);
    const schedule = buildSchedule(parsed.tasks, dueDate as string);

    const studyPlan: StudyPlan = {
      summary: parsed.summary,
      difficulty: parsed.difficulty,
      priority,
      tasks: parsed.tasks,
      schedule,
    };

    res.status(200).json({ studyPlan });
  } catch (err) {
    if (err instanceof GroqApiError) {
      console.error("[generatePlan] GroqApiError:", err.statusCode, err.message);
      res.status(502).json({ error: "Could not reach the AI service. Please try again.", code: "upstream_error" });
      return;
    }
    console.error("[generatePlan] Unexpected error:", err);
    res.status(500).json({ error: "Something went wrong on our end. Please try again.", code: "server_error" });
  }
});
