/* eslint-disable react-refresh/only-export-components -- context file exporting provider + hook */
import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { api } from '../utils/api';
import { useAuth } from './AuthContext';
import { useTodo } from './TodoContext';

// CRM-lite: contacts + a customizable pipeline kanban, backed by the Node API.
// The server is the source of truth; the context keeps the same interface the
// pages already use. Empty foreign keys are '' client-side, null server-side.

const CrmContext = createContext();

export const DEFAULT_STAGES = [
    { id: 'new', name: 'New' },
    { id: 'contacted', name: 'Contacted' },
    { id: 'in-progress', name: 'In Progress' },
    { id: 'done', name: 'Done' },
];

const nullToEmpty = (v) => (v ?? '');

function toClientCard(card) {
    return { ...card, contactId: nullToEmpty(card.contactId), taskId: nullToEmpty(card.taskId) };
}

function toServerRef(v) {
    if (v === '' || v === null || v === undefined) return null;
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
}

export function useCrm() {
    const context = useContext(CrmContext);
    if (!context) throw new Error('useCrm must be used within a CrmProvider');
    return context;
}

export function CrmProvider({ children }) {
    const { user } = useAuth();
    const { todoList, upsertTask } = useTodo();
    const [contacts, setContacts] = useState([]);
    const [stages, setStages] = useState([]);
    const [cards, setCards] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchAll = useCallback(async () => {
        if (!user) return;
        setIsLoading(true);
        try {
            const [cData, pData] = await Promise.all([api('/api/contacts'), api('/api/pipeline')]);
            setContacts(cData.contacts || []);
            setStages(pData.stages || []);
            setCards((pData.cards || []).map(toClientCard));
        } catch {
            // Errors surface per-action; the lists simply stay as-is.
        } finally {
            setIsLoading(false);
        }
    }, [user]);

    useEffect(() => {
        fetchAll();
    }, [fetchAll]);

    /* ---------------- Contacts ---------------- */

    const addContact = useCallback(async (data) => {
        const saved = await api('/api/contacts', {
            method: 'POST',
            body: {
                name: data.name || '',
                company: data.company || '',
                email: data.email || '',
                phone: data.phone || '',
                notes: data.notes || '',
                tags: Array.isArray(data.tags) ? data.tags : [],
            },
        });
        setContacts((prev) => [saved, ...prev]);
        return saved.id;
    }, []);

    const updateContact = useCallback(async (id, patch) => {
        const saved = await api(`/api/contacts/${id}`, { method: 'PATCH', body: patch });
        setContacts((prev) => prev.map((c) => (c.id === id ? saved : c)));
    }, []);

    const deleteContact = useCallback(
        async (id) => {
            await api(`/api/contacts/${id}`, { method: 'DELETE' });
            setContacts((prev) => prev.filter((c) => c.id !== id));
            // Server unlinks cards + tasks; mirror the task unlink locally.
            for (const t of todoList) {
                if (t.contactId === id || String(t.contactId) === String(id)) {
                    upsertTask({ ...t, contactId: null });
                }
            }
            setCards((prev) => prev.map((card) => (card.contactId === id ? { ...card, contactId: '' } : card)));
        },
        [todoList, upsertTask]
    );

    const getContact = useCallback((id) => contacts.find((c) => c.id === id || String(c.id) === String(id)), [contacts]);

    /* ---------------- Pipeline stages ---------------- */

    const addStage = useCallback(async (name) => {
        const clean = name.trim().slice(0, 40);
        if (!clean) return null;
        const saved = await api('/api/pipeline/stages', { method: 'POST', body: { name: clean } });
        setStages((prev) => [...prev, saved]);
        return saved.id;
    }, []);

    const renameStage = useCallback(async (id, name) => {
        const clean = name.trim().slice(0, 40);
        if (!clean) return;
        const saved = await api(`/api/pipeline/stages/${id}`, { method: 'PATCH', body: { name: clean } });
        setStages((prev) => prev.map((s) => (s.id === id ? saved : s)));
    }, []);

    const deleteStage = useCallback(async (id) => {
        await api(`/api/pipeline/stages/${id}`, { method: 'DELETE' });
        // The server moves orphaned cards to the first remaining stage —
        // refetch so local cards match.
        const pData = await api('/api/pipeline');
        setStages(pData.stages || []);
        setCards((pData.cards || []).map(toClientCard));
    }, []);

    /* ---------------- Pipeline cards ---------------- */

    const addCard = useCallback(
        async (data) => {
            const saved = await api('/api/pipeline/cards', {
                method: 'POST',
                body: {
                    title: data.title || '',
                    stageId: toServerRef(data.stageId) ?? stages[0]?.id ?? null,
                    contactId: toServerRef(data.contactId),
                    taskId: toServerRef(data.taskId),
                    notes: data.notes || '',
                },
            });
            const client = toClientCard(saved);
            setCards((prev) => [client, ...prev]);
            return client.id;
        },
        [stages]
    );

    const updateCard = useCallback(async (id, patch) => {
        const body = { ...patch };
        if ('contactId' in body) body.contactId = toServerRef(body.contactId);
        if ('taskId' in body) body.taskId = toServerRef(body.taskId);
        if ('stageId' in body) body.stageId = toServerRef(body.stageId);
        const saved = await api(`/api/pipeline/cards/${id}`, { method: 'PATCH', body });
        const client = toClientCard(saved);
        setCards((prev) => prev.map((c) => (c.id === id ? client : c)));
    }, []);

    const moveCard = useCallback(
        async (cardId, stageId) => {
            await updateCard(cardId, { stageId });
        },
        [updateCard]
    );

    const deleteCard = useCallback(async (id) => {
        await api(`/api/pipeline/cards/${id}`, { method: 'DELETE' });
        setCards((prev) => prev.filter((c) => c.id !== id));
    }, []);

    const clearCrm = useCallback(async () => {
        // Reset to a blank CRM: no contacts, no cards, default stages.
        await Promise.all([
            ...cards.map((c) => api(`/api/pipeline/cards/${c.id}`, { method: 'DELETE' }).catch(() => null)),
            ...contacts.map((c) => api(`/api/contacts/${c.id}`, { method: 'DELETE' }).catch(() => null)),
        ]);
        const keep = stages[0];
        await Promise.all(
            stages.slice(1).map((s) => api(`/api/pipeline/stages/${s.id}`, { method: 'DELETE' }).catch(() => null))
        );
        if (keep) {
            await api(`/api/pipeline/stages/${keep.id}`, { method: 'PATCH', body: { name: 'New' } }).catch(() => null);
            for (const name of ['Contacted', 'In Progress', 'Done']) {
                await api('/api/pipeline/stages', { method: 'POST', body: { name } }).catch(() => null);
            }
        }
        await fetchAll();
    }, [cards, contacts, stages, fetchAll]);

    // One-click demo content so the board doesn't start as a blank slate.
    const loadSampleCrm = useCallback(async () => {
        const mkContact = (c) =>
            api('/api/contacts', {
                method: 'POST',
                body: { name: '', company: '', email: '', phone: '', notes: '', tags: [], ...c },
            });
        const [c1, c2, c3] = await Promise.all([
            mkContact({ name: 'Maya Chen', company: 'Northwind Labs', email: 'maya@northwindlabs.com', phone: '415-555-0132', notes: 'Interested in the new onboarding flow.', tags: ['prospect', 'saas'] }),
            mkContact({ name: 'Devon Park', company: 'Acme Co', email: 'devon@acme.co', notes: 'Met at the Vegas tech mixer — follow up about the intro call.', tags: ['networking'] }),
            mkContact({ name: 'Priya Nair', company: 'Brightline', email: 'priya@brightline.io', phone: '702-555-0188', notes: 'Decision maker for the team plan.', tags: ['client'] }),
        ]);
        const pData = await api('/api/pipeline');
        const stageId = (name) => (pData.stages.find((s) => s.name === name) || pData.stages[0] || {}).id;
        const mkCard = (title, st, contactId, notes = '') =>
            api('/api/pipeline/cards', {
                method: 'POST',
                body: { title, stageId: st, contactId: contactId || null, notes },
            });
        await Promise.all([
            mkCard('Send proposal follow-up', stageId('Contacted'), c1.id, 'Proposal sent last week — nudge before Friday.'),
            mkCard('Schedule intro call', stageId('New'), c2.id),
            mkCard('Draft onboarding checklist', stageId('In Progress'), c3.id),
            mkCard('Renew annual plan', stageId('Done'), c3.id, 'Closed — expansion opportunity in Q1.'),
            mkCard('Research competitor pricing', stageId('New'), null),
        ]);
        await fetchAll();
    }, [fetchAll]);

    const value = useMemo(
        () => ({
            contacts,
            isLoading,
            addContact,
            updateContact,
            deleteContact,
            getContact,
            stages,
            cards,
            addStage,
            renameStage,
            deleteStage,
            addCard,
            updateCard,
            moveCard,
            deleteCard,
            clearCrm,
            loadSampleCrm,
        }),
        [
            contacts, isLoading, addContact, updateContact, deleteContact, getContact,
            stages, cards, addStage, renameStage, deleteStage, addCard,
            updateCard, moveCard, deleteCard, clearCrm, loadSampleCrm,
        ]
    );

    return <CrmContext.Provider value={value}>{children}</CrmContext.Provider>;
}
