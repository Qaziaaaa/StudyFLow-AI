export interface LoadingIndicatorProps {
  visible: boolean;
}

export function LoadingIndicator({ visible }: LoadingIndicatorProps) {
  if (!visible) return null;

  return (
    <div role="status" aria-label="Generating study plan" className="card-elevated px-6 py-5 flex items-center gap-4">
      {/* Animated ring */}
      <div className="relative flex-shrink-0 w-10 h-10">
        <div className="absolute inset-0 rounded-full border-[3px] border-indigo-100" />
        <div
          className="absolute inset-0 rounded-full border-[3px] border-transparent border-t-indigo-500 animate-spin"
          aria-hidden="true"
        />
        <div className="absolute inset-2 rounded-full bg-indigo-50 flex items-center justify-center">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2L2 7l10 5 10-5-10-5z"/>
          </svg>
        </div>
      </div>
      <div className="flex-1">
        <p className="text-sm font-semibold text-slate-800">Building your personalised study plan…</p>
        <p className="text-xs text-slate-400 mt-0.5">Analysing your assignment and creating a step-by-step roadmap</p>
      </div>
      {/* Animated dots */}
      <div className="flex gap-1 flex-shrink-0" aria-hidden="true">
        {[0, 1, 2].map(i => (
          <div key={i} className="w-1.5 h-1.5 rounded-full bg-indigo-400"
            style={{ animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite` }} />
        ))}
      </div>
      <style>{`
        @keyframes bounce {
          0%, 80%, 100% { transform: translateY(0); opacity: 0.4; }
          40% { transform: translateY(-4px); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
