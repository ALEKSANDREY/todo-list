import React, { useMemo } from 'react'; // 1. Add the useMemo import
import TodoListItem from '../TodoListItem.jsx';

// 2. Add dataVersion to the props coming from the parent component
function TodoList({ todoList, dataVersion, onCompleteTodo, onUpdateTodo }) {

    // 3. Wrap your existing filter logic in useMemo so it doesn't run unless needed
    const filteredTodoList = useMemo(() => {


        const activeTodos = todoList.filter(todo => !todo.isCompleted);

        // The assignment requires returning an object with version and todos
        return {
            version: dataVersion,
            todos: activeTodos
        };
    }, [todoList, dataVersion]); // Recalculate if the list changes or version updates

    // 4. Update the JSX to use filteredTodoList.todos instead of filteredTodoList
    return (
        filteredTodoList.todos.length === 0 ? (
            <p>Add todo above to get started</p>
        ) : (
            <ul>
                {filteredTodoList.todos.map(todo => (
                    <TodoListItem
                        key={todo.id}
                        todo={todo}
                        onCompleteTodo={onCompleteTodo}
                        onUpdateTodo={onUpdateTodo}
                    />
                ))}
            </ul>
        )
    );
}

export default TodoList;