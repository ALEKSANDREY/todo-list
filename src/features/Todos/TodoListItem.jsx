import React, { useState } from 'react';

function TodoListItem({ todo, onCompleteTodo, onUpdateTodo }) {
    const [isEditing, setIsEditing] = useState(false);
    const [editText, setEditText] = useState(todo.title);

    const handleUpdate = (e) => {
        e.preventDefault();
        if (editText.trim() && editText.trim() !== todo.title) {
            onUpdateTodo({ ...todo, title: editText.trim() });
        }
        setIsEditing(false);
    };

    return (
        <li className="todo-row group mb-3 flex items-center justify-between gap-3 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition-all duration-200 hover:-translate-y-px hover:border-indigo-200 hover:shadow-[0_10px_24px_-10px_rgba(99,102,241,0.25)]">
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

                    {!todo.isCompleted && (
                        <button
                            type="button"
                            onClick={() => setIsEditing(true)}
                            className="shrink-0 rounded-lg bg-indigo-50 px-3 py-1.5 text-xs font-bold text-indigo-600 opacity-0 transition-all hover:bg-indigo-100 hover:text-indigo-800 focus:opacity-100 group-hover:opacity-100"
                        >
                            Edit
                        </button>
                    )}
                </>
            )}
        </li>
    );
}

export default TodoListItem;
