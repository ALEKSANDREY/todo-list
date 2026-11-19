const highlights = [
    { icon: '✅', title: 'Tasks', text: 'Capture everything in one list, with due dates and reminders.' },
    { icon: '🗂️', title: 'Board & calendar', text: 'Drag cards across columns or plan your week on the calendar.' },
    { icon: '⏱️', title: 'Time tracking', text: 'Run the built-in focus timer and watch your hours add up.' },
    { icon: '👥', title: 'Contacts & pipeline', text: 'Keep people and follow-ups moving, from first touch to done.' },
    { icon: '✨', title: 'AI assistant', text: 'An assistant that knows your tasks and helps you prioritize.' },
];

function AboutPage() {
    return (
        <div className="animate-enter mx-auto max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-indigo-500">About</p>
            <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
                A calm space for <span className="gradient-text">getting things done</span>
            </h2>
            <p className="mt-3 max-w-xl text-[0.95rem] leading-relaxed text-slate-500">
                Todo List is a workspace for getting things done — create an account or
                jump straight in with the one-click demo. Everything you create is
                saved to your account on the app server.
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
                {highlights.map((h, i) => (
                    <div key={h.title} className={`card card-hover p-5 animate-enter-${Math.min(i, 3)}`}>
                        <p className="text-sm font-bold text-slate-900">
                            <span className="mr-1.5 text-base">{h.icon}</span>
                            {h.title}
                        </p>
                        <p className="mt-1.5 text-sm leading-relaxed text-slate-500">{h.text}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default AboutPage;
