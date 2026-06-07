import { Task, ScheduleEntry } from "@studyflow/shared";

/**
 * Computes the number of calendar days from today up to and including dueDate.
 * Returns at least 1 (same-day counts as 1).
 */
function computeNumDays(dueDate: string, today: Date): number {
  // Normalise both dates to midnight UTC to count whole calendar days
  const todayMidnight = Date.UTC(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  );

  const [year, month, day] = dueDate.split("-").map(Number);
  const dueMidnight = Date.UTC(year, month - 1, day);

  const msPerDay = 24 * 60 * 60 * 1000;
  const diff = Math.round((dueMidnight - todayMidnight) / msPerDay);

  // diff = 0 means same day → 1 entry; diff < 0 → treat as 1 entry
  return Math.max(1, diff + 1);
}

/**
 * Builds a day-by-day study schedule from a list of tasks and a due date.
 *
 * Rules (Requirements 4.1–4.6):
 * - Produces exactly max(1, daysFromTodayToDueDate) entries labelled "Day 1", "Day 2", …
 * - Same-day (numDays === 1): one entry listing all task names.
 * - tasks.length >= numDays: distribute tasks as evenly as possible (round-robin chunks);
 *   every day gets at least one task.
 * - tasks.length < numDays: first tasks.length days get one task each; the rest get activity = "".
 * - tasks is empty: all entries have activity = "".
 *
 * @param tasks    Task array from the Study_Plan.
 * @param dueDate  ISO 8601 date string (YYYY-MM-DD).
 * @param today    Override for "today" (defaults to new Date()); useful for testing.
 */
export function buildSchedule(
  tasks: Task[],
  dueDate: string,
  today: Date = new Date()
): ScheduleEntry[] {
  const numDays = computeNumDays(dueDate, today);

  // Build the entries array
  const entries: ScheduleEntry[] = [];

  if (tasks.length === 0) {
    // Req 4.4: all empty
    for (let i = 1; i <= numDays; i++) {
      entries.push({ day: `Day ${i}`, activity: "" });
    }
    return entries;
  }

  if (numDays === 1) {
    // Req 4.5: same-day — list all tasks on Day 1
    entries.push({
      day: "Day 1",
      activity: tasks.map((t) => t.name).join(", "),
    });
    return entries;
  }

  if (tasks.length >= numDays) {
    // Req 4.2: tasks >= days — distribute as evenly as possible, no day left empty
    //
    // Strategy: divide tasks into numDays chunks. Some chunks will be one element
    // larger than others when tasks.length is not evenly divisible.
    //
    // e.g. 5 tasks, 3 days → chunks of sizes [2, 2, 1]  (ceil first, then floor)
    // More precisely: the first (tasks.length % numDays) days get (floor + 1) tasks,
    // the rest get floor tasks.
    const floor = Math.floor(tasks.length / numDays);
    const remainder = tasks.length % numDays;

    let taskIndex = 0;
    for (let i = 0; i < numDays; i++) {
      const chunkSize = i < remainder ? floor + 1 : floor;
      const chunk = tasks.slice(taskIndex, taskIndex + chunkSize);
      taskIndex += chunkSize;
      entries.push({
        day: `Day ${i + 1}`,
        activity: chunk.map((t) => t.name).join(", "),
      });
    }
    return entries;
  }

  // Req 4.3: tasks.length < numDays — one task per day, then empty days
  for (let i = 0; i < numDays; i++) {
    if (i < tasks.length) {
      entries.push({ day: `Day ${i + 1}`, activity: tasks[i].name });
    } else {
      entries.push({ day: `Day ${i + 1}`, activity: "" });
    }
  }
  return entries;
}
