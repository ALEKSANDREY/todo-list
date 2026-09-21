/* eslint-disable react-refresh/only-export-components -- context file exporting provider + hook */
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useTodo } from './TodoContext';
import { loadJSON, saveJSON } from '../utils/localStore';

// Per-task metadata kept separate from the task store so the existing
// TodoContext/reducer/API flows stay untouched. Works in demo mode and
// with a real API login alike — everything persists in localStorage.
// Shape: { [taskId]: { dueDate?: 'YYYY-MM-DD', remindAt?: 'YYYY-MM-DDTHH:mm',
//                       contactId?: string, completedAt?: ISO string } }

const TaskMetaContext = createContext();
const META_KEY = 'powerpack-taskmeta-v1';

export function useTaskMeta() {
    const context = useContext(TaskMetaContext);
    if (!context) throw new Error('useTaskMeta must be used within a TaskMetaProvider');
    return context;
}

export function TaskMetaProvider({ children }) {
    const [meta, setMetaState] = useState(() => loadJSON(META_KEY, {}));
    const { todoList } = useTodo();

    useEffect(() => {
        saveJSON(META_KEY, meta);
    }, [meta]);

    // Stamp completedAt when a task transitions to completed; clear it when
    // a task is reopened. This is what powers the dashboard history.
    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional cross-store sync: derives completion timestamps from the task store
        setMetaState((prev) => {
            let changed = false;
            const next = { ...prev };
            for (const t of todoList) {
                const id = String(t.id);
                const m = next[id] || {};
                if (t.isCompleted && !m.completedAt) {
                    next[id] = { ...m, completedAt: new Date().toISOString() };
                    changed = true;
                } else if (!t.isCompleted && m.completedAt) {
                    const { completedAt: _dropped, ...rest } = m;
                    next[id] = rest;
                    changed = true;
                }
            }
            return changed ? next : prev;
        });
    }, [todoList]);

    const getMeta = useCallback((id) => meta[String(id)] || {}, [meta]);

    const setMeta = useCallback((id, patch) => {
        setMetaState((prev) => {
            const key = String(id);
            const merged = { ...(prev[key] || {}), ...patch };
            const cleaned = Object.fromEntries(
                Object.entries(merged).filter(([, v]) => v !== '' && v !== null && v !== undefined)
            );
            if (Object.keys(cleaned).length === 0) {
                if (!prev[key]) return prev;
                const next = { ...prev };
                delete next[key];
                return next;
            }
            return { ...prev, [key]: cleaned };
        });
    }, []);

    const clearMeta = useCallback((id) => {
        setMetaState((prev) => {
            const key = String(id);
            if (!prev[key]) return prev;
            const next = { ...prev };
            delete next[key];
            return next;
        });
    }, []);

    const clearAllMeta = useCallback(() => setMetaState({}), []);

    return (
        <TaskMetaContext.Provider value={{ meta, getMeta, setMeta, clearMeta, clearAllMeta }}>
            {children}
        </TaskMetaContext.Provider>
    );
}
