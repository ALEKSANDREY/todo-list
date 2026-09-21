import React from 'react';
import { useSearchParams } from 'react-router';
import { useTodo } from '../contexts/TodoContext';
import StatusFilter from '../shared/StatusFilter';
import FilterInput from '../shared/FilterInput';
import SortBy from '../shared/SortBy';
import TodoForm from '../features/Todos/TodoForm';
import TodoList from '../features/Todos/TodoList/TodoList';

function TodosPage() {
    const {
        filterTerm,
        setFilterTerm,
        sortBy,
        sortDirection,
        setSort,
        addTodo,
        completeTodo,
        updateTodo
    } = useTodo();

    const [searchParams] = useSearchParams();
    const statusFilter = searchParams.get('status') || 'all';

    return (
        <div className="mx-auto max-w-2xl">
            {/* Header Section */}
            <div className="animate-enter mb-8">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-indigo-500">
                    Task Workspace
                </p>
                <h2 className="mt-2 text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
                    What will you <span className="gradient-text">accomplish</span> today?
                </h2>
                <p className="mt-2 text-sm text-slate-500">
                    Capture, filter, and work through your agenda — one check at a time.
                </p>
            </div>

            {/* Add-task card */}
            <div className="card card-hover animate-enter-1 p-6 mb-5">
                <TodoForm onAddTodo={addTodo} />
            </div>

            {/* Controls card */}
            <div className="card animate-enter-2 p-6 mb-5 space-y-5">
                <div className="flex flex-col gap-4 border-b border-slate-100 pb-5 sm:flex-row sm:items-end sm:justify-between">
                    <div className="sm:flex-1">
                        <span className="field-label">Keyword search</span>
                        <FilterInput filterTerm={filterTerm} onFilterChange={setFilterTerm} />
                    </div>
                    <div className="sm:flex-1">
                        <span className="field-label">Status</span>
                        <StatusFilter />
                    </div>
                </div>
                <div>
                    <span className="field-label">Sort</span>
                    <SortBy
                        sortBy={sortBy}
                        sortDirection={sortDirection}
                        onSortByChange={setSort}
                        onSortDirectionChange={setSort}
                    />
                </div>
            </div>

            {/* Todo list card */}
            <div className="card animate-enter-3 p-6">
                <TodoList
                    statusFilter={statusFilter}
                    onCompleteTodo={completeTodo}
                    onUpdateTodo={updateTodo}
                />
            </div>
        </div>
    );
}

export default TodosPage;
