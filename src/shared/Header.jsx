import { useAuth } from '../contexts/AuthContext.jsx';
import Logoff from './Logoff.jsx';
import Navigation from './Navigation.jsx';

function Header() {
    const { isAuthenticated, email } = useAuth();

    return (
        <header style={{ borderBottom: '1px solid #ccc', paddingBottom: '10px', marginBottom: '20px' }}>
            <h1>Todo List</h1>
            {isAuthenticated && <p>Welcome, {email}!</p>}

            {/* Inject the navigation links portal right here */}
            <Navigation />

        </header>
    );
}

export default Header;