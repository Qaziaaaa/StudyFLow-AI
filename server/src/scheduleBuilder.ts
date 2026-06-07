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

/**
 * Builds a day-by-day schedule that:
 * 1. Distributes tasks evenly across ALL available days (no empty "rest" days unless
 *    there's genuinely nothing left to do on that day — last day is always review/submit).
 * 2. Attaches an estimatedHours value to each day so students know how long to sit.
 * 3. Never leaves more than 1 buffer/rest day at the end.
 */
export function buildSchedule(
  tasks: Task[],
  dueDate: string,
  today: Date = new Date()
): ScheduleEntry[] {
  const numDays = computeNumDays(dueDate, today);

  if (tasks.length === 0) {
    return Array.from({ length: numDays }, (_, i) => ({
      day: `Day ${i + 1}`,
      activity: i === numDays - 1 ? "Final review and submission" : "",
      estimatedHours: 0,
    }));
  }

  // --- Same day ---
  if (numDays === 1) {
    const totalHours = tasks.reduce((s, t) => s + t.estimatedHours, 0);
    return [{
      day: "Day 1",
      activity: tasks.map(t => t.name).join(" → "),
      estimatedHours: roundHalf(totalHours),
    }];
  }

  // --- Reserve the last day for review/submission ---
  // Work days = all days except last
  const workDays = numDays - 1;
  const entries: ScheduleEntry[] = [];

  if (tasks.length >= workDays) {
    // More tasks than work days — chunk them
    const floor = Math.floor(tasks.length / workDays);
    const remainder = tasks.length % workDays;
    let idx = 0;
    for (let i = 0; i < workDays; i++) {
      const chunkSize = i < remainder ? floor + 1 : floor;
      const chunk = tasks.slice(idx, idx + chunkSize);
      idx += chunkSize;
      const dayHours = roundHalf(chunk.reduce((s, t) => s + t.estimatedHours, 0));
      entries.push({
        day: `Day ${i + 1}`,
        activity: chunk.map(t => t.name).join(" + "),
        estimatedHours: dayHours,
      });
    }
  } else {
    // Fewer tasks than work days — spread them out, insert buffer days intelligently
    // Strategy: distribute tasks evenly with gaps, don't bunch all empties at end
    const gap = workDays / tasks.length; // float spacing between tasks
    const assigned = new Set<number>();

    tasks.forEach((task, ti) => {
      // Place task at evenly spaced intervals
      const dayIndex = Math.min(Math.round(ti * gap), workDays - 1);
      // Avoid collision — find next free slot
      let slot = dayIndex;
      while (assigned.has(slot) && slot < workDays - 1) slot++;
      assigned.add(slot);

      entries[slot] = {
        day: `Day ${slot + 1}`,
        activity: task.name,
        estimatedHours: roundHalf(task.estimatedHours),
      };
    });

    // Fill gaps with buffer entries
    for (let i = 0; i < workDays; i++) {
      if (!entries[i]) {
        entries[i] = {
          day: `Day ${i + 1}`,
          activity: "Review progress · catch up on previous tasks",
          estimatedHours: 0.5,
        };
      }
    }
  }

  // Last day is always final review / submission
  entries.push({
    day: `Day ${numDays}`,
    activity: "Final review, polish, and submit ✓",
    estimatedHours: 1,
  });

  return entries;
}
