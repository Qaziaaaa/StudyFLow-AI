import type { StudyPlan } from "@studyflow/shared";

export interface ResultsSectionProps {
  plan: StudyPlan | null;
  error: string | null;
  visible: boolean;
}

function formatHours(h: number): string {
  if (!h || h <= 0) return "—";
  if (h < 1) return `${Math.round(h * 60)} min`;
  if (h === 1) return "1 hr";
  if (Number.isInteger(h)) return `${h} hrs`;
  const whole = Math.floor(h);
  const mins = Math.round((h - whole) * 60);
  return mins > 0 ? `${whole}h ${mins}m` : `${whole} hrs`;
}

function parsePhase(name: string): { phase: string | null; task: string } {
  const match = name.match(/^\[\s*([^\]]+)\s*\]\s*(.+)/);
  if (match) return { phase: match[1].trim(), task: match[2].trim() };
  return { phase: null, task: name };
}

// Phase → color token
const PHASE_COLORS: Record<string, { bg: string; text: string }> = {
  Planning:   { bg: "#f3f0ff", text: "#7c3aed" },
  Setup:      { bg: "#f0f9ff", text: "#0369a1" },
  Database:   { bg: "#eff6ff", text: "#1d4ed8" },
  Backend:    { bg: "#eef2ff", text: "#4338ca" },
  Frontend:   { bg: "#ecfeff", text: "#0e7490" },
  Auth:       { bg: "#fff7ed", text: "#c2410c" },
  Testing:    { bg: "#fefce8", text: "#a16207" },
  Deploy:     { bg: "#f0fdf4", text: "#15803d" },
  Docs:       { bg: "#f0fdfa", text: "#0f766e" },
  Understand: { bg: "#f0f9ff", text: "#0369a1" },
  Research:   { bg: "#eff6ff", text: "#1d4ed8" },
  Plan:       { bg: "#f3f0ff", text: "#7c3aed" },
  Draft:      { bg: "#eef2ff", text: "#4338ca" },
  Edit:       { bg: "#fff7ed", text: "#c2410c" },
  Submit:     { bg: "#f0fdf4", text: "#15803d" },
  Structure:  { bg: "#f3f0ff", text: "#7c3aed" },
  Build:      { bg: "#eef2ff", text: "#4338ca" },
  Design:     { bg: "#fdf4ff", text: "#9333ea" },
  Rehearse:   { bg: "#fff7ed", text: "#c2410c" },
  Deliver:    { bg: "#f0fdf4", text: "#15803d" },
  Analyse:    { bg: "#ecfeff", text: "#0e7490" },
  Write:      { bg: "#eef2ff", text: "#4338ca" },
  Review:     { bg: "#fefce8", text: "#a16207" },
};

function phaseStyle(phase: string | null) {
  if (!phase) return { bg: "#f8fafc", text: "#475569" };
  return PHASE_COLORS[phase] ?? { bg: "#eef2ff", text: "#4338ca" };
}

