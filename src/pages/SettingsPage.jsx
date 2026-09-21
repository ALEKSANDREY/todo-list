import { useState } from 'react';
import { useAssistant, DEFAULT_ASSISTANT_SETTINGS } from '../contexts/AssistantContext';
import { useReminders } from '../contexts/RemindersContext';
import { useCrm } from '../contexts/CrmContext';
import { useTaskMeta } from '../contexts/TaskMetaContext';

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
        <Section eyebrow="AI Assistant" title="Bring your own key" delay={1}>
            <form onSubmit={handleSave} className="grid gap-4">
                <div>
                    <label className="field-label" htmlFor="set-key">API key</label>
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
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                        <label className="field-label" htmlFor="set-base">Base URL</label>
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
                    Your key is stored <strong>only in this browser's localStorage</strong> and is sent{' '}
                    <strong>only to the base URL you configure</strong> — never anywhere else. Any
                    OpenAI-compatible endpoint works (OpenAI, Azure OpenAI, Ollama, LiteLLM, …).
                    Chats are not saved between visits.
                </p>
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
        <Section eyebrow="Reminders" title="Browser notifications" delay={2}>
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
        <Section eyebrow="Workspace" title="Data management" delay={3}>
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
                Everything in this app is stored locally in your browser — no account, no server, no sync.
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
                    AI key, notifications, and your local workspace data.
                </p>
            </div>
            <div className="space-y-5">
                <AssistantSettings />
                <NotificationSettings />
                <DataSettings />
            </div>
        </div>
    );
}
