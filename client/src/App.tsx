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
    <div className="min-h-screen" style={{ background: "linear-gradient(160deg, #f0f4ff 0%, #f1f5f9 50%, #eef2ff 100%)" }}>

      {/* Header */}
      <header className="sticky top-0 z-50" style={{
        background: "rgba(255,255,255,0.85)",
        backdropFilter: "blur(12px)",
        borderBottom: "1px solid rgba(148,163,184,0.2)",
        boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.04)"
      }}>
        <div className="max-w-2xl mx-auto px-6 py-3.5 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, #4f46e5, #6366f1)", boxShadow: "0 2px 8px rgba(79,70,229,0.35)" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5z"/>
              <path d="M2 17l10 5 10-5"/>
              <path d="M2 12l10 5 10-5"/>
            </svg>
          </div>
          <div>
            <span className="text-base font-800 tracking-tight text-slate-900" style={{ fontWeight: 800 }}>StudyFlow AI</span>
          </div>
          <div className="ml-auto">
            <span className="badge badge-brand text-xs">AI-Powered</span>
          </div>
        </div>
      </header>

      {/* Hero */}
      <div className="max-w-2xl mx-auto px-6 pt-8 pb-2">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Generate your study plan</h1>
        <p className="text-slate-500 mt-1 text-sm leading-relaxed">
          Describe your assignment and get a personalised, step-by-step plan — from first task to final submission.
        </p>
      </div>

      {/* Main */}
      <main className="max-w-2xl mx-auto px-6 pb-16 space-y-5 pt-4">
        <AssignmentForm onSubmit={handleSubmit} isLoading={isLoading} />
        <LoadingIndicator visible={isLoading} />
        <ResultsSection plan={plan} error={error} visible={resultsVisible} />
      </main>
    </div>
  );
}
