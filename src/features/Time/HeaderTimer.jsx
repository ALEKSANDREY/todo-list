import { Link } from 'react-router';
import { useTodo } from '../../contexts/TodoContext';
import { useTime } from '../../contexts/TimeContext';

const PHASE_LABEL = {
    focus: 'Focusing',
    break: 'Short break',
    longbreak: 'Long break',
};

function mmss(ms) {
    const total = Math.max(0, Math.ceil(ms / 1000));
    const m = Math.floor(total / 60);
    const s = total % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function truncate(title, max = 30) {
    if (!title) return '';
    return title.length > max ? `${title.slice(0, max - 1).trimEnd()}…` : title;
}

// Compact header pill shown while a stopwatch or pomodoro session is active.
// Links to /todos so the user can jump back to the task being timed.
export default function HeaderTimer({ to = '/todos' }) {
    const { timer, now, pomo } = useTime();
    const { todoList } = useTodo();

    const pomoActive = pomo.phase !== 'idle';

    if (!timer && !pomoActive) return null;

    let label = '';
    let remainingMs = 0;

    if (timer) {
        remainingMs = Math.max(0, now - timer.startedAt);
        const task = (todoList || []).find((t) => String(t.id) === String(timer.taskId));
        label = truncate(task ? task.title : `Task ${timer.taskId}`);
    } else {
        remainingMs = pomo.endsAt
            ? Math.max(0, pomo.endsAt - now)
            : Math.max(0, pomo.remainingMs || 0);
        label = PHASE_LABEL[pomo.phase] || 'Pomodoro';
    }

    return (
        <Link
            to={to}
            className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-500/30 transition-colors hover:bg-emerald-500/20"
            data-testid="header-timer"
        >
            <span className="relative flex h-2 w-2" aria-hidden="true">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            <span aria-hidden="true">⏱</span>
            <span className="font-mono tabular-nums" data-testid="header-timer-time">{mmss(remainingMs)}</span>
            <span className="max-w-32 truncate" data-testid="header-timer-label">· {label}</span>
        </Link>
    );
}
