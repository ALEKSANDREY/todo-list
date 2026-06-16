import React, { createContext, useContext, useReducer, useCallback, useEffect } from 'react';
import { todoReducer, initialTodoState, TODO_ACTIONS } from '../reducers/todoReducer';
import { useAuth } from './AuthContext';
import useDebounce from '../utils/useDebounce';

const TodoContext = createContext();

export function useTodo() {
    const context = useContext(TodoContext);
    if (!context) throw new Error('useTodo must be used within a TodoProvider');
    return context;
}

export function TodoProvider({ children }) {
    const [state, dispatch] = useReducer(todoReducer, initialTodoState);
    const { token } = useAuth();

    const debouncedFilterTerm = useDebounce(state.filterTerm, 300);

    const fetchTodos = useCallback(async () => {
        if (!token) return;
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
    }, [token, state.sortBy, state.sortDirection, debouncedFilterTerm]);

    useEffect(() => {
        fetchTodos();
    }, [fetchTodos]);

    const addTodo = async (todoTitle) => {
        const tempTodo = { id: Date.now(), title: todoTitle, isCompleted: false };
        dispatch({ type: TODO_ACTIONS.ADD_TODO_START, payload: { todo: tempTodo } });

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
        } catch (err) {
            dispatch({ type: TODO_ACTIONS.ADD_TODO_ERROR, payload: { tempId: tempTodo.id, message: err.message } });
        }
    };

    const completeTodo = async (id) => {
        const originalTodo = state.todoList.find(t => t.id === id);
        dispatch({ type: TODO_ACTIONS.COMPLETE_TODO_START, payload: { id } });

        try {
            const response = await fetch(`/api/tasks/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': token },
                credentials: 'include',
                body: JSON.stringify({ isCompleted: true, createdAt: originalTodo.createdAt }),
            });
            if (!response.ok) throw new Error('Failed to complete todo');

            // FIX 2: Dispatch completion success tracking to cycle version cache indicators
            dispatch({ type: TODO_ACTIONS.COMPLETE_TODO_SUCCESS, payload: { id } });
        } catch (err) {
            dispatch({ type: TODO_ACTIONS.COMPLETE_TODO_ERROR, payload: { id, originalTodo, message: err.message } });
        }
    };

    const updateTodo = async (editedTodo) => {
        const originalTodo = state.todoList.find(t => t.id === editedTodo.id);
        dispatch({ type: TODO_ACTIONS.UPDATE_TODO_START, payload: { todo: editedTodo } });

        try {
            const response = await fetch(`/api/tasks/${editedTodo.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': token },
                credentials: 'include',
                body: JSON.stringify({ title: editedTodo.title, isCompleted: editedTodo.isCompleted, createdAt: originalTodo.createdAt }),
            });
            if (!response.ok) throw new Error('Failed to update todo');

            // FIX 2: Dispatch edit update success tracking to cycle version cache indicators
            dispatch({ type: TODO_ACTIONS.UPDATE_TODO_SUCCESS, payload: { id: editedTodo.id } });
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