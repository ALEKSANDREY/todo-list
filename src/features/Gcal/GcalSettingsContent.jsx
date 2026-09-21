// Google Calendar sync controls. Rendered INSIDE the coordinator's Settings
// Section wrapper — this component returns only the inner content.
import { useState } from 'react';
import { useGcal } from '../../contexts/GcalContext';

const STATUS_STYLE = {
    idle: 'bg-slate-100 text-slate-600',
    connecting: 'bg-slate-100 text-slate-600',
    connected: 'bg-emerald-100 text-emerald-700',
    'needs-reconnect': 'bg-amber-100 text-amber-700',
    error: 'bg-red-100 text-red-700',
};

const STATUS_LABEL = {
    idle: 'Not connected',
    connecting: 'Connecting…',
    connected: 'Connected',
    'needs-reconnect': 'Session expired',
    error: 'Error',
};

const SETUP_STEPS = [
    <>
        Open the <a href='https://console.cloud.google.com' target='_blank' rel='noreferrer' className='font-bold text-indigo-600 underline'>Google Cloud Console</a>{' '}
        and create or select a project.
    </>,
    <>
        Go to <strong>APIs &amp; Services → Library</strong>, search for <strong>"Google Calendar API"</strong>, and click <strong>Enable</strong>.
    </>,
    <>
        Go to <strong>APIs &amp; Services → Credentials → Create Credentials → OAuth client ID</strong>, and choose application type <strong>"Web application"</strong>.
    </>,
    <>
        Under <strong>"Authorized JavaScript origins"</strong> add your site's origin, e.g. <code className='rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[0.78rem]'>https://todo-list-undelio.vercel.app</code>{' '}
        (use your deployed domain).
    </>,
    <>
        Copy the <strong>Client ID</strong> and paste it in the field above.
    </>,
];

export default function GcalSettingsContent() {
    const {
        status,
        error,
        clientId,
        saveClientId,
        connect,
        disconnect,
        calendars,
        calendarId,
        selectCalendar,
        syncNow,
        importUpcoming,
        lastSync,
        isConfigured,
        clearError,
    } = useGcal();

    const [draft, setDraft] = useState(clientId || '');
    const [saved, setSaved] = useState(false);
    const [busy, setBusy] = useState(false);
    const [result, setResult] = useState('');

    const connected = status === 'connected';

    const handleSave = () => {
        saveClientId(draft);
        setSaved(true);
    };

    const handleConnect = async () => {
        clearError();
        setResult('');
        await connect();
    };

    const handleDisconnect = async () => {
        setResult('');
        await disconnect();
    };

    const handleSyncNow = async () => {
        setBusy(true);
        setResult('');
        try {
            const { pushed, updated, errors } = await syncNow();
            setResult(
                `Synced — ${pushed} created, ${updated} updated${errors.length ? `, ${errors.length} failed` : ''}.`
            );
        } catch (e) {
            setResult(`Sync failed: ${e.message}`);
        }
        setBusy(false);
    };

    const handleImport = async () => {
        setBusy(true);
        setResult('');
        try {
            const count = await importUpcoming();
            setResult(count === 0 ? 'Nothing new to import.' : `Imported ${count} event${count === 1 ? '' : 's'}.`);
        } catch (e) {
            setResult(`Import failed: ${e.message}`);
        }
        setBusy(false);
    };

    return (
        <>
            <div className='flex flex-col gap-2 sm:flex-row sm:items-end'>
                <div className='flex-1'>
                    <label className='field-label' htmlFor='gcal-client-id'>Google OAuth Client ID</label>
                    <input
                        id='gcal-client-id'
                        className='input font-mono'
                        type='text'
                        value={draft}
                        onChange={(e) => { setDraft(e.target.value); setSaved(false); }}
                        placeholder='123456789-abc…xyz.apps.googleusercontent.com'
                        spellCheck={false}
                        autoComplete='off'
                    />
                </div>
                <button type='button' className='btn-primary shrink-0' onClick={handleSave}>Save</button>
                {saved && <span className='text-sm font-bold text-emerald-600'>Saved ✓</span>}
            </div>

            <div className='mt-5 rounded-xl border border-slate-200 bg-slate-50/70 p-4 text-[0.85rem] leading-relaxed text-slate-700'>
                <p className='font-bold text-slate-800'>Setup guide</p>
                <ol className='mt-2 list-decimal space-y-1.5 pl-5'>
                    {SETUP_STEPS.map((step, i) => (
                        <li key={i}>{step}</li>
                    ))}
                </ol>
                <p className='mt-2 text-slate-500'>Free — no billing required.</p>
            </div>

            <div className='mt-5 flex flex-wrap items-center gap-3'>
                <button type='button' className='btn-primary' onClick={handleConnect} disabled={!isConfigured || status === 'connecting'}>
                    Connect with Google
                </button>
                <span className={`rounded-full px-3 py-1 text-xs font-bold ${STATUS_STYLE[status]}`}>
                    {STATUS_LABEL[status]}
                </span>
            </div>

            {error && (
                <div className='error-banner mt-3' role='alert'>
                    {error}
                </div>
            )}

            {connected && (
                <div className='mt-5 space-y-4 rounded-xl border border-slate-200 p-4'>
                    <div>
                        <label className='field-label' htmlFor='gcal-calendar'>Calendar</label>
                        <select
                            id='gcal-calendar'
                            className='select'
                            value={calendarId || ''}
                            onChange={(e) => selectCalendar(e.target.value)}
                        >
                            {calendars.length === 0 && <option value=''>Loading calendars…</option>}
                            {calendars.map((c) => (
                                <option key={c.id} value={c.id}>{c.summary || c.id}</option>
                            ))}
                        </select>
                    </div>
                    <div className='flex flex-wrap items-center gap-2'>
                        <button type='button' className='btn-primary' onClick={handleSyncNow} disabled={busy}>
                            {busy ? 'Syncing…' : 'Sync now'}
                        </button>
                        <button type='button' className='btn-ghost' onClick={handleImport} disabled={busy}>
                            Import next 30 days
                        </button>
                        <button type='button' className='btn-ghost' onClick={handleDisconnect}>
                            Disconnect
                        </button>
                    </div>
                    <p className='text-sm text-slate-500'>
                        Last sync: {lastSync ? new Date(lastSync).toLocaleString() : 'Never synced'}
                    </p>
                    {result && <p className='text-sm font-semibold text-slate-700'>{result}</p>}
                </div>
            )}

            <div className='mt-5 rounded-xl border border-slate-200 bg-slate-50/70 p-4 text-[0.8rem] leading-relaxed text-slate-600'>
                <p className='font-bold text-slate-800'>Privacy note</p>
                <p className='mt-1'>
                    Your Client ID and OAuth tokens live <strong>only in this browser's localStorage</strong>.
                    Requests go <strong>only</strong> to <code className='rounded bg-slate-100 px-1 font-mono text-[0.75rem]'>accounts.google.com</code>,{' '}
                    <code className='rounded bg-slate-100 px-1 font-mono text-[0.75rem]'>www.googleapis.com</code>, and{' '}
                    <code className='rounded bg-slate-100 px-1 font-mono text-[0.75rem]'>oauth2.googleapis.com</code> — the app never sees your
                    Google password. Disconnect anytime to revoke access.
                </p>
            </div>
        </>
    );
}
