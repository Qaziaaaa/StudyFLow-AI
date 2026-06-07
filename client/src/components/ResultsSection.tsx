import type { StudyPlan } from "@studyflow/shared";

export interface ResultsSectionProps {
  plan: StudyPlan | null;
  error: string | null;
  visible: boolean;
}

const priorityStyles: Record<StudyPlan["priority"], { pill: string; dot: string; label: string }> = {
  High:   { pill: "bg-red-50 text-red-700 border-red-200",    dot: "bg-red-500",    label: "High — due very soon" },
  Medium: { pill: "bg-amber-50 text-amber-700 border-amber-200", dot: "bg-amber-400", label: "Medium — plan ahead" },
  Low:    { pill: "bg-green-50 text-green-700 border-green-200", dot: "bg-green-500",  label: "Low — plenty of time" },
};

const difficultyStyles: Record<StudyPlan["difficulty"], string> = {
  Easy:   "bg-sky-50 text-sky-700 border-sky-200",
  Medium: "bg-amber-50 text-amber-700 border-amber-200",
  Hard:   "bg-purple-50 text-purple-700 border-purple-200",
};

function formatHours(h: number): string {
  if (h < 1) return `${Math.round(h * 60)} min`;
  if (h === 1) return "1 hr";
  if (Number.isInteger(h)) return `${h} hrs`;
  const whole = Math.floor(h);
  const mins = Math.round((h - whole) * 60);
  return mins > 0 ? `${whole}h ${mins}m` : `${whole} hrs`;
}

const card = "bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden";
const sectionTitle = "text-xs font-semibold uppercase tracking-widest text-slate-400 mb-3";

export function ResultsSection({ plan, error, visible }: ResultsSectionProps) {
  if (!visible) return null;

  /* Error */
  if (error) {
    return (
      <div className={`${card} p-6 flex items-start gap-4`} aria-label="Study plan error">
        <div className="w-9 h-9 rounded-full bg-red-50 border border-red-200 flex items-center justify-center flex-shrink-0">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><circle cx="12" cy="16" r="0.5" fill="#ef4444"/>
          </svg>
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-800">Couldn't generate study plan</p>
          <p className="text-sm text-slate-500 mt-1">{error}</p>
        </div>
      </div>
    );
  }

  if (!plan) return null;

  const pri = priorityStyles[plan.priority];
  const totalHrs = plan.tasks.reduce((s, t) => s + t.estimatedHours, 0);

  return (
    <div className="space-y-4" aria-label="Study plan results">

      {/* ── Overview row ── */}
      <div className={`${card} p-6`}>
        <p className={sectionTitle}>Overview</p>

        {/* Priority + Difficulty badges */}
        <div className="flex flex-wrap gap-2 mb-4">
          <span
            aria-label={`Priority: ${plan.priority}`}
            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${pri.pill}`}
          >
            <span className={`w-2 h-2 rounded-full ${pri.dot}`} />
            {pri.label}
          </span>
          <span
            aria-label={`Overall difficulty: ${plan.difficulty}`}
            className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${difficultyStyles[plan.difficulty]}`}
          >
            {plan.difficulty} difficulty
          </span>
          <span className="inline-flex items-center rounded-full border border-brand-200 bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700">
            {formatHours(totalHrs)} total · {plan.tasks.length} tasks
          </span>
        </div>

        {/* Summary */}
        <p className="text-sm text-slate-600 leading-relaxed">{plan.summary}</p>
      </div>

      {/* ── Schedule ── */}
      <div className={card} aria-label="Day-by-Day Schedule">
        <div className="px-6 pt-6 pb-4 border-b border-slate-100">
          <p className={sectionTitle}>Day-by-Day Schedule</p>
          <h2 className="text-base font-semibold text-navy-800">What to work on each day</h2>
        </div>
        <div className="divide-y divide-slate-100">
          {plan.schedule.map((entry, i) => (
            <div key={entry.day} className="flex items-start gap-4 px-6 py-4">
              {/* Day indicator */}
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                i === 0
                  ? "bg-brand-600 text-white"
                  : "bg-slate-100 text-slate-500"
              }`}>
                {i + 1}
              </div>
              <div className="flex-1 min-w-0 pt-1">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-0.5">{entry.day}</p>
                <p className={`text-sm ${entry.activity ? "text-slate-800" : "text-slate-400 italic"}`}>
                  {entry.activity || "Rest or review — no task assigned"}
                </p>
              </div>
              {i === 0 && (
                <span className="text-xs font-semibold text-brand-600 bg-brand-50 border border-brand-200 rounded-full px-2.5 py-1 flex-shrink-0">
                  Start here
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ── Tasks ── */}
      <div className={card} aria-label="Task Breakdown">
        <div className="px-6 pt-6 pb-4 border-b border-slate-100">
          <p className={sectionTitle}>Task Breakdown</p>
          <h2 className="text-base font-semibold text-navy-800">Focused study sessions</h2>
        </div>
        <ul className="divide-y divide-slate-100">
          {plan.tasks.map((task, i) => (
            <li key={`${task.name}-${i}`} className="flex items-center gap-4 px-6 py-4">
              {/* Number */}
              <span className="w-7 h-7 rounded-full bg-slate-100 text-slate-500 text-xs font-bold flex items-center justify-center flex-shrink-0">
                {i + 1}
              </span>
              {/* Name */}
              <span className="flex-1 text-sm font-medium text-slate-800">{task.name}</span>
              {/* Meta */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className="text-xs font-medium text-slate-400">
                  {formatHours(task.estimatedHours)}
                </span>
                <span
                  aria-label={`Task difficulty: ${task.difficulty}`}
                  className={`rounded-full border px-2 py-0.5 text-xs font-semibold ${difficultyStyles[task.difficulty]}`}
                >
                  {task.difficulty}
                </span>
              </div>
            </li>
          ))}
        </ul>
      </div>

    </div>
  );
}
