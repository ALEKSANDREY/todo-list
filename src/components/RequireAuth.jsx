import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { useAuth } from '../contexts/AuthContext';

function RequireAuth({ children }) {
    const { isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        if (!isAuthenticated) {
            // Programmatically navigate to login and pass the historic location state
            navigate('/login', { state: { from: location }, replace: true });
        }
    }, [isAuthenticated, navigate, location]);

    if (!isAuthenticated) {
        return (
            <div className="flex flex-col items-center gap-4 py-20 text-center">
                <span className="spinner" />
                <p className="text-sm text-slate-500">Verifying credentials…</p>
            </div>
        );
    }

    return children;
}

export default RequireAuth;
