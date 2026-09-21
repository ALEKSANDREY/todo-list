import { useState } from 'react';
import { Link } from 'react-router';
import { useTodo } from '../contexts/TodoContext';
import { useTaskMeta } from '../contexts/TaskMetaContext';
import { useCrm } from '../contexts/CrmContext';
import { dueLabel, isOverdueKey } from '../utils/dates';

const COLUMNS = [
    { id: 'todo', name: 'To Do' },
    { id: 'inprogress', name: 'In Progress' },
    { id: 'done', name: 'Done' },
];

function formatTime(totalSeconds) {
    if (!totalSeconds) return '';
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.round((totalSeconds % 3600) / 60);
    if (h > 0) return `${h}h ${m}m`;
    return `${m}m`;
}

function TaskCard({ task, columnIndex, onMoveColumn }) {
    const { getMeta } = useTaskMeta();
    const { getContact } = useCrm();
    const meta = getMeta(task.id);
    const contact = meta.contactId ? getContact(meta.contactId) : null;
    const overdue = meta.dueDate && !task.isCompleted && isOverdueKey(meta.dueDate);

    return (
        <div
            draggable
            onDragStart={(e) => {
                e.dataTransfer.setData('text/plain', String(task.id));
                e.dataTransfer.effectAllowed = 'move';
            }}
            className="cursor-grab rounded-2xl border border-slate-200/80 bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.05)] transition-all hover:-translate-y-px hover:border-indigo-200 hover:shadow-[0_10px_24px_-10px_rgba(99,102,241,0.25)] active:cursor-grabbing"
            aria-label={`Task card: ${task.title}`}
        >
            <p className={`text-sm font-bold leading-snug text-slate-900 ${task.isCompleted ? 'line-through opacity-50' : ''}`}>
                {task.title}
            </p>
            {(meta.dueDate || contact || meta.timeSeconds > 0) && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                    {meta.dueDate && (
                        <span className={`rounded-full px-2 py-0.5 text-[0.7rem] font-bold ${overdue ? 'bg-red-50 text-red-700' : 'bg-slate-100 text-slate-600'}`}>
                            📅 {dueLabel(meta.dueDate)}
                        </span>
                    )}
                    {contact && (
                        <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-[0.7rem] font-bold text-indigo-700">
                            👤 {contact.name}
                        </span>
                    )}
                    {meta.timeSeconds > 0 && (
                        <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[0.7rem] font-bold text-amber-700">
                            ⏱ {formatTime(meta.timeSeconds)}
                        </span>
                    )}
                </div>
            )}
            <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2">
                <button
                    type="button"
                    disabled={columnIndex === 0}
                    onClick={() => onMoveColumn(task, -1)}
                    aria-label={`Move "${task.title}" back`}
                    data-testid={`board-move-left-${task.id}`}
                    className="rounded-lg px-2 py-1 text-sm font-bold text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800 disabled:opacity-30"
                >‹</button>
                <span className="text-[0.65rem] font-bold uppercase tracking-widest text-slate-300">drag or move</span>
                <button
                    type="button"
                    disabled={columnIndex === COLUMNS.length - 1}
                    onClick={() => onMoveColumn(task, 1)}
                    aria-label={`Move "${task.title}" forward`}
                    data-testid={`board-move-right-${task.id}`}
                    className="rounded-lg px-2 py-1 text-sm font-bold text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800 disabled:opacity-30"
                >›</button>
            </div>
        </div>
    );
}

