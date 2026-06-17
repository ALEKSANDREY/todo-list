import React from 'react';
import { useSearchParams } from 'react-router';
import { useTodo } from '../contexts/TodoContext';
import StatusFilter from '../shared/StatusFilter';
import FilterInput from '../shared/FilterInput';
import SortBy from '../shared/SortBy'; // Verify this import path matches your project structure
import TodoList from '../features/Todos/TodoList/TodoList';

function TodosPage() {
    // 1. Extract all required actions and sorting values directly out of context
    const {
        filterTerm,
        setFilterTerm,
        sortBy,
        sortDirection,
        setSort,
        completeTodo,
        updateTodo
    } = useTodo();

    // 2. Read the status parameter via useSearchParams to drive URL-filtering
    const [searchParams] = useSearchParams();
    const statusFilter = searchParams.get('status') || 'all';

    return (
        <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
            <h2>My Tasks</h2>

            <StatusFilter />

            <div style={{ margin: '15px 0' }}>
                <FilterInput filterTerm={filterTerm} onFilterChange={setFilterTerm} />
            </div>

            {/* 3. Include SortBy component above the todo list */}
            <div style={{ margin: '15px 0' }}>
                <SortBy
                    sortBy={sortBy}
                    sortDirection={sortDirection}
                    onSortByChange={setSort}
                    onSortDirectionChange={setSort}
                />
            </div>

            {/* 4. Pass statusFilter and actions directly into TodoList */}
            <TodoList
                statusFilter={statusFilter}
                onCompleteTodo={completeTodo}
                onUpdateTodo={updateTodo}
            />
        </div>
    );
}

export default TodosPage;