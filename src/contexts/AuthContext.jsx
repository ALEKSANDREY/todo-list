import { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}

export function AuthProvider({ children }) {
    const [email, setEmail] = useState('');
    const [token, setToken] = useState('');

    const login = async (userEmail, password) => {
        try {
            const res = await fetch('/api/users/logon', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ email: userEmail, password }),
            });
            const data = await res.json();
            if (res.status === 200 && data.name && data.csrfToken) {
                setEmail(data.name);
                setToken(data.csrfToken);
                return { success: true };
            } else {
                return { success: false, error: `Authentication failed: ${data?.message}` };
            }
        } catch (error) {
            return { success: false, error: 'Network error during login' };
        }
    };

    const logout = async () => {
        try {
            if (token) {
                await fetch('/api/users/logoff', {
                    method: 'POST',
                    headers: { 'X-CSRF-TOKEN': token },
                    credentials: 'include',
                });
            }
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            setEmail('');
            setToken('');
        }
    };

    const value = {
        email,
        token,
        isAuthenticated: !!token,
        login,
        logout,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}