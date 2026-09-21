/* eslint-disable react-refresh/only-export-components -- context file exporting provider + hook */
import { createContext, useContext, useEffect, useRef } from 'react';
import { useTodo } from './TodoContext';
import { useTaskMeta } from './TaskMetaContext';
import { todayKey } from '../utils/dates';
import { nextOccurrence, describeRule } from '../features/Recurrence/recurrence';

// Watches for completed tasks that carry a recurrence rule and respawns the
// next occurrence: a fresh task with the same title, next due date, the same
// recurrence rule, and the same contact link. One spawn per completed task
// (tracked in a ref set so StrictMode's double-effect can't duplicate).

const RecurrenceContext = createContext();

export function useRecurrence() {
    const context = useContext(RecurrenceContext);
    if (!context) throw new Error('useRecurrence must be used within a RecurrenceProvider');
    return context;
}

export function RecurrenceProvider({ children }) {
    const { todoList, addTodo } = useTodo();
    const { meta, getMeta, setMeta } = useTaskMeta();
    const handledRef = useRef(new Set());

    useEffect(() => {
        for (const task of todoList) {
            if (!task.isCompleted) continue;
            const id = String(task.id);
            const m = meta[id] || {};
            if (!m.recurrence || m.recurrenceDone) continue;
            if (handledRef.current.has(id)) continue;
            handledRef.current.add(id); // immediately: StrictMode double-effect safety

            (async () => {
                const rule = m.recurrence;
                const base = m.dueDate || todayKey();
                const next = nextOccurrence(base, rule);
                setMeta(id, { recurrenceDone: true });
                if (rule.endsOn && next > rule.endsOn) return; // series ended: no new task
                const newId = await addTodo(task.title);
                if (!newId) return;
                setMeta(newId, {
                    dueDate: next,
                    recurrence: rule,
                    contactId: m.contactId || '',
                });
            })();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional: run the scan on every store change; handledRef guards repeats
    }, [todoList, meta]);

    const getRecurrence = (taskId) => {
        const m = getMeta(taskId);
        return m.recurrence || null;
    };

    const setRecurrence = (taskId, rule) => {
        if (!rule) {
            // setMeta drops empty-string values, so this clears the rule fields.
            setMeta(taskId, { recurrence: '', recurrenceDone: '', weekdays: '', endsOn: '' });
            return;
        }
        setMeta(taskId, {
            recurrence: {
                freq: rule.freq,
                weekdays: Array.isArray(rule.weekdays) ? rule.weekdays : [],
                endsOn: rule.endsOn || '',
            },
            recurrenceDone: false,
        });
    };

    return (
        <RecurrenceContext.Provider value={{ getRecurrence, setRecurrence, describeRule }}>
            {children}
        </RecurrenceContext.Provider>
    );
}
