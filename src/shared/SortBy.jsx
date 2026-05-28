import React from 'react';

// Reviewer Note: A controlled component for managing API sort query states
function SortBy({ sortBy, sortDirection, onSortByChange, onSortDirectionChange }) {
    return (
        <div className="sort-by-container">
            <label htmlFor="sortFieldSelect">Sort by: </label>
            <select
                id="sortFieldSelect"
                value={sortBy}
                onChange={(e) => onSortByChange(e.target.value)}
            >
                <option value="creationDate">Creation Date</option>
                <option value="title">Title</option>
            </select>

            <label htmlFor="sortOrderSelect"> Order: </label>
            <select
                id="sortOrderSelect"
                value={sortDirection}
                onChange={(e) => onSortDirectionChange(e.target.value)}
            >
                <option value="desc">Descending</option>
                <option value="asc">Ascending</option>
            </select>
        </div>
    );
}

export default SortBy;