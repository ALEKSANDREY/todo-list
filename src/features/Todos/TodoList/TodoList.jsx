import React, { useMemo } from 'react';
import TodoListItem from '../TodoListItem.jsx';
import { useTodo } from '../../../contexts/TodoContext';

function TodoList({ statusFilter = 'all', onCompleteTodo, onUpdateTodo }) {
    // 1. Consume todoList and dataVersion from context per Step 19 guidelines
    const { todoList, dataVersion } = useTodo();

    // 2. Track and memoize the filtered array, including dataVersion as a dependency
    const filteredTodoList = useMemo(() => {
        let tasks = [...todoList];

        // Evaluate URL parameter switches cleanly
        if (statusFilter === 'completed') {
            tasks = tasks.filter(t => t.isCompleted);
        } else if (statusFilter === 'active') {
            tasks = tasks.filter(t => !t.isCompleted);
        }

        return tasks;
    }, [todoList, statusFilter, dataVersion]); // Included dataVersion here

    const getEmptyMessage = () => {
        if (statusFilter === 'completed') return 'No completed todos yet.';
        if (statusFilter === 'active') return 'Clean slate! No active remaining tasks.';
        return 'Your task collection is empty. Type above to add one!';
    };

    const emptySubMessage =
        statusFilter === 'all'
            ? 'Add your first task above and start building momentum.'
            : 'Try a different filter to see more of your tasks.';

    return filteredTodoList.length === 0 ? (
        <div className="flex flex-col items-center px-6 py-14 text-center">
            <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-500">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="h-8 w-8">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                </svg>
            </span>
            <p className="mt-5 text-base font-semibold text-slate-800">{getEmptyMessage()}</p>
            <p className="mt-1.5 max-w-xs text-sm text-slate-500">
                {emptySubMessage}
            </p>
        </div>
    ) : (
        <ul className="m-0 list-none p-0">
            {filteredTodoList.map((todo) => (
                <TodoListItem
                    key={todo.id}
                    todo={todo}
                    onCompleteTodo={onCompleteTodo}
                    onUpdateTodo={onUpdateTodo}
                />
            ))}
        </ul>
    );
}

export default TodoList;