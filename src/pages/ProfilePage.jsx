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

    return (
        <main className="min-h-[calc(100vh-73px)] bg-slate-900 py-10 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md mx-auto bg-slate-800 border border-slate-700/60 rounded-2xl shadow-xl p-6">
                <h2 className="text-2xl font-extrabold text-slate-100 tracking-tight border-b border-slate-700 pb-3 mb-4">
                    Your Profile
                </h2>
                <p className="text-sm text-slate-300">
                    <strong className="text-indigo-400 font-semibold mr-1">Account Name:</strong>
                    {email || 'Authenticated User'}
                </p>

                {/* THE FIXED CARD CONTAINER CONTAINER PANEL */}
                <div className="bg-slate-900/50 border border-slate-700/40 p-5 rounded-xl mt-6 space-y-3">
                    <h3 className="text-md font-bold text-slate-200 tracking-wide uppercase text-xs text-indigo-400">
                        Todo Productivity Statistics
                    </h3>

                    {loading && <p className="text-sm text-slate-400 animate-pulse">Analyzing your task history...</p>}
                    {error && <p className="text-sm text-red-400 font-medium">⚠️ {error}</p>}

                    {!loading && !error && (
                        <>
                            <div className="space-y-2 text-sm text-slate-300 pt-1">
                                <p className="flex justify-between"><span>Total Tasks Created:</span> <span className="font-bold text-slate-100">{stats.total}</span></p>
                                <p className="flex justify-between"><span>Completed Tasks:</span> <span className="font-bold text-emerald-400">{stats.completed}</span></p>
                                <p className="flex justify-between"><span>Active Pending Tasks:</span> <span className="font-bold text-amber-400">{stats.active}</span></p>
                            </div>

                            <hr className="border-slate-700/60 my-3" />

                            <div className="space-y-2">
                                <h4 className="text-sm font-semibold text-slate-200 flex justify-between">
                                    <span>Task Completion Score:</span>
                                    <span className="text-indigo-400 font-bold">{percentage}%</span>
                                </h4>
                                {/* Clean Interactive Progress Tracker Gauge */}
                                <div className="w-full bg-slate-700 h-2.5 rounded-full overflow-hidden">
                                    <div
                                        className="bg-indigo-500 h-full rounded-full transition-all duration-500 ease-out shadow-[0_0_12px_rgba(99,102,241,0.4)]"
                                        style={{ width: `${percentage}%` }}
                                    />
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </main>
    );
}

export default ProfilePage;