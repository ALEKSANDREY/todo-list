import { useState } from 'react';

function TodoForm({ onAddTodo }) {
    const [workingTodoTitle, setWorkingTodoTitle] = useState('')

    const handleAddTodo = (event) => {
        event.preventDefault();
        if (workingTodoTitle.trim()) {
            onAddTodo(workingTodoTitle);
            setWorkingTodoTitle('');
        }
    };

    return (
        <form onSubmit={handleAddTodo}>
            <label htmlFor="todoTitle">Todo</label>
            <input
                type="text"
                id="todoTitle"
                value={workingTodoTitle}
                onChange={(e) => setWorkingTodoTitle(e.target.value)}
                placeholder="Todo text"
            />
            <button type="submit" disabled={!workingTodoTitle.trim()}>
                Add Todo
            </button>
        </form>
    );
}

export default TodoForm;