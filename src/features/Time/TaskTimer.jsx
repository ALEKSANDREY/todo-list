import { useTime, formatDuration } from '../../contexts/TimeContext';

// Compact per-task stopwatch row for the task expander. Shows the live total
// (tracked seconds + any currently-running segment), Start/Pause toggle,
// Stop, and ±5m manual adjustments.
export default function TaskTimer({ taskId }) {
    const { timer, totalSeconds, startTimer, stopTimer, adjustTime } = useTime();
    const running = Boolean(timer) && String(timer.taskId) === String(taskId);
    const total = totalSeconds(taskId);

    return (
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <span className="inline-flex items-center gap-1.5 font-semibold text-slate-700" data-testid="task-timer-total">
                {running ? (
                    <span className="relative flex h-2 w-2" aria-hidden="true">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                        <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                    </span>
                ) : (
                    <span aria-hidden="true">⏱</span>
                )}
                {formatDuration(total)}
            </span>
            <button
                type="button"
                onClick={() => (running ? stopTimer() : startTimer(taskId))}
                className="btn-ghost rounded-lg px-2 py-1 text-xs font-semibold"
                data-testid={running ? 'task-timer-pause' : 'task-timer-start'}
            >
                {running ? 'Pause' : 'Start'}
            </button>
            {running && (
                <button
                    type="button"
                    onClick={() => stopTimer()}
                    className="btn-ghost rounded-lg px-2 py-1 text-xs font-semibold"
                    data-testid="task-timer-stop"
                >
                    Stop
                </button>
            )}
            <button
                type="button"
                onClick={() => adjustTime(taskId, 300)}
                className="btn-ghost rounded-lg px-2 py-1 text-xs font-semibold"
                title="Add 5 minutes"
                data-testid="task-timer-plus5"
            >
                +5m
            </button>
            <button
                type="button"
                onClick={() => adjustTime(taskId, -300)}
                className="btn-ghost rounded-lg px-2 py-1 text-xs font-semibold"
                title="Subtract 5 minutes"
                data-testid="task-timer-minus5"
            >
                −5m
            </button>
        </div>
    );
}
