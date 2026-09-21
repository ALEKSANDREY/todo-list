/* eslint-disable react-refresh/only-export-components -- context file exporting provider + hook */
import React, { createContext, useContext, useReducer, useCallback, useEffect } from 'react';
import { todoReducer, initialTodoState, TODO_ACTIONS } from '../reducers/todoReducer';
import { useAuth, DEMO_TOKEN } from './AuthContext';
import useDebounce from '../utils/useDebounce';

const TodoContext = createContext();

// Demo task store: while the demo session is active the workspace runs
// fully client-side (seeded tasks + localStorage persistence) so the public
// demo stays interactive with no backend.
const DEMO_STORAGE_KEY = 'todo-demo-tasks-v1';

const DEMO_SEED_TASKS = [
    { id: 1, title: 'Review the new design', isCompleted: false },
    { id: 2, title: 'Polish the portfolio README', isCompleted: false },
    { id: 3, title: 'Prep for the recruiter call', isCompleted: false },
    { id: 4, title: 'Ship the redesign branch', isCompleted: true },
];

function loadDemoTasks() {
    try {
        const raw = window.localStorage.getItem(DEMO_STORAGE_KEY);
        if (raw) {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed)) return parsed;
        }
    } catch {
        // Storage unavailable — fall through to seed data.
    }
    return [...DEMO_SEED_TASKS];
}

function saveDemoTasks(tasks) {
    try {
        window.localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(tasks));
    } catch {
        // Storage unavailable — demo still works for this session.
    }
}

function applyDemoQuery(tasks, { sortBy, sortDirection, filterTerm }) {
    let result = [...tasks];
    const term = (filterTerm || '').trim().toLowerCase();
    if (term) {
        result = result.filter((t) => t.title.toLowerCase().includes(term));
    }
    const dir = sortDirection === 'asc' ? 1 : -1;
    result.sort((a, b) => {
        if (sortBy === 'title') return a.title.localeCompare(b.title) * dir;
        return (a.id - b.id) * dir; // creationDate → insertion order via timestamp ids
    });
    return result;
}

export function useTodo() {
    const context = useContext(TodoContext);
    if (!context) throw new Error('useTodo must be used within a TodoProvider');
    return context;
}

