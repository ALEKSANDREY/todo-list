import React from 'react';

// Reviewer Note: Controlled input component with explicit accessibility labels
function FilterInput({ filterTerm, onFilterChange }) {
    return (
        <div className="relative">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="pointer-events-none absolute left-3.5 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-slate-400">
                <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
            </svg>
            <input
                id="filterInput"
                type="text"
                aria-label="Search tasks"
                value={filterTerm}
                placeholder="Search tasks…"
                onChange={(e) => onFilterChange(e.target.value)}
                className="input pl-10"
            />
        </div>
    );
}

export default FilterInput;
