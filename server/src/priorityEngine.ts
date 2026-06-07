import type { Priority } from "@studyflow/shared";

/**
 * Computes the number of whole calendar days from today (exclusive) to dueDate (inclusive).
 *
 * For example:
 *   today = 2024-01-01, dueDate = "2024-01-01" → 0 days remaining → "High"
 *   today = 2024-01-01, dueDate = "2024-01-03" → 2 days remaining → "High"
 *   today = 2024-01-01, dueDate = "2024-01-04" → 3 days remaining → "Medium"
 *   today = 2024-01-01, dueDate = "2024-01-07" → 6 days remaining → "Medium"
 *   today = 2024-01-01, dueDate = "2024-01-08" → 7 days remaining → "Low"
 */
function daysRemaining(dueDate: string, today: Date): number {
  // Normalise today to midnight UTC so we compare whole calendar days only
  const todayMidnight = new Date(
    Date.UTC(today.getFullYear(), today.getMonth(), today.getDate())
  );

  // Parse dueDate as a UTC midnight date (YYYY-MM-DD)
  const [year, month, day] = dueDate.split("-").map(Number);
  const dueMidnight = new Date(Date.UTC(year, month - 1, day));

  const msPerDay = 24 * 60 * 60 * 1000;
  return Math.round((dueMidnight.getTime() - todayMidnight.getTime()) / msPerDay);
}

/**
 * Assigns a priority level based on how many whole calendar days remain until the due date.
 *
 * Thresholds (today exclusive, dueDate inclusive):
 *   daysRemaining < 3  → "High"
 *   3 <= daysRemaining < 7 → "Medium"
 *   daysRemaining >= 7 → "Low"
 *
 * @param dueDate - ISO 8601 date string (YYYY-MM-DD)
 * @param today   - Reference date (defaults to the current date); time component is ignored
 */
export function computePriority(dueDate: string, today: Date = new Date()): Priority {
  const days = daysRemaining(dueDate, today);

  if (days < 3) {
    return "High";
  } else if (days < 7) {
    return "Medium";
  } else {
    return "Low";
  }
}
