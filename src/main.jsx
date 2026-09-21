import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router'; // React Router v7 import
import './index.css';
import App from './App.jsx';
import { AuthProvider } from './contexts/AuthContext';
import { TodoProvider } from './contexts/TodoContext'; // From week 9 refactor
import { TaskMetaProvider } from './contexts/TaskMetaContext';
import { CrmProvider } from './contexts/CrmContext';
import { RemindersProvider } from './contexts/RemindersContext';
import { AssistantProvider } from './contexts/AssistantContext';

createRoot(document.getElementById('root')).render(
    <StrictMode>
        <BrowserRouter>
            <AuthProvider>
                <TodoProvider>
                    <TaskMetaProvider>
                        <CrmProvider>
                            <RemindersProvider>
                                <AssistantProvider>
                                    <App />
                                </AssistantProvider>
                            </RemindersProvider>
                        </CrmProvider>
                    </TaskMetaProvider>
                </TodoProvider>
            </AuthProvider>
        </BrowserRouter>
    </StrictMode>
);
