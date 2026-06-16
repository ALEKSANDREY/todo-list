import './App.css';
import Header from './shared/Header.jsx';
import TodosPage from './features/Todos/TodosPage.jsx';
import Logon from './features/Logon.jsx';
import { useAuth } from './contexts/AuthContext.jsx';
import { TodoProvider } from './contexts/TodoContext.jsx'; // Import TodoProvider here instead

function App() {
    const { isAuthenticated } = useAuth();

    return (
        <div>
            <Header />
            {isAuthenticated ? (
                /* The Todo List only needs to run if we are logged in! */
                <TodoProvider>
                    <TodosPage />
                </TodoProvider>
            ) : (
                <Logon />
            )}
        </div>
    );
}

export default App;