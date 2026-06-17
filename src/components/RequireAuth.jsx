import { Navigate, useLocation } from 'react-router';
import { useAuth } from '../contexts/AuthContext';

function RequireAuth({ children }) {
    const { isAuthenticated } = useAuth(); // Simplified to drop the loading check
    const location = useLocation();

    if (!isAuthenticated) {
        // Redirect to login page but keep the historic location state intact
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return children;
}

export default RequireAuth;