import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../contexts/AuthContext';

function Logoff() {
    const { logout } = useAuth();
    const navigate = useNavigate();
    const hasLoggedOut = useRef(false);

    useEffect(() => {
        if (!hasLoggedOut.current) {
            hasLoggedOut.current = true;
            logout();
            navigate('/login', { replace: true });
        }
    }, [logout, navigate]);

    return null;
}

export default Logoff;