import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

const inputClass =
    'w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 ' +
    'placeholder:text-slate-400 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100';

export default function LoginPage() {
    const { login, register, demo, authError, setAuthError } = useAuth();
    const [mode, setMode] = useState('login'); // 'login' | 'register'
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [busy, setBusy] = useState(false);

    const switchMode = (next) => {
        setMode(next);
        setAuthError('');
    };

    const submit = async (e) => {
        e.preventDefault();
        setBusy(true);
        try {
            if (mode === 'login') {
                await login(email.trim(), password);
            } else {
                await register(email.trim(), password, name.trim());
            }
        } catch {
            // authError is already set in the context; stay on the form.
        } finally {
            setBusy(false);
        }
    };

    const continueDemo = async () => {
        setBusy(true);
        try {
            await demo();
        } catch {
            // authError / backendDown handled by the context + gate.
        } finally {
            setBusy(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-sky-50 px-4 py-10">
            <div className="w-full max-w-md">
                <div className="mb-6 text-center">
                    <div className="logo-mark mx-auto mb-4 h-14 w-14 rounded-2xl text-xl font-extrabold">✓</div>
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-500">Task workspace</p>
                    <h1 className="mt-1 text-3xl font-extrabold text-slate-900">
                        {mode === 'login' ? 'Welcome back' : 'Create your account'}
                    </h1>
                    <p className="mt-2 text-sm text-slate-500">
                        Your tasks, contacts, and focus time — saved to your own account.
                    </p>
                </div>

                <div className="card p-6 sm:p-8">
                    <div className="mb-5 grid grid-cols-2 gap-1 rounded-xl bg-slate-100 p-1">
                        {(['login', 'register']).map((m) => (
                            <button
                                key={m}
                                type="button"
                                onClick={() => switchMode(m)}
                                className={`rounded-lg px-3 py-2 text-sm font-bold transition ${
                                    mode === m ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                                }`}
                            >
                                {m === 'login' ? 'Log in' : 'Sign up'}
                            </button>
                        ))}
                    </div>

                    <form onSubmit={submit} className="space-y-3">
                        {mode === 'register' && (
                            <input
                                className={inputClass}
                                placeholder="Your name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                autoComplete="name"
                            />
                        )}
                        <input
                            className={inputClass}
                            type="email"
                            required
                            placeholder="Email address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            autoComplete="email"
                        />
                        <input
                            className={inputClass}
                            type="password"
                            required
                            minLength={8}
                            placeholder={mode === 'register' ? 'Password (min 8 characters)' : 'Password'}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                        />
                        {authError && (
                            <p role="alert" className="rounded-xl bg-red-50 px-4 py-2.5 text-sm font-medium text-red-700">
                                {authError}
                            </p>
                        )}
                        <button
                            type="submit"
                            disabled={busy}
                            className="btn-primary w-full py-2.5 text-sm disabled:opacity-60"
                        >
                            {busy ? 'Please wait…' : mode === 'login' ? 'Log in' : 'Create account'}
                        </button>
                    </form>

                    <div className="my-5 flex items-center gap-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
                        <span className="h-px flex-1 bg-slate-200" />
                        or
                        <span className="h-px flex-1 bg-slate-200" />
                    </div>

                    <button
                        type="button"
                        onClick={continueDemo}
                        disabled={busy}
                        className="w-full rounded-xl border-2 border-dashed border-indigo-200 bg-indigo-50/50 px-4 py-2.5 text-sm font-bold text-indigo-700 transition hover:border-indigo-300 hover:bg-indigo-50 disabled:opacity-60"
                    >
                        ✨ Continue as demo — one click, no sign-up
                    </button>
                    <p className="mt-3 text-center text-xs text-slate-400">
                        Demo opens a seeded workspace you can explore instantly.
                    </p>
                </div>

                <p className="mt-6 text-center text-[0.7rem] font-medium text-slate-400">
                    Built with React · Vite · Tailwind CSS · Node
                </p>
            </div>
        </div>
    );
}
