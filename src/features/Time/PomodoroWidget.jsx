import { useState } from 'react';
import { useTime } from '../../contexts/TimeContext';
import { useTodo } from '../../contexts/TodoContext';

const PHASE_LABEL = {
    idle: 'Ready to focus',
    focus: 'Focusing',
    break: 'Short break',
    longbreak: 'Long break',
};

const PHASE_ACCENT = {
    idle: 'text-slate-600',
    focus: 'text-emerald-700',
    break: 'text-amber-700',
    longbreak: 'text-indigo-700',
};

function mmss(ms) {
    const total = Math.max(0, Math.ceil(ms / 1000));
    const m = Math.floor(total / 60);
    const s = total % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function SettingsForm({ settings, onSave }) {
    const [draft, setDraft] = useState({
        focusMin: settings.focusMin,
        breakMin: settings.breakMin,
        longBreakMin: settings.longBreakMin,
        cyclesBeforeLong: settings.cyclesBeforeLong,
    });

    const num = (v) => {
        const n = parseFloat(v);
        return Number.isFinite(n) && n >= 0 ? n : 0;
    };

    return (
        <div className="mt-3 grid grid-cols-2 gap-3 border-t border-slate-100 pt-3">
            {[
                { key: 'focusMin', label: 'Focus (min)', step: '0.01' },
                { key: 'breakMin', label: 'Short break (min)', step: '0.01' },
                { key: 'longBreakMin', label: 'Long break (min)', step: '0.01' },
                { key: 'cyclesBeforeLong', label: 'Cycles before long', step: '1' },
            ].map(({ key, label, step }) => (
                <label key={key} className="block">
                    <span className="field-label">{label}</span>
                    <input
                        type="number"
                        min="0"
                        step={step}
                        value={draft[key]}
                        onChange={(e) => setDraft((d) => ({ ...d, [key]: e.target.value }))}
                        className="input mt-1 w-full"
                        data-testid={`pomo-setting-${key}`}
                    />
                </label>
            ))}
            <div className="col-span-2">
                <button
                    type="button"
                    onClick={() => onSave({
                        focusMin: num(draft.focusMin),
                        breakMin: num(draft.breakMin),
                        longBreakMin: num(draft.longBreakMin),
                        cyclesBeforeLong: Math.max(1, Math.round(num(draft.cyclesBeforeLong))),
                    })}
                    className="btn-primary rounded-xl px-4 py-2 text-sm font-semibold"
                    data-testid="pomo-settings-save"
                >
                    Save settings
                </button>
            </div>
        </div>
    );
}

export default function PomodoroWidget() {
    const {
        now, pomo, pomoSettings, savePomoSettings,
        startFocus, pausePomo, resumePomo, resetPomo, skipPhase,
    } = useTime();
    const { todoList } = useTodo();
    const [showSettings, setShowSettings] = useState(false);

    const openTasks = (todoList || []).filter((t) => !t.isCompleted);
    const idle = pomo.phase === 'idle';
    // The select edits a pending value before a session starts; once a
    // session is running the link is fixed so credited minutes can't drift.
    const [pendingTaskId, setPendingTaskId] = useState('');
    const linkedValue = idle ? pendingTaskId : pomo.linkedTaskId;

    // Idle shows the full focus length as the countdown target; paused shows
    // the frozen remainder; running shows endsAt - now.
    const remainingMs = pomo.endsAt
        ? Math.max(0, pomo.endsAt - now)
        : pomo.remainingMs != null
            ? pomo.remainingMs
            : Math.round(pomoSettings.focusMin * 60000);

    const running = pomo.phase !== 'idle' && Boolean(pomo.endsAt);
    const paused = pomo.phase !== 'idle' && !pomo.endsAt;
    const dots = Math.max(1, pomoSettings.cyclesBeforeLong);
    const filledDots = pomo.completedFocus % dots;

    return (
        <div className="card p-5" data-testid="pomodoro-widget">
            <div className="flex items-center justify-between gap-3">
                <p className="text-[0.7rem] font-bold uppercase tracking-[0.14em] text-slate-500">Pomodoro</p>
                <button
                    type="button"
                    onClick={() => setShowSettings((s) => !s)}
                    className="btn-ghost rounded-lg px-2 py-1 text-xs font-semibold"
                    data-testid="pomo-settings-toggle"
                >
                    {showSettings ? 'Hide settings' : 'Settings'}
                </button>
            </div>

            <p className={`mt-1 text-lg font-bold ${PHASE_ACCENT[pomo.phase] || PHASE_ACCENT.idle}`} data-testid="pomo-phase">
                {PHASE_LABEL[pomo.phase] || PHASE_LABEL.idle}
                {running && (
                    <span className="ml-2 inline-flex align-middle" aria-hidden="true">
                        <span className="relative flex h-2 w-2">
                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                        </span>
                    </span>
                )}
            </p>

            <p className="mt-1 font-mono text-5xl font-bold tabular-nums text-slate-900" data-testid="pomo-countdown">
                {mmss(remainingMs)}
            </p>

            <div className="mt-2 flex items-center gap-1.5" aria-label={`${filledDots} of ${dots} sessions completed`} data-testid="pomo-dots">
                {Array.from({ length: dots }, (_, i) => (
                    <span
                        key={i}
                        className={`h-2.5 w-2.5 rounded-full ${i < filledDots ? 'bg-emerald-500' : 'bg-slate-200'}`}
                    />
                ))}
            </div>

            <label className="mt-4 block">
                <span className="field-label">Linked task</span>
                <select
                    value={linkedValue}
                    onChange={(e) => setPendingTaskId(e.target.value)}
                    disabled={!idle}
                    className="select mt-1 w-full"
                    data-testid="pomo-linked-task"
                >
                    <option value="">No task (focus time only)</option>
                    {openTasks.map((t) => (
                        <option key={t.id} value={t.id}>{t.title}</option>
                    ))}
                </select>
            </label>

            <div className="mt-4 flex flex-wrap gap-2">
                {pomo.phase === 'idle' && (
                    <button
                        type="button"
                        onClick={() => startFocus(pendingTaskId)}
                        className="btn-primary rounded-xl px-4 py-2 text-sm font-semibold"
                        data-testid="pomo-start"
                    >
                        Start focus
                    </button>
                )}
                {running && (
                    <button
                        type="button"
                        onClick={pausePomo}
                        className="btn-ghost rounded-xl px-4 py-2 text-sm font-semibold"
                        data-testid="pomo-pause"
                    >
                        Pause
                    </button>
                )}
                {paused && (
                    <button
                        type="button"
                        onClick={resumePomo}
                        className="btn-primary rounded-xl px-4 py-2 text-sm font-semibold"
                        data-testid="pomo-resume"
                    >
                        Resume
                    </button>
                )}
                {pomo.phase !== 'idle' && (
                    <>
                        <button
                            type="button"
                            onClick={resetPomo}
                            className="btn-ghost rounded-xl px-4 py-2 text-sm font-semibold"
                            data-testid="pomo-reset"
                        >
                            Reset
                        </button>
                        <button
                            type="button"
                            onClick={skipPhase}
                            className="btn-ghost rounded-xl px-4 py-2 text-sm font-semibold"
                            data-testid="pomo-skip"
                        >
                            Skip
                        </button>
                    </>
                )}
            </div>

            {showSettings && <SettingsForm settings={pomoSettings} onSave={savePomoSettings} />}
        </div>
    );
}
