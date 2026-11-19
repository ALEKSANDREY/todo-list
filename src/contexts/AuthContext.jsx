/* eslint-disable react-refresh/only-export-components -- context file exporting provider + hook */
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api, ApiError } from '../utils/api';

const AuthContext = createContext();

// Real session auth against the Node backend. The server sets an httpOnly
// cookie on login/register/demo; `me` revalidates the session on boot.
// If the backend is unreachable on first load, backendDown is true and the
// app shows a full-screen "start the server" state instead of fake data.
export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [authChecked, setAuthChecked] = useState(false);
    const [backendDown, setBackendDown] = useState(false);
    const [authError, setAuthError] = useState('');

    const checkSession = useCallback(async () => {
        try {
            const data = await api('/api/auth/me');
            setUser(data.user);
            setBackendDown(false);
        } catch (err) {
            if (err instanceof ApiError && err.status === 0) {
                setBackendDown(true);
            } else {
                setUser(null);
            }
        } finally {
            setAuthChecked(true);
        }
    }, []);

    useEffect(() => {
        checkSession();
    }, [checkSession]);

    const runAuth = useCallback(async (fn) => {
        setAuthError('');
        try {
            const data = await fn();
            setUser(data.user);
            setBackendDown(false);
            return data.user;
        } catch (err) {
            if (err instanceof ApiError && err.status === 0) {
                setBackendDown(true);
                throw err;
            }
            setAuthError(err.message || 'Something went wrong. Please try again.');
            throw err;
        }
    }, []);

    const login = useCallback(
        (email, password) => runAuth(() => api('/api/auth/login', { method: 'POST', body: { email, password } })),
        [runAuth]
    );

    const register = useCallback(
        (email, password, name) =>
            runAuth(() => api('/api/auth/register', { method: 'POST', body: { email, password, name } })),
        [runAuth]
    );

    const demo = useCallback(
        () => runAuth(() => api('/api/auth/demo', { method: 'POST' })),
        [runAuth]
    );

    const logout = useCallback(async () => {
        try {
            await api('/api/auth/logout', { method: 'POST' });
        } catch {
            // Cookie may already be gone — the local session ends regardless.
        } finally {
            setUser(null);
        }
    }, []);

    const value = {
        user,
        isAuthenticated: !!user,
        authChecked,
        backendDown,
        authError,
        setAuthError,
        login,
        register,
        demo,
        logout,
        recheck: checkSession,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
