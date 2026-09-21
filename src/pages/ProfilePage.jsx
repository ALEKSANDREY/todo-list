import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

function ProfilePage() {
    const { email, token } = useAuth();
    const [stats, setStats] = useState({ total: 0, completed: 0, active: 0 });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        async function fetchTodoStats() {
            if (!token) return;
            try {
                setLoading(true);
                setError('');
                const options = {
                    method: 'GET',
                    headers: { 'X-CSRF-TOKEN': token },
                    credentials: 'include',
                };
                const response = await fetch('/api/tasks', options);
                if (response.status === 401) {
                    throw new Error('Unauthorized');
                }
                if (!response.ok) {
                    throw new Error('Failed to fetch todos');
                }

                const data = await response.json();
                const taskList = data.tasks || [];

                const total = taskList.length;
                const completed = taskList.filter((todo) => todo.isCompleted).length;
                const active = total - completed;

                setStats({ total, completed, active });
            } catch (err) {
                setError(`Error loading statistics: ${err.message}`);
            } finally {
                setLoading(false);
            }
        }
        fetchTodoStats();
    }, [token]);

    const percentage = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;

    const statCards = [
        { label: 'Total tasks', value: stats.total, accent: 'text-slate-900', bg: 'bg-slate-100' },
        { label: 'Completed', value: stats.completed, accent: 'text-emerald-600', bg: 'bg-emerald-50' },
        { label: 'Active', value: stats.active, accent: 'text-amber-600', bg: 'bg-amber-50' },
    ];

    return (
        <div className="animate-enter mx-auto max-w-xl">
            <div className="card p-8">
                <div className="flex items-center gap-4">
                    <span className="logo-mark h-14 w-14 rounded-2xl text-lg font-extrabold">
                        {(email || 'U').charAt(0).toUpperCase()}
                    </span>
                    <div>
                        <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">
                            Your Profile
                        </h2>
                        <p className="mt-0.5 truncate text-sm text-slate-500">
                            {email || 'Authenticated user'}
                        </p>
                    </div>
                </div>

                <div className="mt-8">
                    <h3 className="field-label">Productivity statistics</h3>

                    {loading && (
                        <div className="flex items-center gap-3 py-6 text-sm text-slate-500">
                            <span className="spinner h-6 w-6 border-2" />
                            Analyzing your task history…
                        </div>
                    )}
                    {error && (
                        <div className="error-banner" role="alert">
                            <span>{error}</span>
                        </div>
                    )}

                    {!loading && !error && (
                        <>
                            <div className="grid grid-cols-3 gap-3">
                                {statCards.map((s) => (
                                    <div key={s.label} className={`rounded-2xl ${s.bg} p-4 text-center`}>
                                        <p className={`text-3xl font-extrabold tracking-tight ${s.accent}`}>{s.value}</p>
                                        <p className="mt-1 text-[0.7rem] font-semibold uppercase tracking-widest text-slate-500">{s.label}</p>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-6 rounded-2xl border border-slate-100 bg-slate-50/60 p-5">
                                <div className="flex items-center justify-between">
                                    <h4 className="text-sm font-semibold text-slate-700">Completion score</h4>
                                    <span className="gradient-text text-xl font-extrabold">{percentage}%</span>
                                </div>
                                <div className="progress-track mt-3">
                                    <div className="progress-fill" style={{ width: `${percentage}%` }} />
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

export default ProfilePage;
