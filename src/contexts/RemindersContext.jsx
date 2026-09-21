/* eslint-disable react-refresh/only-export-components -- context file exporting provider + hook */
import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useTodo } from './TodoContext';
import { useTaskMeta } from './TaskMetaContext';
import { todayKey, parseDateTimeLocal } from '../utils/dates';
import { uid } from '../utils/localStore';

// Reminders fire while the app tab is open: a 60-second poll checks for
// due reminder times and overdue tasks, surfacing in-app toasts and (when
// permitted) native browser notifications.

const RemindersContext = createContext();
const POLL_MS = 60_000;
const TOAST_TTL_MS = 9000;

function notificationsSupported() {
    return typeof window !== 'undefined' && 'Notification' in window;
}

export function useReminders() {
    const context = useContext(RemindersContext);
    if (!context) throw new Error('useReminders must be used within a RemindersProvider');
    return context;
}

export function RemindersProvider({ children }) {
    const { todoList } = useTodo();
    const { meta } = useTaskMeta();
    const [toasts, setToasts] = useState([]);
    const [permission, setPermission] = useState(() =>
        notificationsSupported() ? Notification.permission : 'unsupported'
    );
    // Session-only: each reminder/overdue fires at most once per tab session.
    const notifiedRef = useRef(new Set());

    const dismissToast = useCallback((id) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    const pushToast = useCallback((toast) => {
        const id = uid();
        setToasts((prev) => [...prev.slice(-3), { id, ...toast }]);
        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
        }, TOAST_TTL_MS);
    }, []);

    const requestPermission = useCallback(async () => {
        if (!notificationsSupported()) return 'unsupported';
        try {
            const result = await Notification.requestPermission();
            setPermission(result);
            return result;
        } catch {
            return Notification.permission;
        }
    }, []);

    const fireNotification = useCallback((title, body) => {
        if (notificationsSupported() && Notification.permission === 'granted') {
            try {
                new Notification(title, { body });
            } catch {
                // Notification construction can throw in some contexts — toasts still show.
            }
        }
    }, []);

    const checkReminders = useCallback(() => {
        const now = new Date();
        const tKey = todayKey();
        for (const task of todoList) {
            if (task.isCompleted) continue;
            const m = meta[String(task.id)] || {};

            const remindKey = `remind:${task.id}`;
            if (m.remindAt && !notifiedRef.current.has(remindKey)) {
                const at = parseDateTimeLocal(m.remindAt);
                if (at && at <= now) {
                    notifiedRef.current.add(remindKey);
                    pushToast({ title: 'Reminder', body: task.title, tone: 'info', taskId: task.id });
                    fireNotification('Task reminder', task.title);
                }
            }

            const overdueKey = `overdue:${task.id}`;
            if (m.dueDate && m.dueDate < tKey && !notifiedRef.current.has(overdueKey)) {
                notifiedRef.current.add(overdueKey);
                pushToast({ title: 'Overdue task', body: task.title, tone: 'warn', taskId: task.id });
                fireNotification('Overdue task', task.title);
            }
        }
    }, [todoList, meta, pushToast, fireNotification]);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect -- poll-on-mount: fires due reminders immediately, then every 60s
        checkReminders();
        const timer = setInterval(checkReminders, POLL_MS);
        return () => clearInterval(timer);
    }, [checkReminders]);

    // Derived lists for the dashboard + header badge.
    const tKey = todayKey();
    const activeTasks = todoList.filter((t) => !t.isCompleted);
    const metaFor = (id) => meta[String(id)] || {};
    const overdueTasks = activeTasks.filter((t) => {
        const d = metaFor(t.id).dueDate;
        return d && d < tKey;
    });
    const dueTodayTasks = activeTasks.filter((t) => metaFor(t.id).dueDate === tKey);
    const attentionCount = overdueTasks.length + dueTodayTasks.length;

    const value = {
        toasts,
        pushToast,
        dismissToast,
        overdueTasks,
        dueTodayTasks,
        attentionCount,
        permission,
        requestPermission,
        notificationsSupported: notificationsSupported(),
    };

    return <RemindersContext.Provider value={value}>{children}</RemindersContext.Provider>;
}
