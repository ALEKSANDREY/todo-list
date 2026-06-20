import { useState, useRef } from 'react';
import TextInputWithLabel from '../shared/TextInputWithLabel';
import { isValidTodoTitle } from '../utils/todoValidation';

function TodoForm({ onAddTodo }) {
    const [workingTodoTitle, setWorkingTodoTitle] = useState('')
    const inputRef = useRef()

    const handleAddTodo = (event) => {
        event.preventDefault();
        if (isValidTodoTitle(workingTodoTitle)) {
            onAddTodo(workingTodoTitle);
            setWorkingTodoTitle('');
            inputRef.current.focus();
        }
    };

    return (
        <form onSubmit={handleAddTodo}>
            <TextInputWithLabel
                elementId="todoTitle"
                labelText="Todo"
                ref={inputRef}
                value={workingTodoTitle}
                onChange={(e) => setWorkingTodoTitle(e.target.value)}
            />
            <button type="submit" disabled={!isValidTodoTitle(workingTodoTitle)}>
                Add Todo
            </button>
        </form>
    );
}

export default TodoForm;