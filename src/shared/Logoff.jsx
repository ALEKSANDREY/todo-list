import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../contexts/AuthContext';

function Logoff() {
    const { logout } = useAuth();
    const navigate = useNavigate();
    const effectFired = useRef(false);

    useEffect(() => {
        if (!effectFired.current) {
            effectFired.current = true;
            logout();
            navigate('/login', { replace: true });
        }
    }, [logout, navigate]);

    return <p style={{ textAlign: 'center' }}>Logging you out securely...</p>;
}

export default Logoff;