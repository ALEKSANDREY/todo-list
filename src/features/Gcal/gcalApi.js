// Pure, JSX-free Google Calendar helpers. No DOM is touched except inside
// loadScript(); the hash/event builders are unit-testable with plain node.

const GIS_SRC = 'https://accounts.google.com/gsi/client';
const GAPI_SRC = 'https://apis.google.com/js/api.js';
const DISCOVERY_DOC = 'https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest';

export { GIS_SRC, GAPI_SRC, DISCOVERY_DOC };

// Inject a <script> tag and resolve when it loads. If a tag with the same
// src is already in the document, resolve immediately (dedupe).
export function loadScript(src) {
    return new Promise((resolve, reject) => {
        if (document.querySelector(`script[src="${src}"]`)) {
            resolve();
            return;
        }
        const tag = document.createElement('script');
        tag.src = src;
        tag.async = true;
        tag.onload = () => resolve();
        tag.onerror = () => reject(new Error(`Failed to load script: ${src}`));
        document.head.appendChild(tag);
    });
}

// Fingerprint of a task's sync-relevant fields. Stored as meta.gcalHash so
// pushTasks() can tell when an already-pushed task needs a PATCH.
export function taskHash(task, meta) {
    return `${task.title}|${(meta && meta.dueDate) || ''}`;
}

// All-day event body for a task with a due date.
export function buildEventFromTask(task, meta) {
    return {
        summary: task.title,
        start: { date: meta.dueDate },
        end: { date: meta.dueDate },
    };
}

// Normalize a Calendar event's start to a YYYY-MM-DD key. All-day events
// carry start.date; timed events carry start.dateTime (we only need the day).
export function eventDayKey(event) {
    if (event.start.date) return event.start.date;
    return event.start.dateTime.slice(0, 10);
}
