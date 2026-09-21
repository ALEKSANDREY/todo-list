/* eslint-disable react-refresh/only-export-components -- context file exporting provider + hook */
import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useTodo } from './TodoContext';
import { useTaskMeta } from './TaskMetaContext';
import { loadJSON, saveJSON } from '../utils/localStore';
import {
    loadScript,
    taskHash,
    buildEventFromTask,
    eventDayKey,
    GIS_SRC,
    GAPI_SRC,
    DISCOVERY_DOC,
} from '../features/Gcal/gcalApi';

// Google Calendar sync, client-side only. OAuth (GIS token client) + raw
// fetch calls to the Calendar v3 REST API. Tokens and settings persist in
// localStorage; nothing is ever sent anywhere except Google's endpoints.
const GcalContext = createContext();

const GCAL_KEY = 'worldclass-gcal-v1';
const IMPORTED_KEY = 'worldclass-gcal-imported-v1';
const LASTSYNC_KEY = 'worldclass-gcal-lastsync-v1';
const CALENDAR_SCOPE = 'https://www.googleapis.com/auth/calendar';

export const ensureGis = () => loadScript(GIS_SRC);

export async function ensureGapi() {
    await loadScript(GAPI_SRC);
    await new Promise((res) => window.gapi.load('client', res));
    await window.gapi.client.init({ discoveryDocs: [DISCOVERY_DOC] });
}

function friendlyOauthError(e) {
    const type = e && e.type;
    if (type === 'popup_closed') return 'The Google sign-in popup was closed before finishing. Click Connect again and allow the popup.';
    if (type === 'popup_blocked') return 'Your browser blocked the Google sign-in popup. Allow popups for this site and try again.';
    if (type === 'access_denied') return 'Google sign-in was denied. Try again and grant calendar access.';
    return 'Google sign-in failed. Double-check the Client ID and try again.';
}

export function useGcal() {
    const context = useContext(GcalContext);
    if (!context) throw new Error('useGcal must be used within a GcalProvider');
    return context;
}

