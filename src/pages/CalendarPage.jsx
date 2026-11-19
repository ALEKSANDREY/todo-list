import { useMemo, useState } from 'react';
import { Link } from 'react-router';
import { useTodo } from '../contexts/TodoContext';
import { useTaskMeta } from '../contexts/TaskMetaContext';
import { useCrm } from '../contexts/CrmContext';
import {
    todayKey, toLocalKey, keyToDate, dueLabel, isOverdueKey, weekStartKey,
} from '../utils/dates';

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const MONTH_NAMES = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
];

function monthCells(year, month) {
    // Weeks start Monday; pad with leading/trailing days to fill whole weeks.
    const first = new Date(year, month, 1);
    const startKey = weekStartKey(toLocalKey(first));
    const start = keyToDate(startKey);
    const last = new Date(year, month + 1, 0);
    const lastKey = toLocalKey(last);
    const cells = [];
    const d = new Date(start);
    for (let i = 0; i < 42; i++) {
        const key = toLocalKey(d);
        cells.push({ key, inMonth: key.slice(0, 7) === `${year}-${String(month + 1).padStart(2, '0')}` });
        if (key === lastKey && cells.length % 7 === 0) break;
        d.setDate(d.getDate() + 1);
    }
    return cells;
}

function DayChip({ task, overdueDay, onExpand }) {
    const chipTitle = `${task.title}${task.isCompleted ? ' (completed)' : ''}`;
    return (
        <button
            type="button"
            title={chipTitle}
            data-testid={`cal-chip-${task.id}`}
            onClick={(e) => { e.stopPropagation(); onExpand(task); }}
            className={`w-full truncate rounded-md px-1.5 py-0.5 text-left text-[0.7rem] font-bold leading-tight transition-colors ${
                task.isCompleted
                    ? 'bg-slate-100 text-slate-400 line-through'
                    : overdueDay
                        ? 'bg-red-50 text-red-700 hover:bg-red-100'
                        : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
            }`}
        >
            {task.title}
        </button>
    );
}

