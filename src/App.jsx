import './App.css';
import { Routes, Route } from 'react-router';
import AboutPage from './pages/AboutPage';
import TodosPage from './pages/TodosPage';
import BoardPage from './pages/BoardPage';
import CalendarPage from './pages/CalendarPage';
import DashboardPage from './pages/DashboardPage';
import ContactsPage from './pages/ContactsPage';
import PipelinePage from './pages/PipelinePage';
import SettingsPage from './pages/SettingsPage';
import NotFoundPage from './pages/NotFoundPage';
import LoginPage from './pages/LoginPage';
import Header from './shared/Header';
import ToastHost from './features/Reminders/ToastHost';
import AssistantFab from './features/Assistant/AssistantFab';
import AssistantPanel from './features/Assistant/AssistantPanel';
import UpdatePrompt from './features/PWA/UpdatePrompt';
import WelcomeOverlay from './features/Welcome/WelcomeOverlay';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { TodoProvider } from './contexts/TodoContext';
import { TaskMetaProvider } from './contexts/TaskMetaContext';
import { CrmProvider } from './contexts/CrmContext';
import { RemindersProvider } from './contexts/RemindersContext';
import { AssistantProvider } from './contexts/AssistantContext';
import { TimeProvider } from './contexts/TimeContext';
import { RecurrenceProvider } from './contexts/RecurrenceContext';
import { GcalProvider } from './contexts/GcalContext';

function LoadingSplash() {
    return (
        <div className="flex min-h-screen items-center justify-center">
            <div className="text-center">
                <div className="logo-mark mx-auto mb-4 h-14 w-14 rounded-2xl text-xl font-extrabold">✓</div>
                <p className="text-sm font-semibold text-slate-500">Loading your workspace…</p>
            </div>
        </div>
    );
}

function BackendOffline() {
    const { recheck } = useAuth();
    return (
        <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
            <div className="card w-full max-w-md p-8 text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100 text-2xl">
                    🔌
                </div>
                <h1 className="text-xl font-extrabold text-slate-900">Backend is offline</h1>
                <p className="mt-2 text-sm text-slate-500">
                    The app needs its Node server running. In a terminal, from the project folder:
                </p>
                <code className="mt-4 block rounded-xl bg-slate-900 px-4 py-3 text-left text-xs font-mono text-emerald-300">
                    cd server && npm install && node index.js
                </code>
                <button type="button" onClick={recheck} className="btn-primary mt-5 w-full py-2.5 text-sm">
                    Retry connection
                </button>
            </div>
        </div>
    );
}

function DataProviders({ children }) {
    return (
        <TodoProvider>
            <TaskMetaProvider>
                <CrmProvider>
                    <RemindersProvider>
                        <AssistantProvider>
                            <TimeProvider>
                                <RecurrenceProvider>
                                    <GcalProvider>{children}</GcalProvider>
                                </RecurrenceProvider>
                            </TimeProvider>
                        </AssistantProvider>
                    </RemindersProvider>
                </CrmProvider>
            </TaskMetaProvider>
        </TodoProvider>
    );
}

function WorkspaceApp() {
    const { user, logout } = useAuth();
    return (
        <div className="min-h-screen text-slate-900">
            <Header user={user} onLogout={logout} />

            {/* RESPONSIVE MAIN CONTAINER WORKSPACE */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                <Routes>
                    {/* Tasks are the heart of the app — the default landing view */}
                    <Route path='/' element={<TodosPage />} />
                    <Route path='/todos' element={<TodosPage />} />
                    <Route path='/about' element={<AboutPage />} />
                    <Route path='/board' element={<BoardPage />} />
                    <Route path='/calendar' element={<CalendarPage />} />
                    <Route path='/dashboard' element={<DashboardPage />} />
                    <Route path='/contacts' element={<ContactsPage />} />
                    <Route path='/pipeline' element={<PipelinePage />} />
                    <Route path='/settings' element={<SettingsPage />} />

                    {/* 404 Catch-All Route */}
                    <Route path='*' element={<NotFoundPage />} />
                </Routes>
            </main>

            <footer className="mx-auto max-w-7xl px-4 pb-8 text-center text-[0.7rem] font-medium text-slate-400">
                Built with React · Vite · Tailwind CSS · Node — your data stays on your own server.
            </footer>

            {/* App-wide overlays */}
            <WelcomeOverlay />
            <ToastHost />
            <AssistantFab />
            <AssistantPanel />
            <UpdatePrompt />
        </div>
    );
}

function AuthGate() {
    const { user, authChecked, backendDown } = useAuth();

    if (!authChecked) return <LoadingSplash />;
    // Never silently fall back to fake data: no backend, no workspace.
    if (backendDown) return <BackendOffline />;
    if (!user) return <LoginPage />;

    return (
        <DataProviders>
            <WorkspaceApp />
        </DataProviders>
    );
}

function App() {
    return (
        <AuthProvider>
            <AuthGate />
        </AuthProvider>
    );
}

export default App;
