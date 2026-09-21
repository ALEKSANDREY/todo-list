import './App.css';
import { Routes, Route } from 'react-router';
import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import LoginPage from './pages/LoginPage';
import TodosPage from './pages/TodosPage';
import DashboardPage from './pages/DashboardPage';
import ContactsPage from './pages/ContactsPage';
import PipelinePage from './pages/PipelinePage';
import SettingsPage from './pages/SettingsPage';
import ProfilePage from './pages/ProfilePage';
import NotFoundPage from './pages/NotFoundPage';
import RequireAuth from './components/RequireAuth';
import Header from './shared/Header';
import Logoff from './shared/Logoff';
import ToastHost from './features/Reminders/ToastHost';
import AssistantFab from './features/Assistant/AssistantFab';
import AssistantPanel from './features/Assistant/AssistantPanel';

function App() {
    return (
        <div className="min-h-screen text-slate-900">
            <Header />

            {/* RESPONSIVE MAIN CONTAINER WORKSPACE */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                <Routes>
                    {/* Public Routes */}
                    <Route path='/' element={<HomePage />} />
                    <Route path='/about' element={<AboutPage />} />
                    <Route path='/login' element={<LoginPage />} />

                    {/* Protected Dashboard Routes */}
                    <Route
                        path='/todos'
                        element={
                            <RequireAuth>
                                <TodosPage />
                            </RequireAuth>
                        }
                    />
                    <Route
                        path='/dashboard'
                        element={
                            <RequireAuth>
                                <DashboardPage />
                            </RequireAuth>
                        }
                    />
                    <Route
                        path='/contacts'
                        element={
                            <RequireAuth>
                                <ContactsPage />
                            </RequireAuth>
                        }
                    />
                    <Route
                        path='/pipeline'
                        element={
                            <RequireAuth>
                                <PipelinePage />
                            </RequireAuth>
                        }
                    />
                    <Route
                        path='/settings'
                        element={
                            <RequireAuth>
                                <SettingsPage />
                            </RequireAuth>
                        }
                    />

                    {/* Protected Logoff Route */}
                    <Route
                        path="/logoff"
                        element={
                            <RequireAuth>
                                <Logoff />
                            </RequireAuth>
                        }
                    />

                    <Route
                        path='/profile'
                        element={
                            <RequireAuth>
                                <ProfilePage />
                            </RequireAuth>
                        }
                    />

                    {/* 404 Catch-All Route */}
                    <Route path='*' element={<NotFoundPage />} />
                </Routes>
            </main>

            {/* Power-pack overlays: available on every page */}
            <ToastHost />
            <AssistantFab />
            <AssistantPanel />
        </div>
    );
}

export default App;
