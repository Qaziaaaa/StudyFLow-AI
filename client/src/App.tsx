import { useState } from "react";
import type { AssignmentInput, StudyPlan, ErrorResponse } from "@studyflow/shared";
import { AssignmentForm } from "./components/AssignmentForm";
import { LoadingIndicator } from "./components/LoadingIndicator";
import { ResultsSection } from "./components/ResultsSection";

export default function App() {
  const [isLoading, setIsLoading] = useState(false);
  const [plan, setPlan] = useState<StudyPlan | null>(null);
  const [error, setError] = useState<string | null>(null);

  const resultsVisible = plan !== null || error !== null;

  async function handleSubmit(data: AssignmentInput) {
    setIsLoading(true);
    setError(null);
    setPlan(null);
    try {
      const apiBase = import.meta.env.VITE_API_URL ?? "";
      const res = await fetch(`${apiBase}/generate-plan`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        const json = await res.json();
        setPlan(json.studyPlan as StudyPlan);
      } else {
        const json: ErrorResponse = await res.json().catch(() => ({ error: "Unexpected error." }));
        setError(json.error ?? "Something went wrong. Please try again.");
      }
    } catch {
      setError("Network error — please check your connection and try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-2xl mx-auto px-6 py-4 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
            </svg>
          </div>
          <span className="text-lg font-bold text-navy-800 tracking-tight">StudyFlow AI</span>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-8 space-y-5">
        <div>
          <h1 className="text-2xl font-bold text-navy-800">Generate your study plan</h1>
          <p className="text-slate-500 mt-1 text-sm">
            Tell us about your assignment and we'll build a practical, step-by-step plan.
          </p>
        </div>

        <AssignmentForm onSubmit={handleSubmit} isLoading={isLoading} />
        <LoadingIndicator visible={isLoading} />
        <ResultsSection plan={plan} error={error} visible={resultsVisible} />
      </main>
    </div>
  );
}
