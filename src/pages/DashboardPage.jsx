import { Link } from 'react-router';
import { useTodo } from '../contexts/TodoContext';
import { useTaskMeta } from '../contexts/TaskMetaContext';
import { useCrm } from '../contexts/CrmContext';
import { useReminders } from '../contexts/RemindersContext';
import {
    todayKey, lastNDayKeys, shortDayLabel, weekStartKey,
    toLocalKey, addDaysToKey, dueLabel,
} from '../utils/dates';

function StatCard({ label, value, sub, delay }) {
    return (
        <div className={`card card-hover animate-enter-${delay} p-5`}>
            <p className="text-[0.7rem] font-bold uppercase tracking-[0.14em] text-slate-500">{label}</p>
            <p className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900">{value}</p>
            {sub && <p className="mt-1 text-xs font-medium text-slate-500">{sub}</p>}
        </div>
    );
}

// Pure-SVG bar chart: completions per day over the trailing 7 days.
function WeeklyChart({ dayCounts }) {
    const keys = lastNDayKeys(7);
    const values = keys.map((k) => dayCounts.get(k) || 0);
    const max = Math.max(1, ...values);

    const W = 560, H = 210, PAD_L = 8, PAD_B = 30, PAD_T = 26;
    const plotH = H - PAD_B - PAD_T;
    const slot = (W - PAD_L * 2) / 7;
    const barW = Math.min(52, slot * 0.55);

    return (
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="Tasks completed per day, last 7 days">
            <defs>
                <linearGradient id="pp-bar" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6366f1" />
                    <stop offset="100%" stopColor="#8b5cf6" />
                </linearGradient>
            </defs>
            {/* baseline */}
            <line x1={PAD_L} y1={H - PAD_B} x2={W - PAD_L} y2={H - PAD_B} stroke="#e2e8f0" strokeWidth="1.5" />
            {keys.map((key, i) => {
                const v = values[i];
                const h = (v / max) * plotH;
                const x = PAD_L + slot * i + (slot - barW) / 2;
                const y = H - PAD_B - h;
                const isToday = i === 6;
                return (
                    <g key={key}>
                        <rect
                            x={x}
                            y={y}
                            width={barW}
                            height={Math.max(h, v > 0 ? 6 : 2)}
                            rx={7}
                            fill={v > 0 ? 'url(#pp-bar)' : '#eef2ff'}
                            opacity={isToday && v > 0 ? 1 : v > 0 ? 0.85 : 1}
                        />
                        {v > 0 && (
                            <text x={x + barW / 2} y={y - 8} textAnchor="middle" fontSize="13" fontWeight="800" fill="#4f46e5">
                                {v}
                            </text>
                        )}
                        <text
                            x={x + barW / 2}
                            y={H - PAD_B + 20}
                            textAnchor="middle"
                            fontSize="12"
                            fontWeight={isToday ? '800' : '600'}
                            fill={isToday ? '#4f46e5' : '#94a3b8'}
                        >
                            {shortDayLabel(key)}
                        </text>
                    </g>
                );
            })}
        </svg>
    );
}

function dayCountsFromMeta(meta) {
    const map = new Map();
    for (const m of Object.values(meta)) {
        if (!m.completedAt) continue;
        const key = toLocalKey(new Date(m.completedAt));
        map.set(key, (map.get(key) || 0) + 1);
    }
    return map;
}

function calcStreak(dayCounts) {
    let streak = 0;
    let cursor = todayKey();
    if (!dayCounts.get(cursor)) cursor = addDaysToKey(cursor, -1);
    while (dayCounts.get(cursor)) {
        streak += 1;
        cursor = addDaysToKey(cursor, -1);
    }
    return streak;
}

