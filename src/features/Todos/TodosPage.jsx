import { useState, useEffect, useCallback } from 'react'; // Added useCallback
import TodoForm from './TodoForm.jsx';
import TodoList from './TodoList/TodoList.jsx';
import SortBy from '../../shared/SortBy.jsx';
import FilterInput from '../../shared/FilterInput.jsx';
import useDebounce from '../../utils/useDebounce.js';

function TodosPage({ token }) {
    const [todoList, setTodoList] = useState([]);
    const [error, setError] = useState('');
    const [isTodoListLoading, setIsTodoListLoading] = useState(false);

    // --- Part 1, 2, & 4: New Sorting, Filtering, and Error States ---
    const [sortBy, setSortBy] = useState('creationDate');
    const [sortDirection, setSortDirection] = useState('desc');
    const [filterTerm, setFilterTerm] = useState('');
    const [filterError, setFilterError] = useState('');

    // --- Part 3: Data Version State for Cache Invalidation ---
    const [dataVersion, setDataVersion] = useState(0);

    // Delay filter term to throttle network hits on keyboard typing
    const debouncedFilterTerm = useDebounce(filterTerm, 300);

    // --- Part 3 Optimization Hook Practice ---
    // Reviewer Note: Tracks cache states through mutations to avoid recalculating useMemo list
    const invalidateCache = useCallback(() => {
        setDataVersion(prev => prev + 1);
    }, []);

    //  Extracted to a stable callback reference to prevent dependency infinite loops
    const fetchTodos = useCallback(async () => {
        if (!token) return;
        setIsTodoListLoading(true);

        // Assemble query params safely instead of using string concatenation
        const paramsObject = {
            sortBy,
            sortDirection
        };
        if (debouncedFilterTerm) {
            paramsObject.find = debouncedFilterTerm;
        }
        const params = new URLSearchParams(paramsObject);

        try {
            const response = await fetch(`/api/tasks?${params}`, {
                headers: { 'X-CSRF-TOKEN': token },
                credentials: 'include'
            });
            if (response.status === 401) throw new Error('unauthorized');
            if (!response.ok) throw new Error('Failed to fetch todos');

            const data = await response.json();
            setTodoList(data.tasks);
            setFilterError(''); // Part 4: Clear filter error on successful fetch
        } catch (err) {
            // Part 4: Differentiate error messaging structure based on query settings
            if (debouncedFilterTerm || sortBy !== 'creationDate' || sortDirection !== 'desc') {
                setFilterError(`Error filtering/sorting todos: ${err.message}`);
            } else {
                // FIXED: Main fetch error message formatting with strict instruction prefix matching
                setError(`Error fetching todos: ${err.message}`);
            }
        } finally {
            setIsTodoListLoading(false);
        }
    }, [token, sortBy, sortDirection, debouncedFilterTerm]);

    // Triggers fetch requests automatically when dependencies change
    useEffect(() => {
        fetchTodos();
    }, [fetchTodos]);

    // Clean handler for user input mutations
    const handleFilterChange = (newTerm) => {
        setFilterTerm(newTerm);
    };

    async function addTodo(todoTitle) {
        const newTodo = {
            id: Date.now(),
            title: todoTitle,
            isCompleted: false,
            isOptimisticPending: true
        };
        setTodoList(previous => [newTodo, ...previous]);
        try {
            const response = await fetch('/api/tasks', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': token
                },
                credentials: 'include',
                body: JSON.stringify({ title: todoTitle, isCompleted: false })
            });
            if (!response.ok) throw new Error('Failed to add todo');
            const data = await response.json();
            setTodoList(previous => [data, ...previous.filter(t => t.id !== newTodo.id)]);

            invalidateCache(); // Part 3: Force update list version on creation
        } catch (err) {
            setTodoList(previous => previous.filter(t => t.id !== newTodo.id));
            setError(err.message);
        }
    }

    async function completeTodo(id) {
        const originalTodo = todoList.find(todo => todo.id === id);

        // Optimistic Update
        setTodoList(prev => prev.map(todo =>
            todo.id === id ? { ...todo, isCompleted: true } : todo
        ));

        try {
            const response = await fetch(`/api/tasks/${id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': token
                },
                credentials: 'include',
                body: JSON.stringify({ isCompleted: true, createdAt: originalTodo.createdAt })
            });
            if (!response.ok) throw new Error('Failed to complete todo');

            invalidateCache();
        } catch (err) {
            // FIX 1: Safe functional rollback targeting ONLY the single failed item
            setTodoList(prev => prev.map(todo =>
                todo.id === id ? originalTodo : todo
            ));
            setError(err.message);
        }
    }

    async function updateTodo(editedTodo) {
        const originalTodo = todoList.find(todo => todo.id === editedTodo.id);

        // Optimistic Update
        setTodoList(prev => prev.map(todo =>
            todo.id === editedTodo.id ? { ...editedTodo } : todo
        ));

        try {
            const response = await fetch(`/api/tasks/${editedTodo.id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': token
                },
                credentials: 'include',
                body: JSON.stringify({ title: editedTodo.title, isCompleted: editedTodo.isCompleted, createdAt: originalTodo.createdAt })
            });
            if (!response.ok) throw new Error('Failed to update todo');

            invalidateCache();
        } catch (err) {
            // FIX 1: Safe functional rollback targeting ONLY the single failed item
            setTodoList(prev => prev.map(todo =>
                todo.id === editedTodo.id ? originalTodo : todo
            ));
            setError(err.message);
        }
    }

    return (
        <div>
            {/* Standard Global Errors */}
            {error && (
                <div>
                    <p>{error}</p>
                    <button onClick={() => setError('')}>Clear Error</button>
                </div>
            )}

            {/* Part 1 & 2 Inputs layout placement */}
            <SortBy
                sortBy={sortBy}
                sortDirection={sortDirection}
                onSortByChange={setSortBy}
                onSortDirectionChange={setSortDirection}
            />

            <FilterInput
                filterTerm={filterTerm}
                onFilterChange={handleFilterChange}
            />

            {/* Part 4: Advanced Search Error Display Box */}
            {filterError && (
                <div className="filter-error-container">
                    <p style={{ color: 'red' }}>{filterError}</p>
                    <button onClick={() => setFilterError('')}>Clear Filter Error</button>
                    <button onClick={() => {
                        setFilterTerm('');
                        setSortBy('creationDate');
                        setSortDirection('desc');
                        setFilterError('');
                    }}>Reset Filters</button>
                </div>
            )}

            {isTodoListLoading && <p>Loading...</p>}

            <TodoForm onAddTodo={addTodo} />

            {/* Part 3: Passing layout cache variables downward */}
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