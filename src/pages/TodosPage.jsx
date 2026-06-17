import React from 'react';
import { useSearchParams } from 'react-router'; // Import hook
import { useTodo } from '../contexts/TodoContext';
import TodoForm from '../features/Todos/TodoForm.jsx';
import TodoList from '../features/Todos/TodoList/TodoList.jsx';
import SortBy from '../shared/SortBy.jsx';
import FilterInput from '../shared/FilterInput.jsx';
import StatusFilter from '../shared/StatusFilter.jsx'; // Import filter selector

function TodosPage() {
    const [searchParams] = useSearchParams();
    const statusFilter = searchParams.get('status') || 'all'; // Read the current state directly from the address bar

    const {
        todoList,
        error,
        isTodoListLoading,
        sortBy,
        sortDirection,
        addTodo,
        completeTodo,
        updateTodo,
        setSort,
        clearError,
    } = useTodo();

    return (
        <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
            {error && (
                <div>
                    <p style={{ color: 'red' }}>{error}</p>
                    <button onClick={clearError}>Clear Error</button>
                </div>
            )}

            <SortBy
                sortBy={sortBy}
                sortDirection={sortDirection}
                onSortByChange={(newSortBy) => setSort(newSortBy, sortDirection)}
                onSortDirectionChange={(newDir) => setSort(sortBy, newDir)}
            />

            <StatusFilter /> {/* Injects URL mutator selection field */}

            {isTodoListLoading && <p>Loading your profile task streams...</p>}

            <TodoForm onAddTodo={addTodo} />

            <TodoList
                todoList={todoList}
                onCompleteTodo={completeTodo}
                onUpdateTodo={updateTodo}
                statusFilter={statusFilter} // Pass down the filter string
            />
        </div>
    );
}

export default TodosPage;