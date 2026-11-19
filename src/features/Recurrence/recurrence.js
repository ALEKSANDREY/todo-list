// Pure recurrence helpers — no JSX, no React, no side effects, so they can be
// unit-tested with plain node. Day keys are 'YYYY-MM-DD' strings.
import { keyToDate, toLocalKey, addDaysToKey, dueLabel } from '../../utils/dates.js';

const SHORT_DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// Add `months` months to baseKey, clamping the day to the last day of the
// target month (e.g. Jan 31 2026 + 1 month → Feb 28 2026).
function addMonthsClamped(baseKey, months) {
    const d = keyToDate(baseKey);
    const targetMonth = d.getMonth() + months;
    const year = d.getFullYear() + Math.floor(targetMonth / 12);
    const month = ((targetMonth % 12) + 12) % 12;
    const lastDay = new Date(year, month + 1, 0).getDate();
    return toLocalKey(new Date(year, month, Math.min(d.getDate(), lastDay)));
}

// nextOccurrence(baseKey, rule) → 'YYYY-MM-DD'.
// Computes the day after `baseKey` on which the recurring task should recur.
export function nextOccurrence(baseKey, rule) {
    if (!rule) return addDaysToKey(baseKey, 1);
    switch (rule.freq) {
        case 'daily':
            return addDaysToKey(baseKey, 1);
        case 'weekly':
            return addDaysToKey(baseKey, 7);
        case 'monthly':
            return addMonthsClamped(baseKey, 1);
        case 'weekdays': {
            const days = Array.isArray(rule.weekdays) ? rule.weekdays : [];
            if (days.length === 0) return addDaysToKey(baseKey, 7); // empty → weekly fallback
            for (let i = 1; i <= 7; i++) {
                const candidate = keyToDate(baseKey);
                candidate.setDate(candidate.getDate() + i);
                if (days.includes(candidate.getDay())) return toLocalKey(candidate);
            }
            return addDaysToKey(baseKey, 7); // unreachable, but stay total
        }
        default:
            return addDaysToKey(baseKey, 1);
    }
}

// describeRule(rule) → human string, e.g. "Every day", "Every Mon, Wed",
// "Every weekday until Aug 14".
export function describeRule(rule) {
    if (!rule || !rule.freq) return '';
    let base;
    switch (rule.freq) {
        case 'daily':
            base = 'Every day';
            break;
        case 'weekly':
            base = 'Every week';
            break;
        case 'monthly':
            base = 'Every month';
            break;
        case 'weekdays': {
            const days = [...(Array.isArray(rule.weekdays) ? rule.weekdays : [])].sort((a, b) => a - b);
            const isWeekdays = days.length === 5 && days.every((d, i) => d === i + 1);
            base = isWeekdays
                ? 'Every weekday'
                : `Every ${days.map((d) => SHORT_DAYS[d]).join(', ')}`;
            break;
        }
        default:
            base = '';
    }
    if (!base) return '';
    return rule.endsOn ? `${base} until ${dueLabel(rule.endsOn)}` : base;
}
