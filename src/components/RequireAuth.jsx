import { Navigate, useLocation } from 'react-router';
import { useAuth } from '../contexts/AuthContext';

function RequireAuth({ children }) {
    const { isAuthenticated } = useAuth();
    const location = useLocation();

    if (!isAuthenticated) {
        return (
            <p style={{ textAlign: 'center' }}>
                Verifying credentials...
                <Navigate to="/login" state={{ from: location }} replace />
            </p>
        );
    }

    return children;
}

export default RequireAuth;