export function ResultsSection({ plan, error, visible }: ResultsSectionProps) {
  if (!visible) return null;

  // ── Error ──
  if (error) {
    return (
      <div className="card p-5 flex items-start gap-4" aria-label="Study plan error"
        style={{ borderLeft: "3px solid #ef4444" }}>
        <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
          style={{ background: "#fef2f2", border: "1px solid #fecaca" }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><circle cx="12" cy="16" r="0.5" fill="#dc2626"/>
          </svg>
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-800">Couldn't generate study plan</p>
          <p className="text-sm text-slate-500 mt-1 leading-relaxed">{error}</p>
        </div>
      </div>
    );
  }

  if (!plan) return null;

  const totalHrs = plan.tasks.reduce((s, t) => s + t.estimatedHours, 0);
  const activeDays = plan.schedule.filter(e => e.estimatedHours > 0).length;
  const avgHrsPerDay = activeDays > 0 ? Math.round((totalHrs / activeDays) * 2) / 2 : 0;

  const priorityConfig = {
    High:   { cls: "badge-priority-high",   icon: "🔴", label: "High Priority",   hint: "Due very soon — start today" },
    Medium: { cls: "badge-priority-medium", icon: "🟡", label: "Medium Priority", hint: "Plan ahead, stay consistent" },
    Low:    { cls: "badge-priority-low",    icon: "🟢", label: "Low Priority",    hint: "Plenty of time — stay steady" },
  }[plan.priority];

  const diffCls = { Easy: "badge-diff-easy", Medium: "badge-diff-medium", Hard: "badge-diff-hard" }[plan.difficulty];

  return (
    <div className="space-y-4" aria-label="Study plan results">

      {/* ══ OVERVIEW CARD ══ */}
      <div className="card-elevated overflow-hidden">
        {/* Gradient top strip */}
        <div className="h-1" style={{ background: "linear-gradient(90deg, #4f46e5, #818cf8, #6366f1)" }} />

        <div className="px-6 py-5">
          {/* Title row */}
          <div className="flex items-start justify-between gap-3 mb-4">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1">Your Study Plan</p>
              <h2 className="text-base font-bold text-slate-900">Overview</h2>
            </div>
            <span className={`badge ${priorityConfig.cls}`}>
              {priorityConfig.icon} {priorityConfig.label}
            </span>
          </div>

          {/* Summary */}
          <p className="text-sm text-slate-600 leading-relaxed mb-4">{plan.summary}</p>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-3 mb-4">
            {[
              { label: "Total time", value: formatHours(totalHrs), icon: "⏱" },
              { label: "Tasks", value: String(plan.tasks.length), icon: "✅" },
              { label: "Avg / day", value: activeDays > 0 ? formatHours(avgHrsPerDay) : "—", icon: "📅" },
            ].map(stat => (
              <div key={stat.label} className="rounded-xl p-3 text-center"
                style={{ background: "#f8fafc", border: "1px solid #e2e8f0", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
                <div className="text-lg mb-0.5">{stat.icon}</div>
                <div className="text-base font-bold text-slate-900">{stat.value}</div>
                <div className="text-xs text-slate-400 mt-0.5">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Badge row */}
          <div className="flex flex-wrap gap-2">
            <span aria-label={`Overall difficulty: ${plan.difficulty}`} className={`badge ${diffCls}`}>
              {plan.difficulty} difficulty
            </span>
            <span className="badge badge-neutral">{priorityConfig.hint}</span>
          </div>
        </div>
      </div>

      {/* ══ SCHEDULE CARD ══ */}
      <div className="card-elevated overflow-hidden" aria-label="Day-by-Day Schedule">
        {/* Header */}
        <div className="px-6 py-4" style={{ borderBottom: "1px solid #f1f5f9" }}>
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ background: "#eef2ff", border: "1px solid #c7d2fe" }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
            </div>
            <div>
              <h2 className="text-sm font-semibold text-slate-900">Day-by-Day Schedule</h2>
              <p className="text-xs text-slate-400">What to do each day — and how long it takes</p>
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div className="px-6 py-4 space-y-2">
          {plan.schedule.map((entry, i) => {
            const isFirst = i === 0;
            const isLast = i === plan.schedule.length - 1;
            const hasWork = entry.estimatedHours > 0;

            return (
              <div key={entry.day}
                className="flex items-start gap-3 rounded-xl p-3 transition-colors"
                style={{
                  background: isFirst ? "#f5f7ff" : isLast ? "#f0fdf4" : "#fafafa",
                  border: isFirst ? "1px solid #c7d2fe" : isLast ? "1px solid #bbf7d0" : "1px solid #f1f5f9",
                  boxShadow: "0 1px 2px rgba(0,0,0,0.03)"
                }}>

                {/* Day circle */}
                <div className="timeline-dot flex-shrink-0"
                  style={{
                    background: isFirst ? "linear-gradient(135deg,#4f46e5,#6366f1)"
                               : isLast  ? "linear-gradient(135deg,#16a34a,#22c55e)"
                               : hasWork ? "#1e293b"
                               : "#e2e8f0",
                    color: (isFirst || isLast || hasWork) ? "#fff" : "#94a3b8",
                    fontSize: isLast ? "14px" : "12px"
                  }}>
                  {isLast ? "✓" : i + 1}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                    <span className="text-xs font-semibold uppercase tracking-wide"
                      style={{ color: isFirst ? "#4338ca" : isLast ? "#15803d" : "#94a3b8" }}>
                      {entry.day}
                    </span>
                    {isFirst && <span className="badge" style={{ background:"#4f46e5", color:"#fff", borderColor:"#4f46e5", fontSize:"0.6rem", padding:"2px 7px" }}>Start today</span>}
                    {isLast && <span className="badge badge-success" style={{ fontSize:"0.6rem", padding:"2px 7px" }}>Submit</span>}
                  </div>
                  <p className="text-sm leading-snug"
                    style={{ color: hasWork || isLast ? "#0f172a" : "#94a3b8", fontStyle: hasWork || isLast ? "normal" : "italic" }}>
                    {entry.activity || "Buffer day — catch up if needed"}
                  </p>
                </div>

                {/* Time badge */}
                {hasWork && (
                  <span className="badge badge-time flex-shrink-0 font-bold"
                    style={{
                      background: isFirst ? "#eef2ff" : isLast ? "#f0fdf4" : "#f8fafc",
                      color: isFirst ? "#4338ca" : isLast ? "#15803d" : "#475569",
                      borderColor: isFirst ? "#c7d2fe" : isLast ? "#bbf7d0" : "#e2e8f0",
                    }}>
                    ⏱ {formatHours(entry.estimatedHours)}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ══ TASKS CARD ══ */}
      <div className="card-elevated overflow-hidden" aria-label="Task Breakdown">
        {/* Header */}
        <div className="px-6 py-4" style={{ borderBottom: "1px solid #f1f5f9" }}>
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ background: "#f0fdf4", border: "1px solid #bbf7d0" }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
              </svg>
            </div>
            <div>
              <h2 className="text-sm font-semibold text-slate-900">Full Task Breakdown</h2>
              <p className="text-xs text-slate-400">Every step from start to final submission</p>
            </div>
            <div className="ml-auto">
              <span className="badge badge-neutral">{plan.tasks.length} tasks</span>
            </div>
          </div>
        </div>

        {/* Tasks list */}
        <ul className="px-4 py-3 space-y-2">
          {plan.tasks.map((task, i) => {
            const { phase, task: taskName } = parsePhase(task.name);
            const ps = phaseStyle(phase);
            const diffCls2 = { Easy: "badge-diff-easy", Medium: "badge-diff-medium", Hard: "badge-diff-hard" }[task.difficulty];

            return (
              <li key={`${task.name}-${i}`}
                className="flex items-start gap-3 rounded-xl p-3.5 transition-colors hover:bg-slate-50"
                style={{ border: "1px solid #f1f5f9", boxShadow: "0 1px 2px rgba(0,0,0,0.03)" }}>

                {/* Step number */}
                <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5"
                  style={{ background: "#f1f5f9", color: "#475569", boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }}>
                  {i + 1}
                </div>

                <div className="flex-1 min-w-0">
                  {/* Phase tag */}
                  {phase && (
                    <span className="phase-pill mb-1.5 inline-block"
                      style={{ background: ps.bg, color: ps.text }}>
                      {phase}
                    </span>
                  )}
                  <p className="text-sm font-medium text-slate-800 leading-snug">{taskName}</p>
                </div>

                {/* Meta */}
                <div className="flex flex-col items-end gap-1.5 flex-shrink-0 ml-2">
                  <span className="badge badge-time font-semibold">{formatHours(task.estimatedHours)}</span>
                  <span aria-label={`Task difficulty: ${task.difficulty}`} className={`badge ${diffCls2}`}>
                    {task.difficulty}
                  </span>
                </div>
              </li>
            );
          })}
        </ul>

        {/* Footer total */}
        <div className="mx-4 mb-4 px-4 py-3 rounded-xl flex items-center justify-between"
          style={{ background: "#fafbff", border: "1px solid #e0e7ff" }}>
          <span className="text-xs font-semibold text-slate-500">Total estimated time</span>
          <span className="text-sm font-bold text-indigo-700">{formatHours(totalHrs)}</span>
        </div>
      </div>

    </div>
  );
}
