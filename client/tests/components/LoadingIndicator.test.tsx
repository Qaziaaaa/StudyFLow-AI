import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { LoadingIndicator } from "../../src/components/LoadingIndicator";

describe("LoadingIndicator", () => {
  // ── Visibility ─────────────────────────────────────────────────────────────

  it("renders the loading status element when visible is true", () => {
    render(<LoadingIndicator visible={true} />);
    expect(screen.getByRole("status")).toBeInTheDocument();
  });

  it("renders nothing when visible is false", () => {
    render(<LoadingIndicator visible={false} />);
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  // ── Accessibility ──────────────────────────────────────────────────────────

  it("has an accessible label when visible", () => {
    render(<LoadingIndicator visible={true} />);
    expect(
      screen.getByRole("status", { name: /generating study plan/i })
    ).toBeInTheDocument();
  });

  it("displays descriptive loading text when visible", () => {
    render(<LoadingIndicator visible={true} />);
    expect(screen.getByText(/generating your study plan/i)).toBeInTheDocument();
  });

  // ── Toggle behaviour ───────────────────────────────────────────────────────

  it("hides after being visible when re-rendered with visible=false", () => {
    const { rerender } = render(<LoadingIndicator visible={true} />);
    expect(screen.getByRole("status")).toBeInTheDocument();

    rerender(<LoadingIndicator visible={false} />);
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it("shows after being hidden when re-rendered with visible=true", () => {
    const { rerender } = render(<LoadingIndicator visible={false} />);
    expect(screen.queryByRole("status")).not.toBeInTheDocument();

    rerender(<LoadingIndicator visible={true} />);
    expect(screen.getByRole("status")).toBeInTheDocument();
  });
});
