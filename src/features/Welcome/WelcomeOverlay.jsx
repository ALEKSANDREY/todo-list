import { useState, useEffect } from 'react';
import { loadJSON, saveJSON } from '../../utils/localStore';

const SEEN_KEY = 'worldclass-welcome-v1';

const HIGHLIGHTS = [
    { icon: '✅', text: 'Keep all your tasks in one place' },
    { icon: '🗂️', text: 'Plan your week on the calendar, or drag cards on the board' },
    { icon: '⏱️', text: 'Track time with the built-in focus timer' },
    { icon: '👥', text: 'Keep contacts and follow-ups moving in your pipeline' },
    { icon: '🔔', text: 'Get reminders before things are due' },
    { icon: '✨', text: 'Chat with an AI assistant that knows your tasks' },
];

export default function WelcomeOverlay() {
    const [seen, setSeen] = useState(() => loadJSON(SEEN_KEY, false));
    const [step, setStep] = useState(0);

    const dismiss = () => {
        saveJSON(SEEN_KEY, true);
        setSeen(true);
    };

    useEffect(() => {
        if (seen) return;
        const onKey = (e) => {
            if (e.key === 'Escape') dismiss();
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [seen ]);

    if (seen) return null;

    return (
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center p-4"
            role="dialog"
            aria-modal="true"
            aria-label="Welcome"
        >
            <div className="absolute inset-0 bg-slate-900/45 backdrop-blur-sm" onClick={dismiss} />
            <div className="card animate-enter relative w-full max-w-md p-6 sm:p-8">
                <button
                    type="button"
                    onClick={dismiss}
                    aria-label="Close welcome"
                    className="absolute right-4 top-4 rounded-xl p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="h-5 w-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                    </svg>
                </button>

                {step === 0 ? (
                    <>
                        <p className="text-xs font-bold uppercase tracking-[0.18em] text-indigo-500">Welcome</p>
                        <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-slate-900">
                            Your task workspace
                        </h2>
                        <p className="mt-2 text-sm leading-relaxed text-slate-600">
                            Here's what this app does, in plain words:
                        </p>
                        <ul className="mt-4 space-y-2.5">
                            {HIGHLIGHTS.map((h) => (
                                <li key={h.text} className="flex items-start gap-2.5 text-sm font-medium text-slate-700">
                                    <span className="text-base leading-none">{h.icon}</span>
                                    <span>{h.text}</span>
                                </li>
                            ))}
                        </ul>
                    </>
                ) : (
                    <>
                        <p className="text-xs font-bold uppercase tracking-[0.18em] text-indigo-500">Good to know</p>
                        <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-slate-900">
                            No account needed
                        </h2>
                        <p className="mt-3 text-sm leading-relaxed text-slate-600">
                            Everything you create is saved <strong>in this browser</strong> — no
                            sign-up, no password, nothing leaves your device. Your tasks are
                            waiting on the Tasks tab.
                        </p>
                        <p className="mt-3 text-sm leading-relaxed text-slate-600">
                            Want the AI assistant or Google Calendar sync? You'll find them under
                            Settings whenever you're ready.
                        </p>
                    </>
                )}

                <div className="mt-6 flex items-center justify-between">
                    <div className="flex gap-1.5" aria-hidden="true">
                        {[0, 1].map((i) => (
                            <span
                                key={i}
                                className={`h-1.5 rounded-full transition-all ${i === step ? 'w-6 bg-indigo-500' : 'w-1.5 bg-slate-200'}`}
                            />
                        ))}
                    </div>
                    <div className="flex gap-2">
                        {step === 0 ? (
                            <>
                                <button type="button" onClick={dismiss} className="btn-ghost px-4 py-2 text-xs">
                                    Skip
                                </button>
                                <button type="button" onClick={() => setStep(1)} className="btn-primary px-4 py-2 text-xs">
                                    Next
                                </button>
                            </>
                        ) : (
                            <>
                                <button type="button" onClick={() => setStep(0)} className="btn-ghost px-4 py-2 text-xs">
                                    Back
                                </button>
                                <button type="button" onClick={dismiss} className="btn-primary px-4 py-2 text-xs">
                                    Get started
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
