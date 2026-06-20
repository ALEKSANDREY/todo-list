import { NavLink } from 'react-router';
import { useAuth } from '../contexts/AuthContext';

function Navigation() {
    const { isAuthenticated } = useAuth();

    const linkClass = ({ isActive }) =>
        `text-sm font-semibold transition-all px-3 py-2 rounded-lg ${
            isActive
                ? 'bg-slate-100 text-slate-950 shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
        }`;

    return (
        <nav className="flex justify-center items-center py-4 bg-white border-b border-slate-100 px-4">
            <ul className="flex items-center gap-2 max-w-2xl w-full justify-center">
                <li><NavLink to="/about" className={linkClass}>About</NavLink></li>
                {isAuthenticated && (
                    <>
                        <li><NavLink to="/todos" className={linkClass}>Todos</NavLink></li>
                        <li><NavLink to="/profile" className={linkClass}>Profile</NavLink></li>
                        <li><NavLink to="/logoff" className="text-sm font-semibold text-red-600 hover:bg-red-50 px-3 py-2 rounded-lg transition-all">Log Out</NavLink></li>
                    </>
                )}
                {!isAuthenticated && (
                    <li><NavLink to="/login" className={linkClass}>Login</NavLink></li>
                )}
            </ul>
        </nav>
    );
}

export default Navigation;