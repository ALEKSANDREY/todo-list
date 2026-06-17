import React, { useMemo } from 'react';
import TodoListItem from '../TodoListItem.jsx';
import { useTodo } from '../../../contexts/TodoContext';

function TodoList({ statusFilter = 'all', onCompleteTodo, onUpdateTodo }) {
    // 1. Consume todoList and dataVersion from context per Step 19 guidelines
    const { todoList, dataVersion } = useTodo();

    // 2. Track and memoize the filtered array, including dataVersion as a dependency
    const filteredTodoList = useMemo(() => {
        let tasks = [...todoList];

        // Evaluate URL parameter switches cleanly
        if (statusFilter === 'completed') {
            tasks = tasks.filter(t => t.isCompleted);
        } else if (statusFilter === 'active') {
            tasks = tasks.filter(t => !t.isCompleted);
        }

        return tasks;
    }, [todoList, statusFilter, dataVersion]); // Included dataVersion here

    const getEmptyMessage = () => {
        if (statusFilter === 'completed') return 'No completed todos yet.';
        if (statusFilter === 'active') return 'Clean slate! No active remaining tasks.';
        return 'Your task collection is empty. Type above to add one!';
    };

    // 3. Log the cache dataVersion on every render execution to demonstrate cache updates
    console.log(`Rendering TodoList cache version: ${dataVersion}`);

    return filteredTodoList.length === 0 ? (
        <p style={{ textAlign: 'center', color: '#666', fontStyle: 'italic' }}>{getEmptyMessage()}</p>
    ) : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
            {filteredTodoList.map((todo) => (
                <TodoListItem
                    key={todo.id}
                    todo={todo}
                    onCompleteTodo={onCompleteTodo}
                    onUpdateTodo={onUpdateTodo}
                />
            ))}
        </ul>
    );
}

export default TodoList;