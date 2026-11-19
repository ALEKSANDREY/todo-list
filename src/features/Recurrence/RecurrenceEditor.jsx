import { useState } from 'react';
import { useRecurrence } from '../../contexts/RecurrenceContext';

const FREQ_OPTIONS = [
    { value: '', label: 'None' },
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'weekdays', label: 'Custom weekdays' },
];

// Weekday toggle labels: index 0 = Sunday.
const WEEKDAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

function initialForm(rule) {
    return {
        freq: rule?.freq || '',
        weekdays: Array.isArray(rule?.weekdays) ? [...rule.weekdays] : [],
        endsOn: rule?.endsOn || '',
    };
}

export default function RecurrenceEditor({ taskId }) {
    const { getRecurrence, setRecurrence } = useRecurrence();
    const [form, setForm] = useState(() => initialForm(getRecurrence(taskId)));

    const reset = () => setForm(initialForm(getRecurrence(taskId)));

    const toggleWeekday = (day) => {
        setForm((prev) => ({
            ...prev,
            weekdays: prev.weekdays.includes(day)
                ? prev.weekdays.filter((d) => d !== day)
                : [...prev.weekdays, day],
        }));
    };

    const handleSave = () => {
        if (!form.freq) {
            setRecurrence(taskId, null);
            return;
        }
        setRecurrence(taskId, {
            freq: form.freq,
            weekdays: form.freq === 'weekdays' ? [...form.weekdays].sort((a, b) => a - b) : [],
            endsOn: form.endsOn || '',
        });
    };

    return (
        <div className="space-y-3">
            <div>
                <label className="field-label" htmlFor={`recur-freq-${taskId}`}>Repeat</label>
                <select
                    id={`recur-freq-${taskId}`}
                    className="select"
                    value={form.freq}
                    onChange={(e) => setForm((prev) => ({ ...prev, freq: e.target.value }))}
                >
                    {FREQ_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                </select>
            </div>

            {form.freq === 'weekdays' && (
                <div>
                    <span className="field-label">Days</span>
                    <div className="flex gap-1.5">
                        {WEEKDAY_LABELS.map((label, day) => {
                            const active = form.weekdays.includes(day);
                            return (
                                <button
                                    key={day}
                                    type="button"
                                    aria-pressed={active}
                                    onClick={() => toggleWeekday(day)}
                                    className={`h-9 w-9 rounded-full text-sm font-semibold transition-colors ${
                                        active
                                            ? 'bg-teal-600 text-white'
                                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                    }`}
                                    title={['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][day]}
                                >
                                    {label}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}

            {form.freq && (
                <div>
                    <label className="field-label" htmlFor={`recur-ends-${taskId}`}>Ends on (optional)</label>
                    <input
                        id={`recur-ends-${taskId}`}
                        type="date"
                        className="input"
                        value={form.endsOn}
                        onChange={(e) => setForm((prev) => ({ ...prev, endsOn: e.target.value }))}
                    />
                </div>
            )}

            <div className="flex gap-2 pt-1">
                <button type="button" className="btn-primary" onClick={handleSave}>Save</button>
                <button type="button" className="btn-ghost" onClick={reset}>Cancel</button>
            </div>
        </div>
    );
}
