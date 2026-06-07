export interface LoadingIndicatorProps {
  visible: boolean;
}

export function LoadingIndicator({ visible }: LoadingIndicatorProps) {
  if (!visible) return null;

  return (
    <div
      role="status"
      aria-label="Generating study plan"
      className="bg-white rounded-2xl border border-slate-200 shadow-sm px-6 py-5 flex items-center gap-4"
    >
      <div
        className="w-8 h-8 rounded-full border-[3px] border-brand-200 border-t-brand-600 animate-spin flex-shrink-0"
        aria-hidden="true"
      />
      <div>
        <p className="text-sm font-semibold text-navy-800">Building your study plan…</p>
        <p className="text-xs text-slate-400 mt-0.5">This usually takes a few seconds</p>
      </div>
    </div>
  );
}
