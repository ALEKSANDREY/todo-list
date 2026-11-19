import { useState } from 'react';
import { useAssistant, DEFAULT_ASSISTANT_SETTINGS } from '../contexts/AssistantContext';
import { useReminders } from '../contexts/RemindersContext';
import { useCrm } from '../contexts/CrmContext';
import { useTaskMeta } from '../contexts/TaskMetaContext';
import GcalSettingsContent from '../features/Gcal/GcalSettingsContent';
import usePwaInstall from '../features/PWA/usePwaInstall';

function Section({ eyebrow, title, children, delay = 1 }) {
    return (
        <section className={`card animate-enter-${delay} p-6 sm:p-8`}>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-indigo-500">{eyebrow}</p>
            <h3 className="mt-2 text-xl font-extrabold tracking-tight text-slate-900">{title}</h3>
            <div className="mt-5">{children}</div>
        </section>
    );
}

function AssistantSettings() {
    const { settings, saveSettings, clearKey, hasKey } = useAssistant();
    const [form, setForm] = useState(settings);
    const [saved, setSaved] = useState(false);

    const set = (field) => (e) => {
        setForm((f) => ({ ...f, [field]: e.target.value }));
        setSaved(false);
    };

    const handleSave = (e) => {
        e.preventDefault();
        saveSettings({
            apiKey: form.apiKey.trim(),
            baseUrl: form.baseUrl.trim().replace(/\/+$/, '') || DEFAULT_ASSISTANT_SETTINGS.baseUrl,
            model: form.model.trim() || DEFAULT_ASSISTANT_SETTINGS.model,
        });
        setSaved(true);
    };

    return (
        <Section eyebrow="AI Assistant" title="An assistant that knows your tasks" delay={1}>
            <p className="text-sm leading-relaxed text-slate-600">
                Chat with an assistant that sees your tasks, contacts, and pipeline — ask it
                to help you prioritize, break big work down, or draft a follow-up.
            </p>
            <form onSubmit={handleSave} className="mt-4 grid gap-4">
                <div>
                    <label className="field-label" htmlFor="set-key">OpenAI API key</label>
                    <input
                        id="set-key"
                        type="password"
                        className="input font-mono"
                        value={form.apiKey}
                        onChange={set('apiKey')}
                        placeholder="sk-…"
                        autoComplete="off"
                        spellCheck={false}
                    />
                    <p className="mt-1.5 text-xs leading-relaxed text-slate-500">
                        To turn the assistant on, paste your key above. Get one at{' '}
                        <span className="font-semibold text-slate-700">platform.openai.com</span> →{' '}
                        API keys. The key is stored only in this browser.
                    </p>
                </div>
                <details className="rounded-xl border border-slate-200/80 bg-slate-50/50 px-4 py-3">
                    <summary className="cursor-pointer text-xs font-bold text-slate-600 hover:text-slate-900">
                        Advanced settings
                    </summary>
                    <div className="mt-3 grid gap-4 sm:grid-cols-2">
                        <div>
                            <label className="field-label" htmlFor="set-base">Service address</label>
                            <input
                                id="set-base"
                                type="url"
                                className="input font-mono text-sm"
                                value={form.baseUrl}
                                onChange={set('baseUrl')}
                                placeholder="https://api.openai.com/v1"
                                spellCheck={false}
                            />
                        </div>
                        <div>
                            <label className="field-label" htmlFor="set-model">Model</label>
                            <input
                                id="set-model"
                                className="input font-mono text-sm"
                                value={form.model}
                                onChange={set('model')}
                                placeholder="gpt-4o-mini"
                                spellCheck={false}
                            />
                        </div>
                    </div>
                    <p className="mt-2 text-xs text-slate-500">
                        Only change these if you use a different AI service (like a local model).
                    </p>
                </details>
                <div className="flex flex-wrap items-center gap-2">
                    <button type="submit" className="btn-primary">Save settings</button>
                    {hasKey && (
                        <button type="button" onClick={() => { clearKey(); setForm((f) => ({ ...f, apiKey: '' })); setSaved(false); }} className="btn-ghost">
                            Remove key
                        </button>
                    )}
                    {saved && <span className="text-sm font-bold text-emerald-600">Saved ✓</span>}
                </div>
            </form>
            <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50/70 p-4 text-[0.8rem] leading-relaxed text-slate-600">
                <p className="font-bold text-slate-800">Privacy note</p>
                <p className="mt-1">
                    Your key is stored <strong>only in this browser</strong> and is sent{' '}
                    <strong>only to the AI service you configure</strong> — never anywhere else.
                    Chats are not saved between visits.
                </p>
            </div>
        </Section>
    );
}

function GoogleCalendarSettings() {
    return (
        <Section eyebrow="Calendar" title="Google Calendar sync" delay={2}>
            <GcalSettingsContent />
        </Section>
    );
}

