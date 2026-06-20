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
        <div style={{ padding: '20px', textAlign: 'center' }}>
            <p>Redirecting you to your workspace...</p>
        </div>
    );
}

export default HomePage;