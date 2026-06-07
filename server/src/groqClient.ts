import Groq, { APIError } from "groq-sdk";

export interface GroqClientOptions {
  model: string;
  systemPrompt: string;
  userMessage: string;
}

export interface GroqClientResult {
  rawText: string;
}

/**
 * Typed error thrown when the Groq API returns a non-2xx response.
 */
export class GroqApiError extends Error {
  constructor(
    public readonly statusCode: number | undefined,
    message: string
  ) {
    super(message);
    this.name = "GroqApiError";
  }
}

/**
 * System prompt that instructs the Llama 3 model to respond with a JSON object
 * matching the prompt schema contract used by the StudyFlow backend.
 *
 * The backend fills `priority` and `schedule` after parsing this response, so
 * the model is not asked to produce those fields.
 */
export const GROQ_SYSTEM_PROMPT = `You are an expert academic study planner. Your job is to read a student's assignment details and produce a concrete, subject-specific study plan.

IMPORTANT — Input quality rules:
- If the title or description is gibberish, too short (under 10 meaningful characters), or clearly not a real assignment (e.g. "jojo", "sdjsd", "test"), respond with a summary that says: "The assignment details provided are too vague to generate a meaningful study plan. Please enter a real assignment title and description." and return exactly 3 generic tasks named "Re-read the assignment brief", "Clarify requirements with your instructor", "Draft an initial plan". Set difficulty to "Easy".
- Otherwise, generate a fully specific plan tailored to the actual subject matter.

The JSON object MUST conform exactly to this schema:
{
  "summary": "<1–2 sentences describing specifically what this assignment requires the student to produce, in plain language>",
  "difficulty": "<exactly one of: Easy | Medium | Hard>",
  "tasks": [
    {
      "name": "<specific, actionable task directly related to this assignment — e.g. 'Research causes of World War 1', 'Write the introduction paragraph', 'Solve practice integration problems'>",
      "estimatedHours": <realistic number: 0.5 to 3>,
      "difficulty": "<exactly one of: Easy | Medium | Hard>"
    }
  ]
}

Task quality rules:
- Tasks must be SPECIFIC to the assignment subject — never generic like "Read Description" or "Analyze Requirements"
- Use the actual topic in task names: e.g. "Research the French Revolution", not "Research the topic"
- 4 to 7 tasks, each representing one focused study session of 0.5–3 hours
- Tasks should follow a logical order: research → outline → draft → revise → review
- Each task name starts with an action verb

Output rules:
- Return ONLY the raw JSON object — no markdown fences, no explanation
- "difficulty", "tasks[].difficulty" must be exactly "Easy", "Medium", or "Hard"
- Do NOT include "priority" or "schedule" fields`;

// Lazily initialised Groq SDK client so the module can be imported in tests
// without requiring GROQ_API_KEY to be present at import time.
let _groqClient: Groq | null = null;

function getGroqClient(): Groq {
  if (!_groqClient) {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      throw new Error("GROQ_API_KEY environment variable is not set");
    }
    _groqClient = new Groq({ apiKey });
  }
  return _groqClient;
}

/**
 * Calls the Groq API with `response_format: { type: "json_object" }` for
 * reliable JSON output.  Throws `GroqApiError` on non-2xx responses.
 *
 * @param options - model, system prompt and user message to send
 * @returns rawText - the model's raw JSON string
 */
export async function callGroq(
  options: GroqClientOptions
): Promise<GroqClientResult> {
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
    // Re-throw API errors as our typed GroqApiError
    if (err instanceof APIError) {
      console.error("[GroqClient] APIError:", err.status, err.message, err.error);
      throw new GroqApiError(
        err.status,
        `Upstream Groq API error: ${err.status ?? "unknown status"}`
      );
    }
    // Propagate any other unexpected errors unchanged
    console.error("[GroqClient] Unexpected error:", err);
    throw err;
  }
}
