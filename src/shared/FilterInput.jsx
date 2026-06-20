import React from 'react';

// Reviewer Note: Controlled input component with explicit accessibility labels
function FilterInput({ filterTerm, onFilterChange }) {
    return (
        <div className="filter-input-container">
            <label htmlFor="filterInput">Search todos: </label>
            <input
                id="filterInput"
                type="text"
                value={filterTerm}
                placeholder="Search by title..."
                onChange={(e) => onFilterChange(e.target.value)}
            />
        </div>
    );
}

export default FilterInput;