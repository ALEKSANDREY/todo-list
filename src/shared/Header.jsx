function Header({ token, onSetToken, onSetEmail }) {
    function handleLogout() {
        onSetToken('');
        onSetEmail('');
    }

    return (
        <header>
            <h1>Todo List</h1>
            {token && (
                <button onClick={handleLogout}>Log Out</button>
            )}
        </header>
    );
}

export default Header;  