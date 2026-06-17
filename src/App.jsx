import './App.css';
import { Routes, Route } from 'react-router';
import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import LoginPage from './pages/LoginPage';
import TodosPage from './pages/TodosPage.jsx';
import ProfilePage from './pages/ProfilePage';
import NotFoundPage from './pages/NotFoundPage';
import RequireAuth from './components/RequireAuth';
import Header from './shared/Header';

function App() {
    return (
        <>
            <Header />
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
        </>
    );
}

export default App;