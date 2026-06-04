import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext.jsx'; // 1. Import the custom auth hook

// 2. Remove the old props destructured parameters (onSetEmail, onSetToken, etc.)
function Logon() {
    const { login } = useAuth(); // 3. Pull the centralized login function from context
    const [emailInput, setEmailInput] = useState('');
    const [passwordInput, setPasswordInput] = useState('');
    const [loginError, setLoginError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoginError('');

        // 4. Call the context login method instead of managing local state setters
        const result = await login(emailInput, passwordInput);

        if (!result.success) {
            setLoginError(result.error);
        }
    };

    return (
        <div className="login-container">
            <h2>Log On</h2>
            {loginError && <p style={{ color: 'red' }}>{loginError}</p>}
            <form onSubmit={handleSubmit}>
                <div>
                    <label>Email</label>
                    <input
                        type="email"
                        value={emailInput}
                        onChange={(e) => setEmailInput(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label>Password</label>
                    <input
                        type="password"
                        value={passwordInput}
                        onChange={(e) => setPasswordInput(e.target.value)}
                        required
                    />
                </div>
                <button type="submit">Log On</button>
            </form>
        </div>
    );
}

export default Logon;