import React from 'react';
import { Link, NavLink } from 'react-router'; // or 'react-router' depending on your setup
import { useAuth } from '../contexts/AuthContext'; // adjust path to your AuthContext if needed

export default function Header() {
    const { isAuthenticated, user } = useAuth();

    return (
        <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

                    {/* App Brand / Welcome Text */}
                    <div className="text-center sm:text-left">
                        <Link to="/" className="text-xl font-bold tracking-tight text-slate-900 no-underline">
                            Todo List
                        </Link>
                        {isAuthenticated && user && (
                            <p className="text-xs text-slate-500 m-0">Welcome, {user.name || 'User'}!</p>
                        )}
                    </div>

                    {/* CENTERED & RESPONSIVE NAVIGATION MENU */}
                    <nav className="flex flex-wrap justify-center items-center gap-2 bg-slate-100 p-1 rounded-lg mx-auto sm:mx-0">
                        <NavLink
                            to="/"
                            className={({ isActive }) => `px-3 py-1.5 text-sm font-medium rounded-md no-underline transition-colors ${isActive ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
                        >
                            Home
                        </NavLink>
                        <NavLink
                            to="/about"
                            className={({ isActive }) => `px-3 py-1.5 text-sm font-medium rounded-md no-underline transition-colors ${isActive ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
                        >
                            About
                        </NavLink>

                        {isAuthenticated ? (
                            <>
                                <NavLink
                                    to="/todos"
                                    className={({ isActive }) => `px-3 py-1.5 text-sm font-medium rounded-md no-underline transition-colors ${isActive ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
                                >
                                    Todos
                                </NavLink>
                                <NavLink
                                    to="/profile"
                                    className={({ isActive }) => `px-3 py-1.5 text-sm font-medium rounded-md no-underline transition-colors ${isActive ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
                                >
                                    Profile
                                </NavLink>
                                <NavLink
                                    to="/logoff"
                                    className="px-3 py-1.5 text-sm font-medium rounded-md no-underline text-red-600 hover:bg-red-50 transition-colors"
                                >
                                    Log Out
                                </NavLink>
                            </>
                        ) : (
                            <NavLink
                                to="/login"
                                className={({ isActive }) => `px-3 py-1.5 text-sm font-medium rounded-md no-underline transition-colors ${isActive ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
                            >
                                Log In
                            </NavLink>
                        )}
                    </nav>

                </div>
            </div>
        </header>
    );
}