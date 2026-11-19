/* eslint-disable react-refresh/only-export-components -- context file exporting provider + hook */
import { createContext, useContext, useEffect, useCallback, useMemo, useRef } from 'react';
import { useTodo } from './TodoContext';
import { api } from '../utils/api';

// Per-task metadata now lives on the server task row (see server schema).
// This context keeps its old interface: `meta` is a live view derived from
// the task store, and setMeta PATCHes the row and merges the authoritative
// response back via TodoContext.upsertTask.
// Meta shape: { [taskId]: { dueDate, remindAt, contactId, completedAt,
//   status: 'todo'|'inprogress'|'done', recurrence, recurrenceDone,
//   timeSeconds, gcalEventId, gcalHash } }

const TaskMetaContext = createContext();

// Client meta key -> server task column.
const FIELD_MAP = {
    dueDate: 'dueDate',
    remindAt: 'remindAt',
    contactId: 'contactId',
    completedAt: 'completedAt',
    status: 'status',
    recurrence: 'recurrence',
    recurrenceDone: 'recurrenceDone',
    timeSeconds: 'timeLogged',
    gcalEventId: 'gcalEventId',
    gcalHash: 'gcalHash',
};

const NULLABLE = new Set([
    'dueDate', 'remindAt', 'contactId', 'completedAt',
    'recurrence', 'gcalEventId', 'gcalHash',
]);

function rowToMeta(row) {
    return {
        dueDate: row.dueDate ?? '',
        remindAt: row.remindAt ?? '',
        contactId: row.contactId ?? '',
        completedAt: row.completedAt ?? '',
        status: row.status || 'todo',
        recurrence: row.recurrence || null,
        recurrenceDone: !!row.recurrenceDone,
        timeSeconds: Number(row.timeLogged || 0),
        gcalEventId: row.gcalEventId ?? '',
        gcalHash: row.gcalHash ?? '',
    };
}

// Normalize a client-side patch into server columns. Empty strings become
// NULL for nullable columns; unknown keys are dropped.
function toServerPatch(patch) {
    const body = {};
    for (const [key, value] of Object.entries(patch || {})) {
        const column = FIELD_MAP[key];
        if (!column) continue;
        if (key === 'timeSeconds') {
            body[column] = Math.max(0, Math.floor(Number(value) || 0));
        } else if (key === 'recurrenceDone') {
            body[column] = !!value;
        } else if (value === '' || value === null || value === undefined) {
            body[column] = NULLABLE.has(key) ? null : value;
        } else if (key === 'contactId') {
            body[column] = Number(value) || null;
        } else {
            body[column] = value;
        }
    }
    return body;
}

const META_NULL_PATCH = {
    dueDate: null,
    remindAt: null,
    contactId: null,
    completedAt: null,
    recurrence: null,
    recurrenceDone: false,
    timeLogged: 0,
    gcalEventId: null,
    gcalHash: null,
};

export function useTaskMeta() {
    const context = useContext(TaskMetaContext);
    if (!context) throw new Error('useTaskMeta must be used within a TaskMetaProvider');
    return context;
}

export function TaskMetaProvider({ children }) {
    const { todoList, upsertTask } = useTodo();

    const meta = useMemo(() => {
        const map = {};
        for (const t of todoList) map[String(t.id)] = rowToMeta(t);
        return map;
    }, [todoList]);

    const metaRef = useRef(meta);
    useEffect(() => {
        metaRef.current = meta;
    }, [meta]);

    const patchTask = useCallback(
        async (id, body) => {
            if (Object.keys(body).length === 0) return;
            try {
                const saved = await api(`/api/tasks/${id}`, { method: 'PATCH', body });
                upsertTask(saved);
            } catch {
                // Errors surface through TodoContext's error state on its own
                // actions; meta PATCHes are best-effort to keep the UI snappy.
            }
        },
        [upsertTask]
    );

    // Stamp completedAt when a task transitions to completed; clear it when
    // a task is reopened. This is what powers the dashboard history.
    useEffect(() => {
        for (const t of todoList) {
            const m = metaRef.current[String(t.id)] || {};
            if (t.isCompleted && !m.completedAt) {
                patchTask(t.id, { completedAt: new Date().toISOString() });
            } else if (!t.isCompleted && m.completedAt) {
                patchTask(t.id, { completedAt: null });
            }
        }
    }, [todoList, patchTask]);

    // Keep kanban status in sync with the completed flag: completing a task
    // moves it to 'done'; reopening a 'done' task drops it back to 'todo'.
    // ('inprogress' is only ever set explicitly from the board UI.)
    useEffect(() => {
        for (const t of todoList) {
            const m = metaRef.current[String(t.id)] || {};
            if (t.isCompleted && m.status !== 'done') {
                patchTask(t.id, { status: 'done' });
            } else if (!t.isCompleted && m.status === 'done') {
                patchTask(t.id, { status: 'todo' });
            }
        }
    }, [todoList, patchTask]);

    const getMeta = useCallback((id) => metaRef.current[String(id)] || rowToMeta({}), []);

    const setMeta = useCallback(
        (id, patch) => {
            const body = toServerPatch(patch);
            return patchTask(id, body);
        },
        [patchTask]
    );

    const clearMeta = useCallback(
        (id) => {
            const t = todoList.find((x) => String(x.id) === String(id));
            patchTask(id, { ...META_NULL_PATCH, status: t && t.isCompleted ? 'done' : 'todo' });
        },
        [todoList, patchTask]
    );

    const clearAllMeta = useCallback(async () => {
        for (const t of todoList) {
            await patchTask(t.id, { ...META_NULL_PATCH, status: t.isCompleted ? 'done' : 'todo' });
        }
    }, [todoList, patchTask]);

    const value = useMemo(
        () => ({ meta, getMeta, setMeta, clearMeta, clearAllMeta }),
        [meta, getMeta, setMeta, clearMeta, clearAllMeta]
    );

    return <TaskMetaContext.Provider value={value}>{children}</TaskMetaContext.Provider>;
}
