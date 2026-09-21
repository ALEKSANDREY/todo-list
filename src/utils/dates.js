// Local-timezone date helpers. Day keys are 'YYYY-MM-DD' strings so they
// compare and sort lexicographically.

const pad2 = (n) => String(n).padStart(2, '0');

export function toLocalKey(date) {
    return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
}

export function todayKey() {
    return toLocalKey(new Date());
}

export function keyToDate(key) {
    const [y, m, d] = key.split('-').map(Number);
    return new Date(y, m - 1, d);
}

export function addDaysToKey(key, n) {
    const d = keyToDate(key);
    d.setDate(d.getDate() + n);
    return toLocalKey(d);
}

// Oldest → newest keys for the trailing n days, ending today.
export function lastNDayKeys(n) {
    const t = todayKey();
    return Array.from({ length: n }, (_, i) => addDaysToKey(t, i - (n - 1)));
}

// Monday (local) of the week containing `key`.
export function weekStartKey(key) {
    const d = keyToDate(key);
    const mondayOffset = (d.getDay() + 6) % 7;
    d.setDate(d.getDate() - mondayOffset);
    return toLocalKey(d);
}

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function shortDayLabel(key) {
    const d = keyToDate(key);
    return `${DAY_NAMES[d.getDay()]} ${d.getDate()}`;
}

export function isOverdueKey(key) {
    return Boolean(key) && key < todayKey();
}

// Human label for a due-date day key.
export function dueLabel(key) {
    if (!key) return '';
    const t = todayKey();
    if (key === t) return 'Today';
    if (key === addDaysToKey(t, 1)) return 'Tomorrow';
    if (key === addDaysToKey(t, -1)) return 'Yesterday';
    if (key < t) {
        const diff = Math.round((keyToDate(t) - keyToDate(key)) / 86400000);
        return diff === 1 ? '1 day overdue' : `${diff} days overdue`;
    }
    const d = keyToDate(key);
    return `${MONTH_NAMES[d.getMonth()]} ${d.getDate()}`;
}

// <input type="datetime-local"> values are 'YYYY-MM-DDTHH:mm' (local time).
export function parseDateTimeLocal(value) {
    if (!value || typeof value !== 'string') return null;
    const [datePart, timePart] = value.split('T');
    if (!datePart || !timePart) return null;
    const [y, m, d] = datePart.split('-').map(Number);
    const [h, min] = timePart.split(':').map(Number);
    if ([y, m, d, h, min].some((n) => Number.isNaN(n))) return null;
    return new Date(y, m - 1, d, h, min);
}

export function toDateTimeLocalValue(date) {
    return `${toLocalKey(date)}T${pad2(date.getHours())}:${pad2(date.getMinutes())}`;
}

export function formatTime(date) {
    let h = date.getHours();
    const ap = h >= 12 ? 'PM' : 'AM';
    h = h % 12 || 12;
    return `${h}:${pad2(date.getMinutes())} ${ap}`;
}
