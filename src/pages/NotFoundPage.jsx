import { Link } from 'react-router';

function NotFoundPage() {
    return (
        <div className="animate-enter mx-auto max-w-md py-16 text-center">
            <p className="gradient-text text-7xl font-extrabold tracking-tight">404</p>
            <h2 className="mt-4 text-2xl font-extrabold tracking-tight text-slate-900">
                This page wandered off
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-500">
                The address you entered doesn't map to anything in this workspace.
            </p>
            <Link to="/" className="btn-primary mt-8 inline-flex no-underline">
                Return to workspace
            </Link>
        </div>
    );
}

export default NotFoundPage;
