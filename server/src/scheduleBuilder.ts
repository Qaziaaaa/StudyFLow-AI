import { Task, ScheduleEntry } from "@studyflow/shared";

function computeNumDays(dueDate: string, today: Date): number {
  const todayMidnight = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());
  const [year, month, day] = dueDate.split("-").map(Number);
  const dueMidnight = Date.UTC(year, month - 1, day);
  const diff = Math.round((dueMidnight - todayMidnight) / (24 * 60 * 60 * 1000));
  return Math.max(1, diff + 1);
}

function roundHalf(n: number): number {
  return Math.round(n * 2) / 2;
}

/** Strip [ Phase ] prefix from task names for clean display */
function cleanTaskName(name: string): string {
  return name.replace(/^\[\s*[^\]]+\s*\]\s*/, "").trim();
}

/**
 * Builds a structured day-by-day schedule.
 * Each day entry has a `tasks` array (not a joined string) so the UI can
 * render each task as its own line item.
 *
 * Rules:
 * - Last day is always "Final review & submit"
 * - When tasks > work days: chunk tasks evenly, every work day has ≥1 task
 * - When tasks < work days: one task per day, evenly spaced, gaps are buffer days
 * - Same day: all tasks on Day 1
 */
export function buildSchedule(
  tasks: Task[],
  dueDate: string,
  today: Date = new Date()
): ScheduleEntry[] {
  const numDays = computeNumDays(dueDate, today);

  // ── No tasks ──
  if (tasks.length === 0) {
    return Array.from({ length: numDays }, (_, i) => ({
      day: `Day ${i + 1}`,
      tasks: [],
      estimatedHours: i === numDays - 1 ? 1 : 0,
      label: i === numDays - 1 ? "Final review and submission" : "Buffer day",
    }));
  }

  // ── Same day ──
  if (numDays === 1) {
    return [{
      day: "Day 1",
      tasks: tasks.map(t => cleanTaskName(t.name)),
      estimatedHours: roundHalf(tasks.reduce((s, t) => s + t.estimatedHours, 0)),
    }];
  }

  // Work days = everything except the last (reserved for review/submit)
  const workDays = numDays - 1;
  const entries: ScheduleEntry[] = [];

  if (tasks.length >= workDays) {
    // More tasks than work days — chunk evenly, every day gets ≥1 task
    const floor = Math.floor(tasks.length / workDays);
    const remainder = tasks.length % workDays;
    let idx = 0;
    for (let i = 0; i < workDays; i++) {
      const chunkSize = i < remainder ? floor + 1 : floor;
      const chunk = tasks.slice(idx, idx + chunkSize);
      idx += chunkSize;
      entries.push({
        day: `Day ${i + 1}`,
        tasks: chunk.map(t => cleanTaskName(t.name)),
        estimatedHours: roundHalf(chunk.reduce((s, t) => s + t.estimatedHours, 0)),
      });
    }
  } else {
    // Fewer tasks than work days — space them out evenly
    const gap = workDays / tasks.length;
    const assigned = new Set<number>();

    tasks.forEach((task, ti) => {
      let slot = Math.min(Math.round(ti * gap), workDays - 1);
      while (assigned.has(slot) && slot < workDays - 1) slot++;
      assigned.add(slot);
      entries[slot] = {
        day: `Day ${slot + 1}`,
        tasks: [cleanTaskName(task.name)],
        estimatedHours: roundHalf(task.estimatedHours),
      };
    });

    // Fill gaps with buffer days
    for (let i = 0; i < workDays; i++) {
      if (!entries[i]) {
        entries[i] = {
          day: `Day ${i + 1}`,
          tasks: [],
          estimatedHours: 0,
          label: "Review & catch up on previous tasks",
        };
      }
    }
  }

  // Final day — always review & submit
  entries.push({
    day: `Day ${numDays}`,
    tasks: [],
    estimatedHours: 1,
    label: "Final review, polish, and submit",
  });

  return entries;
}