function InstallAppSettings() {
    const { canInstall, promptInstall } = usePwaInstall();

    return (
        <Section eyebrow="Phone app" title="Install on your phone" delay={5}>
            <p className="text-sm leading-relaxed text-slate-600">
                Add this workspace to your home screen for full-screen use, faster loading,
                offline access, and its own app icon.
            </p>
            <div className="mt-4">
                {canInstall ? (
                    <button type="button" onClick={promptInstall} className="btn-primary">
                        Install app
                    </button>
                ) : (
                    <p className="rounded-xl bg-slate-50 px-4 py-3 text-xs leading-relaxed text-slate-500">
                        On your phone, open this page in Chrome and choose “Add to Home screen”
                        from the browser menu. On iPhone, use Share → “Add to Home Screen” in Safari.
                    </p>
                )}
            </div>
        </Section>
    );
}

function NotificationSettings() {
    const { permission, requestPermission, notificationsSupported } = useReminders();
    const [busy, setBusy] = useState(false);

    const handleEnable = async () => {
        setBusy(true);
        await requestPermission();
        setBusy(false);
    };

    const statusBadge = {
        granted: <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700">Enabled</span>,
        denied: <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-bold text-red-700">Blocked</span>,
        default: <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">Not enabled</span>,
        unsupported: <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">Unsupported</span>,
    }[permission] || null;

    return (
        <Section eyebrow="Reminders" title="Browser notifications" delay={3}>
            <div className="flex flex-wrap items-center gap-3">
                {statusBadge}
                {notificationsSupported && permission !== 'granted' && (
                    <button type="button" onClick={handleEnable} disabled={busy} className="btn-primary !px-4 !py-2 !text-xs">
                        {busy ? 'Requesting…' : 'Enable notifications'}
                    </button>
                )}
            </div>
            {permission === 'denied' && (
                <p className="mt-3 text-sm text-slate-600">
                    Notifications are blocked for this site. Allow them in your browser's site settings to turn them back on.
                </p>
            )}
            <p className="mt-4 text-sm leading-relaxed text-slate-600">
                Reminders fire <strong>while this app tab is open</strong> — the app checks every minute for
                due reminder times and overdue tasks. You'll always also get an in-app toast, even with
                browser notifications off. Close the tab and reminders pause until you return.
            </p>
        </Section>
    );
}

function DataSettings() {
    const { clearCrm } = useCrm();
    const { clearAllMeta } = useTaskMeta();
    const [confirm, setConfirm] = useState(null);

    const actions = [
        {
            id: 'crm',
            label: 'Clear contacts & pipeline',
            hint: 'Deletes all contacts, stages, and pipeline cards.',
            run: clearCrm,
        },
        {
            id: 'meta',
            label: 'Clear task schedules',
            hint: 'Removes due dates, reminders, contact links, and completion history from tasks. Tasks themselves are kept.',
            run: clearAllMeta,
        },
    ];

    return (
        <Section eyebrow="Workspace" title="Data management" delay={4}>
            <div className="space-y-3">
                {actions.map((a) => (
                    <div key={a.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200/80 p-4">
                        <div className="min-w-0">
                            <p className="text-sm font-bold text-slate-900">{a.label}</p>
                            <p className="text-xs text-slate-500">{a.hint}</p>
                        </div>
                        {confirm === a.id ? (
                            <div className="flex gap-2">
                                <button type="button" onClick={() => { a.run(); setConfirm(null); }} className="rounded-xl bg-red-600 px-4 py-2 text-xs font-bold text-white hover:bg-red-700">
                                    Confirm
                                </button>
                                <button type="button" onClick={() => setConfirm(null)} className="btn-ghost px-4 py-2 text-xs">Cancel</button>
                            </div>
                        ) : (
                            <button type="button" onClick={() => setConfirm(a.id)} className="btn-ghost px-4 py-2 text-xs">Clear</button>
                        )}
                    </div>
                ))}
            </div>
            <p className="mt-4 text-xs leading-relaxed text-slate-400">
                Everything in this app is stored in your account on the app server.
                Clearing data here cannot be undone.
            </p>
        </Section>
    );
}

export default function SettingsPage() {
    return (
        <div className="mx-auto max-w-3xl">
            <div className="animate-enter mb-8">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-indigo-500">Preferences</p>
                <h2 className="mt-2 text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
                    <span className="gradient-text">Settings</span>
                </h2>
                <p className="mt-2 text-sm text-slate-500">
                    Assistant, calendar sync, notifications, and your local workspace data.
                </p>
            </div>
            <div className="space-y-5">
                <AssistantSettings />
                <GoogleCalendarSettings />
                <NotificationSettings />
                <DataSettings />
                <InstallAppSettings />
            </div>
        </div>
    );
}
