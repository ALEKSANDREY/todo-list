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

    return (
        <div className="flex flex-col items-center gap-4 py-20 text-center">
            <span className="spinner" />
            <p className="text-sm text-slate-500">Logging you out securely…</p>
        </div>
    );
}

export default Logoff;
