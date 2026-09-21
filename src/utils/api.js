// API client for the Node backend (server/).
// Base URL comes from VITE_API_URL at build time; defaults to the local dev
// server. The backend authenticates with an httpOnly cookie, so every request
// uses credentials: 'include'. Throws ApiError with a human-friendly message.

const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:3001').replace(/\/+$/, '');

export class ApiError extends Error {
    constructor(status, message) {
        super(message);
        this.name = 'ApiError';
        this.status = status; // 0 = network unreachable, otherwise the HTTP status
    }
}

export function apiBase() {
    return API_BASE;
}

export async function api(path, { method = 'GET', body, signal } = {}) {
    let res;
    try {
        res = await fetch(`${API_BASE}${path}`, {
            method,
            credentials: 'include',
            signal,
            headers: { 'Content-Type': 'application/json' },
            body: body !== undefined ? JSON.stringify(body) : undefined,
        });
    } catch (err) {
        if (err && err.name === 'AbortError') throw err;
        throw new ApiError(
            0,
            'Cannot reach the backend server. Start it with `node server/index.js`, then reload.'
        );
    }
    let data = null;
    try {
        data = await res.json();
    } catch {
        // Non-JSON or empty body — handled below via res.ok.
    }
    if (!res.ok) {
        const message = (data && data.error) || `Request failed (HTTP ${res.status})`;
        throw new ApiError(res.status, message);
    }
    return data;
}
