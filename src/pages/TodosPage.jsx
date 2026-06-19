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
        <main className="min-h-screen bg-slate-900 py-10 px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mx-auto">

                {/* Header Section */}
                <div className="mb-8 text-center sm:text-left border-l-4 border-indigo-500 pl-4">
                    <h2 className="text-3xl font-extrabold text-slate-100 tracking-tight">
                        Task Workspace
                    </h2>
                    <p className="mt-2 text-sm text-slate-400">
                        Review, filter, and execute your development agenda items.
                    </p>
                </div>

                {/* Forms & Panel Controls (Dark Card Styling) */}
                <div className="bg-slate-800 border border-slate-700/50 rounded-2xl shadow-xl p-6 mb-6">
                    <TodoForm onAddTodo={addTodo} />
                </div>

                <div className="bg-slate-800 border border-slate-700/50 rounded-2xl shadow-xl p-6 mb-6 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-700/50">
                        <span className="text-sm font-semibold text-slate-300">Sort Matrix</span>
                        <SortBy
                            sortBy={sortBy}
                            sortDirection={sortDirection}
                            onSortByChange={setSort}
                            onSortDirectionChange={setSort}
                        />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                        <div>
                            <span className="block text-xs font-bold text-indigo-400 uppercase tracking-wider mb-2">Filter Status</span>
                            <StatusFilter />
                        </div>
                        <div>
                            <span className="block text-xs font-bold text-indigo-400 uppercase tracking-wider mb-2">Keyword Search</span>
                            <FilterInput filterTerm={filterTerm} onFilterChange={setFilterTerm} />
                        </div>
                    </div>
                </div>

                {/* Todo List Mapping Wrapper */}
                <div className="bg-slate-800 border border-slate-700/50 rounded-2xl shadow-xl p-6">
                    <TodoList
                        statusFilter={statusFilter}
                        onCompleteTodo={completeTodo}
                        onUpdateTodo={updateTodo}
                    />
                </div>

            </div>
        </main>
    );
}

export default TodosPage;