import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { useAuth } from '../contexts/AuthContext';

function RequireAuth({ children }) {
    const { isAuthenticated, isAuthLoading } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        // If auth state resolves and they are invalid, bounce them to login
        if (!isAuthLoading && !isAuthenticated) {
            navigate('/login', { replace: true, state: { from: location } });
        }
    }, [isAuthenticated, isAuthLoading, navigate, location]);

    if (isAuthLoading) {
        return <p style={{ textCentering: 'center', padding: '20px' }}>Verifying credentials...</p>;
    }

    return isAuthenticated ? children : null;
}

export default RequireAuth;