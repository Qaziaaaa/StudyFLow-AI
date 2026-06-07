import type { StudyPlan } from "@studyflow/shared";

export interface ResultsSectionProps {
  plan: StudyPlan | null;
  error: string | null;
  visible: boolean;
}

const priorityStyles: Record<StudyPlan["priority"], { pill: string; dot: string; label: string }> = {
  High:   { pill: "bg-red-50 text-red-700 border-red-200",       dot: "bg-red-500",    label: "High — due very soon"    },
  Medium: { pill: "bg-amber-50 text-amber-700 border-amber-200", dot: "bg-amber-400",  label: "Medium — plan ahead"     },
  Low:    { pill: "bg-green-50 text-green-700 border-green-200", dot: "bg-green-500",  label: "Low — plenty of time"    },
};

const difficultyStyles: Record<StudyPlan["difficulty"], string> = {
  Easy:   "bg-sky-50 text-sky-700 border-sky-200",
  Medium: "bg-amber-50 text-amber-700 border-amber-200",
  Hard:   "bg-purple-50 text-purple-700 border-purple-200",
};

function formatHours(h: number): string {
  if (!h || h <= 0) return "—";
  if (h < 1) return `${Math.round(h * 60)} min`;
  if (h === 1) return "1 hr";
  if (Number.isInteger(h)) return `${h} hrs`;
  const whole = Math.floor(h);
  const mins = Math.round((h - whole) * 60);
  return mins > 0 ? `${whole}h ${mins}m` : `${whole} hrs`;
}

/** Parse a phase label like "[ Build ] Set up server" → { phase: "Build", rest: "Set up server" } */
function parsePhase(name: string): { phase: string | null; task: string } {
  const match = name.match(/^\[\s*([^\]]+)\s*\]\s*(.+)/);
  if (match) return { phase: match[1].trim(), task: match[2].trim() };
  return { phase: null, task: name };
}

const phaseColors: Record<string, string> = {
  Planning:    "bg-violet-100 text-violet-700",
  Setup:       "bg-slate-100 text-slate-600",
  Database:    "bg-blue-100 text-blue-700",
  Backend:     "bg-indigo-100 text-indigo-700",
  Frontend:    "bg-cyan-100 text-cyan-700",
  Auth:        "bg-orange-100 text-orange-700",
  Testing:     "bg-yellow-100 text-yellow-700",
  Deploy:      "bg-green-100 text-green-700",
  Docs:        "bg-teal-100 text-teal-700",
  Understand:  "bg-sky-100 text-sky-700",
  Research:    "bg-blue-100 text-blue-700",
  Plan:        "bg-violet-100 text-violet-700",
  Draft:       "bg-indigo-100 text-indigo-700",
  Edit:        "bg-amber-100 text-amber-700",
  Submit:      "bg-green-100 text-green-700",
  Structure:   "bg-violet-100 text-violet-700",
  Build:       "bg-indigo-100 text-indigo-700",
  Design:      "bg-pink-100 text-pink-700",
  Rehearse:    "bg-orange-100 text-orange-700",
  Deliver:     "bg-green-100 text-green-700",
  Analyse:     "bg-cyan-100 text-cyan-700",
  Write:       "bg-indigo-100 text-indigo-700",
  Review:      "bg-amber-100 text-amber-700",
};

function phaseColor(phase: string | null): string {
  if (!phase) return "bg-slate-100 text-slate-600";
  return phaseColors[phase] ?? "bg-brand-100 text-brand-700";
}

const card = "bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden";
const sectionLabel = "text-xs font-semibold uppercase tracking-widest text-slate-400";

