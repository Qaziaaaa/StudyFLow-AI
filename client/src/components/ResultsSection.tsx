import type { StudyPlan } from "@studyflow/shared";

export interface ResultsSectionProps {
  plan: StudyPlan | null;
  error: string | null;
  visible: boolean;
}

// ── SVG Icons ───────────────────────────────────────────────────────────────
const Icons = {
  Clock: ({ size = 16, color = "currentColor" }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
    </svg>
  ),
  CheckSquare: ({ size = 16, color = "currentColor" }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
    </svg>
  ),
  Calendar: ({ size = 16, color = "currentColor" }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
    </svg>
  ),
  AlertCircle: ({ size = 16, color = "currentColor" }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
    </svg>
  ),
  CheckCircle: ({ size = 16, color = "currentColor" }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  ),
  Zap: ({ size = 16, color = "currentColor" }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
    </svg>
  ),
  BookOpen: ({ size = 16, color = "currentColor" }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
    </svg>
  ),
  Target: ({ size = 16, color = "currentColor" }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>
    </svg>
  ),
  TrendingUp: ({ size = 16, color = "currentColor" }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/>
    </svg>
  ),
  Pause: ({ size = 16, color = "currentColor" }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/>
    </svg>
  ),
  ArrowRight: ({ size = 16, color = "currentColor" }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
    </svg>
  ),
  Upload: ({ size = 16, color = "currentColor" }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/>
      <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/>
    </svg>
  ),
};

// ── Helpers ─────────────────────────────────────────────────────────────────

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

const PHASE_COLORS: Record<string, { bg: string; color: string }> = {
  Planning:   { bg: "#f3f0ff", color: "#7c3aed" },
  Setup:      { bg: "#f0f9ff", color: "#0369a1" },
  Database:   { bg: "#eff6ff", color: "#1d4ed8" },
  Backend:    { bg: "#eef2ff", color: "#4338ca" },
  Frontend:   { bg: "#ecfeff", color: "#0e7490" },
  Auth:       { bg: "#fff7ed", color: "#c2410c" },
  Testing:    { bg: "#fefce8", color: "#a16207" },
  Deploy:     { bg: "#f0fdf4", color: "#15803d" },
  Docs:       { bg: "#f0fdfa", color: "#0f766e" },
  Understand: { bg: "#f0f9ff", color: "#0369a1" },
  Research:   { bg: "#eff6ff", color: "#1d4ed8" },
  Plan:       { bg: "#f3f0ff", color: "#7c3aed" },
  Draft:      { bg: "#eef2ff", color: "#4338ca" },
  Edit:       { bg: "#fff7ed", color: "#c2410c" },
  Submit:     { bg: "#f0fdf4", color: "#15803d" },
  Structure:  { bg: "#f3f0ff", color: "#7c3aed" },
  Build:      { bg: "#eef2ff", color: "#4338ca" },
  Design:     { bg: "#fdf4ff", color: "#9333ea" },
  Rehearse:   { bg: "#fff7ed", color: "#c2410c" },
  Deliver:    { bg: "#f0fdf4", color: "#15803d" },
  Analyse:    { bg: "#ecfeff", color: "#0e7490" },
  Write:      { bg: "#eef2ff", color: "#4338ca" },
  Review:     { bg: "#fefce8", color: "#a16207" },
};

function phaseStyle(phase: string | null) {
  if (!phase) return { bg: "#f1f5f9", color: "#64748b" };
  return PHASE_COLORS[phase] ?? { bg: "#eef2ff", color: "#4338ca" };
}

// ── Component ────────────────────────────────────────────────────────────────

