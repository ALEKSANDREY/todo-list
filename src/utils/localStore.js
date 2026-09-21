// Tiny localStorage helpers shared by the power-pack features.
// Everything stays client-side; nothing here touches the network.

export function loadJSON(key, fallback) {
    try {
        const raw = window.localStorage.getItem(key);
        if (raw == null) return fallback;
        return JSON.parse(raw);
    } catch {
        return fallback;
    }
}

export function saveJSON(key, value) {
    try {
        window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
        // Storage unavailable (private mode, quota) — the app keeps working for this session.
    }
}

export function removeKey(key) {
    try {
        window.localStorage.removeItem(key);
    } catch {
        // ignore
    }
}

// Collision-resistant-enough id for client-created records.
export function uid() {
    return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
}
