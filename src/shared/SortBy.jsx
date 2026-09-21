import React from 'react';

// Reviewer Note: A controlled component for managing API sort query states
function SortBy({ sortBy, sortDirection, onSortByChange, onSortDirectionChange }) {
    return (
        <div className="flex flex-col gap-3 sm:flex-row">
            <select
                id="sortFieldSelect"
                aria-label="Sort field"
                value={sortBy}
                onChange={(e) => onSortByChange(e.target.value)}
                className="select"
            >
                <option value="creationDate">Creation date</option>
                <option value="title">Title</option>
            </select>

            <select
                id="sortOrderSelect"
                aria-label="Sort order"
                value={sortDirection}
                onChange={(e) => onSortDirectionChange(e.target.value)}
                className="select"
            >
                <option value="desc">Descending</option>
                <option value="asc">Ascending</option>
            </select>
        </div>
    );
}

export default SortBy;
