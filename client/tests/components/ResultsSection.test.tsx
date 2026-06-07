import { render, screen, within } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { ResultsSection } from "../../src/components/ResultsSection";
import type { StudyPlan } from "@studyflow/shared";

// ── Fixtures ──────────────────────────────────────────────────────────────────

const mockPlan: StudyPlan = {
  summary: "A comprehensive study plan for your history essay.",
  difficulty: "Medium",
  priority: "High",
  tasks: [
    { name: "Research sources", estimatedHours: 2, difficulty: "Easy" },
    { name: "Write outline", estimatedHours: 1, difficulty: "Medium" },
    { name: "Draft essay", estimatedHours: 4, difficulty: "Hard" },
  ],
  schedule: [
    { day: "Day 1", activity: "Research sources" },
    { day: "Day 2", activity: "Write outline" },
    { day: "Day 3", activity: "Draft essay" },
  ],
};

const lowPriorityPlan: StudyPlan = {
  ...mockPlan,
  priority: "Low",
  difficulty: "Easy",
};

const mediumPriorityPlan: StudyPlan = {
  ...mockPlan,
  priority: "Medium",
  difficulty: "Hard",
};

// ── Visibility (Req 5.7) ──────────────────────────────────────────────────────

describe("ResultsSection – visibility", () => {
  it("is hidden when visible=false, plan=null, error=null", () => {
    const { container } = render(
      <ResultsSection plan={null} error={null} visible={false} />
    );
    expect(container.firstChild).toBeNull();
  });

  it("is hidden when visible=false even if plan is provided", () => {
    const { container } = render(
      <ResultsSection plan={mockPlan} error={null} visible={false} />
    );
    expect(container.firstChild).toBeNull();
  });

  it("renders when visible=true and plan is provided", () => {
    render(<ResultsSection plan={mockPlan} error={null} visible={true} />);
    expect(screen.getByRole("region", { name: /study plan results/i })).toBeInTheDocument();
  });

  it("renders when visible=true and error is provided", () => {
    render(
      <ResultsSection plan={null} error="Groq API error – could not generate study plan" visible={true} />
    );
    expect(screen.getByRole("region", { name: /study plan error/i })).toBeInTheDocument();
  });
});

// ── Error rendering (Req 5.6) ─────────────────────────────────────────────────

describe("ResultsSection – error state", () => {
  it("displays the error message", () => {
    const errorMsg = "Groq API error – could not generate study plan";
    render(<ResultsSection plan={null} error={errorMsg} visible={true} />);
    expect(screen.getByText(errorMsg)).toBeInTheDocument();
  });

  it("references the error source in the heading", () => {
    render(
      <ResultsSection
        plan={null}
        error="Network error – please try again"
        visible={true}
      />
    );
    expect(
      screen.getByRole("heading", { name: /error generating study plan/i })
    ).toBeInTheDocument();
  });

  it("replaces the plan with the error message when error is set", () => {
    render(
      <ResultsSection
        plan={mockPlan}
        error="Backend 502 error"
        visible={true}
      />
    );
    // Error section shown, plan content absent
    expect(screen.getByText("Backend 502 error")).toBeInTheDocument();
    expect(
      screen.queryByRole("region", { name: /study plan results/i })
    ).not.toBeInTheDocument();
  });
});

// ── Plan rendering (Req 5.1 – 5.5) ───────────────────────────────────────────

describe("ResultsSection – plan content", () => {
  it("displays the assignment summary (Req 5.1)", () => {
    render(<ResultsSection plan={mockPlan} error={null} visible={true} />);
    expect(
      screen.getByText("A comprehensive study plan for your history essay.")
    ).toBeInTheDocument();
  });

  it("displays each task name (Req 5.2)", () => {
    render(<ResultsSection plan={mockPlan} error={null} visible={true} />);
    // Task names appear in both the schedule table and the task list, so use getAllByText
    expect(screen.getAllByText("Research sources").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Write outline").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Draft essay").length).toBeGreaterThanOrEqual(1);
  });

  it("displays each task's estimated hours (Req 5.2)", () => {
    render(<ResultsSection plan={mockPlan} error={null} visible={true} />);
    expect(screen.getByText("2h")).toBeInTheDocument();
    expect(screen.getByText("1h")).toBeInTheDocument();
    expect(screen.getByText("4h")).toBeInTheDocument();
  });

  it("displays each task's difficulty level (Req 5.2)", () => {
    render(<ResultsSection plan={mockPlan} error={null} visible={true} />);
    const taskDifficultyBadges = screen.getAllByLabelText(/task difficulty/i);
    const levels = taskDifficultyBadges.map((el) => el.textContent);
    expect(levels).toContain("Easy");
    expect(levels).toContain("Medium");
    expect(levels).toContain("Hard");
  });

  it("displays the overall difficulty rating (Req 5.3)", () => {
    render(<ResultsSection plan={mockPlan} error={null} visible={true} />);
    expect(
      screen.getByLabelText(/overall difficulty: medium/i)
    ).toBeInTheDocument();
  });
});

