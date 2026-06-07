import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { ResultsSection } from "../../src/components/ResultsSection";
import type { StudyPlan } from "@studyflow/shared";

const mockPlan: StudyPlan = {
  summary: "A comprehensive study plan for your history essay.",
  difficulty: "Medium",
  priority: "High",
  tasks: [
    { name: "[ Research ] Find sources on WW2",  estimatedHours: 1,   difficulty: "Easy"   },
    { name: "[ Draft ] Write outline",            estimatedHours: 0.5, difficulty: "Medium" },
    { name: "[ Draft ] Write essay body",         estimatedHours: 1.5, difficulty: "Hard"   },
  ],
  schedule: [
    { day: "Day 1", tasks: ["Find sources on WW2"],          estimatedHours: 1   },
    { day: "Day 2", tasks: ["Write outline"],                 estimatedHours: 0.5 },
    { day: "Day 3", tasks: ["Write essay body"],              estimatedHours: 1.5 },
    { day: "Day 4", tasks: [], estimatedHours: 1, label: "Final review, polish, and submit" },
  ],
};

const lowPriorityPlan:    StudyPlan = { ...mockPlan, priority: "Low",    difficulty: "Easy" };
const mediumPriorityPlan: StudyPlan = { ...mockPlan, priority: "Medium", difficulty: "Hard" };

// ── Visibility ───────────────────────────────────────────────────────────────

describe("ResultsSection – visibility", () => {
  it("renders nothing when visible=false", () => {
    const { container } = render(<ResultsSection plan={null} error={null} visible={false} />);
    expect(container.firstChild).toBeNull();
  });

  it("renders nothing when visible=false even with a plan", () => {
    const { container } = render(<ResultsSection plan={mockPlan} error={null} visible={false} />);
    expect(container.firstChild).toBeNull();
  });

  it("renders the plan when visible=true", () => {
    render(<ResultsSection plan={mockPlan} error={null} visible={true} />);
    expect(screen.getByLabelText(/study plan results/i)).toBeInTheDocument();
  });

  it("renders the error section when visible=true and error is set", () => {
    render(<ResultsSection plan={null} error="Something went wrong" visible={true} />);
    expect(screen.getByLabelText(/study plan error/i)).toBeInTheDocument();
  });
});

// ── Error state ──────────────────────────────────────────────────────────────

describe("ResultsSection – error state", () => {
  it("displays the error message text", () => {
    render(<ResultsSection plan={null} error="Groq API error" visible={true} />);
    expect(screen.getByText("Groq API error")).toBeInTheDocument();
  });

  it("shows error instead of plan when both provided", () => {
    render(<ResultsSection plan={mockPlan} error="Some error" visible={true} />);
    expect(screen.getByText("Some error")).toBeInTheDocument();
    expect(screen.queryByLabelText(/study plan results/i)).not.toBeInTheDocument();
  });
});

// ── Plan content ─────────────────────────────────────────────────────────────

describe("ResultsSection – plan content", () => {
  it("displays the assignment summary", () => {
    render(<ResultsSection plan={mockPlan} error={null} visible={true} />);
    expect(screen.getByText("A comprehensive study plan for your history essay.")).toBeInTheDocument();
  });

  it("displays task names (with phase stripped) in the task breakdown", () => {
    render(<ResultsSection plan={mockPlan} error={null} visible={true} />);
    expect(screen.getAllByText("Find sources on WW2").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Write outline").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Write essay body").length).toBeGreaterThanOrEqual(1);
  });

  it("displays task difficulty badges", () => {
    render(<ResultsSection plan={mockPlan} error={null} visible={true} />);
    const badges = screen.getAllByLabelText(/task difficulty/i);
    const levels = badges.map(el => el.textContent);
    expect(levels).toContain("Easy");
    expect(levels).toContain("Medium");
    expect(levels).toContain("Hard");
  });

  it("displays the overall difficulty badge", () => {
    render(<ResultsSection plan={mockPlan} error={null} visible={true} />);
    expect(screen.getByLabelText(/overall difficulty: medium/i)).toBeInTheDocument();
  });
});

