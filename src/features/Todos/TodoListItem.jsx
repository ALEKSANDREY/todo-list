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
        <li className="flex items-center justify-between p-4 mb-3 bg-white border border-slate-200/60 rounded-xl shadow-sm hover:shadow-md transition-all group">
            {isEditing ? (
                <form onSubmit={handleUpdate} className="flex items-center gap-2 w-full">
                    <input
                        type="text"
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        maxLength={100}
                        className="flex-1 px-3 py-1.5 text-sm bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        autoFocus
                    />
                    <button type="submit" className="px-3 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg cursor-pointer">
                        Save
                    </button>
                    <button type="button" onClick={() => { setIsEditing(false); setEditText(todo.title); }} className="px-3 py-1.5 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg cursor-pointer">
                        Cancel
                    </button>
                </form>
            ) : (
                <>
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                        <button
                            type="button"
                            onClick={() => onCompleteTodo(todo.id)}
                            className={`w-6 h-6 rounded-full border-2 flex items-center justify-center cursor-pointer transition-all shrink-0 active:scale-90 ${
                                todo.isCompleted
                                    ? 'bg-indigo-600 border-indigo-600 text-white'
                                    : 'border-slate-300 hover:border-indigo-500 bg-slate-50'
                            }`}
                        >
                            {todo.isCompleted && (
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-3.5 h-3.5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                                </svg>
                            )}
                        </button>

                        <span className={`text-sm font-semibold truncate pr-4 ${
                            todo.isCompleted ? 'text-slate-400 line-through' : 'text-slate-800'
                        }`}>
                            {todo.title}
                        </span>
                    </div>

                    {!todo.isCompleted && (
                        <button
                            type="button"
                            onClick={() => setIsEditing(true)}
                            className="text-xs font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 px-3 py-1.5 rounded-lg transition-all opacity-0 group-hover:opacity-100 focus:opacity-100 cursor-pointer"
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