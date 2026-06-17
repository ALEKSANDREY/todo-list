import { useEffect } from 'react';
import { useNavigate } from 'react-router'; // 1. Add this import
import { useAuth } from '../contexts/AuthContext';

function Logoff() {
    const { logout } = useAuth();
    const navigate = useNavigate(); // 2. Initialize the navigation engine

    useEffect(() => {
        logout();
        navigate('/login'); // 3. Redirect the user instantly after logging out
    }, [logout, navigate]);

    return <p style={{ textAlign: 'center' }}>Logging you out securely...</p>;
}

export default Logoff;