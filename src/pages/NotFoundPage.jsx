import { Link } from 'react-router';

function NotFoundPage() {
    return (
        <div style={{ padding: '40px', textAlign: 'center' }}>
            <h2>404: Route Not Found</h2>
            <p>Oops! The page sequence you entered doesn't map to an active view container.</p>
            <Link to="/" style={{ color: 'blue', textDecoration: 'underline' }}>Return to Workspace</Link>
        </div>
    );
}

export default NotFoundPage;