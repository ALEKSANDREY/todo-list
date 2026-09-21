/* eslint-disable react-refresh/only-export-components -- context file exporting provider + hook */
import { createContext, useContext, useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useTaskMeta } from './TaskMetaContext';
import { useAuth } from './AuthContext';
import { api } from '../utils/api';
import { loadJSON, saveJSON } from '../utils/localStore';
import { lastNDayKeys } from '../utils/dates';

// Per-task stopwatch + Pomodoro engine. Timed seconds are credited to the
// server task row (via TaskMetaContext), pomodoro settings live in the
// server user-settings row, and completed focus sessions are logged as
// time entries. The running stopwatch itself stays in localStorage — it is
// ephemeral session state.
const TIMER_KEY = 'worldclass-timer-v1';

const DEFAULT_POMO_SETTINGS = { focusMin: 25, breakMin: 5, longBreakMin: 15, cyclesBeforeLong: 4 };
const IDLE_POMO = { phase: 'idle', endsAt: null, remainingMs: null, linkedTaskId: '', completedFocus: 0 };

// "45s" / "12m 30s" / "1h 23m"
export function formatDuration(totalSec) {
    const s = Math.max(0, Math.floor(Number(totalSec) || 0));
    if (s < 60) return `${s}s`;
    const m = Math.floor(s / 60);
    const r = s % 60;
    if (m < 60) return r ? `${m}m ${r}s` : `${m}m`;
    const h = Math.floor(m / 60);
    const rm = m % 60;
    return rm ? `${h}h ${rm}m` : `${h}h`;
}

// Local YYYY-MM-DD key for an ISO timestamp (matches utils/dates todayKey).
function isoDayKey(iso) {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return '';
    const p = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

// Double 880Hz beep via WebAudio; silently no-ops where audio is unavailable.
function beep() {
    try {
        const AC = window.AudioContext || window.webkitAudioContext;
        if (!AC) return;
        const ctx = new AC();
        if (ctx.state === 'suspended') ctx.resume().catch(() => {});
        [0, 0.22].forEach((delay) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.value = 880;
            const t0 = ctx.currentTime + delay;
            gain.gain.setValueAtTime(0.0001, t0);
            gain.gain.exponentialRampToValueAtTime(0.4, t0 + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.18);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(t0);
            osc.stop(t0 + 0.2);
        });
        setTimeout(() => ctx.close().catch(() => {}), 800);
    } catch {
        // Audio unavailable (headless, no device) — the visual transition still runs.
    }
}

const TimeContext = createContext();

export function useTime() {
    const context = useContext(TimeContext);
    if (!context) throw new Error('useTime must be used within a TimeProvider');
    return context;
}

function toClientSettings(row) {
    return {
        focusMin: Number(row.pomoFocusMin ?? DEFAULT_POMO_SETTINGS.focusMin),
        breakMin: Number(row.pomoBreakMin ?? DEFAULT_POMO_SETTINGS.breakMin),
        longBreakMin: Number(row.pomoLongBreakMin ?? DEFAULT_POMO_SETTINGS.longBreakMin),
        cyclesBeforeLong: Number(row.pomoCycles ?? DEFAULT_POMO_SETTINGS.cyclesBeforeLong),
    };
}

function toServerSettings(patch) {
    const map = {
        focusMin: 'pomoFocusMin',
        breakMin: 'pomoBreakMin',
        longBreakMin: 'pomoLongBreakMin',
        cyclesBeforeLong: 'pomoCycles',
    };
    const body = {};
    for (const [k, v] of Object.entries(patch || {})) {
        if (map[k]) body[map[k]] = Math.max(1, Math.floor(Number(v) || 1));
    }
    return body;
}