export default function CalendarPage() {
    const { todoList, addTodo } = useTodo();
    const { getMeta, setMeta } = useTaskMeta();
    const { getContact } = useCrm();

    const now = new Date();
    const [year, setYear] = useState(now.getFullYear());
    const [month, setMonth] = useState(now.getMonth());
    const [selectedKey, setSelectedKey] = useState(todayKey());
    const [expandedTaskId, setExpandedTaskId] = useState(null);
    const [panelAdd, setPanelAdd] = useState('');
    const [adding, setAdding] = useState(false);

    const cells = useMemo(() => monthCells(year, month), [year, month]);

    const tasksByDay = useMemo(() => {
        const map = {};
        for (const t of todoList) {
            const due = getMeta(t.id).dueDate;
            if (!due) continue;
            (map[due] = map[due] || []).push(t);
        }
        return map;
    }, [todoList, getMeta]);

    const shiftMonth = (delta) => {
        const d = new Date(year, month + delta, 1);
        setYear(d.getFullYear());
        setMonth(d.getMonth());
    };

    const goToday = () => {
        const t = new Date();
        setYear(t.getFullYear());
        setMonth(t.getMonth());
        setSelectedKey(todayKey());
    };

    const handlePanelAdd = async (e) => {
        e.preventDefault();
        const title = panelAdd.trim();
        if (!title || adding) return;
        setAdding(true);
        try {
            const id = await addTodo(title);
            if (id != null) setMeta(id, { dueDate: selectedKey });
            setPanelAdd('');
        } finally {
            setAdding(false);
        }
    };

    const selectedTasks = tasksByDay[selectedKey] || [];
    const today = todayKey();

    return (
        <div className="mx-auto max-w-7xl">
            <div className="animate-enter mb-6 flex flex-wrap items-end justify-between gap-4">
                <div>
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-indigo-500">Calendar</p>
                    <h2 className="mt-2 text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
                        Due-date <span className="gradient-text">calendar</span>
                    </h2>
                    <p className="mt-2 text-sm text-slate-500">
                        Tasks appear on their due dates. Click a day to see its tasks and add new ones.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <button type="button" onClick={() => shiftMonth(-1)} aria-label="Previous month" data-testid="cal-prev" className="btn-ghost !px-3">‹</button>
                    <button type="button" onClick={goToday} data-testid="cal-today" className="btn-ghost !px-3">Today</button>
                    <button type="button" onClick={() => shiftMonth(1)} aria-label="Next month" data-testid="cal-next" className="btn-ghost !px-3">›</button>
                </div>
            </div>

            <h3 className="animate-enter-1 mb-3 text-xl font-extrabold tracking-tight text-slate-900">
                {MONTH_NAMES[month]} {year}
            </h3>

            <div className="card animate-enter-2 overflow-hidden p-2 sm:p-4">
                <div className="grid grid-cols-7 gap-1">
                    {WEEKDAYS.map((d) => (
                        <div key={d} className="py-1 text-center text-[0.65rem] font-extrabold uppercase tracking-widest text-slate-400">
                            {d}
                        </div>
                    ))}
                </div>
                <div className="grid grid-cols-7 gap-1">
                    {cells.map(({ key, inMonth }) => {
                        const dayTasks = tasksByDay[key] || [];
                        const isToday = key === today;
                        const isSelected = key === selectedKey;
                        const past = isOverdueKey(key);
                        const dayNum = Number(key.slice(8, 10));
                        return (
                            <div
                                key={key}
                                role="button"
                                tabIndex={0}
                                onClick={() => { setSelectedKey(key); setExpandedTaskId(null); }}
                                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setSelectedKey(key); setExpandedTaskId(null); } }}
                                data-testid={`cal-day-${key}`}
                                aria-label={`Select ${dueLabel(key) || key}`}
                                className={`min-h-16 cursor-pointer sm:min-h-24 rounded-xl border p-1 text-left align-top transition-colors sm:p-1.5 ${
                                    isSelected
                                        ? 'border-indigo-400 bg-indigo-50/60'
                                        : isToday
                                            ? 'border-indigo-500 bg-white ring-2 ring-indigo-300'
                                            : 'border-slate-200/70 bg-white hover:border-indigo-200 hover:bg-indigo-50/30'
                                } ${inMonth ? '' : 'opacity-40'}`}
                            >
                                <span className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-extrabold ${
                                    isToday ? 'bg-indigo-600 text-white' : 'text-slate-700'
                                }`}>
                                    {dayNum}
                                </span>
                                <div className="mt-1 hidden space-y-1 sm:block">
                                    {dayTasks.slice(0, 3).map((t) => (
                                        <DayChip
                                            key={t.id}
                                            task={t}
                                            overdueDay={past && !t.isCompleted}
                                            onExpand={() => { setSelectedKey(key); setExpandedTaskId(String(t.id)); }}
                                        />
                                    ))}
                                    {dayTasks.length > 3 && (
                                        <p className="px-1.5 text-[0.65rem] font-bold text-slate-400">+{dayTasks.length - 3} more</p>
                                    )}
                                </div>
                                {dayTasks.length > 0 && (
                                    <span className="mt-1 block text-center text-[0.6rem] font-extrabold text-slate-400 sm:hidden">
                                        {dayTasks.length} ●
                                    </span>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="card animate-enter-3 mt-4 p-5 sm:p-6">
                <h3 className="text-lg font-extrabold tracking-tight text-slate-900">
                    Tasks for {dueLabel(selectedKey) || selectedKey}
                </h3>
                {selectedTasks.length === 0 ? (
                    <p className="mt-3 text-sm text-slate-500">No tasks due this day yet — add one below.</p>
                ) : (
                    <ul className="mt-3 space-y-2">
                        {selectedTasks.map((t) => {
                            const m = getMeta(t.id);
                            const contact = m.contactId ? getContact(m.contactId) : null;
                            const isExpanded = String(expandedTaskId) === String(t.id);
                            return (
                                <li key={t.id} className="rounded-2xl border border-slate-200/80 bg-white">
                                    <button
                                        type="button"
                                        onClick={() => setExpandedTaskId(isExpanded ? null : t.id)}
                                        data-testid={`cal-task-${t.id}`}
                                        className="flex w-full items-center justify-between gap-2 px-4 py-3 text-left"
                                        aria-expanded={isExpanded}
                                    >
                                        <span className={`truncate text-sm font-bold ${t.isCompleted ? 'text-slate-400 line-through' : 'text-slate-900'}`}>
                                            {t.title}
                                        </span>
                                        <span className="shrink-0 text-xs font-bold text-slate-400">{isExpanded ? '▾' : '▸'}</span>
                                    </button>
                                    {isExpanded && (
                                        <div className="border-t border-slate-100 px-4 py-3 text-sm text-slate-600">
                                            <p><span className="font-bold text-slate-800">Title:</span> {t.title}</p>
                                            <p className="mt-1">
                                                <span className="font-bold text-slate-800">Due:</span>{' '}
                                                {m.dueDate ? dueLabel(m.dueDate) : '—'}
                                            </p>
                                            <p className="mt-1">
                                                <span className="font-bold text-slate-800">Contact:</span>{' '}
                                                {contact ? contact.name : '—'}
                                            </p>
                                            <p className="mt-1">
                                                <span className="font-bold text-slate-800">Status:</span>{' '}
                                                {t.isCompleted ? 'Completed' : 'Open'}
                                            </p>
                                            <Link to="/todos" className="mt-2 inline-block text-sm font-bold text-indigo-600 hover:underline">
                                                Open in Tasks →
                                            </Link>
                                        </div>
                                    )}
                                </li>
                            );
                        })}
                    </ul>
                )}
                <form onSubmit={handlePanelAdd} className="mt-4 flex gap-2" data-testid="cal-quick-add">
                    <input
                        value={panelAdd}
                        onChange={(e) => setPanelAdd(e.target.value)}
                        placeholder={`Add a task due ${dueLabel(selectedKey) || selectedKey}…`}
                        maxLength={120}
                        aria-label="Add task for selected day"
                        className="input"
                    />
                    <button type="submit" disabled={adding || !panelAdd.trim()} className="btn-primary shrink-0">
                        Add
                    </button>
                </form>
            </div>
        </div>
    );
}