export function GcalProvider({ children }) {
    const { todoList, addTodo } = useTodo();
    const { meta, setMeta } = useTaskMeta();

    const [settings, setSettingsState] = useState(() =>
        loadJSON(GCAL_KEY, { clientId: '', calendarId: '', token: '', tokenExpiry: 0 })
    );
    const [status, setStatus] = useState('idle'); // idle | connecting | connected | needs-reconnect | error
    const [error, setError] = useState('');
    const [calendars, setCalendars] = useState([]);
    const [lastSync, setLastSync] = useState(() => loadJSON(LASTSYNC_KEY, null));

    const pushTimer = useRef(null);
    const pushingRef = useRef(false);
    const metaRef = useRef(meta);
    metaRef.current = meta;

    useEffect(() => {
        saveJSON(GCAL_KEY, settings);
    }, [settings]);

    useEffect(() => {
        saveJSON(LASTSYNC_KEY, lastSync);
    }, [lastSync]);

    const clearError = useCallback(() => setError(''), []);

    const saveClientId = useCallback((id) => {
        setSettingsState((s) => ({ ...s, clientId: (id || '').trim() }));
    }, []);

    const selectCalendar = useCallback((id) => {
        setSettingsState((s) => ({ ...s, calendarId: id }));
    }, []);

    // Direct Google API call with the stored OAuth token.
    const api = useCallback(
        async (path, options = {}, tokenOverride) => {
            const token = tokenOverride || settings.token;
            if (!token) throw new Error('Not connected to Google.');
            const res = await fetch('https://www.googleapis.com' + path, {
                ...options,
                headers: {
                    Authorization: 'Bearer ' + token,
                    'Content-Type': 'application/json',
                    ...(options.headers || {}),
                },
            });
            if (res.status === 401) {
                setStatus('needs-reconnect');
                setError('Google session expired — click Connect again.');
                throw new Error('Google session expired');
            }
            if (!res.ok) throw new Error(`Google API error ${res.status}`);
            return res;
        },
        [settings.token]
    );

    const loadCalendars = useCallback(
        async (tokenOverride) => {
            const res = await api('/calendar/v3/users/me/calendarList', {}, tokenOverride);
            const data = await res.json();
            const items = data.items || [];
            setCalendars(items);
            setSettingsState((s) => {
                if (s.calendarId) return s;
                const primary = items.find((c) => c.primary) || items[0];
                return { ...s, calendarId: primary ? primary.id : 'primary' };
            });
        },
        [api]
    );

    // On boot, restore the session if we still hold a live token.
    useEffect(() => {
        const saved = loadJSON(GCAL_KEY, { clientId: '', calendarId: '', token: '', tokenExpiry: 0 });
        if (saved.token && saved.tokenExpiry > Date.now()) {
            setStatus('connected');
            loadCalendars(saved.token).catch(() => {});
        } else if (saved.token) {
            setStatus('needs-reconnect');
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps -- one-time session restore on mount
    }, []);

    const connect = useCallback(async () => {
        const clientId = (settings.clientId || '').trim();
        if (!clientId) {
            setError('Add your OAuth Client ID first — see the setup guide below.');
            return;
        }
        setError('');
        setStatus('connecting');
        try {
            await ensureGis();
        } catch {
            setStatus('error');
            setError("Could not load Google's sign-in library. Check your internet connection and try again.");
            return;
        }
        let tokenClient;
        try {
            tokenClient = window.google.accounts.oauth2.initTokenClient({
                client_id: clientId,
                scope: CALENDAR_SCOPE,
                callback: (resp) => {
                    if (resp && resp.error) {
                        setStatus('error');
                        setError(`Google sign-in failed: ${resp.error_description || resp.error}`);
                        return;
                    }
                    const expiresIn = resp.expires_in || 3600;
                    setSettingsState((s) => ({
                        ...s,
                        token: resp.access_token,
                        tokenExpiry: Date.now() + expiresIn * 1000,
                    }));
                    setStatus('connected');
                    loadCalendars(resp.access_token).catch(() => {});
                },
                error_callback: (e) => {
                    setStatus('error');
                    setError(friendlyOauthError(e));
                },
            });
        } catch {
            setStatus('error');
            setError('That Client ID was rejected by Google. Double-check it in the setup guide.');
            return;
        }
        try {
            tokenClient.requestAccessToken({ prompt: 'consent' });
        } catch {
            setStatus('error');
            setError('Could not open the Google sign-in popup. Allow popups for this site and try again.');
        }
    }, [settings.clientId, loadCalendars]);

    const disconnect = useCallback(async () => {
        const token = settings.token;
        if (token) {
            try {
                await fetch('https://oauth2.googleapis.com/revoke?token=' + encodeURIComponent(token), {
                    method: 'POST',
                });
            } catch {
                // Best effort — Google revokes when the token next gets used regardless.
            }
        }
        setSettingsState((s) => ({ ...s, token: '', tokenExpiry: 0 }));
        setCalendars([]);
        setStatus('idle');
        setError('');
    }, [settings.token]);

    // Push every task with a due date up to Google Calendar: create missing
    // events, PATCH events whose title/due date changed since the last push.
    const pushTasks = useCallback(async () => {
        if (status !== 'connected') return { pushed: 0, updated: 0, errors: [] };
        if (pushingRef.current) return { pushed: 0, updated: 0, errors: [] };
        pushingRef.current = true;
        const calendarId = settings.calendarId || 'primary';
        let pushed = 0;
        let updated = 0;
        const errors = [];
        try {
            for (const task of todoList) {
                const m = metaRef.current[String(task.id)] || {};
                if (!m.dueDate) continue;
                const hash = taskHash(task, m);
                try {
                    if (!m.gcalEventId) {
                        const res = await api(
                            `/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events`,
                            { method: 'POST', body: JSON.stringify(buildEventFromTask(task, m)) }
                        );
                        const ev = await res.json();
                        setMeta(task.id, { gcalEventId: ev.id, gcalHash: hash });
                        pushed++;
                    } else if (m.gcalHash !== hash) {
                        await api(
                            `/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events/${encodeURIComponent(m.gcalEventId)}`,
                            { method: 'PATCH', body: JSON.stringify(buildEventFromTask(task, m)) }
                        );
                        setMeta(task.id, { gcalHash: hash });
                        updated++;
                    }
                } catch (e) {
                    errors.push({ task: task.title, error: e.message });
                }
            }
        } finally {
            pushingRef.current = false;
        }
        return { pushed, updated, errors };
    }, [status, todoList, api, setMeta, settings.calendarId]);

    // Pull the next 30 days of events into the todo list, skipping events we
    // have already imported (tracked in localStorage by Google event id).
    const importUpcoming = useCallback(async () => {
        if (status !== 'connected') return 0;
        const calendarId = settings.calendarId || 'primary';
        const params = new URLSearchParams({
            timeMin: new Date().toISOString(),
            timeMax: new Date(Date.now() + 30 * 864e5).toISOString(),
            singleEvents: 'true',
            orderBy: 'startTime',
            maxResults: '50',
        });
        const res = await api(`/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events?${params}`);
        const data = await res.json();
        const items = data.items || [];
        const importedIds = loadJSON(IMPORTED_KEY, []);
        let count = 0;
        for (const ev of items) {
            if (!ev || !ev.id) continue;
            if (importedIds.includes(ev.id)) continue;
            if (!ev.start || ev.status === 'cancelled') continue;
            const newId = await addTodo(ev.summary || 'Untitled event');
            setMeta(newId, { dueDate: eventDayKey(ev) });
            importedIds.push(ev.id);
            count++;
        }
        saveJSON(IMPORTED_KEY, importedIds);
        return count;
    }, [status, settings.calendarId, api, addTodo, setMeta]);

    const syncNow = useCallback(async () => {
        const startedAt = new Date().toISOString();
        const results = await pushTasks();
        setLastSync(startedAt);
        return results;
    }, [pushTasks]);

    // Debounced auto-push: a few seconds after the user edits tasks or dates,
    // push the changes up — no manual sync needed.
    useEffect(() => {
        if (status !== 'connected') return;
        if (pushTimer.current) clearTimeout(pushTimer.current);
        pushTimer.current = setTimeout(() => {
            pushTasks().catch(() => {});
        }, 8000);
        return () => {
            if (pushTimer.current) clearTimeout(pushTimer.current);
        };
    }, [todoList, meta, status, pushTasks]);

    return (
        <GcalContext.Provider
            value={{
                status,
                error,
                clientId: settings.clientId,
                saveClientId,
                connect,
                disconnect,
                calendars,
                calendarId: settings.calendarId,
                selectCalendar,
                syncNow,
                importUpcoming,
                lastSync,
                isConfigured: !!settings.clientId,
                clearError,
            }}
        >
            {children}
        </GcalContext.Provider>
    );
}
