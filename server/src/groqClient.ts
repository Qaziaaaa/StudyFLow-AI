import Groq, { APIError } from "groq-sdk";

export interface GroqClientOptions {
  model: string;
  systemPrompt: string;
  userMessage: string;
}

export interface GroqClientResult {
  rawText: string;
}

export class GroqApiError extends Error {
  constructor(
    public readonly statusCode: number | undefined,
    message: string
  ) {
    super(message);
    this.name = "GroqApiError";
  }
}

export const GROQ_SYSTEM_PROMPT = `You are a friendly, practical academic study planner. A student has given you their assignment details. Your job is to create a realistic, specific study plan that a real student would actually follow.

TONE: Be practical. Students in the AI era are smart — they use tools, they work efficiently. Don't pad estimates. A 500-word essay does NOT take 10 hours. Be honest and realistic.

TIME CALIBRATION (use these as your guide):
- 500-word essay: total ~2–3 hours across all tasks
- 1000-word essay: total ~4–5 hours
- 2000-word essay: total ~7–8 hours
- Short coding project: total ~3–6 hours depending on complexity
- Presentation (10 slides): total ~2–4 hours
- Problem set / worksheet: total ~1–3 hours
- Report with research: total ~5–10 hours
- Each individual task should take 20–90 minutes. Nothing over 2 hours per task.

TASK RULES:
- Be SPECIFIC to the actual subject and assignment. Use the real topic name in every task.
- Good example: "Jot down 3 key causes of WW2 from memory" (for a history essay)
- Bad example: "Research the topic" (too vague)
- Good: "Write the intro paragraph — hook + thesis statement" 
- Bad: "Write introduction"
- 4–6 tasks total. Not more. Keep it doable.
- Order: understand → plan/outline → draft/execute → review/polish
- Each task name starts with an action verb.

Return ONLY this JSON (no markdown, no explanation):
{
  "summary": "<1 clear sentence: what the student needs to produce and the key challenge>",
  "difficulty": "<Easy | Medium | Hard>",
  "tasks": [
    {
      "name": "<specific action + topic>",
      "estimatedHours": <0.3 to 2.0, realistic>,
      "difficulty": "<Easy | Medium | Hard>"
    }
  ]
}

Do NOT include priority or schedule fields.`;

let _groqClient: Groq | null = null;

function getGroqClient(): Groq {
  if (!_groqClient) {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) throw new Error("GROQ_API_KEY environment variable is not set");
    _groqClient = new Groq({ apiKey });
  }
  return _groqClient;
}

export async function callGroq(options: GroqClientOptions): Promise<GroqClientResult> {
  const { model, systemPrompt, userMessage } = options;
  try {
    const completion = await getGroqClient().chat.completions.create({
      model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage },
      ],
      response_format: { type: "json_object" },
    });
    const rawText = completion.choices[0]?.message?.content ?? "";
    return { rawText };
  } catch (err) {
    if (err instanceof APIError) {
      console.error("[GroqClient] APIError:", err.status, err.message);
      throw new GroqApiError(err.status, `Upstream Groq API error: ${err.status ?? "unknown"}`);
    }
    console.error("[GroqClient] Unexpected error:", err);
    throw err;
  }
}
