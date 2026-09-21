import { describeRule } from './recurrence';

export default function RecurrenceBadge({ rule }) {
    if (!rule) return null;
    return (
        <span className="rounded-full bg-teal-50 px-2.5 py-0.5 text-[0.7rem] font-bold text-teal-700">
            🔁 {describeRule(rule)}
        </span>
    );
}
