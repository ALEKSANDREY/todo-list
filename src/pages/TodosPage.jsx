import React from 'react';
import { useSearchParams } from 'react-router';
import { useTodo } from '../contexts/TodoContext';
import StatusFilter from '../shared/StatusFilter';
import FilterInput from '../shared/FilterInput';
import SortBy from '../shared/SortBy';
import TodoForm from "../features/Todos/TodoForm";// THE FIX: Import the missing TodoForm component
import TodoList from '../features/Todos/TodoList/TodoList';

function TodosPage() {
    const {
        filterTerm,
        setFilterTerm,
        sortBy,
        sortDirection,
        setSort,
        addTodo, // THE FIX: Extract addTodo from context
        completeTodo,
        updateTodo
    } = useTodo();

    const [searchParams] = useSearchParams();
    const statusFilter = searchParams.get('status') || 'all';

    return (
        <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
            <h2>My Tasks</h2>

            {/* THE FIX: SortBy component moved to the very top layout position per spec */}
            <div style={{ margin: '15px 0' }}>
                <SortBy
                    sortBy={sortBy}
                    sortDirection={sortDirection}
                    onSortByChange={setSort}
                    onSortDirectionChange={setSort}
                />
            </div>

            <StatusFilter />

            <div style={{ margin: '15px 0' }}>
                <FilterInput filterTerm={filterTerm} onFilterChange={setFilterTerm} />
            </div>

            {/* THE FIX: Render the TodoForm component above the task list mapping container */}
            <div style={{ margin: '15px 0' }}>
                <TodoForm onAddTodo={addTodo} />
            </div>

            <TodoList
                statusFilter={statusFilter}
                onCompleteTodo={completeTodo}
                onUpdateTodo={updateTodo}
            />
        </div>
    );
}

export default TodosPage;