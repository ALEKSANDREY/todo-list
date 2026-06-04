import { useAuth } from '../contexts/AuthContext.jsx';
import Logoff from './Logoff.jsx'; // or wherever your Logoff button lives

function Header() {
    const { isAuthenticated, email } = useAuth();
    return (
        <header>
            <h1>Todo List</h1>
            {isAuthenticated && <p>Welcome, {email}!</p>}
            <Logoff />
        </header>
    );
}
export default Header;