import { useState } from 'react';
import DOMPurify from 'dompurify';

function TodoForm({ onAddTodo }) {
    const [workingTodoTitle, setWorkingTodoTitle] = useState('');
    const [validationError, setValidationError] = useState(''); // Tracking client input security state

    const handleAddTodo = (event) => {
        event.preventDefault();
        setValidationError('');

        const trimmedInput = workingTodoTitle.trim();

        // 1. Validation check runs first
        if (!trimmedInput) {
            setValidationError('Task title cannot be empty.');
            return;
        }

        if (trimmedInput.length > 100) {
            setValidationError('Task title must be under 100 characters.');
            return;
        }

        // 2. Sanitization runs second to completely strip out script/HTML injections
        const sanitizedTitle = DOMPurify.sanitize(trimmedInput, {
            ALLOWED_TAGS: [], // Drops all elements like <script>, <img>, <iframe>
            ALLOWED_ATTR: []  // Drops all hidden event attributes like onerror, onclick
        });

        // 3. Forward secure string up to your data provider engine context layer
        onAddTodo(sanitizedTitle);
        setWorkingTodoTitle('');
    };

    return (
        <form onSubmit={handleAddTodo} style={{ marginBottom: '15px' }}>
            <label htmlFor="todoTitle" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                Todo
            </label>
            <input
                type="text"
                id="todoTitle"
                value={workingTodoTitle}
                onChange={(e) => {
                    setWorkingTodoTitle(e.target.value);
                    if (validationError) setValidationError(''); // Clear warning banner when typing resumes
                }}
                placeholder="Todo text"
                maxLength={120} // Structural fallback safeguard restriction constraint
                style={{ padding: '8px', width: '70%', marginRight: '10px' }}
            />
            <button type="submit" disabled={!workingTodoTitle.trim()} style={{ padding: '8px 12px' }}>
                Add Todo
            </button>

            {/* User-friendly UI validation error indicator */}
            {validationError && (
                <p style={{ color: 'red', fontSize: '0.85rem', marginTop: '5px', fontWeight: '500' }}>
                    {validationError}
                </p>
            )}
        </form>
    );
}

export default TodoForm;