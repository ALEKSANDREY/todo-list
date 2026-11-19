/* eslint-disable react-refresh/only-export-components -- context file exporting provider + hook */
import React, { createContext, useContext, useReducer, useCallback, useEffect } from 'react';
import { todoReducer, initialTodoState, TODO_ACTIONS } from '../reducers/todoReducer';
import { api } from '../utils/api';
import { useAuth } from './AuthContext';
import useDebounce from '../utils/useDebounce';

const TodoContext = createContext();

// Task store backed by the Node API. The server row is the source of truth;
// the client shape adds `isCompleted` as an alias of `completed` for the
// existing UI. Sorting/filtering stay client-side.
export function toClientTask(row) {
    if (!row) return row;
    return { ...row, isCompleted: !!row.completed };
}

function applyQuery(tasks, { sortBy, sortDirection, filterTerm }) {
    const result = [...tasks];
    const term = (filterTerm || '').trim().toLowerCase();
    const filtered = term
        ? result.filter((t) => (t.title || '').toLowerCase().includes(term))
        : result;
    const dir = sortDirection === 'asc' ? 1 : -1;
    filtered.sort((a, b) => {
        if (sortBy === 'title') return (a.title || '').localeCompare(b.title || '') * dir;
        return (a.id - b.id) * dir; // creationDate → insertion order via ids
    });
    return filtered;
}

export function useTodo() {
    const context = useContext(TodoContext);
    if (!context) throw new Error('useTodo must be used within a TodoProvider');
    return context;
}

export function TodoProvider({ children }) {
    const [state, dispatch] = useReducer(todoReducer, initialTodoState);
    const { user } = useAuth();

    const debouncedFilterTerm = useDebounce(state.filterTerm, 300);

    const fetchTodos = useCallback(async () => {
        if (!user) return;
        dispatch({ type: TODO_ACTIONS.FETCH_START });
        try {
            const data = await api('/api/tasks');
            const tasks = applyQuery((data.tasks || []).map(toClientTask), {
                sortBy: state.sortBy,
                sortDirection: state.sortDirection,
                filterTerm: debouncedFilterTerm,
            });
            dispatch({ type: TODO_ACTIONS.FETCH_SUCCESS, payload: { todos: tasks } });
        } catch (err) {
            const isFilterActive =
                debouncedFilterTerm || state.sortBy !== 'creationDate' || state.sortDirection !== 'desc';
            dispatch({
                type: TODO_ACTIONS.FETCH_ERROR,
                payload: {
                    message: isFilterActive
                        ? `Error filtering/sorting todos: ${err.message}`
                        : `Error fetching todos: ${err.message}`,
                    isFilterError: isFilterActive,
                },
            });
        }
    }, [user, state.sortBy, state.sortDirection, debouncedFilterTerm]);

    useEffect(() => {
        fetchTodos();
    }, [fetchTodos, state.dataVersion]);

    // Merge an authoritative server row into local state (used by contexts
    // that PATCH task fields, e.g. TaskMetaContext).
    const upsertTask = useCallback((serverRow) => {
        dispatch({ type: TODO_ACTIONS.UPSERT_TASK, payload: { todo: toClientTask(serverRow) } });
    }, []);

    const addTodo = async (todoTitle) => {
        const tempTodo = { id: `temp-${Date.now()}`, title: todoTitle, isCompleted: false, completed: false };
        dispatch({ type: TODO_ACTIONS.ADD_TODO_START, payload: { todo: tempTodo } });
        try {
            const saved = await api('/api/tasks', {
                method: 'POST',
                body: { title: todoTitle, completed: false },
            });
            const client = toClientTask(saved);
            dispatch({ type: TODO_ACTIONS.ADD_TODO_SUCCESS, payload: { tempId: tempTodo.id, todo: client } });
            return client.id;
        } catch (err) {
            dispatch({ type: TODO_ACTIONS.ADD_TODO_ERROR, payload: { tempId: tempTodo.id, message: err.message } });
            return null;
        }
    };

    const completeTodo = async (id) => {
        const originalTodo = state.todoList.find((t) => t.id === id);
        dispatch({ type: TODO_ACTIONS.COMPLETE_TODO_START, payload: { id } });
        try {
            const saved = await api(`/api/tasks/${id}`, {
                method: 'PATCH',
                body: { completed: true },
            });
            dispatch({ type: TODO_ACTIONS.UPSERT_TASK, payload: { todo: toClientTask(saved) } });
            dispatch({ type: TODO_ACTIONS.COMPLETE_TODO_SUCCESS, payload: { id } });
        } catch (err) {
            dispatch({ type: TODO_ACTIONS.COMPLETE_TODO_ERROR, payload: { id, originalTodo, message: err.message } });
        }
    };

    const reopenTodo = async (id) => {
        const originalTodo = state.todoList.find((t) => t.id === id);
        dispatch({ type: TODO_ACTIONS.REOPEN_TODO_START, payload: { id } });
        try {
            const saved = await api(`/api/tasks/${id}`, {
                method: 'PATCH',
                body: { completed: false },
            });
            dispatch({ type: TODO_ACTIONS.UPSERT_TASK, payload: { todo: toClientTask(saved) } });
            dispatch({ type: TODO_ACTIONS.REOPEN_TODO_SUCCESS, payload: { id } });
        } catch (err) {
            dispatch({ type: TODO_ACTIONS.REOPEN_TODO_ERROR, payload: { id, originalTodo, message: err.message } });
        }
    };

    const updateTodo = async (editedTodo) => {
        const originalTodo = state.todoList.find((t) => t.id === editedTodo.id);
        dispatch({ type: TODO_ACTIONS.UPDATE_TODO_START, payload: { todo: editedTodo } });
        try {
            const saved = await api(`/api/tasks/${editedTodo.id}`, {
                method: 'PATCH',
                body: { title: editedTodo.title },
            });
            dispatch({ type: TODO_ACTIONS.UPSERT_TASK, payload: { todo: toClientTask(saved) } });
            dispatch({ type: TODO_ACTIONS.UPDATE_TODO_SUCCESS, payload: { todo: toClientTask(saved) } });
        } catch (err) {
            dispatch({
                type: TODO_ACTIONS.UPDATE_TODO_ERROR,
                payload: { id: editedTodo.id, originalTodo, message: err.message },
            });
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
        reopenTodo,
        updateTodo,
        upsertTask,
        setSort,
        setFilterTerm,
        clearError,
        clearFilterError,
        resetFilters,
    };

    return <TodoContext.Provider value={value}>{children}</TodoContext.Provider>;
}
