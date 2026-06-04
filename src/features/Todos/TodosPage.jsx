import React from 'react';
import { useTodo } from '../../contexts/TodoContext.jsx'; // Pulling state globally now
import TodoForm from './TodoForm.jsx';
import TodoList from './TodoList/TodoList.jsx';
import SortBy from '../../shared/SortBy.jsx';
import FilterInput from '../../shared/FilterInput.jsx';

function TodosPage() {
    // Connect to the global state provider tower
    const {
        todoList,
        error,
        filterError,
        isTodoListLoading,
        sortBy,
        sortDirection,
        filterTerm,
        dataVersion,
        addTodo,
        completeTodo,
        updateTodo,
        setSort,
        setFilterTerm,
        clearError,
        clearFilterError,
        resetFilters
    } = useTodo();

    return (
        <div>
            {/* Standard Global Errors */}
            {error && (
                <div>
                    <p>{error}</p>
                    <button onClick={clearError}>Clear Error</button>
                </div>
            )}

            {/* Sorting Inputs managed via unified reducer actions */}
            <SortBy
                sortBy={sortBy}
                sortDirection={sortDirection}
                onSortByChange={(newSortBy) => setSort(newSortBy, sortDirection)}
                onSortDirectionChange={(newDir) => setSort(sortBy, newDir)}
            />

            {/* Text filtering input matching your input patterns */}
            <FilterInput
                filterTerm={filterTerm}
                onFilterChange={setFilterTerm}
            />

            {/* Advanced Search Error Display Box */}
            {filterError && (
                <div className="filter-error-container">
                    <p style={{ color: 'red' }}>{filterError}</p>
                    <button onClick={clearFilterError}>Clear Filter Error</button>
                    <button onClick={resetFilters}>Reset Filters</button>
                </div>
            )}

            {isTodoListLoading && <p>Loading...</p>}

            <TodoForm onAddTodo={addTodo} />

            {/* Passing optimized list state configurations downward */}
            <TodoList
                todoList={todoList}
                dataVersion={dataVersion}
                onCompleteTodo={completeTodo}
                onUpdateTodo={updateTodo}
            />
        </div>
    );
}

export default TodosPage;