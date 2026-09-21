const techStack = [
    { name: 'React 19', blurb: 'Declarative component architecture with hooks, context, and reducers.' },
    { name: 'React Router 7', blurb: 'Client-side routing with protected routes and URL-driven filters.' },
    { name: 'Vite', blurb: 'Lightning-fast dev server and optimized production builds.' },
    { name: 'Tailwind CSS', blurb: 'Utility-first styling with a custom professional design system.' },
];

function AboutPage() {
    return (
        <div className="animate-enter mx-auto max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-indigo-500">About</p>
            <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
                A calm space for <span className="gradient-text">getting things done</span>
            </h2>
            <p className="mt-3 max-w-xl text-[0.95rem] leading-relaxed text-slate-500">
                Todo List is a polished task-tracking workspace built as a React single-page
                application. Add tasks, search and filter them, sort your agenda, and watch
                your completion score climb.
            </p>

            <h3 className="field-label mt-10">Under the hood</h3>
            <div className="mt-3 grid gap-4 sm:grid-cols-2">
                {techStack.map((t, i) => (
                    <div key={t.name} className={`card card-hover p-5 animate-enter-${Math.min(i, 3)}`}>
                        <p className="text-sm font-bold text-slate-900">{t.name}</p>
                        <p className="mt-1.5 text-sm leading-relaxed text-slate-500">{t.blurb}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default AboutPage;
