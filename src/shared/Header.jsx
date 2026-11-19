import { Link, NavLink } from 'react-router';
import { useReminders } from '../contexts/RemindersContext';
import HeaderTimer from '../features/Time/HeaderTimer';

function CheckIcon({ className = 'w-5 h-5' }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className={className}>
            <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
        </svg>
    );
}

export default function Header({ user, onLogout }) {
    const { attentionCount } = useReminders();

    const pillClass = ({ isActive }) => `nav-pill whitespace-nowrap shrink-0 ${isActive ? 'nav-pill-active' : ''}`;
    const displayName = user?.name || user?.email || 'Account';
    const initial = (displayName || 'A').charAt(0).toUpperCase();

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

                    {/* Running timer / pomodoro indicator */}
                    <HeaderTimer />

                    {/* Navigation */}
                    <nav className="flex max-w-full items-center gap-1 overflow-x-auto rounded-2xl border border-slate-200/70 bg-slate-100/70 p-1.5 shadow-inner [scrollbar-width:none] [&::-webkit-scrollbar]:hidden" aria-label="Main">
                        <NavLink to="/" end className={pillClass}>Tasks</NavLink>
                        <NavLink to="/board" className={pillClass}>Board</NavLink>
                        <NavLink to="/calendar" className={pillClass}>Calendar</NavLink>
                        <NavLink to="/dashboard" className={pillClass}>Dashboard</NavLink>
                        <NavLink to="/contacts" className={pillClass}>Contacts</NavLink>
                        <NavLink to="/pipeline" className={pillClass}>Pipeline</NavLink>
                        <NavLink to="/settings" className={pillClass}>Settings</NavLink>
                        <NavLink to="/about" className={pillClass}>About</NavLink>
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
                    </nav>

                    {/* Account */}
                    <div className="flex shrink-0 items-center gap-2" title={user?.email || ''}>
                        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-600 text-sm font-extrabold text-white">
                            {initial}
                        </span>
                        <div className="hidden leading-tight md:block">
                            <p className="max-w-28 truncate text-xs font-bold text-slate-900">{displayName}</p>
                            <button
                                type="button"
                                onClick={onLogout}
                                className="text-[0.7rem] font-semibold text-slate-400 transition-colors hover:text-red-600"
                            >
                                Log out
                            </button>
                        </div>
                        <button
                            type="button"
                            onClick={onLogout}
                            title="Log out"
                            className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600 md:hidden"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-5 w-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6A2.25 2.25 0 0 0 5.25 5.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        </header>
    );
}
