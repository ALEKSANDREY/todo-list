import './App.css';
import { Routes, Route } from 'react-router';
import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import LoginPage from './pages/LoginPage';
import TodosPage from './pages/TodosPage';
import ProfilePage from './pages/ProfilePage';
import NotFoundPage from './pages/NotFoundPage';
import RequireAuth from './components/RequireAuth';
import Header from './shared/Header';
import Logoff from './shared/Logoff';

function App() {
    return (
        <div className="min-h-screen bg-slate-50 text-slate-900">
            <Header />

            {/* RESPONSIVE MAIN CONTAINER WORKSPACE */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
        </div>
    );
}

export default App;