export function TimeProvider({ children }) {
    const { getMeta, setMeta } = useTaskMeta();
    const { user } = useAuth();

    // 1s heartbeat driving every live display and the pomodoro transitions.
    const [now, setNow] = useState(() => Date.now());
    useEffect(() => {
        const id = setInterval(() => setNow(Date.now()), 1000);
        return () => clearInterval(id);
    }, []);

    // ---- Server-backed settings + focus log ---------------------------
    const [pomoSettings, setPomoSettings] = useState(DEFAULT_POMO_SETTINGS);
    const [entries, setEntries] = useState([]);

    useEffect(() => {
        if (!user) return;
        let cancelled = false;
        (async () => {
            try {
                const [sData, eData] = await Promise.all([api('/api/settings'), api('/api/time/entries')]);
                if (!cancelled) {
                    setPomoSettings(toClientSettings(sData || {}));
                    setEntries(eData.entries || []);
                }
            } catch {
                // Offline mid-session: keep defaults; actions below no-op safely.
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [user]);

    const settingsRef = useRef(pomoSettings);
    useEffect(() => {
        settingsRef.current = pomoSettings;
    }, [pomoSettings]);

    const savePomoSettings = useCallback((patch) => {
        setPomoSettings((prev) => ({ ...prev, ...patch }));
        const body = toServerSettings(patch);
        if (Object.keys(body).length > 0) {
            api('/api/settings', { method: 'PATCH', body }).catch(() => {});
        }
    }, []);

    const logFocusEntry = useCallback(async (taskId, minutes) => {
        try {
            const saved = await api('/api/time/entries', {
                method: 'POST',
                body: {
                    taskId: taskId ? Number(taskId) || null : null,
                    startedAt: new Date().toISOString(),
                    seconds: Math.round(minutes * 60),
                    kind: 'pomodoro',
                },
            });
            setEntries((prev) => [saved, ...prev]);
        } catch {
            // Best-effort: the time credit below is what matters most.
        }
    }, []);

    // ---- Stopwatch ----------------------------------------------------
    const [timer, setTimerState] = useState(() => loadJSON(TIMER_KEY, null));
    useEffect(() => {
        saveJSON(TIMER_KEY, timer);
    }, [timer]);

    // Mirrors so long-lived callbacks/effects never read stale state.
    const timerRef = useRef(timer);
    useEffect(() => {
        timerRef.current = timer;
    }, [timer]);
    const getMetaRef = useRef(getMeta);
    useEffect(() => {
        getMetaRef.current = getMeta;
    }, [getMeta]);

    const creditTimer = useCallback(() => {
        const t = timerRef.current;
        if (!t) return;
        timerRef.current = null;
        setTimerState(null);
        const secs = Math.floor((Date.now() - t.startedAt) / 1000);
        if (secs > 0) {
            const id = String(t.taskId);
            const cur = getMetaRef.current(id).timeSeconds || 0;
            setMeta(id, { timeSeconds: cur + secs });
        }
    }, [setMeta]);

    const startTimer = useCallback(
        (taskId) => {
            creditTimer(); // never leak time when switching tasks
            const t = { taskId: String(taskId), startedAt: Date.now() };
            timerRef.current = t;
            setTimerState(t);
        },
        [creditTimer]
    );

    const pauseTimer = creditTimer;
    const stopTimer = creditTimer;

    const adjustTime = useCallback(
        (taskId, deltaSec) => {
            const id = String(taskId);
            const cur = getMetaRef.current(id).timeSeconds || 0;
            setMeta(id, { timeSeconds: Math.max(0, cur + deltaSec) });
        },
        [setMeta]
    );

    const timerElapsed = useCallback((taskId) => {
        const t = timerRef.current;
        if (!t || String(t.taskId) !== String(taskId)) return 0;
        return Math.floor((Date.now() - t.startedAt) / 1000);
    }, []);

    const totalSeconds = useCallback(
        (taskId) => {
            const id = String(taskId);
            return (getMetaRef.current(id).timeSeconds || 0) + timerElapsed(id);
        },
        [timerElapsed]
    );

    // ---- Pomodoro ------------------------------------------------------
    const [pomo, setPomo] = useState(IDLE_POMO);
    const pomoRef = useRef(pomo);
    useEffect(() => {
        pomoRef.current = pomo;
    }, [pomo]);

    // Complete the current phase: credit + log for focus, advance the cycle.
    const transitionPhase = useCallback(
        (p, timestamp) => {
            const settings = settingsRef.current;
            beep();
            if (p.phase === 'focus') {
                const credit = Math.round(settings.focusMin * 60);
                const taskId = String(p.linkedTaskId || '');
                if (taskId) {
                    const cur = getMetaRef.current(taskId).timeSeconds || 0;
                    setMeta(taskId, { timeSeconds: cur + credit });
                }
                logFocusEntry(taskId, settings.focusMin);
                const n = p.completedFocus + 1;
                const isLong = n % settings.cyclesBeforeLong === 0;
                const breakMin = isLong ? settings.longBreakMin : settings.breakMin;
                setPomo({
                    phase: isLong ? 'longbreak' : 'break',
                    endsAt: timestamp + Math.round(breakMin * 60000),
                    remainingMs: null,
                    linkedTaskId: '',
                    completedFocus: n,
                });
            } else {
                // break / longbreak → back to ready
                setPomo({ phase: 'idle', endsAt: null, remainingMs: null, linkedTaskId: '', completedFocus: p.completedFocus });
            }
        },
        [setMeta, logFocusEntry]
    );

    // Transition effect: fires when the 1s tick crosses the phase deadline.
    useEffect(() => {
        const p = pomoRef.current;
        if (!p || !p.endsAt || now < p.endsAt) return;
        transitionPhase(p, now);
    }, [now, transitionPhase]);

    const startFocus = useCallback((linkedTaskId = '') => {
        const settings = settingsRef.current;
        const p = pomoRef.current;
        setPomo({
            phase: 'focus',
            endsAt: Date.now() + Math.round(settings.focusMin * 60000),
            remainingMs: null,
            linkedTaskId: String(linkedTaskId || ''),
            completedFocus: p.completedFocus,
        });
    }, []);

    const pausePomo = useCallback(() => {
        const p = pomoRef.current;
        if (p.phase === 'idle' || !p.endsAt) return;
        setPomo({ ...p, remainingMs: Math.max(0, p.endsAt - Date.now()), endsAt: null });
    }, []);

    const resumePomo = useCallback(() => {
        const p = pomoRef.current;
        if (p.phase === 'idle' || p.endsAt || p.remainingMs == null) return;
        setPomo({ ...p, endsAt: Date.now() + p.remainingMs, remainingMs: null });
    }, []);

    const resetPomo = useCallback(() => {
        setPomo({ ...IDLE_POMO, completedFocus: pomoRef.current.completedFocus });
    }, []);

    const skipPhase = useCallback(() => {
        const p = pomoRef.current;
        if (p.phase === 'idle') return;
        transitionPhase(p, Date.now());
    }, [transitionPhase]);

    const secondsForDay = useCallback(
        (dayKey) => entries.reduce((sum, e) => (isoDayKey(e.startedAt) === dayKey ? sum + (Number(e.seconds) || 0) : sum), 0),
        [entries]
    );

    const getFocusMinutes = useCallback((dayKey) => Math.round(secondsForDay(dayKey) / 60), [secondsForDay]);

    const getFocusMinutesWeek = useCallback(() => {
        const days = new Set(lastNDayKeys(7));
        const total = entries.reduce(
            (sum, e) => (days.has(isoDayKey(e.startedAt)) ? sum + (Number(e.seconds) || 0) : sum),
            0
        );
        return Math.round(total / 60);
    }, [entries]);

    const value = useMemo(
        () => ({
            timer,
            now,
            startTimer,
            pauseTimer,
            stopTimer,
            adjustTime,
            timerElapsed,
            totalSeconds,
            pomo,
            pomoSettings,
            savePomoSettings,
            startFocus,
            pausePomo,
            resumePomo,
            resetPomo,
            skipPhase,
            getFocusMinutes,
            getFocusMinutesWeek,
        }),
        [
            timer, now, startTimer, pauseTimer, stopTimer, adjustTime, timerElapsed,
            totalSeconds, pomo, pomoSettings, savePomoSettings, startFocus, pausePomo,
            resumePomo, resetPomo, skipPhase, getFocusMinutes, getFocusMinutesWeek,
        ]
    );

    return <TimeContext.Provider value={value}>{children}</TimeContext.Provider>;
}