export function ResultsSection({ plan, error, visible }: ResultsSectionProps) {
  if (!visible) return null;

  if (error) {
    return (
      <div className={`${card} p-6 flex items-start gap-4`} aria-label="Study plan error">
        <div className="w-9 h-9 rounded-full bg-red-50 border border-red-200 flex items-center justify-center flex-shrink-0">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/>
            <circle cx="12" cy="16" r="0.5" fill="#ef4444"/>
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
  const activeDays = plan.schedule.filter(e => e.estimatedHours > 0).length;
  const avgHrsPerDay = activeDays > 0 ? totalHrs / activeDays : 0;

  return (
    <div className="space-y-4" aria-label="Study plan results">

      {/* ── Overview ── */}
      <div className={`${card} p-6`}>
        <p className={`${sectionLabel} mb-3`}>Overview</p>

        <div className="flex flex-wrap gap-2 mb-4">
          <span aria-label={`Priority: ${plan.priority}`}
            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${pri.pill}`}>
            <span className={`w-2 h-2 rounded-full ${pri.dot}`} />
            {pri.label}
          </span>
          <span aria-label={`Overall difficulty: ${plan.difficulty}`}
            className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${difficultyStyles[plan.difficulty]}`}>
            {plan.difficulty} difficulty
          </span>
          <span className="inline-flex items-center rounded-full border border-brand-200 bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700">
            {formatHours(totalHrs)} total · {plan.tasks.length} tasks
          </span>
        </div>

        <p className="text-sm text-slate-600 leading-relaxed">{plan.summary}</p>

        {/* Daily commitment summary */}
        {activeDays > 0 && (
          <div className="mt-4 flex items-center gap-3 bg-brand-50 border border-brand-100 rounded-xl px-4 py-3">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#4f46e5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
            </svg>
            <p className="text-xs text-brand-700 font-medium">
              Spread across <strong>{activeDays} study days</strong> — roughly{" "}
              <strong>{formatHours(Math.round(avgHrsPerDay * 2) / 2)} per day</strong> on average to finish on time.
            </p>
          </div>
        )}
      </div>

      {/* ── Day-by-Day Schedule ── */}
      <div className={card} aria-label="Day-by-Day Schedule">
        <div className="px-6 pt-5 pb-4 border-b border-slate-100">
          <p className={`${sectionLabel} mb-1`}>Day-by-Day Schedule</p>
          <h2 className="text-base font-semibold text-navy-800">What to work on — and for how long</h2>
          <p className="text-xs text-slate-400 mt-0.5">Time shown is your daily study commitment</p>
        </div>

        <div className="divide-y divide-slate-100">
          {plan.schedule.map((entry, i) => {
            const isToday = i === 0;
            const isLast = i === plan.schedule.length - 1;
            const hasWork = entry.estimatedHours > 0;

            return (
              <div key={entry.day} className={`flex items-start gap-4 px-6 py-4 ${isToday ? "bg-brand-50/50" : ""}`}>
                {/* Day circle */}
                <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                  isToday ? "bg-brand-600 text-white" :
                  isLast  ? "bg-green-500 text-white" :
                  hasWork ? "bg-slate-800 text-white" :
                            "bg-slate-100 text-slate-400"
                }`}>
                  {isLast ? "✓" : i + 1}
                </div>

                <div className="flex-1 min-w-0">
                  {/* Day label + time badge on same row */}
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
                      {entry.day}
                    </span>
                    {hasWork && (
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${
                        isToday
                          ? "bg-brand-600 text-white border-brand-600"
                          : isLast
                          ? "bg-green-50 text-green-700 border-green-200"
                          : "bg-slate-100 text-slate-600 border-slate-200"
                      }`}>
                        {formatHours(entry.estimatedHours)}
                      </span>
                    )}
                    {isToday && (
                      <span className="text-xs font-semibold text-brand-600 bg-brand-50 border border-brand-200 rounded-full px-2 py-0.5">
                        Start today
                      </span>
                    )}
                  </div>

                  {/* Activity */}
                  <p className={`text-sm leading-snug ${
                    hasWork || isLast ? "text-slate-800 font-medium" : "text-slate-400 italic"
                  }`}>
                    {entry.activity || "Buffer day — catch up if needed"}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Task Breakdown ── */}
      <div className={card} aria-label="Task Breakdown">
        <div className="px-6 pt-5 pb-4 border-b border-slate-100">
          <p className={`${sectionLabel} mb-1`}>Full Task Breakdown</p>
          <h2 className="text-base font-semibold text-navy-800">Every step from start to finish</h2>
        </div>

        <ul className="divide-y divide-slate-100">
          {plan.tasks.map((task, i) => {
            const { phase, task: taskName } = parsePhase(task.name);
            return (
              <li key={`${task.name}-${i}`} className="flex items-start gap-3 px-6 py-4">
                {/* Step number */}
                <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-500 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                  {i + 1}
                </span>

                <div className="flex-1 min-w-0">
                  {/* Phase tag */}
                  {phase && (
                    <span className={`inline-block text-xs font-semibold px-2 py-0.5 rounded-md mb-1 ${phaseColor(phase)}`}>
                      {phase}
                    </span>
                  )}
                  {/* Task name */}
                  <p className="text-sm font-medium text-slate-800 leading-snug">{taskName}</p>
                </div>

                {/* Time + difficulty */}
                <div className="flex flex-col items-end gap-1 flex-shrink-0 ml-2">
                  <span className="text-xs font-semibold text-slate-500 whitespace-nowrap">
                    {formatHours(task.estimatedHours)}
                  </span>
                  <span aria-label={`Task difficulty: ${task.difficulty}`}
                    className={`rounded-full border px-2 py-0.5 text-xs font-semibold ${difficultyStyles[task.difficulty]}`}>
                    {task.difficulty}
                  </span>
                </div>
              </li>
            );
          })}
        </ul>
      </div>

    </div>
  );
}