// ── Priority badge ────────────────────────────────────────────────────────────

describe("ResultsSection – priority badge", () => {
  it("shows High priority with red styling", () => {
    render(<ResultsSection plan={mockPlan} error={null} visible={true} />);
    const badge = screen.getByLabelText(/priority: high/i);
    expect(badge).toBeInTheDocument();
    expect(badge.className).toMatch(/red/);
  });

  it("shows Medium priority with amber styling", () => {
    render(<ResultsSection plan={mediumPriorityPlan} error={null} visible={true} />);
    const badge = screen.getByLabelText(/priority: medium/i);
    expect(badge).toBeInTheDocument();
    expect(badge.className).toMatch(/amber/);
  });

  it("shows Low priority with green styling", () => {
    render(<ResultsSection plan={lowPriorityPlan} error={null} visible={true} />);
    const badge = screen.getByLabelText(/priority: low/i);
    expect(badge).toBeInTheDocument();
    expect(badge.className).toMatch(/green/);
  });
});

// ── Schedule ──────────────────────────────────────────────────────────────────

describe("ResultsSection – schedule", () => {
  it("renders the schedule section", () => {
    render(<ResultsSection plan={mockPlan} error={null} visible={true} />);
    expect(screen.getByLabelText(/day-by-day schedule/i)).toBeInTheDocument();
  });

  it("renders all day labels in order", () => {
    render(<ResultsSection plan={mockPlan} error={null} visible={true} />);
    expect(screen.getByText("Day 1")).toBeInTheDocument();
    expect(screen.getByText("Day 2")).toBeInTheDocument();
    expect(screen.getByText("Day 3")).toBeInTheDocument();
    expect(screen.getByText("Day 4")).toBeInTheDocument();
  });

  it("renders task names inside the schedule", () => {
    render(<ResultsSection plan={mockPlan} error={null} visible={true} />);
    expect(screen.getAllByText(/find sources on ww2/i).length).toBeGreaterThanOrEqual(1);
  });

  it("shows time for days with work", () => {
    render(<ResultsSection plan={mockPlan} error={null} visible={true} />);
    expect(screen.getAllByText("1 hr").length).toBeGreaterThanOrEqual(1);
  });

  it("shows buffer text for days with no tasks", () => {
    const planWithBuffer: StudyPlan = {
      ...mockPlan,
      schedule: [
        { day: "Day 1", tasks: ["Find sources"], estimatedHours: 1 },
        { day: "Day 2", tasks: [], estimatedHours: 0, label: "Review & catch up on previous tasks" },
      ],
    };
    render(<ResultsSection plan={planWithBuffer} error={null} visible={true} />);
    expect(screen.getByText(/review & catch up/i)).toBeInTheDocument();
  });
});

// ── Phase tags ────────────────────────────────────────────────────────────────

describe("ResultsSection – phase tags", () => {
  it("renders Research phase tag", () => {
    render(<ResultsSection plan={mockPlan} error={null} visible={true} />);
    expect(screen.getAllByText("Research").length).toBeGreaterThanOrEqual(1);
  });

  it("renders Draft phase tag", () => {
    render(<ResultsSection plan={mockPlan} error={null} visible={true} />);
    expect(screen.getAllByText("Draft").length).toBeGreaterThanOrEqual(1);
  });
});

// ── DOM order ─────────────────────────────────────────────────────────────────

describe("ResultsSection – DOM order", () => {
  it("overview section appears before schedule", () => {
    render(<ResultsSection plan={mockPlan} error={null} visible={true} />);
    const overview = screen.getByLabelText(/study plan results/i);
    const schedule = screen.getByLabelText(/day-by-day schedule/i);
    expect(overview.compareDocumentPosition(schedule) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it("schedule appears before task breakdown", () => {
    render(<ResultsSection plan={mockPlan} error={null} visible={true} />);
    const schedule = screen.getByLabelText(/day-by-day schedule/i);
    const tasks = screen.getByLabelText(/task breakdown/i);
    expect(schedule.compareDocumentPosition(tasks) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });
});
