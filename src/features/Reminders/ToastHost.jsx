import { Link } from 'react-router';
import { useReminders } from '../../contexts/RemindersContext';

const TONE_STYLES = {
    info: 'border-indigo-200 bg-white',
    warn: 'border-amber-200 bg-amber-50/95',
};

const TONE_ICON = {
    info: 'text-indigo-500',
    warn: 'text-amber-500',
};

function ToastIcon({ tone }) {
    if (tone === 'warn') {
        return (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={`h-5 w-5 shrink-0 ${TONE_ICON[tone]}`}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
            </svg>
        );
    }
    return (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={`h-5 w-5 shrink-0 ${TONE_ICON[tone]}`}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
        </svg>
    );
}

export default function ToastHost() {
    const { toasts, dismissToast } = useReminders();

    if (toasts.length === 0) return null;

    return (
        <div className="fixed bottom-5 left-5 z-[70] flex w-[calc(100vw-2.5rem)] max-w-sm flex-col gap-2" role="status" aria-live="polite">
            {toasts.map((toast) => (
                <div
                    key={toast.id}
                    className={`animate-enter flex items-start gap-3 rounded-2xl border p-4 shadow-[0_16px_40px_-12px_rgba(15,23,42,0.3)] backdrop-blur-md ${TONE_STYLES[toast.tone] || TONE_STYLES.info}`}
                >
                    <ToastIcon tone={toast.tone} />
                    <div className="min-w-0 flex-1">
                        <p className="text-[0.7rem] font-bold uppercase tracking-[0.14em] text-slate-500">{toast.title}</p>
                        <p className="mt-0.5 truncate text-sm font-semibold text-slate-800">{toast.body}</p>
                        {toast.taskId != null && (
                            <Link to="/todos" onClick={() => dismissToast(toast.id)} className="mt-1 inline-block text-xs font-bold text-indigo-600 hover:text-indigo-800">
                                View task →
                            </Link>
                        )}
                    </div>
                    <button
                        type="button"
                        onClick={() => dismissToast(toast.id)}
                        aria-label="Dismiss"
                        className="rounded-lg p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="h-4 w-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            ))}
        </div>
    );
}
