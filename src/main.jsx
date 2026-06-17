import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router'; // React Router v7 import
import './index.css';
import App from './App.jsx';
import { AuthProvider } from './contexts/AuthContext';
import { TodoProvider } from './contexts/TodoContext'; // From week 9 refactor

createRoot(document.getElementById('root')).render(
    <StrictMode>
        <BrowserRouter>
            <AuthProvider>
                <TodoProvider>
                    <App />
                </TodoProvider>
            </AuthProvider>
        </BrowserRouter>
    </StrictMode>
);