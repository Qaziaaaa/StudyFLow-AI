import { describe, it, expect } from "vitest";
import { buildSchedule } from "../../src/scheduleBuilder";
import { Task } from "@studyflow/shared";

function makeTask(name: string): Task {
  return { name, estimatedHours: 1, difficulty: "Easy" };
}

describe("buildSchedule", () => {

  // ── Same-day ──────────────────────────────────────────────────────────────

  describe("same-day due date", () => {
    it("produces a single 'Day 1' entry", () => {
      const today = new Date(2024, 0, 15);
      const schedule = buildSchedule([], "2024-01-15", today);
      expect(schedule).toHaveLength(1);
      expect(schedule[0].day).toBe("Day 1");
    });

    it("lists all tasks in Day 1 when tasks are provided", () => {
      const today = new Date(2024, 0, 15);
      const tasks = [makeTask("Read chapter 1"), makeTask("Write notes")];
      const schedule = buildSchedule(tasks, "2024-01-15", today);
      expect(schedule).toHaveLength(1);
      expect(schedule[0].tasks).toContain("Read chapter 1");
      expect(schedule[0].tasks).toContain("Write notes");
    });

    it("has empty tasks when task array is empty", () => {
      const today = new Date(2024, 0, 15);
      const schedule = buildSchedule([], "2024-01-15", today);
      expect(schedule[0].tasks).toHaveLength(0);
    });
  });

  // ── Multiple days ──────────────────────────────────────────────────────────

  describe("numDays > 1", () => {
    it("produces the correct number of entries including submit day", () => {
      const today = new Date(2024, 0, 15); // 15 Jan → 17 Jan = 3 days
      const schedule = buildSchedule([], "2024-01-17", today);
      expect(schedule).toHaveLength(3);
    });

    it("labels entries sequentially Day 1, Day 2, …", () => {
      const today = new Date(2024, 0, 15);
      const schedule = buildSchedule([], "2024-01-17", today);
      expect(schedule.map(e => e.day)).toEqual(["Day 1", "Day 2", "Day 3"]);
    });

    it("last day is always the submit/review day", () => {
      const today = new Date(2024, 0, 15);
      const schedule = buildSchedule([makeTask("Task A")], "2024-01-17", today);
      const last = schedule[schedule.length - 1];
      expect(last.estimatedHours).toBeGreaterThan(0);
      // label should reference review/submit
      expect(last.label?.toLowerCase() ?? "").toMatch(/review|submit/);
    });
  });

  // ── Empty tasks ────────────────────────────────────────────────────────────

  describe("empty tasks (Req 4.4)", () => {
    it("all work-day entries have empty tasks arrays when tasks is empty", () => {
      const today = new Date(2024, 0, 15);
      const schedule = buildSchedule([], "2024-01-19", today); // 5 days
      // All days except last should have no tasks
      const workDays = schedule.slice(0, -1);
      for (const entry of workDays) {
        expect(entry.tasks).toHaveLength(0);
      }
    });
  });

  // ── tasks < numDays ────────────────────────────────────────────────────────

  describe("tasks < numDays", () => {
    it("assigns tasks to days and leaves gaps as buffer days", () => {
      const today = new Date(2024, 0, 15); // 5 days to Jan 19
      const tasks = [makeTask("Task A"), makeTask("Task B")];
      const schedule = buildSchedule(tasks, "2024-01-19", today);
      // All task names should appear somewhere in the schedule
      const allTaskNames = schedule.flatMap(e => e.tasks);
      expect(allTaskNames).toContain("Task A");
      expect(allTaskNames).toContain("Task B");
    });

    it("task names from input appear in schedule activities", () => {
      const today = new Date(2024, 0, 15);
      const tasks = [makeTask("Alpha"), makeTask("Beta")];
      const schedule = buildSchedule(tasks, "2024-01-19", today);
      const allNames = new Set(schedule.flatMap(e => e.tasks));
      expect(allNames.has("Alpha")).toBe(true);
      expect(allNames.has("Beta")).toBe(true);
    });
  });

  // ── tasks === numDays ──────────────────────────────────────────────────────

  describe("tasks === work days", () => {
    it("assigns one task per work day", () => {
      const today = new Date(2024, 0, 15); // 3 days to Jan 17 → 2 work days + 1 submit
      const tasks = [makeTask("T1"), makeTask("T2")];
      const schedule = buildSchedule(tasks, "2024-01-17", today);
      const workEntries = schedule.slice(0, -1);
      expect(workEntries[0].tasks).toContain("T1");
      expect(workEntries[1].tasks).toContain("T2");
    });
  });

  // ── tasks > numDays ────────────────────────────────────────────────────────

  describe("tasks > work days", () => {
    it("no work day is empty when tasks > work days", () => {
      const today = new Date(2024, 0, 15); // 3 days → 2 work days
      const tasks = [makeTask("T1"), makeTask("T2"), makeTask("T3"), makeTask("T4"), makeTask("T5")];
      const schedule = buildSchedule(tasks, "2024-01-17", today);
      const workDays = schedule.slice(0, -1);
      for (const entry of workDays) {
        expect(entry.tasks.length).toBeGreaterThan(0);
      }
    });

    it("all task names appear exactly once in the schedule", () => {
      const today = new Date(2024, 0, 15);
      const tasks = [makeTask("T1"), makeTask("T2"), makeTask("T3"), makeTask("T4"), makeTask("T5")];
      const schedule = buildSchedule(tasks, "2024-01-17", today);
      const allNames = schedule.flatMap(e => e.tasks);
      for (const task of tasks) {
        expect(allNames.filter(n => n === task.name)).toHaveLength(1);
      }
    });
  });

  // ── Phase bracket stripping ────────────────────────────────────────────────

  describe("phase bracket stripping", () => {
    it("strips [ Phase ] prefix from task names in schedule", () => {
      const today = new Date(2024, 0, 15);
      const tasks = [makeTask("[ Research ] Find sources on WW2")];
      const schedule = buildSchedule(tasks, "2024-01-16", today);
      const allNames = schedule.flatMap(e => e.tasks);
      expect(allNames.some(n => n.includes("["))).toBe(false);
      expect(allNames).toContain("Find sources on WW2");
    });
  });

});
