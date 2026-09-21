/* eslint-disable react-refresh/only-export-components -- context file exporting provider + hook */
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { loadJSON, saveJSON, uid } from '../utils/localStore';

// CRM-lite: contacts + a customizable pipeline kanban. Fully client-side,
// persisted in localStorage so it works in demo mode and offline.

const CrmContext = createContext();
const CONTACTS_KEY = 'powerpack-contacts-v1';
const PIPELINE_KEY = 'powerpack-pipeline-v1';

export const DEFAULT_STAGES = [
    { id: 'new', name: 'New' },
    { id: 'contacted', name: 'Contacted' },
    { id: 'in-progress', name: 'In Progress' },
    { id: 'done', name: 'Done' },
];

function loadPipeline() {
    const raw = loadJSON(PIPELINE_KEY, null);
    if (raw && Array.isArray(raw.stages) && raw.stages.length > 0 && Array.isArray(raw.cards)) {
        return raw;
    }
    return { stages: DEFAULT_STAGES, cards: [] };
}

export function useCrm() {
    const context = useContext(CrmContext);
    if (!context) throw new Error('useCrm must be used within a CrmProvider');
    return context;
}

export function CrmProvider({ children }) {
    const [contacts, setContacts] = useState(() => loadJSON(CONTACTS_KEY, []));
    const [pipeline, setPipeline] = useState(loadPipeline);

    useEffect(() => { saveJSON(CONTACTS_KEY, contacts); }, [contacts]);
    useEffect(() => { saveJSON(PIPELINE_KEY, pipeline); }, [pipeline]);

    /* ---------------- Contacts ---------------- */

    const addContact = useCallback((data) => {
        const contact = {
            id: uid(),
            name: '',
            company: '',
            email: '',
            phone: '',
            notes: '',
            tags: [],
            ...data,
        };
        setContacts((prev) => [contact, ...prev]);
        return contact.id;
    }, []);

    const updateContact = useCallback((id, patch) => {
        setContacts((prev) => prev.map((c) => (c.id === id ? { ...c, ...patch } : c)));
    }, []);

    const deleteContact = useCallback((id) => {
        setContacts((prev) => prev.filter((c) => c.id !== id));
        // Unlink pipeline cards; task links are pruned lazily on read.
        setPipeline((prev) => ({
            ...prev,
            cards: prev.cards.map((card) =>
                card.contactId === id ? { ...card, contactId: '' } : card
            ),
        }));
    }, []);

    const getContact = useCallback(
        (id) => contacts.find((c) => c.id === id),
        [contacts]
    );

    /* ---------------- Pipeline stages ---------------- */

    const addStage = useCallback((name) => {
        const stage = { id: uid(), name: name.trim().slice(0, 40) };
        setPipeline((prev) => ({ ...prev, stages: [...prev.stages, stage] }));
        return stage.id;
    }, []);

    const renameStage = useCallback((id, name) => {
        const clean = name.trim().slice(0, 40);
        if (!clean) return;
        setPipeline((prev) => ({
            ...prev,
            stages: prev.stages.map((s) => (s.id === id ? { ...s, name: clean } : s)),
        }));
    }, []);

    const deleteStage = useCallback((id) => {
        setPipeline((prev) => {
            const stages = prev.stages.filter((s) => s.id !== id);
            if (stages.length === 0) return prev; // never delete the last stage
            const fallback = stages[0].id;
            return {
                stages,
                cards: prev.cards.map((c) =>
                    c.stageId === id ? { ...c, stageId: fallback } : c
                ),
            };
        });
    }, []);

    /* ---------------- Pipeline cards ---------------- */

    const addCard = useCallback((data) => {
        const card = {
            id: uid(),
            title: '',
            stageId: '',
            contactId: '',
            taskId: '',
            notes: '',
            ...data,
        };
        setPipeline((prev) => ({
            ...prev,
            cards: [{ ...card, stageId: card.stageId || prev.stages[0]?.id || 'new' }, ...prev.cards],
        }));
        return card.id;
    }, []);

    const updateCard = useCallback((id, patch) => {
        setPipeline((prev) => ({
            ...prev,
            cards: prev.cards.map((c) => (c.id === id ? { ...c, ...patch } : c)),
        }));
    }, []);

    const moveCard = useCallback((cardId, stageId) => {
        setPipeline((prev) => ({
            ...prev,
            cards: prev.cards.map((c) => (c.id === cardId ? { ...c, stageId } : c)),
        }));
    }, []);

    const deleteCard = useCallback((id) => {
        setPipeline((prev) => ({ ...prev, cards: prev.cards.filter((c) => c.id !== id) }));
    }, []);

    const clearCrm = useCallback(() => {
        setContacts([]);
        setPipeline({ stages: DEFAULT_STAGES, cards: [] });
    }, []);

    // One-click demo content so the board doesn't start as a blank slate.
    const loadSampleCrm = useCallback(() => {
        const c1 = { id: uid(), name: 'Maya Chen', company: 'Northwind Labs', email: 'maya@northwindlabs.com', phone: '415-555-0132', notes: 'Interested in the new onboarding flow.', tags: ['prospect', 'saas'] };
        const c2 = { id: uid(), name: 'Devon Park', company: 'Acme Co', email: 'devon@acme.co', phone: '', notes: 'Met at the Vegas tech mixer — follow up about the intro call.', tags: ['networking'] };
        const c3 = { id: uid(), name: 'Priya Nair', company: 'Brightline', email: 'priya@brightline.io', phone: '702-555-0188', notes: 'Decision maker for the team plan.', tags: ['client'] };
        setContacts([c1, c2, c3]);
        const mk = (title, stageId, contactId, notes = '') => ({
            id: uid(), title, stageId, contactId, taskId: '', notes,
        });
        setPipeline({
            stages: DEFAULT_STAGES,
            cards: [
                mk('Send proposal follow-up', 'contacted', c1.id, 'Proposal sent last week — nudge before Friday.'),
                mk('Schedule intro call', 'new', c2.id),
                mk('Draft onboarding checklist', 'in-progress', c3.id),
                mk('Renew annual plan', 'done', c3.id, 'Closed — expansion opportunity in Q1.'),
                mk('Research competitor pricing', 'new', ''),
            ],
        });
    }, []);

    const value = {
        contacts,
        addContact,
        updateContact,
        deleteContact,
        getContact,
        stages: pipeline.stages,
        cards: pipeline.cards,
        addStage,
        renameStage,
        deleteStage,
        addCard,
        updateCard,
        moveCard,
        deleteCard,
        clearCrm,
        loadSampleCrm,
    };

    return <CrmContext.Provider value={value}>{children}</CrmContext.Provider>;
}