export function ResultsSection({ plan, error, visible }: ResultsSectionProps) {
  if (!visible) return null;

  // Error state
  if (error) {
    return (
      <div className="card p-5 flex items-start gap-4" aria-label="Study plan error"
        style={{ borderLeft: "3px solid #ef4444" }}>
        <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
          style={{ background: "#fef2f2", border: "1px solid #fecaca" }}>
          <Icons.AlertCircle size={16} color="#dc2626" />
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
    High:   { cls: "badge-priority-high",   icon: <Icons.Zap size={11} color="#dc2626" />,        label: "High Priority",   hint: "Due very soon — start today" },
    Medium: { cls: "badge-priority-medium", icon: <Icons.TrendingUp size={11} color="#d97706" />,  label: "Medium Priority", hint: "Plan ahead, stay consistent" },
    Low:    { cls: "badge-priority-low",    icon: <Icons.Target size={11} color="#16a34a" />,       label: "Low Priority",    hint: "Plenty of time — stay steady" },
  }[plan.priority];

  const diffCls = { Easy: "badge-diff-easy", Medium: "badge-diff-medium", Hard: "badge-diff-hard" }[plan.difficulty];

  return (
    <div className="space-y-4" aria-label="Study plan results">

      {/* ══ OVERVIEW ══ */}
      <div className="card-elevated overflow-hidden">
        <div className="h-1" style={{ background: "linear-gradient(90deg,#4f46e5,#818cf8,#6366f1)" }} />
        <div className="px-6 py-5">

          <div className="flex items-start justify-between gap-3 mb-3">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1">Your Study Plan</p>
              <h2 className="text-lg font-bold text-slate-900">Overview</h2>
            </div>
            <span className={`badge ${priorityConfig.cls}`} aria-label={`Priority: ${plan.priority}`}>
              {priorityConfig.icon}
              {priorityConfig.label}
            </span>
          </div>

          <p className="text-sm text-slate-600 leading-relaxed mb-4">{plan.summary}</p>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 mb-4">
            {[
              { label: "Total time",  value: formatHours(totalHrs),                icon: <Icons.Clock size={20} color="#6366f1" />,       bg: "#f5f3ff", border: "#ddd6fe" },
              { label: "Tasks",       value: String(plan.tasks.length),            icon: <Icons.CheckSquare size={20} color="#16a34a" />,  bg: "#f0fdf4", border: "#bbf7d0" },
              { label: "Avg / day",   value: activeDays > 0 ? formatHours(avgHrsPerDay) : "—", icon: <Icons.Calendar size={20} color="#0369a1" />, bg: "#f0f9ff", border: "#bae6fd" },
            ].map(stat => (
              <div key={stat.label} className="rounded-xl p-3 text-center"
                style={{
                  background: stat.bg,
                  border: `1.5px solid ${stat.border}`,
                  boxShadow: "0 1px 4px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.04), 0 0 0 1px rgba(255,255,255,0.8) inset",
                }}>
                <div className="flex justify-center mb-1.5">{stat.icon}</div>
                <div className="text-lg font-bold text-slate-900">{stat.value}</div>
                <div className="text-xs text-slate-500 mt-0.5">{stat.label}</div>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-2">
            <span aria-label={`Overall difficulty: ${plan.difficulty}`} className={`badge ${diffCls}`}>
              {plan.difficulty} difficulty
            </span>
            <span className="badge badge-neutral">{priorityConfig.hint}</span>
          </div>
        </div>
      </div>

      {/* ══ SCHEDULE ══ */}
      <div className="card-elevated overflow-hidden" aria-label="Day-by-Day Schedule">
        <div className="px-6 py-4" style={{ borderBottom: "1px solid #f1f5f9" }}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: "#eef2ff", border: "1px solid #c7d2fe" }}>
              <Icons.Calendar size={15} color="#6366f1" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-slate-900">Day-by-Day Schedule</h2>
              <p className="text-xs text-slate-400 mt-0.5">Your daily roadmap — what to do and how long it takes</p>
            </div>
          </div>
        </div>

        <div className="px-5 py-4 space-y-2.5">
          {plan.schedule.map((entry, i) => {
            const isFirst = i === 0;
            const isLast = i === plan.schedule.length - 1;
            const isBuffer = entry.tasks.length === 0 && !isLast;
            const taskCount = entry.tasks.length;

            return (
              <div key={entry.day}
                className="rounded-xl overflow-hidden"
                style={{
                  border: isFirst ? "2px solid #a5b4fc"
                        : isLast  ? "2px solid #6ee7b7"
                        : isBuffer ? "1.5px solid #e2e8f0"
                        : "1.5px solid #cbd5e1",
                  boxShadow: isFirst
                    ? "0 2px 8px rgba(99,102,241,0.12), 0 8px 24px rgba(99,102,241,0.08), 0 0 0 1px rgba(255,255,255,0.8) inset"
                    : isLast
                    ? "0 2px 8px rgba(22,163,74,0.12), 0 8px 24px rgba(22,163,74,0.08), 0 0 0 1px rgba(255,255,255,0.8) inset"
                    : isBuffer
                    ? "0 1px 3px rgba(0,0,0,0.04)"
                    : "0 1px 4px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.04), 0 0 0 1px rgba(255,255,255,0.8) inset",
                }}>

                {/* Day header row */}
                <div className="flex items-center gap-3 px-4 py-3"
                  style={{
                    background: isFirst ? "linear-gradient(135deg,#f0f4ff,#e8ecff)"
                               : isLast  ? "linear-gradient(135deg,#f0fdf4,#dcfce7)"
                               : isBuffer ? "#fafafa"
                               : "#ffffff",
                    borderBottom: taskCount > 0 || isLast ? "1px solid" : "none",
                    borderColor: isFirst ? "#dbeafe" : isLast ? "#bbf7d0" : "#f1f5f9",
                  }}>

                  {/* Circle */}
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                    style={{
                      background: isFirst ? "linear-gradient(135deg,#4f46e5,#6366f1)"
                                 : isLast  ? "linear-gradient(135deg,#16a34a,#22c55e)"
                                 : isBuffer ? "#e2e8f0"
                                 : "#1e293b",
                      color: isBuffer ? "#94a3b8" : "#ffffff",
                      boxShadow: isFirst || isLast
                        ? "0 2px 8px rgba(0,0,0,0.15)"
                        : "0 1px 3px rgba(0,0,0,0.1)",
                    }}>
                    {isLast
                      ? <Icons.CheckCircle size={14} color="white" />
                      : i + 1}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold uppercase tracking-wider"
                        style={{ color: isFirst ? "#4338ca" : isLast ? "#15803d" : isBuffer ? "#94a3b8" : "#475569" }}>
                        {entry.day}
                      </span>
                      {isFirst && (
                        <span className="badge" style={{ background:"#4f46e5", color:"#fff", borderColor:"#4f46e5", fontSize:"0.6rem", padding:"2px 8px", fontWeight:700 }}>
                          Start today
                        </span>
                      )}
                      {isLast && (
                        <span className="badge badge-success" style={{ fontSize:"0.6rem", padding:"2px 8px", fontWeight:700 }}>
                          Submit
                        </span>
                      )}
                      {isBuffer && (
                        <span className="badge badge-neutral" style={{ fontSize:"0.6rem", padding:"2px 8px" }}>
                          Buffer
                        </span>
                      )}
                      {taskCount > 1 && (
                        <span className="badge badge-neutral" style={{ fontSize:"0.6rem", padding:"2px 8px" }}>
                          {taskCount} tasks
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Time badge */}
                  {entry.estimatedHours > 0 && (
                    <div className="flex items-center gap-1.5 flex-shrink-0 rounded-lg px-3 py-1.5"
                      style={{
                        background: isFirst ? "#eef2ff" : isLast ? "#f0fdf4" : "#f8fafc",
                        border: `1px solid ${isFirst ? "#c7d2fe" : isLast ? "#bbf7d0" : "#e2e8f0"}`,
                      }}>
                      <Icons.Clock size={12} color={isFirst ? "#6366f1" : isLast ? "#16a34a" : "#64748b"} />
                      <span className="text-xs font-bold"
                        style={{ color: isFirst ? "#4338ca" : isLast ? "#15803d" : "#374151" }}>
                        {formatHours(entry.estimatedHours)}
                      </span>
                    </div>
                  )}
                </div>

                {/* Task items */}
                {(taskCount > 0 || isLast) && (
                  <div className="px-4 py-3 space-y-2"
                    style={{ background: isFirst ? "#f8f9ff" : isLast ? "#f9fffe" : "#fafafa" }}>
                    {isLast && entry.tasks.length === 0 ? (
                      <div className="flex items-center gap-2.5">
                        <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                          style={{ background: "#dcfce7", border: "1px solid #86efac" }}>
                          <Icons.CheckCircle size={10} color="#16a34a" />
                        </div>
                        <span className="text-sm text-slate-700 font-medium">
                          {entry.label ?? "Final review, polish, and submit"}
                        </span>
                      </div>
                    ) : (
                      entry.tasks.map((taskName, ti) => (
                        <div key={ti} className="flex items-start gap-2.5">
                          <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                            style={{
                              background: isFirst ? "#eef2ff" : "#f1f5f9",
                              border: `1px solid ${isFirst ? "#c7d2fe" : "#e2e8f0"}`,
                            }}>
                            <Icons.ArrowRight size={9} color={isFirst ? "#6366f1" : "#94a3b8"} />
                          </div>
                          <span className="text-sm text-slate-700 leading-snug">{taskName}</span>
                        </div>
                      ))
                    )}

                    {/* Buffer message */}
                    {isBuffer && entry.label && (
                      <div className="flex items-center gap-2.5">
                        <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                          style={{ background: "#f1f5f9", border: "1px solid #e2e8f0" }}>
                          <Icons.Pause size={9} color="#94a3b8" />
                        </div>
                        <span className="text-sm text-slate-400 italic">{entry.label}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ══ TASK BREAKDOWN ══ */}
      <div className="card-elevated overflow-hidden" aria-label="Task Breakdown">
        <div className="px-6 py-4" style={{ borderBottom: "1px solid #f1f5f9" }}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: "#f0fdf4", border: "1px solid #bbf7d0" }}>
              <Icons.BookOpen size={15} color="#16a34a" />
            </div>
            <div className="flex-1">
              <h2 className="text-sm font-semibold text-slate-900">Full Task Breakdown</h2>
              <p className="text-xs text-slate-400 mt-0.5">Every step from start to final submission</p>
            </div>
            <span className="badge badge-neutral">{plan.tasks.length} tasks</span>
          </div>
        </div>

        <ul className="px-4 py-3 space-y-2.5">
          {plan.tasks.map((task, i) => {
            const { phase, task: taskName } = parsePhase(task.name);
            const ps = phaseStyle(phase);
            const tDiffCls = { Easy: "badge-diff-easy", Medium: "badge-diff-medium", Hard: "badge-diff-hard" }[task.difficulty];

            return (
              <li key={`${task.name}-${i}`}
                className="flex items-start gap-3 rounded-xl p-4 transition-all"
                style={{
                  border: "1.5px solid #e2e8f0",
                  background: "#ffffff",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.05), 0 4px 12px rgba(0,0,0,0.05), 0 0 0 1px rgba(255,255,255,0.9) inset",
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = "#f8fafc";
                  e.currentTarget.style.borderColor = "#c7d2fe";
                  e.currentTarget.style.boxShadow = "0 2px 6px rgba(0,0,0,0.07), 0 8px 20px rgba(79,70,229,0.07), 0 0 0 1px rgba(255,255,255,0.9) inset";
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = "#ffffff";
                  e.currentTarget.style.borderColor = "#e2e8f0";
                  e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.05), 0 4px 12px rgba(0,0,0,0.05), 0 0 0 1px rgba(255,255,255,0.9) inset";
                }}
              >
                {/* Step number */}
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5"
                  style={{
                    background: "linear-gradient(135deg, #f8fafc, #f1f5f9)",
                    color: "#334155",
                    border: "1.5px solid #cbd5e1",
                    boxShadow: "0 1px 4px rgba(0,0,0,0.1), 0 0 0 1px rgba(255,255,255,0.8) inset",
                  }}>
                  {i + 1}
                </div>

                <div className="flex-1 min-w-0">
                  {phase && (
                    <span className="phase-pill mb-1.5 inline-block"
                      style={{ background: ps.bg, color: ps.color }}>
                      {phase}
                    </span>
                  )}
                  <p className="text-sm font-medium text-slate-800 leading-snug">{taskName}</p>
                </div>

                <div className="flex flex-col items-end gap-1.5 flex-shrink-0 ml-2">
                  <div className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5"
                    style={{
                      background: "#f0f4ff",
                      border: "1.5px solid #c7d2fe",
                      boxShadow: "0 1px 3px rgba(79,70,229,0.08)",
                    }}>
                    <Icons.Clock size={11} color="#6366f1" />
                    <span className="text-xs font-bold text-indigo-700">{formatHours(task.estimatedHours)}</span>
                  </div>
                  <span aria-label={`Task difficulty: ${task.difficulty}`} className={`badge ${tDiffCls}`}>
                    {task.difficulty}
                  </span>
                </div>
              </li>
            );
          })}
        </ul>

        {/* Total footer */}
        <div className="mx-4 mb-4 px-4 py-3 rounded-xl flex items-center justify-between"
          style={{ background: "#f5f3ff", border: "1px solid #ddd6fe" }}>
          <div className="flex items-center gap-2">
            <Icons.Clock size={14} color="#6366f1" />
            <span className="text-xs font-semibold text-slate-600">Total estimated time</span>
          </div>
          <span className="text-sm font-bold text-indigo-700">{formatHours(totalHrs)}</span>
        </div>
      </div>

    </div>
  );
}
