import { Link, NavLink } from 'react-router';
import { useAuth } from '../contexts/AuthContext';
import { useReminders } from '../contexts/RemindersContext';

function CheckIcon({ className = 'w-5 h-5' }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className={className}>
            <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
        </svg>
    );
}

export default function Header() {
    const { isAuthenticated, user } = useAuth();
    const { attentionCount } = useReminders();

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
                    <nav className="flex flex-wrap items-center justify-end gap-1 rounded-2xl border border-slate-200/70 bg-slate-100/70 p-1.5 shadow-inner">
                        <NavLink to="/" end className={pillClass}>Home</NavLink>
                        <NavLink to="/about" className={pillClass}>About</NavLink>
                        {isAuthenticated ? (
                            <>
                                <NavLink to="/todos" className={pillClass}>Todos</NavLink>
                                <NavLink to="/dashboard" className={pillClass}>Dashboard</NavLink>
                                <NavLink to="/contacts" className={pillClass}>Contacts</NavLink>
                                <NavLink to="/pipeline" className={pillClass}>Pipeline</NavLink>
                                <NavLink to="/settings" className={pillClass}>Settings</NavLink>
                                <NavLink to="/profile" className={pillClass}>Profile</NavLink>
                                {attentionCount > 0 && (
                                    <NavLink
                                        to="/dashboard"
                                        title={`${attentionCount} task${attentionCount === 1 ? '' : 's'} need attention`}
                                        aria-label={`${attentionCount} tasks need attention`}
                                        className="relative rounded-xl p-2 text-amber-600 transition-colors hover:bg-amber-50 hover:text-amber-700"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-5 w-5">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
                                        </svg>
                                        <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[0.65rem] font-extrabold text-white">
                                            {attentionCount}
                                        </span>
                                    </NavLink>
                                )}
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
