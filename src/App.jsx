import { useState } from 'react'
import './App.css'
import TodoList from './features/TodoList/TodoList.jsx'
import TodoForm from './features/TodoForm.jsx'

function App() {
    const [todoList, setTodoList] = useState([])

    function addTodo(todoTitle) {
        const newTodo = {
            id: Date.now(),
            title: todoTitle,
            isCompleted: false
        }
        setTodoList(previous => [newTodo, ...previous])
    }

    function completeTodo(id) {
        setTodoList(todoList.map(todo =>
            todo.id === id ? {...todo, isCompleted: true} : todo
        ))
    }

    function updateTodo(editedTodo) {
        const updatedTodos = todoList.map(todo =>
            todo.id === editedTodo.id ? { ...editedTodo } : todo
        );
        setTodoList(updatedTodos);
    }

    return (
        <div>
            <h1>Todo List</h1>
            <TodoForm onAddTodo={addTodo} />
            <TodoList
                todoList={todoList}
                onCompleteTodo={completeTodo}
                onUpdateTodo={updateTodo}
            /><TodoList
            todoList={todoList}
            onCompleteTodo={completeTodo}
            onUpdateTodo={updateTodo}
        />
        </div>
    );
}

export default App