// ── Priority badge (Req 5.4) ──────────────────────────────────────────────────

describe("ResultsSection – priority badge", () => {
  it("shows 'High' priority label text for a High-priority plan", () => {
    render(<ResultsSection plan={mockPlan} error={null} visible={true} />);
    expect(screen.getByLabelText(/priority: high/i)).toBeInTheDocument();
  });

  it("applies red styling classes for High priority", () => {
    render(<ResultsSection plan={mockPlan} error={null} visible={true} />);
    const badge = screen.getByLabelText(/priority: high/i);
    expect(badge.className).toMatch(/red/);
  });

  it("shows 'Medium' priority label text for a Medium-priority plan", () => {
    render(<ResultsSection plan={mediumPriorityPlan} error={null} visible={true} />);
    expect(screen.getByLabelText(/priority: medium/i)).toBeInTheDocument();
  });

  it("applies yellow styling classes for Medium priority", () => {
    render(<ResultsSection plan={mediumPriorityPlan} error={null} visible={true} />);
    const badge = screen.getByLabelText(/priority: medium/i);
    expect(badge.className).toMatch(/yellow/);
  });

  it("shows 'Low' priority label text for a Low-priority plan", () => {
    render(<ResultsSection plan={lowPriorityPlan} error={null} visible={true} />);
    expect(screen.getByLabelText(/priority: low/i)).toBeInTheDocument();
  });

  it("applies green styling classes for Low priority", () => {
    render(<ResultsSection plan={lowPriorityPlan} error={null} visible={true} />);
    const badge = screen.getByLabelText(/priority: low/i);
    expect(badge.className).toMatch(/green/);
  });
});

// ── Schedule table (Req 5.5) ──────────────────────────────────────────────────

describe("ResultsSection – schedule", () => {
  it("renders a table with the correct schedule entries in order (Req 5.5)", () => {
    render(<ResultsSection plan={mockPlan} error={null} visible={true} />);
    const rows = screen.getAllByRole("row");
    // rows[0] is the header row; data rows start at index 1
    expect(within(rows[1]).getByText("Day 1")).toBeInTheDocument();
    expect(within(rows[2]).getByText("Day 2")).toBeInTheDocument();
    expect(within(rows[3]).getByText("Day 3")).toBeInTheDocument();
  });

  it("shows activities in the schedule cells", () => {
    render(<ResultsSection plan={mockPlan} error={null} visible={true} />);
    // "Research sources" appears in both the schedule cell and the task list
    const matches = screen.getAllByText("Research sources");
    expect(matches.length).toBeGreaterThanOrEqual(1);
  });

  it("shows 'No task assigned' placeholder for empty-activity days", () => {
    const planWithEmptyDay: StudyPlan = {
      ...mockPlan,
      schedule: [
        { day: "Day 1", activity: "Research sources" },
        { day: "Day 2", activity: "" },
      ],
    };
    render(<ResultsSection plan={planWithEmptyDay} error={null} visible={true} />);
    expect(screen.getByText("No task assigned")).toBeInTheDocument();
  });
});

// ── DOM order (Req 7.4) ───────────────────────────────────────────────────────

describe("ResultsSection – DOM order (Req 7.4)", () => {
  it("priority badge appears before schedule in DOM", () => {
    render(<ResultsSection plan={mockPlan} error={null} visible={true} />);
    const priorityBadge = screen.getByLabelText(/priority: high/i);
    const scheduleHeading = screen.getByRole("heading", {
      name: /day-by-day schedule/i,
    });
    // compareDocumentPosition: DOCUMENT_POSITION_FOLLOWING = 4
    expect(
      priorityBadge.compareDocumentPosition(scheduleHeading) &
        Node.DOCUMENT_POSITION_FOLLOWING
    ).toBeTruthy();
  });

  it("schedule heading appears before Tasks heading in DOM", () => {
    render(<ResultsSection plan={mockPlan} error={null} visible={true} />);
    const scheduleHeading = screen.getByRole("heading", {
      name: /day-by-day schedule/i,
    });
    const tasksHeading = screen.getByRole("heading", { name: /^tasks$/i });
    expect(
      scheduleHeading.compareDocumentPosition(tasksHeading) &
        Node.DOCUMENT_POSITION_FOLLOWING
    ).toBeTruthy();
  });

  it("Tasks heading appears before Summary heading in DOM", () => {
    render(<ResultsSection plan={mockPlan} error={null} visible={true} />);
    const tasksHeading = screen.getByRole("heading", { name: /^tasks$/i });
    const summaryHeading = screen.getByRole("heading", { name: /^summary$/i });
    expect(
      tasksHeading.compareDocumentPosition(summaryHeading) &
        Node.DOCUMENT_POSITION_FOLLOWING
    ).toBeTruthy();
  });
});
