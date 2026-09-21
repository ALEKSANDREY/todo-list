import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../contexts/AuthContext';

function HomePage() {
    const { isAuthenticated } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (isAuthenticated) {
            navigate('/todos', { replace: true });
        } else {
            navigate('/login', { replace: true });
        }
    }, [isAuthenticated, navigate]);

    return (
        <div className="flex flex-col items-center gap-4 py-20 text-center">
            <span className="spinner" />
            <p className="text-sm text-slate-500">Redirecting you to your workspace…</p>
        </div>
    );
}

export default HomePage;
