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

                const data = await response.json(); // Read the raw data object wrapper

                // access the inner array using data.tasks instead of using the raw object
                const taskList = data.tasks || [];

                // Calculate statistics using our safe array
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
        <div style={{ padding: '20px', maxWidth: '500px', margin: '0 auto' }}>
            <h2>Your Profile</h2>
            <p><strong>Account Name:</strong> {email || 'Authenticated User'}</p>

            <div style={{ background: '#f5f5f5', padding: '15px', borderRadius: '6px', marginTop: '20px' }}>
                <h3>Todo Productivity Statistics</h3>
                {loading && <p>Analyzing your task history...</p>}
                {error && <p style={{ color: 'red' }}>{error}</p>}

                {!loading && !error && (
                    <>
                        <p>Total Tasks Created: {stats.total}</p>
                        <p>Completed Tasks: {stats.completed}</p>
                        <p>Active Pending Tasks: {stats.active}</p>
                        <hr />
                        <h4>Task Completion Score: {percentage}%</h4>
                        <div style={{ width: '100%', background: '#ddd', height: '10px', borderRadius: '4px' }}>
                            <div style={{ width: `${percentage}%`, background: 'green', height: '10px', borderRadius: '4px' }} />
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

export default ProfilePage;