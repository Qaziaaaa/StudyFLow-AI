import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { AssignmentForm } from "../../src/components/AssignmentForm";

/** Returns a YYYY-MM-DD date string offset by `days` from today. */
function dateOffsetFromToday(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().split("T")[0];
}

const FUTURE_DATE = dateOffsetFromToday(7);
const YESTERDAY = dateOffsetFromToday(-1);

describe("AssignmentForm", () => {
  // ── Rendering ──────────────────────────────────────────────────────────────

  it("renders the title input with a visible label", () => {
    render(<AssignmentForm onSubmit={vi.fn()} isLoading={false} />);
    expect(screen.getByLabelText(/assignment title/i)).toBeInTheDocument();
  });

  it("renders the description textarea with a visible label", () => {
    render(<AssignmentForm onSubmit={vi.fn()} isLoading={false} />);
    expect(screen.getByLabelText(/assignment description/i)).toBeInTheDocument();
  });

  it("renders the due date input with a visible label", () => {
    render(<AssignmentForm onSubmit={vi.fn()} isLoading={false} />);
    expect(screen.getByLabelText(/due date/i)).toBeInTheDocument();
  });

  it("renders the Generate Plan button", () => {
    render(<AssignmentForm onSubmit={vi.fn()} isLoading={false} />);
    expect(screen.getByRole("button", { name: /generate/i })).toBeInTheDocument();
  });

  // ── Field constraints ───────────────────────────────────────────────────────

  it("title input has maxLength 255", () => {
    render(<AssignmentForm onSubmit={vi.fn()} isLoading={false} />);
    const input = screen.getByLabelText(/assignment title/i) as HTMLInputElement;
    expect(input.maxLength).toBe(255);
  });

  it("description textarea has maxLength 2000", () => {
    render(<AssignmentForm onSubmit={vi.fn()} isLoading={false} />);
    const textarea = screen.getByLabelText(/assignment description/i) as HTMLTextAreaElement;
    expect(textarea.maxLength).toBe(2000);
  });

  it("due date input is of type date", () => {
    render(<AssignmentForm onSubmit={vi.fn()} isLoading={false} />);
    const input = screen.getByLabelText(/due date/i) as HTMLInputElement;
    expect(input.type).toBe("date");
  });

  // ── Loading state ───────────────────────────────────────────────────────────

  it("disables the Generate Plan button when isLoading is true", () => {
    render(<AssignmentForm onSubmit={vi.fn()} isLoading={true} />);
    const button = screen.getByRole("button", { name: /generat/i });
    expect(button).toBeDisabled();
  });

  it("enables the Generate Plan button when isLoading is false", () => {
    render(<AssignmentForm onSubmit={vi.fn()} isLoading={false} />);
    const button = screen.getByRole("button", { name: /generate/i });
    expect(button).not.toBeDisabled();
  });

  // ── Successful submission ───────────────────────────────────────────────────

  it("calls onSubmit with the entered values when the form is valid", async () => {
    const user = userEvent.setup();
    const handleSubmit = vi.fn();
    render(<AssignmentForm onSubmit={handleSubmit} isLoading={false} />);

    await user.type(screen.getByLabelText(/assignment title/i), "My Essay");
    await user.type(screen.getByLabelText(/assignment description/i), "Write about history.");
    await user.type(screen.getByLabelText(/due date/i), FUTURE_DATE);

    await user.click(screen.getByRole("button", { name: /generate/i }));

    expect(handleSubmit).toHaveBeenCalledOnce();
    expect(handleSubmit).toHaveBeenCalledWith({
      title: "My Essay",
      description: "Write about history.",
      dueDate: FUTURE_DATE,
    });
  });

  // ── Submit-time validation ──────────────────────────────────────────────────

  it("shows a title error and does not call onSubmit when title is empty", async () => {
    const user = userEvent.setup();
    const handleSubmit = vi.fn();
    render(<AssignmentForm onSubmit={handleSubmit} isLoading={false} />);

    await user.type(screen.getByLabelText(/assignment description/i), "Some description");
    await user.type(screen.getByLabelText(/due date/i), FUTURE_DATE);
    await user.click(screen.getByRole("button", { name: /generate/i }));

    expect(handleSubmit).not.toHaveBeenCalled();
    expect(screen.getByText(/title is required/i)).toBeInTheDocument();
  });

  it("shows a title error and does not call onSubmit when title is whitespace-only", async () => {
    const user = userEvent.setup();
    const handleSubmit = vi.fn();
    render(<AssignmentForm onSubmit={handleSubmit} isLoading={false} />);

    await user.type(screen.getByLabelText(/assignment title/i), "   ");
    await user.type(screen.getByLabelText(/assignment description/i), "Some description");
    await user.type(screen.getByLabelText(/due date/i), FUTURE_DATE);
    await user.click(screen.getByRole("button", { name: /generate/i }));

    expect(handleSubmit).not.toHaveBeenCalled();
    expect(screen.getByText(/title is required/i)).toBeInTheDocument();
  });

  it("shows a description error and does not call onSubmit when description is empty", async () => {
    const user = userEvent.setup();
    const handleSubmit = vi.fn();
    render(<AssignmentForm onSubmit={handleSubmit} isLoading={false} />);

    await user.type(screen.getByLabelText(/assignment title/i), "My Essay");
    await user.type(screen.getByLabelText(/due date/i), FUTURE_DATE);
    await user.click(screen.getByRole("button", { name: /generate/i }));

    expect(handleSubmit).not.toHaveBeenCalled();
    expect(screen.getByText(/description is required/i)).toBeInTheDocument();
  });

  it("shows a description error and does not call onSubmit when description is whitespace-only", async () => {
    const user = userEvent.setup();
    const handleSubmit = vi.fn();
    render(<AssignmentForm onSubmit={handleSubmit} isLoading={false} />);

    await user.type(screen.getByLabelText(/assignment title/i), "My Essay");
    await user.type(screen.getByLabelText(/assignment description/i), "   ");
    await user.type(screen.getByLabelText(/due date/i), FUTURE_DATE);
    await user.click(screen.getByRole("button", { name: /generate/i }));

    expect(handleSubmit).not.toHaveBeenCalled();
    expect(screen.getByText(/description is required/i)).toBeInTheDocument();
  });

  it("shows a due date error and does not call onSubmit when due date is empty", async () => {
    const user = userEvent.setup();
    const handleSubmit = vi.fn();
    render(<AssignmentForm onSubmit={handleSubmit} isLoading={false} />);

    await user.type(screen.getByLabelText(/assignment title/i), "My Essay");
    await user.type(screen.getByLabelText(/assignment description/i), "Some description");
    await user.click(screen.getByRole("button", { name: /generate/i }));

    expect(handleSubmit).not.toHaveBeenCalled();
    expect(screen.getByText(/due date is required/i)).toBeInTheDocument();
  });

  it("shows errors for all three fields when the form is submitted empty", async () => {
    const user = userEvent.setup();
    const handleSubmit = vi.fn();
    render(<AssignmentForm onSubmit={handleSubmit} isLoading={false} />);

    await user.click(screen.getByRole("button", { name: /generate/i }));

    expect(handleSubmit).not.toHaveBeenCalled();
    expect(screen.getByText(/title is required/i)).toBeInTheDocument();
    expect(screen.getByText(/description is required/i)).toBeInTheDocument();
    expect(screen.getByText(/due date is required/i)).toBeInTheDocument();
  });

  // ── Past-date validation (on input / blur) ──────────────────────────────────

  it("shows a past-date error immediately when a past date is typed", async () => {
    const user = userEvent.setup();
    render(<AssignmentForm onSubmit={vi.fn()} isLoading={false} />);

    await user.type(screen.getByLabelText(/due date/i), YESTERDAY);

    expect(
      screen.getByText(/due date must be today or in the future/i)
    ).toBeInTheDocument();
  });

  it("shows a past-date error on blur when a past date is entered", async () => {
    const user = userEvent.setup();
    render(<AssignmentForm onSubmit={vi.fn()} isLoading={false} />);

    const dateInput = screen.getByLabelText(/due date/i);
    await user.type(dateInput, YESTERDAY);
    await user.tab(); // trigger blur

    expect(
      screen.getByText(/due date must be today or in the future/i)
    ).toBeInTheDocument();
  });

  it("clears the past-date error when a future date is entered afterwards", async () => {
    const user = userEvent.setup();
    render(<AssignmentForm onSubmit={vi.fn()} isLoading={false} />);

    const dateInput = screen.getByLabelText(/due date/i);
    // First enter a past date to trigger the error
    await user.type(dateInput, YESTERDAY);
    expect(
      screen.getByText(/due date must be today or in the future/i)
    ).toBeInTheDocument();

    // Then correct it to a future date
    await user.clear(dateInput);
    await user.type(dateInput, FUTURE_DATE);
    expect(
      screen.queryByText(/due date must be today or in the future/i)
    ).not.toBeInTheDocument();
  });

  it("does not show the past-date error for a future date on submit", async () => {
    const user = userEvent.setup();
    const handleSubmit = vi.fn();
    render(<AssignmentForm onSubmit={handleSubmit} isLoading={false} />);

    await user.type(screen.getByLabelText(/assignment title/i), "My Essay");
    await user.type(screen.getByLabelText(/assignment description/i), "Some description");
    await user.type(screen.getByLabelText(/due date/i), FUTURE_DATE);
    await user.click(screen.getByRole("button", { name: /generate/i }));

    expect(handleSubmit).toHaveBeenCalledOnce();
    expect(
      screen.queryByText(/due date must be today or in the future/i)
    ).not.toBeInTheDocument();
  });

  // ── Accessibility ───────────────────────────────────────────────────────────

  it("all form fields have accessible labels (for= or aria-label)", () => {
    render(<AssignmentForm onSubmit={vi.fn()} isLoading={false} />);

    // getByLabelText throws if no programmatic label is found
    expect(screen.getByLabelText(/assignment title/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/assignment description/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/due date/i)).toBeInTheDocument();
    // button has aria-label
    expect(screen.getByRole("button", { name: /generate study plan/i })).toBeInTheDocument();
  });
});
