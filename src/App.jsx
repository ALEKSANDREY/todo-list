import { useState } from 'react'
import './App.css'
import TodoList from './features/TodoList/TodoList.jsx'
import TodoForm from './features/TodoForm.jsx'

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

    function updateTodo(editedTodo) {
        const updatedTodos = todoList.map(todo =>
            todo.id === editedTodo.id ? { ...editedTodo } : todo
        );
        setTodoList(updatedTodos);
    }

    return (
        <div>
            <h1>Todo List</h1>
            <TodoForm onAddTodo={addTodo} />
            <TodoList
                todoList={todoList}
                onCompleteTodo={completeTodo}
                onUpdateTodo={updateTodo}
            />
        </div>
    );
}

export default App;