import { describe, it, expect } from "vitest";
import { computePriority } from "../../src/priorityEngine";

/**
 * Unit tests for computePriority.
 * Concrete examples covering boundary conditions at 3 and 7 days, and all three tiers.
 *
 * Property-based tests (Property 1) are in task 2.2.
 */

/** Returns an ISO 8601 date string (YYYY-MM-DD) offset by `offsetDays` from `base`. */
function addDays(base: Date, offsetDays: number): string {
  const d = new Date(
    Date.UTC(base.getFullYear(), base.getMonth(), base.getDate())
  );
  d.setUTCDate(d.getUTCDate() + offsetDays);
  return d.toISOString().split("T")[0];
}

describe("computePriority", () => {
  const today = new Date(2024, 0, 1); // 2024-01-01 (local time, time part ignored)

  // ── "High" tier: daysRemaining < 3 ──────────────────────────────────────

  it('returns "High" when dueDate is today (0 days remaining)', () => {
    expect(computePriority(addDays(today, 0), today)).toBe("High");
  });

  it('returns "High" when dueDate is 1 day from today', () => {
    expect(computePriority(addDays(today, 1), today)).toBe("High");
  });

  it('returns "High" when dueDate is 2 days from today', () => {
    expect(computePriority(addDays(today, 2), today)).toBe("High");
  });

  it('returns "High" when dueDate is in the past (negative days remaining)', () => {
    expect(computePriority(addDays(today, -1), today)).toBe("High");
  });

  // ── Lower boundary of "Medium": exactly 3 days ──────────────────────────

  it('returns "Medium" when dueDate is exactly 3 days from today', () => {
    expect(computePriority(addDays(today, 3), today)).toBe("Medium");
  });

  it('returns "Medium" when dueDate is 4 days from today', () => {
    expect(computePriority(addDays(today, 4), today)).toBe("Medium");
  });

  it('returns "Medium" when dueDate is 6 days from today (upper boundary)', () => {
    expect(computePriority(addDays(today, 6), today)).toBe("Medium");
  });

  // ── Lower boundary of "Low": exactly 7 days ─────────────────────────────

  it('returns "Low" when dueDate is exactly 7 days from today', () => {
    expect(computePriority(addDays(today, 7), today)).toBe("Low");
  });

  it('returns "Low" when dueDate is far in the future (30 days)', () => {
    expect(computePriority(addDays(today, 30), today)).toBe("Low");
  });

  // ── Default `today` parameter ────────────────────────────────────────────

  it("uses the current date when `today` is omitted", () => {
    const realToday = new Date();
    const farFuture = addDays(realToday, 30);
    expect(computePriority(farFuture)).toBe("Low");
  });
});
