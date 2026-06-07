import { describe, it, expect } from "vitest";
import { buildSchedule } from "../../src/scheduleBuilder";
import { Task } from "@studyflow/shared";

// Helper to build a minimal Task
function makeTask(name: string): Task {
  return { name, estimatedHours: 1, difficulty: "Easy" };
}

describe("buildSchedule", () => {
  // ── Same-day (due date === today) ──────────────────────────────────────────

  describe("same-day due date", () => {
    it("produces a single 'Day 1' entry", () => {
      const today = new Date(2024, 0, 15); // 15 Jan 2024
      const schedule = buildSchedule([], "2024-01-15", today);
      expect(schedule).toHaveLength(1);
      expect(schedule[0].day).toBe("Day 1");
    });

    it("lists all task names in Day 1 when tasks are provided", () => {
      const today = new Date(2024, 0, 15);
      const tasks = [makeTask("Read chapter 1"), makeTask("Write notes")];
      const schedule = buildSchedule(tasks, "2024-01-15", today);
      expect(schedule).toHaveLength(1);
      expect(schedule[0].activity).toBe("Read chapter 1, Write notes");
    });

    it("has empty activity when tasks array is empty", () => {
      const today = new Date(2024, 0, 15);
      const schedule = buildSchedule([], "2024-01-15", today);
      expect(schedule[0].activity).toBe("");
    });
  });

  // ── Due date in the past → treated as 1 day ────────────────────────────────

  describe("due date in the past", () => {
    it("produces a single entry when dueDate is before today", () => {
      const today = new Date(2024, 0, 20);
      const schedule = buildSchedule([], "2024-01-15", today);
      expect(schedule).toHaveLength(1);
      expect(schedule[0].day).toBe("Day 1");
    });
  });

  // ── Multiple days ──────────────────────────────────────────────────────────

  describe("numDays > 1", () => {
    it("produces the correct number of entries (Req 4.1)", () => {
      const today = new Date(2024, 0, 15); // 15 Jan → 17 Jan = 3 days
      const schedule = buildSchedule([], "2024-01-17", today);
      expect(schedule).toHaveLength(3);
    });

    it("labels entries sequentially Day 1, Day 2, … (Req 4.1)", () => {
      const today = new Date(2024, 0, 15);
      const schedule = buildSchedule([], "2024-01-17", today);
      expect(schedule.map((e) => e.day)).toEqual(["Day 1", "Day 2", "Day 3"]);
    });
  });

  // ── Empty task array ───────────────────────────────────────────────────────

  describe("empty tasks (Req 4.4)", () => {
    it("all entries have activity = '' when tasks is empty", () => {
      const today = new Date(2024, 0, 15);
      const schedule = buildSchedule([], "2024-01-19", today); // 5 days
      expect(schedule).toHaveLength(5);
      for (const entry of schedule) {
        expect(entry.activity).toBe("");
      }
    });
  });

  // ── tasks < numDays ────────────────────────────────────────────────────────

  describe("tasks < numDays (Req 4.3)", () => {
    it("assigns one task per day for the first N days, then empty", () => {
      const today = new Date(2024, 0, 15); // 5 days to Jan 19
      const tasks = [makeTask("Task A"), makeTask("Task B")];
      const schedule = buildSchedule(tasks, "2024-01-19", today);
      expect(schedule).toHaveLength(5);
      expect(schedule[0].activity).toBe("Task A");
      expect(schedule[1].activity).toBe("Task B");
      expect(schedule[2].activity).toBe("");
      expect(schedule[3].activity).toBe("");
      expect(schedule[4].activity).toBe("");
    });

    it("activities reference only input task names (Req 4.6)", () => {
      const today = new Date(2024, 0, 15);
      const tasks = [makeTask("Alpha"), makeTask("Beta")];
      const schedule = buildSchedule(tasks, "2024-01-19", today);
      const taskNames = new Set(tasks.map((t) => t.name));
      for (const entry of schedule) {
        if (entry.activity !== "") {
          expect(taskNames.has(entry.activity)).toBe(true);
        }
      }
    });
  });

  // ── tasks === numDays ──────────────────────────────────────────────────────

  describe("tasks === numDays (Req 4.2)", () => {
    it("assigns exactly one task per day and no day is empty", () => {
      const today = new Date(2024, 0, 15); // 3 days to Jan 17
      const tasks = [makeTask("T1"), makeTask("T2"), makeTask("T3")];
      const schedule = buildSchedule(tasks, "2024-01-17", today);
      expect(schedule).toHaveLength(3);
      expect(schedule[0].activity).toBe("T1");
      expect(schedule[1].activity).toBe("T2");
      expect(schedule[2].activity).toBe("T3");
    });
  });

  // ── tasks > numDays ────────────────────────────────────────────────────────

  describe("tasks > numDays (Req 4.2 – round-robin)", () => {
    it("no day is empty when tasks > days", () => {
      const today = new Date(2024, 0, 15); // 3 days to Jan 17
      const tasks = [
        makeTask("T1"),
        makeTask("T2"),
        makeTask("T3"),
        makeTask("T4"),
        makeTask("T5"),
      ];
      const schedule = buildSchedule(tasks, "2024-01-17", today);
      expect(schedule).toHaveLength(3);
      for (const entry of schedule) {
        expect(entry.activity).not.toBe("");
      }
    });

    it("all task names appear exactly once in the schedule (Req 4.6)", () => {
      const today = new Date(2024, 0, 15); // 3 days
      const tasks = [
        makeTask("T1"),
        makeTask("T2"),
        makeTask("T3"),
        makeTask("T4"),
        makeTask("T5"),
      ];
      const schedule = buildSchedule(tasks, "2024-01-17", today);

      const allActivities = schedule.map((e) => e.activity).join(", ");
      const taskNames = tasks.map((t) => t.name);
      for (const name of taskNames) {
        expect(allActivities).toContain(name);
      }
    });

    it("distributes 5 tasks across 3 days as 2, 2, 1", () => {
      const today = new Date(2024, 0, 15); // 3 days
      const tasks = [
        makeTask("T1"),
        makeTask("T2"),
        makeTask("T3"),
        makeTask("T4"),
        makeTask("T5"),
      ];
      const schedule = buildSchedule(tasks, "2024-01-17", today);
      // floor=1, remainder=2 → first 2 days get 2 tasks, last gets 1
      expect(schedule[0].activity).toBe("T1, T2");
      expect(schedule[1].activity).toBe("T3, T4");
      expect(schedule[2].activity).toBe("T5");
    });

    it("distributes 6 tasks evenly across 3 days (2 each)", () => {
      const today = new Date(2024, 0, 15); // 3 days
      const tasks = Array.from({ length: 6 }, (_, i) => makeTask(`T${i + 1}`));
      const schedule = buildSchedule(tasks, "2024-01-17", today);
      expect(schedule[0].activity).toBe("T1, T2");
      expect(schedule[1].activity).toBe("T3, T4");
      expect(schedule[2].activity).toBe("T5, T6");
    });
  });

  // ── Activity only contains input task names ────────────────────────────────

  describe("activity names are from input (Req 4.6)", () => {
    it("no fabricated names appear in activities", () => {
      const today = new Date(2024, 0, 15);
      const tasks = [makeTask("Study Math"), makeTask("Read Physics")];
      const schedule = buildSchedule(tasks, "2024-01-17", today);
      const taskNames = new Set(tasks.map((t) => t.name));
      for (const entry of schedule) {
        if (entry.activity !== "") {
          // Activity may be a comma-separated list of names
          const parts = entry.activity.split(", ");
          for (const part of parts) {
            expect(taskNames.has(part)).toBe(true);
          }
        }
      }
    });
  });
});