export default function DashboardPage() {
    const { todoList } = useTodo();
    const { meta, getMeta } = useTaskMeta();
    const { contacts, stages, cards } = useCrm();
    const { overdueTasks, dueTodayTasks } = useReminders();

    const tKey = todayKey();
    const counts = dayCountsFromMeta(meta);
    const completedToday = counts.get(tKey) || 0;
    const thisWeekStart = weekStartKey(tKey);
    const completedThisWeek = [...counts.entries()]
        .filter(([key]) => key >= thisWeekStart && key <= tKey)
        .reduce((sum, [, v]) => sum + v, 0);

    const totalTasks = todoList.length;
    const completedTotal = todoList.filter((t) => t.isCompleted).length;
    const completionRate = totalTasks === 0 ? '—' : `${Math.round((completedTotal / totalTasks) * 100)}%`;
    const streak = calcStreak(counts);

    const attention = [
        ...overdueTasks.map((t) => ({ task: t, kind: 'overdue' })),
        ...dueTodayTasks.map((t) => ({ task: t, kind: 'today' })),
    ];

    const pipelineSub = stages.map((s) => {
        const n = cards.filter((c) => c.stageId === s.id).length;
        return `${n} ${s.name}`;
    }).join(' · ');

    const stats = [
        { label: 'Completed today', value: completedToday, sub: 'tasks finished today' },
        { label: 'Completed this week', value: completedThisWeek, sub: 'Monday – today' },
        { label: 'Completion rate', value: completionRate, sub: `${completedTotal} of ${totalTasks} tasks done` },
        { label: 'Day streak', value: streak, sub: streak === 1 ? 'day in a row' : 'days in a row' },
        { label: 'Contacts', value: contacts.length, sub: 'people in your CRM' },
        { label: 'Pipeline cards', value: cards.length, sub: pipelineSub || 'no stages yet' },
    ];

    return (
        <div className="mx-auto max-w-5xl">
            <div className="animate-enter mb-8">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-indigo-500">Progress</p>
                <h2 className="mt-2 text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
                    Your week at a <span className="gradient-text">glance</span>
                </h2>
                <p className="mt-2 text-sm text-slate-500">
                    Completions, streaks, and everything that needs your attention.
                </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
                {stats.map((s, i) => (
                    <StatCard key={s.label} {...s} delay={(i % 3) + 1} />
                ))}
            </div>

            {/* Weekly chart */}
            <div className="card animate-enter-2 mt-5 p-6">
                <div className="mb-4 flex items-center justify-between">
                    <div>
                        <h3 className="text-base font-extrabold tracking-tight text-slate-900">Activity</h3>
                        <p className="text-xs font-medium text-slate-500">Tasks completed per day · last 7 days</p>
                    </div>
                </div>
                <WeeklyChart dayCounts={counts} />
                {completedThisWeek === 0 && (
                    <p className="mt-2 text-center text-sm font-medium text-slate-400">
                        No completions yet this week — check off a task and watch the bars grow.
                    </p>
                )}
            </div>

            {/* Needs attention */}
            <div className="card animate-enter-3 mt-5 p-6">
                <div className="mb-4 flex items-center justify-between">
                    <div>
                        <h3 className="text-base font-extrabold tracking-tight text-slate-900">Needs attention</h3>
                        <p className="text-xs font-medium text-slate-500">Overdue and due-today tasks</p>
                    </div>
                    <Link to="/todos" className="btn-ghost px-4 py-2 text-xs">Open tasks</Link>
                </div>
                {attention.length === 0 ? (
                    <p className="rounded-xl bg-emerald-50/70 px-4 py-3 text-sm font-medium text-emerald-700">
                        All clear — nothing overdue or due today. 🎉
                    </p>
                ) : (
                    <ul className="space-y-2">
                        {attention.map(({ task, kind }) => {
                            const m = getMeta(task.id);
                            return (
                                <li
                                    key={`${kind}-${task.id}`}
                                    className={`flex items-center justify-between gap-3 rounded-xl border px-4 py-3 ${
                                        kind === 'overdue'
                                            ? 'border-red-200 bg-red-50/60'
                                            : 'border-amber-200 bg-amber-50/60'
                                    }`}
                                >
                                    <span className="min-w-0 flex-1 truncate text-sm font-semibold text-slate-800">
                                        {task.title}
                                    </span>
                                    <span className={`shrink-0 rounded-full px-2.5 py-1 text-[0.7rem] font-bold uppercase tracking-wide ${
                                        kind === 'overdue' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-800'
                                    }`}>
                                        {kind === 'overdue' ? dueLabel(m.dueDate) : 'Due today'}
                                    </span>
                                </li>
                            );
                        })}
                    </ul>
                )}
            </div>
        </div>
    );
}
