import React from 'react';
import { useTodo } from '../contexts/TodoContext';
import StatusFilter from '../features/Todos/StatusFilter';
import FilterInput from '../features/Todos/FilterInput';
import TodoList from '../features/Todos/TodoList/TodoList';

function TodosPage() {
    // Extract filter values directly out of your custom hook engine context
    const { filterTerm, setFilterTerm } = useTodo();

    return (
        <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
            <h2>My Tasks</h2>

            <StatusFilter />

            {/* THE FIX: Render the missing keyword filter input bar right here */}
            <div style={{ margin: '15px 0' }}>
                <FilterInput filterTerm={filterTerm} onFilterChange={setFilterTerm} />
            </div>

            <TodoList />
        </div>
    );
}

export default TodosPage;