export default function BoardPage() {
    const { todoList, addTodo, completeTodo, reopenTodo } = useTodo();
    const { getMeta, setMeta } = useTaskMeta();
    const [quickAdd, setQuickAdd] = useState('');
    const [adding, setAdding] = useState(false);
    const [dragOver, setDragOver] = useState(null);

    const columnOf = (task) => {
        if (task.isCompleted) return 'done';
        return getMeta(task.id).status === 'inprogress' ? 'inprogress' : 'todo';
    };

    const moveTo = async (task, columnId) => {
        if (columnId === 'done') {
            if (!task.isCompleted) await completeTodo(task.id);
            setMeta(task.id, { status: 'done' });
        } else if (columnId === 'inprogress') {
            if (task.isCompleted) await reopenTodo(task.id);
            setMeta(task.id, { status: 'inprogress' });
        } else {
            if (task.isCompleted) await reopenTodo(task.id);
            setMeta(task.id, { status: 'todo' });
        }
    };

    const moveByDelta = (task, delta) => {
        const idx = COLUMNS.findIndex((c) => c.id === columnOf(task));
        const next = COLUMNS[idx + delta];
        if (next) moveTo(task, next.id);
    };

    const handleQuickAdd = async (e) => {
        e.preventDefault();
        const title = quickAdd.trim();
        if (!title || adding) return;
        setAdding(true);
        try {
            const id = await addTodo(title);
            if (id != null) setMeta(id, { status: 'todo' });
            setQuickAdd('');
        } finally {
            setAdding(false);
        }
    };

    return (
        <div className="mx-auto max-w-7xl">
            <div className="animate-enter mb-6 flex flex-wrap items-end justify-between gap-4">
                <div>
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-indigo-500">Kanban</p>
                    <h2 className="mt-2 text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
                        Task <span className="gradient-text">board</span>
                    </h2>
                    <p className="mt-2 text-sm text-slate-500">
                        Drag cards between columns, or use the ‹ › arrows. Manage details in{' '}
                        <Link to="/todos" className="font-bold text-indigo-600 hover:underline">Tasks →</Link>
                    </p>
                </div>
            </div>

            <div className="animate-enter-2 flex snap-x gap-4 overflow-x-auto pb-4">
                {COLUMNS.map((col, colIndex) => {
                    const inCol = todoList.filter((t) => columnOf(t) === col.id);
                    return (
                        <section
                            key={col.id}
                            onDragOver={(e) => { e.preventDefault(); setDragOver(col.id); }}
                            onDragLeave={() => setDragOver((v) => (v === col.id ? null : v))}
                            onDrop={(e) => {
                                e.preventDefault();
                                const taskId = e.dataTransfer.getData('text/plain');
                                const task = todoList.find((t) => String(t.id) === String(taskId));
                                if (task) moveTo(task, col.id);
                                setDragOver(null);
                            }}
                            className={`w-72 shrink-0 snap-start rounded-3xl border p-3 transition-colors sm:w-80 ${
                                dragOver === col.id
                                    ? 'border-indigo-300 bg-indigo-50/60'
                                    : 'border-slate-200/70 bg-slate-100/50'
                            }`}
                            aria-label={`${col.name} column`}
                        >
                            <header className="flex items-center justify-between px-2 pb-3 pt-1">
                                <h3 className="text-sm font-extrabold tracking-tight text-slate-800">{col.name}</h3>
                                <span className="rounded-full bg-white px-2.5 py-0.5 text-xs font-bold text-slate-500 shadow-sm">{inCol.length}</span>
                            </header>
                            {col.id === 'todo' && (
                                <form onSubmit={handleQuickAdd} className="mb-2.5 flex gap-1.5" data-testid="board-quick-add">
                                    <input
                                        value={quickAdd}
                                        onChange={(e) => setQuickAdd(e.target.value)}
                                        placeholder="New task…"
                                        maxLength={120}
                                        aria-label="Quick add task"
                                        className="input !py-2 !text-sm"
                                    />
                                    <button type="submit" disabled={adding || !quickAdd.trim()} className="btn-primary !px-3 !py-2 !text-sm shrink-0">
                                        Add
                                    </button>
                                </form>
                            )}
                            <div className="space-y-2.5">
                                {inCol.map((task) => (
                                    <TaskCard
                                        key={task.id}
                                        task={task}
                                        columnIndex={colIndex}
                                        onMoveColumn={moveByDelta}
                                    />
                                ))}
                            </div>
                            {inCol.length === 0 && (
                                <p className="rounded-2xl border-2 border-dashed border-slate-200 py-6 text-center text-xs font-bold text-slate-400">
                                    Nothing here yet
                                </p>
                            )}
                        </section>
                    );
                })}
            </div>
        </div>
    );
}
