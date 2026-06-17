import { NavLink } from 'react-router';
import { useAuth } from '../contexts/AuthContext';

function Navigation() {
    const { isAuthenticated } = useAuth();

    const navLinkStyle = ({ isActive }) => ({
        fontWeight: isActive ? 'bold' : 'normal',
        textDecoration: isActive ? 'underline' : 'none',
        color: isActive ? '#000' : '#555'
    });

    return (
        <nav style={{ margin: '10px 0' }}>
            <ul style={{ listStyle: 'none', display: 'flex', gap: '1.5rem', padding: 0, justifyContent: 'center' }}>
                <li><NavLink to="/about" style={navLinkStyle}>About</NavLink></li>
                {isAuthenticated && (
                    <>
                        <li><NavLink to="/todos" style={navLinkStyle}>Todos</NavLink></li>
                        <li><NavLink to="/profile" style={navLinkStyle}>Profile</NavLink></li>
                        <li><NavLink to="/logoff" style={navLinkStyle}>Log Out</NavLink></li>
                    </>
                )}
                {!isAuthenticated && (
                    <li><NavLink to="/login" style={navLinkStyle}>Login</NavLink></li>
                )}
            </ul>
        </nav>
    );
}

export default Navigation;