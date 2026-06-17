import { useMemo } from 'react';
import TodoListItem from '../TodoListItem.jsx';

function TodoList({ todoList, onCompleteTodo, onUpdateTodo, statusFilter = 'all' }) {

    const filteredTodoList = useMemo(() => {
        let tasks = [...todoList];

        // Evaluate URL parameter switches cleanly
        if (statusFilter === 'completed') {
            tasks = tasks.filter(t => t.isCompleted);
        } else if (statusFilter === 'active') {
            tasks = tasks.filter(t => !t.isCompleted);
        }

        return tasks;
    }, [todoList, statusFilter]);

    const getEmptyMessage = () => {
        if (statusFilter === 'completed') return 'No completed todos yet.';
        if (statusFilter === 'active') return 'Clean slate! No active remaining tasks.';
        return 'Your task collection is empty. Type above to add one!';
    };

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