export function TodoProvider({ children }) {
    const [state, dispatch] = useReducer(todoReducer, initialTodoState);
    const { token } = useAuth();
    const isDemoMode = token === DEMO_TOKEN;

    const debouncedFilterTerm = useDebounce(state.filterTerm, 300);

    const fetchTodos = useCallback(async () => {
        if (!token) return;

        // Demo mode: serve tasks from the local store, no network.
        if (isDemoMode) {
            const tasks = applyDemoQuery(loadDemoTasks(), {
                sortBy: state.sortBy,
                sortDirection: state.sortDirection,
                filterTerm: debouncedFilterTerm,
            });
            dispatch({ type: TODO_ACTIONS.FETCH_SUCCESS, payload: { todos: tasks } });
            return;
        }

        dispatch({ type: TODO_ACTIONS.FETCH_START });

        const params = new URLSearchParams({
            sortBy: state.sortBy,
            sortDirection: state.sortDirection,
        });
        if (debouncedFilterTerm) {
            params.append('find', debouncedFilterTerm);
        }

        try {
            const response = await fetch(`/api/tasks?${params}`, {
                headers: { 'X-CSRF-TOKEN': token },
                credentials: 'include',
            });
            if (response.status === 401) throw new Error('unauthorized');
            if (!response.ok) throw new Error('Failed to fetch todos');

            const data = await response.json();
            dispatch({ type: TODO_ACTIONS.FETCH_SUCCESS, payload: { todos: data.tasks } });
        } catch (err) {
            // FIX 1: Evaluate if query states are active, then bundle the isFilterError boolean indicator flag
            const isFilterActive = debouncedFilterTerm || state.sortBy !== 'creationDate' || state.sortDirection !== 'desc';
            dispatch({
                type: TODO_ACTIONS.FETCH_ERROR,
                payload: {
                    message: isFilterActive ? `Error filtering/sorting todos: ${err.message}` : `Error fetching todos: ${err.message}`,
                    isFilterError: isFilterActive
                }
            });
        }
    }, [token, isDemoMode, state.sortBy, state.sortDirection, debouncedFilterTerm]);

    useEffect(() => {
        fetchTodos();
    }, [fetchTodos, state.dataVersion]);

    const addTodo = async (todoTitle) => {
        const tempTodo = { id: Date.now(), title: todoTitle, isCompleted: false };
        dispatch({ type: TODO_ACTIONS.ADD_TODO_START, payload: { todo: tempTodo } });

        // Demo mode: persist locally, no network.
        if (isDemoMode) {
            saveDemoTasks([...loadDemoTasks(), tempTodo]);
            dispatch({ type: TODO_ACTIONS.ADD_TODO_SUCCESS, payload: { tempId: tempTodo.id, todo: tempTodo } });
            return tempTodo.id;
        }

        try {
            const response = await fetch('/api/tasks', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': token },
                credentials: 'include',
                body: JSON.stringify({ title: todoTitle, isCompleted: false }),
            });
            if (!response.ok) throw new Error('Failed to add todo');
            const savedTodo = await response.json();
            dispatch({ type: TODO_ACTIONS.ADD_TODO_SUCCESS, payload: { tempId: tempTodo.id, todo: savedTodo } });
            return savedTodo.id;
        } catch (err) {
            dispatch({ type: TODO_ACTIONS.ADD_TODO_ERROR, payload: { tempId: tempTodo.id, message: err.message } });
            return null;
        }
    };

    const completeTodo = async (id) => {
        const originalTodo = state.todoList.find(t => t.id === id);
        dispatch({ type: TODO_ACTIONS.COMPLETE_TODO_START, payload: { id } });

        // Demo mode: persist locally, no network.
        if (isDemoMode) {
            saveDemoTasks(loadDemoTasks().map(t => t.id === id ? { ...t, isCompleted: true } : t));
            dispatch({ type: TODO_ACTIONS.COMPLETE_TODO_SUCCESS, payload: { id } });
            return;
        }

        try {
            const response = await fetch(`/api/tasks/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': token },
                credentials: 'include',
                // FIX: Use isCompleted: true to match the schema format accepted by the POST route
                body: JSON.stringify({ title: originalTodo.title, isCompleted: true }),
            });
            if (!response.ok) throw new Error('Failed to complete todo');

            dispatch({ type: TODO_ACTIONS.COMPLETE_TODO_SUCCESS, payload: { id } });
        } catch (err) {
            dispatch({ type: TODO_ACTIONS.COMPLETE_TODO_ERROR, payload: { id, originalTodo, message: err.message } });
        }
    };

    const updateTodo = async (editedTodo) => {
        const originalTodo = state.todoList.find(t => t.id === editedTodo.id);
        dispatch({ type: TODO_ACTIONS.UPDATE_TODO_START, payload: { todo: editedTodo } });

        // Demo mode: persist locally, no network.
        if (isDemoMode) {
            saveDemoTasks(loadDemoTasks().map(t => t.id === editedTodo.id ? editedTodo : t));
            dispatch({ type: TODO_ACTIONS.UPDATE_TODO_SUCCESS, payload: { todo: editedTodo } });
            return;
        }

        try {
            const response = await fetch(`/api/tasks/${editedTodo.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': token },
                credentials: 'include',
                // FIX: Fallback to existing structural properties to prevent undefined key updates
                body: JSON.stringify({
                    title: editedTodo.title,
                    isCompleted: originalTodo.isCompleted || false
                }),
            });
            if (!response.ok) throw new Error('Failed to update todo');

            dispatch({ type: TODO_ACTIONS.UPDATE_TODO_SUCCESS, payload: { todo: editedTodo } });
        } catch (err) {
            dispatch({ type: TODO_ACTIONS.UPDATE_TODO_ERROR, payload: { id: editedTodo.id, originalTodo, message: err.message } });
        }
    };

    const setSort = (sortBy, sortDirection) => {
        dispatch({ type: TODO_ACTIONS.SET_SORT, payload: { sortBy, sortDirection } });
    };

    const setFilterTerm = (filterTerm) => {
        dispatch({ type: TODO_ACTIONS.SET_FILTER, payload: { filterTerm } });
    };

    const clearError = () => dispatch({ type: TODO_ACTIONS.CLEAR_ERROR });
    const clearFilterError = () => dispatch({ type: TODO_ACTIONS.CLEAR_FILTER_ERROR });
    const resetFilters = () => dispatch({ type: TODO_ACTIONS.RESET_FILTERS });

    const value = {
        ...state,
        addTodo,
        completeTodo,
        updateTodo,
        setSort,
        setFilterTerm,
        clearError,
        clearFilterError,
        resetFilters,
    };

    return <TodoContext.Provider value={value}>{children}</TodoContext.Provider>;
}