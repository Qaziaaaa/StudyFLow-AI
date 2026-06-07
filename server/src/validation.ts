import type { StudyPlan } from "@studyflow/shared";

const VALID_DIFFICULTIES = ["Easy", "Medium", "Hard"] as const;

/**
 * Runtime type guard that validates a parsed (unknown) value matches the
 * subset of StudyPlan that the Groq API is expected to return.
 *
 * The backend fills `priority` and `schedule` after calling this guard, so
 * those fields are intentionally excluded from the check.
 */
export function isValidGroqResponse(
  parsed: unknown
): parsed is Pick<StudyPlan, "summary" | "difficulty" | "tasks"> {
  if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
    return false;
  }

  const obj = parsed as Record<string, unknown>;

  // summary: non-empty string
  if (typeof obj.summary !== "string" || obj.summary.trim() === "") {
    return false;
  }

  // difficulty: one of the permitted enum values
  if (!VALID_DIFFICULTIES.includes(obj.difficulty as (typeof VALID_DIFFICULTIES)[number])) {
    return false;
  }

  // tasks: non-empty array
  if (!Array.isArray(obj.tasks) || obj.tasks.length === 0) {
    return false;
  }

  // each task must have name (string), estimatedHours (number), difficulty (string)
  for (const item of obj.tasks) {
    if (typeof item !== "object" || item === null || Array.isArray(item)) {
      return false;
    }
    const task = item as Record<string, unknown>;
    if (typeof task.name !== "string") {
      return false;
    }
    if (typeof task.estimatedHours !== "number") {
      return false;
    }
    if (typeof task.difficulty !== "string") {
      return false;
    }
  }

  return true;
}
