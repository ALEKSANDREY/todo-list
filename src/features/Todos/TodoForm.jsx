import { useState } from 'react';
import DOMPurify from 'dompurify';
import { useTaskMeta } from '../../contexts/TaskMetaContext';

function TodoForm({ onAddTodo }) {
    const [workingTodoTitle, setWorkingTodoTitle] = useState('');
    const [validationError, setValidationError] = useState(''); // Tracking client input security state
    const [showSchedule, setShowSchedule] = useState(false);
    const [dueDate, setDueDate] = useState('');
    const [remindAt, setRemindAt] = useState('');
    const { setMeta } = useTaskMeta();

    const handleAddTodo = async (event) => {
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
        const newId = await onAddTodo(sanitizedTitle);
        if (newId && (dueDate || remindAt)) {
            setMeta(newId, {
                ...(dueDate ? { dueDate } : {}),
                ...(remindAt ? { remindAt } : {}),
            });
        }
        setWorkingTodoTitle('');
        setDueDate('');
        setRemindAt('');
        setShowSchedule(false);
    };

    return (
        <form onSubmit={handleAddTodo}>
            <label htmlFor="todoTitle" className="field-label">
                New task
            </label>
            <div className="flex flex-col gap-3 sm:flex-row">
                <input
                    type="text"
                    id="todoTitle"
                    value={workingTodoTitle}
                    onChange={(e) => {
                        setWorkingTodoTitle(e.target.value);
                        if (validationError) setValidationError(''); // Clear warning banner when typing resumes
                    }}
                    placeholder="What needs doing?"
                    maxLength={120} // Structural fallback safeguard restriction constraint
                    className="input flex-1"
                />
                <button type="submit" disabled={!workingTodoTitle.trim()} className="btn-primary shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="h-4 w-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                    Add task
                </button>
            </div>

            {/* User-friendly UI validation error indicator */}
            {validationError && (
                <div className="error-banner mt-3" role="alert">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-5 w-5 shrink-0">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
                    </svg>
                    <span>{validationError}</span>
                </div>
            )}

            {/* Optional scheduling: due date + reminder */}
            <div className="mt-3">
                <button
                    type="button"
                    onClick={() => setShowSchedule((v) => !v)}
                    aria-expanded={showSchedule}
                    className="text-xs font-bold text-indigo-600 hover:text-indigo-800"
                >
                    {showSchedule ? '− Hide schedule options' : '+ Due date & reminder'}
                </button>
                {showSchedule && (
                    <div className="animate-enter mt-2 grid gap-3 rounded-xl border border-slate-200/70 bg-slate-50/60 p-3 sm:grid-cols-2">
                        <div>
                            <label htmlFor="todoDueDate" className="field-label">Due date</label>
                            <input
                                type="date"
                                id="todoDueDate"
                                value={dueDate}
                                onChange={(e) => setDueDate(e.target.value)}
                                className="input"
                            />
                        </div>
                        <div>
                            <label htmlFor="todoRemindAt" className="field-label">Remind me at</label>
                            <input
                                type="datetime-local"
                                id="todoRemindAt"
                                value={remindAt}
                                onChange={(e) => setRemindAt(e.target.value)}
                                className="input"
                            />
                        </div>
                    </div>
                )}
            </div>
        </form>
    );
}

export default TodoForm;
