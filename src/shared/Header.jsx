import { Link, NavLink } from 'react-router';
import { useAuth } from '../contexts/AuthContext';

function CheckIcon({ className = 'w-5 h-5' }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className={className}>
            <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
        </svg>
    );
}

export default function Header() {
    const { isAuthenticated, user } = useAuth();

    const pillClass = ({ isActive }) => `nav-pill ${isActive ? 'nav-pill-active' : ''}`;

    return (
        <header className="sticky top-0 z-50 border-b border-white/40 bg-white/70 backdrop-blur-xl">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between gap-3 py-3">
                    {/* Brand */}
                    <Link to="/" className="flex items-center gap-3 no-underline shrink-0">
                        <span className="logo-mark">
                            <CheckIcon />
                        </span>
                        <span className="leading-tight">
                            <span className="block text-[1.05rem] font-extrabold tracking-tight text-slate-900">
                                Todo List
                            </span>
                            <span className="block text-[0.7rem] font-medium tracking-wide text-slate-500 uppercase">
                                Task Workspace
                            </span>
                        </span>
                    </Link>

                    {/* Navigation */}
                    <nav className="flex items-center gap-1 rounded-2xl border border-slate-200/70 bg-slate-100/70 p-1.5 shadow-inner">
                        <NavLink to="/" end className={pillClass}>Home</NavLink>
                        <NavLink to="/about" className={pillClass}>About</NavLink>
                        {isAuthenticated ? (
                            <>
                                <NavLink to="/todos" className={pillClass}>Todos</NavLink>
                                <NavLink to="/profile" className={pillClass}>Profile</NavLink>
                                <NavLink
                                    to="/logoff"
                                    className="nav-pill text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                                >
                                    Log Out
                                </NavLink>
                            </>
                        ) : (
                            <NavLink to="/login" className={pillClass}>Log In</NavLink>
                        )}
                    </nav>
                </div>

                {isAuthenticated && user?.name && (
                    <p className="pb-3 -mt-1 text-xs font-medium text-slate-500">
                        Welcome back, <span className="font-semibold text-slate-700">{user.name}</span>
                    </p>
                )}
            </div>
        </header>
    );
}
