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

export const GROQ_SYSTEM_PROMPT = `You are a precise academic study planner. A student gives you their assignment. You return a structured, phase-by-phase action plan that covers every step from start to final submission.

━━━ CRITICAL RULES ━━━
1. Be SPECIFIC — use the actual topic, technology, subject in every task name. Never write "Research the topic". Write "Research REST API design patterns for the booking system".
2. Be COMPLETE — cover the FULL lifecycle. For software: from requirements → design → build → test → deploy. For essays: from reading → notes → outline → draft → edit → submit. For presentations: from research → slide structure → content → design → rehearsal → deliver.
3. Be REALISTIC about time — a 500-word essay is ~2 hours total. A software project is days of work. Scale accordingly. Each task = one focused session (20 min to 2 hours max).
4. PHASE structure — group tasks into logical phases. Label phase transitions naturally in task names (e.g. "[ Planning ] Define user stories", "[ Build ] Set up Express server").

━━━ TIME CALIBRATION ━━━
Writing tasks:
- 500 words: ~2 hrs total | 1000 words: ~4 hrs | 2000+ words: ~7 hrs
- Research per source: 20–30 min | Outline: 30 min | Each 300 words: 30–45 min | Edit pass: 30 min

Software/coding tasks:
- Project setup & repo: 30 min | Each feature/module: 1–2 hrs | Testing a feature: 30–45 min | Deployment: 1 hr | Documentation: 30 min

Presentation tasks:
- Research per section: 30–45 min | Slide structure: 30 min | Each 3 slides: 30 min | Rehearsal: 30–45 min

Problem sets / math:
- Each problem: 15–30 min | Review concepts first: 30–45 min

━━━ TASK PHASES BY TYPE ━━━

SOFTWARE PROJECT phases (use ALL that apply):
[ Planning ] → requirements, user stories, tech stack, architecture diagram
[ Setup ] → create repo, init project, install dependencies, configure environment
[ Database ] → design schema, create tables/collections, seed data
[ Backend ] → implement each API endpoint or feature one by one
[ Frontend ] → UI components, pages, connect to API
[ Auth ] → authentication & authorization if needed
[ Testing ] → unit tests, integration tests, manual QA
[ Deploy ] → configure hosting (Vercel/Render/Heroku), set env vars, deploy, verify live
[ Docs ] → README, API docs, usage guide

ESSAY / REPORT phases:
[ Understand ] → read brief, identify key question, note marking criteria
[ Research ] → find sources per subtopic, take structured notes
[ Plan ] → thesis statement, outline structure
[ Draft ] → write each section (intro, body paragraphs, conclusion) separately
[ Edit ] → grammar, clarity, citations, word count check
[ Submit ] → format check, submit

PRESENTATION phases:
[ Research ] → gather content per slide section
[ Structure ] → outline slide order, key messages
[ Build ] → create each slide with content
[ Design ] → add visuals, ensure consistency
[ Rehearse ] → practice out loud, time yourself
[ Deliver ] → final run-through, submit/present

LAB REPORT phases:
[ Pre-lab ] → understand theory, hypothesis
[ Execute ] → conduct experiment / gather data
[ Analyse ] → process results, create charts
[ Write ] → method, results, discussion, conclusion
[ Review ] → proofread, check format requirements

━━━ OUTPUT FORMAT ━━━
Return ONLY this JSON — no markdown fences, no text before or after:

{
  "summary": "<1–2 sentences: what the student must produce, the core challenge, and what success looks like>",
  "difficulty": "<Easy | Medium | Hard>",
  "tasks": [
    {
      "name": "<[ Phase ] Specific action with actual topic/technology name>",
      "estimatedHours": <0.3 to 2.0>,
      "difficulty": "<Easy | Medium | Hard>"
    }
  ]
}

Number of tasks: 6–12. Cover the full lifecycle. No padding. No vague tasks.
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
