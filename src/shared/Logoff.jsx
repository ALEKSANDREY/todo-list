import { useAuth } from '../contexts/AuthContext.jsx';

function Logoff() {
    const { isAuthenticated, logout } = useAuth();

    if (!isAuthenticated) return null;

    return (
        <button onClick={logout}>Log Off</button>
    );
}
export default Logoff;