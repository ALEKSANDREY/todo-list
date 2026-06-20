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
        return <p style={{ textAlign: 'center' }}>Verifying credentials...</p>;
    }

    return children;
}

export default RequireAuth;