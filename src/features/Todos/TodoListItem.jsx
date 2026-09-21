import React, { useState } from 'react';
import { useTaskMeta } from '../../contexts/TaskMetaContext';
import { useCrm } from '../../contexts/CrmContext';
import { todayKey, dueLabel, parseDateTimeLocal, formatTime } from '../../utils/dates';

function TodoListItem({ todo, onCompleteTodo, onUpdateTodo }) {
    const [isEditing, setIsEditing] = useState(false);
    const [editText, setEditText] = useState(todo.title);
    const [showDetails, setShowDetails] = useState(false);
    const { getMeta, setMeta } = useTaskMeta();
    const { contacts } = useCrm();

    const m = getMeta(todo.id);
    const linkedContact = m.contactId ? contacts.find((c) => c.id === m.contactId) : null;
    const overdue = !todo.isCompleted && m.dueDate && m.dueDate < todayKey();
    const reminderDate = m.remindAt ? parseDateTimeLocal(m.remindAt) : null;

    const handleUpdate = (e) => {
        e.preventDefault();
        if (editText.trim() && editText.trim() !== todo.title) {
            onUpdateTodo({ ...todo, title: editText.trim() });
        }
        setIsEditing(false);
    };

    const clearSchedule = () => {
        setMeta(todo.id, { dueDate: '', remindAt: '', contactId: '' });
    };

    return (
        <li className={`todo-row group mb-3 rounded-2xl border p-4 shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition-all duration-200 hover:-translate-y-px hover:shadow-[0_10px_24px_-10px_rgba(99,102,241,0.25)] ${
            overdue
                ? 'border-red-300 bg-red-50/70 hover:border-red-300'
                : 'border-slate-200/80 bg-white hover:border-indigo-200'
        }`}>
            <div className="flex items-center justify-between gap-3">
                {isEditing ? (
                    <form onSubmit={handleUpdate} className="flex w-full items-center gap-2">
                        <input
                            type="text"
                            value={editText}
                            onChange={(e) => setEditText(e.target.value)}
                            maxLength={100}
                            className="input flex-1"
                            autoFocus
                        />
                        <button type="submit" className="btn-primary px-4 py-2.5 text-xs">
                            Save
                        </button>
                        <button type="button" onClick={() => { setIsEditing(false); setEditText(todo.title); }} className="btn-ghost">
                            Cancel
                        </button>
                    </form>
                ) : (
                    <>
                        <div className="flex min-w-0 flex-1 items-center gap-4">
                            <button
                                type="button"
                                onClick={() => onCompleteTodo(todo.id)}
                                aria-label={todo.isCompleted ? 'Mark as active' : 'Mark as complete'}
                                className={`check-btn ${todo.isCompleted ? 'check-btn-done' : ''}`}
                            >
                                {todo.isCompleted && (
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3.5} stroke="currentColor" className="h-3.5 w-3.5">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                                    </svg>
                                )}
                            </button>

                            <span className={`truncate pr-2 text-[0.95rem] font-medium transition-colors ${
                                todo.isCompleted ? 'text-slate-400 line-through decoration-slate-300' : 'text-slate-800'
                            }`}>
                                {todo.title}
                            </span>
                        </div>

                        <div className="flex shrink-0 items-center gap-1.5">
                            <button
                                type="button"
                                onClick={() => setShowDetails((v) => !v)}
                                aria-expanded={showDetails}
                                aria-label="Task schedule and contact"
                                title="Due date, reminder & contact"
                                className={`rounded-lg p-2 transition-all ${
                                    showDetails || m.dueDate || m.remindAt
                                        ? 'bg-indigo-50 text-indigo-600'
                                        : 'text-slate-400 opacity-0 hover:bg-slate-100 hover:text-slate-600 focus:opacity-100 group-hover:opacity-100'
                                }`}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-4 w-4">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
                                </svg>
                            </button>
                            {!todo.isCompleted && (
                                <button
                                    type="button"
                                    onClick={() => setIsEditing(true)}
                                    className="shrink-0 rounded-lg bg-indigo-50 px-3 py-1.5 text-xs font-bold text-indigo-600 opacity-0 transition-all hover:bg-indigo-100 hover:text-indigo-800 focus:opacity-100 group-hover:opacity-100"
                                >
                                    Edit
                                </button>
                            )}
                        </div>
                    </>
                )}
            </div>

            {/* Badges: due date, reminder, linked contact */}
            {!isEditing && (m.dueDate || reminderDate || linkedContact) && (
                <div className="mt-2 flex flex-wrap gap-1.5 pl-11">
                    {m.dueDate && (
                        <span className={`rounded-full px-2.5 py-0.5 text-[0.7rem] font-bold ${
                            overdue ? 'bg-red-100 text-red-700' : 'bg-indigo-50 text-indigo-700'
                        }`}>
                            📅 {dueLabel(m.dueDate)}
                        </span>
                    )}
                    {reminderDate && !todo.isCompleted && (
                        <span className="rounded-full bg-sky-50 px-2.5 py-0.5 text-[0.7rem] font-bold text-sky-700">
                            ⏰ {formatTime(reminderDate)}
                        </span>
                    )}
                    {linkedContact && (
                        <span className="rounded-full bg-violet-50 px-2.5 py-0.5 text-[0.7rem] font-bold text-violet-700">
                            👤 {linkedContact.name}
                        </span>
                    )}
                </div>
            )}

            {/* Expandable schedule / contact editor */}
            {showDetails && !isEditing && (
                <div className="animate-enter mt-3 grid gap-3 border-t border-slate-100 pt-3 sm:grid-cols-3">
                    <div>
                        <label className="field-label" htmlFor={`due-${todo.id}`}>Due date</label>
                        <input
                            type="date"
                            id={`due-${todo.id}`}
                            value={m.dueDate || ''}
                            onChange={(e) => setMeta(todo.id, { dueDate: e.target.value })}
                            className="input !py-2 text-sm"
                        />
                    </div>
                    <div>
                        <label className="field-label" htmlFor={`rem-${todo.id}`}>Reminder</label>
                        <input
                            type="datetime-local"
                            id={`rem-${todo.id}`}
                            value={m.remindAt || ''}
                            onChange={(e) => setMeta(todo.id, { remindAt: e.target.value })}
                            className="input !py-2 text-sm"
                        />
                    </div>
                    <div>
                        <label className="field-label" htmlFor={`ctc-${todo.id}`}>Contact</label>
                        <select
                            id={`ctc-${todo.id}`}
                            value={m.contactId || ''}
                            onChange={(e) => setMeta(todo.id, { contactId: e.target.value })}
                            className="select !py-2 text-sm"
                        >
                            <option value="">— None —</option>
                            {contacts.map((c) => (
                                <option key={c.id} value={c.id}>{c.name}{c.company ? ` · ${c.company}` : ''}</option>
                            ))}
                        </select>
                    </div>
                    {(m.dueDate || m.remindAt || m.contactId) && (
                        <div className="sm:col-span-3">
                            <button type="button" onClick={clearSchedule} className="text-xs font-bold text-slate-400 hover:text-red-600">
                                Clear schedule & contact
                            </button>
                        </div>
                    )}
                </div>
            )}
        </li>
    );
}

export default TodoListItem;
