import { Router, Request, Response } from "express";
import { callGroq, GroqApiError, GROQ_SYSTEM_PROMPT } from "../groqClient";
import { isValidGroqResponse } from "../validation";
import { computePriority } from "../priorityEngine";
import { buildSchedule } from "../scheduleBuilder";
import type { StudyPlan } from "@studyflow/shared";

export const generatePlanRouter = Router();

/**
 * Validates a value is a present, non-empty, non-whitespace string.
 */
function isNonBlankString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

/**
 * Validates that a string is a valid ISO 8601 date (YYYY-MM-DD).
 * Uses Date.parse on the normalised string and checks the result is not NaN.
 */
function isValidISODate(value: string): boolean {
  // Must match YYYY-MM-DD format exactly
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }
  const ts = Date.parse(value);
  if (isNaN(ts)) {
    return false;
  }
  // Round-trip check: reconstruct the date and confirm it matches the input
  // (catches things like 2024-02-30 which parse but aren't real dates)
  const d = new Date(ts);
  const [year, month, day] = value.split("-").map(Number);
  return (
    d.getUTCFullYear() === year &&
    d.getUTCMonth() + 1 === month &&
    d.getUTCDate() === day
  );
}

/**
 * POST /generate-plan
 *
 * Request body: { title, description, dueDate }
 * Success: 200 { studyPlan: StudyPlan }
 * Validation failure: 400 { error, fields }
 * Groq upstream error: 502 { error }
 * Unexpected error: 500 { error }
 */
generatePlanRouter.post(
  "/generate-plan",
  async (req: Request, res: Response): Promise<void> => {
    // ── 1. Validate request body ──────────────────────────────────────────
    const { title, description, dueDate } = req.body ?? {};

    const invalidFields: string[] = [];

    if (!isNonBlankString(title)) {
      invalidFields.push("title");
    }
    if (!isNonBlankString(description)) {
      invalidFields.push("description");
    }
    if (!isNonBlankString(dueDate) || !isValidISODate(dueDate)) {
      invalidFields.push("dueDate");
    }

    if (invalidFields.length > 0) {
      res.status(400).json({
        error: "Validation failed",
        fields: invalidFields,
      });
      return;
    }

    // ── 2. Call Groq API ──────────────────────────────────────────────────
    try {
      const userMessage = `Title: ${title}\nDescription: ${description}\nDue date: ${dueDate}`;

      const { rawText } = await callGroq({
        model: "llama-3.3-70b-versatile",
        systemPrompt: GROQ_SYSTEM_PROMPT,
        userMessage,
      });

      // ── 3. Parse the raw JSON response ───────────────────────────────────
      let parsed: unknown;
      try {
        parsed = JSON.parse(rawText);
      } catch {
        res.status(502).json({
          error: "Groq API returned unparseable response",
        });
        return;
      }

      // ── 4. Validate response schema ──────────────────────────────────────
      if (!isValidGroqResponse(parsed)) {
        res.status(502).json({
          error: "Groq API response did not match expected study plan schema",
        });
        return;
      }

      // ── 5. Enrich with priority and schedule ─────────────────────────────
      const priority = computePriority(dueDate);
      const schedule = buildSchedule(parsed.tasks, dueDate);

      const studyPlan: StudyPlan = {
        summary: parsed.summary,
        difficulty: parsed.difficulty,
        priority,
        tasks: parsed.tasks,
        schedule,
      };

      // ── 6. Return success ────────────────────────────────────────────────
      res.status(200).json({ studyPlan });
    } catch (err) {
      // Groq returned a non-2xx HTTP status
      if (err instanceof GroqApiError) {
        console.error("[generatePlan] GroqApiError:", err.statusCode, err.message);
        res.status(502).json({
          error: `Upstream Groq API error: ${err.statusCode ?? "unknown status"}`,
        });
        return;
      }

      // Unexpected error — log it server-side, never leak internals to client
      console.error("[generatePlan] Unexpected error:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);
