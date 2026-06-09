import { useState, useEffect, useCallback } from 'react';
import TodoForm from './TodoForm.jsx';
import TodoList from './TodoList/TodoList.jsx';

function TodosPage({ token }) {
    const [todoList, setTodoList] = useState([]);
    const [error, setError] = useState('');
    const [isTodoListLoading, setIsTodoListLoading] = useState(false);

    const fetchTodos = useCallback(async () => {
        if (!token) return;
        setIsTodoListLoading(true);
        try {
            const response = await fetch('/api/tasks', {
                headers: { 'X-CSRF-TOKEN': token },
                credentials: 'include'
            });
            if (response.status === 401) throw new Error('unauthorized');
            if (!response.ok) throw new Error('Failed to fetch todos');

            const data = await response.json();
            setTodoList(data.tasks);
        } catch (err) {
            setError(`Error fetching todos: ${err.message}`);
        } finally {
            setIsTodoListLoading(false);
        }
    }, [token]);

    useEffect(() => {
        fetchTodos();
    }, [fetchTodos]);

    async function addTodo(todoTitle) {
        const newTodo = {
            id: Date.now(),
            title: todoTitle,
            isCompleted: false,
            isOptimisticPending: true // Set flag on add
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

            // Success: replace with server data (which has no pending flag)
            setTodoList(previous => previous.map(t => t.id === newTodo.id ? data : t));
        } catch (err) {
            setTodoList(previous => previous.filter(t => t.id !== newTodo.id));
            setError(err.message);
        }
    }

    async function completeTodo(id) {
        const originalTodo = todoList.find(todo => todo.id === id);

        // Optimistic Update: Mark completed AND set pending flag to true
        setTodoList(prev => prev.map(todo =>
            todo.id === id ? { ...todo, isCompleted: true, isOptimisticPending: true } : todo
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

            // Success: turn off pending flag
            setTodoList(prev => prev.map(todo =>
                todo.id === id ? { ...todo, isOptimisticPending: false } : todo
            ));
        } catch (err) {
            // Rollback completely on failure
            setTodoList(prev => prev.map(todo => todo.id === id ? originalTodo : todo));
            setError(err.message);
        }
    }

    async function updateTodo(editedTodo) {
        const originalTodo = todoList.find(todo => todo.id === editedTodo.id);

        // Optimistic Update: Apply edited text AND set pending flag to true
        setTodoList(prev => prev.map(todo =>
            todo.id === editedTodo.id ? { ...editedTodo, isOptimisticPending: true } : todo
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

            // Success: turn off pending flag
            setTodoList(prev => prev.map(todo =>
                todo.id === editedTodo.id ? { ...todo, isOptimisticPending: false } : todo
            ));
        } catch (err) {
            // Rollback on failure
            setTodoList(prev => prev.map(todo => todo.id === editedTodo.id ? originalTodo : todo));
            setError(err.message);
        }
    }

    return (
        <div>
            {error && (
                <div>
                    <p>{error}</p>
                    <button onClick={() => setError('')}>Clear Error</button>
                </div>
            )}

            {isTodoListLoading && <p>Loading...</p>}

            <TodoForm onAddTodo={addTodo} />

            <TodoList
                todoList={todoList}
                onCompleteTodo={completeTodo}
                onUpdateTodo={updateTodo}
            />
        </div>
    );
}

export default TodosPage;