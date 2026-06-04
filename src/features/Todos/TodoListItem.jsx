import { useState } from 'react';
import TextInputWithLabel from '../../shared/TextInputWithLabel.jsx';
import { isValidTodoTitle } from '../../utils/todoValidation.js';

function TodoListItem({ todo, onCompleteTodo, onUpdateTodo }) {
    const [isEditing, setIsEditing] = useState(false);
    const [workingTitle, setWorkingTitle] = useState(todo.title);

    function handleCancel() {
        setWorkingTitle(todo.title);
        setIsEditing(false);
    }

    function handleEdit(event) {
        setWorkingTitle(event.target.value);
    }

    function handleUpdate(event) {
        if (!isEditing) return;
        event.preventDefault();
        onUpdateTodo({ ...todo, title: workingTitle });
        setIsEditing(false);
    }

    return (
        <li>
            <form onSubmit={handleUpdate}>
                {isEditing ? (
                    <>
                        <TextInputWithLabel
                            elementId={`edit-${todo.id}`}
                            labelText="Edit:"
                            value={workingTitle}
                            onChange={handleEdit}
                        />
                        <button type="button" onClick={handleCancel}>Cancel</button>
                        <button
                            type="button"
                            onClick={handleUpdate}
                            disabled={!isValidTodoTitle(workingTitle)}
                        >
                            Update
                        </button>
                    </>
                ) : (
                    <>
                        <input
                            type="checkbox"
                            checked={todo.isCompleted}
                            onChange={() => onCompleteTodo(todo.id)}
                            disabled={todo.isOptimisticPending} // FIX: Prevents clicking until server returns real data!
                        />
                        {/* FIX: Prevent entering edit mode if the item is an optimistic row pending server validation */}
                        <span
                            onClick={() => !todo.isOptimisticPending && setIsEditing(true)}
                            style={{
                                cursor: todo.isOptimisticPending ? 'not-allowed' : 'pointer',
                                opacity: todo.isOptimisticPending ? 0.6 : 1,
                                fontStyle: todo.isOptimisticPending ? 'italic' : 'normal'
                            }}
                        >
                            {todo.title} {todo.isOptimisticPending && '(Saving...)'}
                        </span>
                    </>
                )}
            </form>
        </li>
    );
}

export default TodoListItem;