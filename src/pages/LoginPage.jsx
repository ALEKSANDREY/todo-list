import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { useAuth } from '../contexts/AuthContext';

function LoginPage() {
    const { login, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loginError, setLoginError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Extract the target page they were bounced from, defaulting to /todos
    const from = location.state?.from?.pathname || '/todos';

    useEffect(() => {
        if (isAuthenticated) {
            navigate(from, { replace: true });
        }
    }, [isAuthenticated, navigate, from]);

    async function handleSubmit(e) {
        e.preventDefault();
        setLoginError('');
        setIsSubmitting(true);
        const result = await login(email, password);
        setIsSubmitting(false);
        if (!result.success) {
            setLoginError(result.error);
        }
    }

    return (
        <div className="animate-enter flex justify-center px-2 py-6">
            <div className="card grid w-full max-w-4xl overflow-hidden md:grid-cols-2">
                {/* Brand panel */}
                <div className="aurora-panel relative hidden flex-col justify-between p-10 text-white md:flex">
                    <div className="absolute inset-0 bg-black/10" />
                    <div className="relative">
                        <div className="flex items-center gap-3">
                            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="h-5 w-5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                                </svg>
                            </span>
                            <span className="text-lg font-extrabold tracking-tight">Todo List</span>
                        </div>
                    </div>
                    <div className="relative">
                        <h2 className="text-3xl font-extrabold leading-tight tracking-tight">
                            Your day,<br />beautifully organized.
                        </h2>
                        <p className="mt-4 max-w-xs text-sm leading-relaxed text-white/85">
                            Capture tasks, filter and sort your agenda, and track your momentum — all in one calm workspace.
                        </p>
                        <div className="mt-8 flex gap-6 text-xs font-semibold uppercase tracking-widest text-white/70">
                            <span>Fast</span>
                            <span>Focused</span>
                            <span>Yours</span>
                        </div>
                    </div>
                    <p className="relative text-xs text-white/60">Built with React · Vite · Tailwind</p>
                </div>

                {/* Form panel */}
                <div className="flex flex-col justify-center p-8 sm:p-10">
                    <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">
                        Welcome back
                    </h2>
                    <p className="mt-1.5 text-sm text-slate-500">
                        Log in to open your task workspace.
                    </p>

                    {loginError && (
                        <div className="error-banner mt-5" role="alert">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-5 w-5 shrink-0">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
                            </svg>
                            <span>{loginError}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="mt-6 space-y-5">
                        <div>
                            <label htmlFor="loginEmail" className="field-label">Email</label>
                            <input
                                id="loginEmail"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                autoComplete="email"
                                placeholder="you@example.com"
                                className="input"
                            />
                        </div>
                        <div>
                            <label htmlFor="loginPassword" className="field-label">Password</label>
                            <input
                                id="loginPassword"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                autoComplete="current-password"
                                placeholder="••••••••"
                                className="input"
                            />
                        </div>
                        <button type="submit" disabled={isSubmitting} className="btn-primary w-full">
                            {isSubmitting ? (
                                <>
                                    <svg className="h-4 w-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                                    </svg>
                                    Logging in…
                                </>
                            ) : (
                                'Log in'
                            )}
                        </button>
                    </form>

                    <p className="mt-6 text-center text-xs leading-relaxed text-slate-400">
                        Protected workspace — your session stays on this device.
                    </p>
                </div>
            </div>
        </div>
    );
}

export default LoginPage;
