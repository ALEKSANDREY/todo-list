function AboutPage() {
    return (
        <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
            <h2>About This Application</h2>
            <p>Welcome to our professional Todo tracking environment built with React SPA architecture.</p>
            <h3>Technologies Implemented:</h3>
            <ul>
                <li><strong>React v19</strong> — Declarative component architecture</li>
                <li><strong>React Router v7</strong> — Client-side dynamic memory navigation</li>
                <li><strong>Context & useReducer</strong> — Global state delivery systems</li>
                <li><strong>Vite Server Proxy</strong> — Secure cookie and credential passing</li>
            </ul>
        </div>
    );
}

export default AboutPage;