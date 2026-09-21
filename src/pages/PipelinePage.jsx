import { useState } from 'react';
import { useCrm } from '../contexts/CrmContext';
import { useTodo } from '../contexts/TodoContext';

function CardModal({ initial, stages, onClose, onSave, onDelete }) {
    const { contacts } = useCrm();
    const { todoList } = useTodo();
    const [form, setForm] = useState(() => ({
        title: initial?.title || '',
        stageId: initial?.stageId || stages[0]?.id || '',
        contactId: initial?.contactId || '',
        taskId: initial?.taskId || '',
        notes: initial?.notes || '',
    }));
    const [error, setError] = useState('');

    const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

    const handleSave = (e) => {
        e.preventDefault();
        if (!form.title.trim()) {
            setError('Card title is required.');
            return;
        }
        onSave({
            title: form.title.trim(),
            stageId: form.stageId,
            contactId: form.contactId,
            taskId: form.taskId,
            notes: form.notes.trim(),
        });
        onClose();
    };

    const openTasks = todoList.filter((t) => !t.isCompleted);

    return (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label={initial ? 'Edit card' : 'Add card'}>
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
            <form onSubmit={handleSave} className="card animate-enter relative w-full max-w-lg p-6 sm:p-8">
                <h3 className="text-xl font-extrabold tracking-tight text-slate-900">
                    {initial ? 'Edit card' : 'Add card'}
                </h3>
                <div className="mt-5 grid gap-4">
                    <div>
                        <label className="field-label" htmlFor="pc-title">Title *</label>
                        <input id="pc-title" className="input" value={form.title} onChange={set('title')} maxLength={100} autoFocus placeholder="What needs to move forward?" />
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                            <label className="field-label" htmlFor="pc-stage">Stage</label>
                            <select id="pc-stage" className="select" value={form.stageId} onChange={set('stageId')}>
                                {stages.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="field-label" htmlFor="pc-contact">Contact</label>
                            <select id="pc-contact" className="select" value={form.contactId} onChange={set('contactId')}>
                                <option value="">— None —</option>
                                {contacts.map((c) => <option key={c.id} value={c.id}>{c.name}{c.company ? ` · ${c.company}` : ''}</option>)}
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="field-label" htmlFor="pc-task">Linked task</label>
                        <select id="pc-task" className="select" value={form.taskId} onChange={set('taskId')}>
                            <option value="">— Standalone card —</option>
                            {openTasks.map((t) => <option key={t.id} value={t.id}>{t.title}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="field-label" htmlFor="pc-notes">Notes</label>
                        <textarea id="pc-notes" className="input resize-none" rows={3} value={form.notes} onChange={set('notes')} maxLength={500} placeholder="Next step, context, blockers…" />
                    </div>
                </div>
                {error && <div className="error-banner mt-4" role="alert"><span>{error}</span></div>}
                <div className="mt-6 flex items-center justify-between">
                    {initial ? (
                        <button type="button" onClick={() => { onDelete(initial.id); onClose(); }} className="rounded-xl px-3 py-2 text-xs font-bold text-red-600 transition-colors hover:bg-red-50">
                            Delete card
                        </button>
                    ) : <span />}
                    <div className="flex gap-2">
                        <button type="button" onClick={onClose} className="btn-ghost">Cancel</button>
                        <button type="submit" className="btn-primary">{initial ? 'Save changes' : 'Add card'}</button>
                    </div>
                </div>
            </form>
        </div>
    );
}

function PipelineCard({ card, stageIndex, stageCount, onMove, onEdit }) {
    const { getContact } = useCrm();
    const { todoList } = useTodo();
    const contact = card.contactId ? getContact(card.contactId) : null;
    const linkedTask = card.taskId ? todoList.find((t) => String(t.id) === String(card.taskId)) : null;

    return (
        <div
            draggable
            onDragStart={(e) => {
                e.dataTransfer.setData('text/plain', card.id);
                e.dataTransfer.effectAllowed = 'move';
            }}
            onClick={() => onEdit(card)}
            className="cursor-grab rounded-2xl border border-slate-200/80 bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.05)] transition-all hover:-translate-y-px hover:border-indigo-200 hover:shadow-[0_10px_24px_-10px_rgba(99,102,241,0.25)] active:cursor-grabbing"
        >
            <p className="text-sm font-bold leading-snug text-slate-900">{card.title}</p>
            {(contact || linkedTask) && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                    {contact && (
                        <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-[0.7rem] font-bold text-indigo-700">👤 {contact.name}</span>
                    )}
                    {linkedTask && (
                        <span className={`rounded-full px-2 py-0.5 text-[0.7rem] font-bold ${linkedTask.isCompleted ? 'bg-emerald-50 text-emerald-700' : 'bg-sky-50 text-sky-700'}`}>
                            ✓ {linkedTask.isCompleted ? 'Done' : 'Task'}
                        </span>
                    )}
                </div>
            )}
            {card.notes && <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-slate-500">{card.notes}</p>}
            <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2" onClick={(e) => e.stopPropagation()}>
                <button
                    type="button"
                    disabled={stageIndex === 0}
                    onClick={() => onMove(card.id, -1)}
                    aria-label="Move to previous stage"
                    className="rounded-lg px-2 py-1 text-sm font-bold text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800 disabled:opacity-30"
                >←</button>
                <span className="text-[0.65rem] font-bold uppercase tracking-widest text-slate-300">drag or move</span>
                <button
                    type="button"
                    disabled={stageIndex === stageCount - 1}
                    onClick={() => onMove(card.id, 1)}
                    aria-label="Move to next stage"
                    className="rounded-lg px-2 py-1 text-sm font-bold text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800 disabled:opacity-30"
                >→</button>
            </div>
        </div>
    );
}

function StageManager({ stages, onAdd, onRename, onDelete }) {
    const [adding, setAdding] = useState(false);
    const [newName, setNewName] = useState('');
    const [editingId, setEditingId] = useState(null);
    const [editName, setEditName] = useState('');

    const commitAdd = () => {
        if (newName.trim()) onAdd(newName);
        setNewName('');
        setAdding(false);
    };
    const commitRename = (id) => {
        onRename(id, editName);
        setEditingId(null);
    };

    return (
        <div className="card animate-enter-1 mb-5 p-4">
            <div className="flex flex-wrap items-center gap-2">
                <span className="field-label !mb-0 mr-1">Stages</span>
                {stages.map((s) => (
                    <span key={s.id} className="flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 py-1 pl-3 pr-1.5">
                        {editingId === s.id ? (
                            <input
                                value={editName}
                                onChange={(e) => setEditName(e.target.value)}
                                onBlur={() => commitRename(s.id)}
                                onKeyDown={(e) => { if (e.key === 'Enter') commitRename(s.id); if (e.key === 'Escape') setEditingId(null); }}
                                autoFocus
                                maxLength={40}
                                className="w-28 bg-transparent text-xs font-bold text-slate-800 outline-none"
                                aria-label="Stage name"
                            />
                        ) : (
                            <button
                                type="button"
                                onClick={() => { setEditingId(s.id); setEditName(s.name); }}
                                title="Rename stage"
                                className="text-xs font-bold text-slate-700 hover:text-indigo-700"
                            >
                                {s.name}
                            </button>
                        )}
                        {stages.length > 1 && (
                            <button
                                type="button"
                                onClick={() => onDelete(s.id)}
                                title="Delete stage (cards move to the first stage)"
                                aria-label={`Delete stage ${s.name}`}
                                className="rounded-full p-1 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="h-3 w-3">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                                </svg>
                            </button>
                        )}
                    </span>
                ))}
                {adding ? (
                    <span className="flex items-center gap-1">
                        <input
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                            onKeyDown={(e) => { if (e.key === 'Enter') commitAdd(); if (e.key === 'Escape') setAdding(false); }}
                            autoFocus
                            maxLength={40}
                            placeholder="Stage name"
                            className="input !w-36 !py-1.5 !text-xs"
                            aria-label="New stage name"
                        />
                        <button type="button" onClick={commitAdd} className="btn-primary !px-3 !py-1.5 !text-xs">Add</button>
                    </span>
                ) : (
                    <button type="button" onClick={() => setAdding(true)} className="btn-ghost !px-3 !py-1.5 !text-xs">+ Stage</button>
                )}
            </div>
        </div>
    );
}

export default function PipelinePage() {
    const {
        stages, cards, addStage, renameStage, deleteStage,
        addCard, updateCard, moveCard, deleteCard, loadSampleCrm,
    } = useCrm();
    const [modal, setModal] = useState(null); // null | { mode:'add', stageId } | { mode:'edit', card }
    const [dragOver, setDragOver] = useState(null);

    const moveByDelta = (cardId, delta) => {
        const card = cards.find((c) => c.id === cardId);
        if (!card) return;
        const idx = stages.findIndex((s) => s.id === card.stageId);
        const next = stages[idx + delta];
        if (next) moveCard(cardId, next.id);
    };

    return (
        <div className="mx-auto max-w-7xl">
            <div className="animate-enter mb-6 flex flex-wrap items-end justify-between gap-4">
                <div>
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-indigo-500">CRM-lite</p>
                    <h2 className="mt-2 text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
                        Deal <span className="gradient-text">pipeline</span>
                    </h2>
                    <p className="mt-2 text-sm text-slate-500">
                        Drag cards between stages, or use the arrows. Click a card to edit.
                    </p>
                </div>
                {cards.length === 0 && (
                    <button type="button" onClick={loadSampleCrm} className="btn-ghost">Load sample data</button>
                )}
            </div>

            <StageManager stages={stages} onAdd={addStage} onRename={renameStage} onDelete={deleteStage} />

            {cards.length === 0 ? (
                <div className="card animate-enter-2 p-10 text-center">
                    <p className="text-lg font-extrabold tracking-tight text-slate-900">Your pipeline is empty</p>
                    <p className="mx-auto mt-2 max-w-sm text-sm text-slate-500">
                        Add cards for opportunities, follow-ups, or anything moving through stages. Cards can link to contacts and tasks, or stand alone.
                    </p>
                </div>
            ) : (
                <div className="animate-enter-2 flex snap-x gap-4 overflow-x-auto pb-4">
                    {stages.map((stage, stageIndex) => {
                        const inStage = cards.filter((c) => c.stageId === stage.id);
                        return (
                            <section
                                key={stage.id}
                                onDragOver={(e) => { e.preventDefault(); setDragOver(stage.id); }}
                                onDragLeave={() => setDragOver((v) => (v === stage.id ? null : v))}
                                onDrop={(e) => {
                                    e.preventDefault();
                                    const cardId = e.dataTransfer.getData('text/plain');
                                    if (cardId) moveCard(cardId, stage.id);
                                    setDragOver(null);
                                }}
                                className={`w-72 shrink-0 snap-start rounded-3xl border p-3 transition-colors ${
                                    dragOver === stage.id
                                        ? 'border-indigo-300 bg-indigo-50/60'
                                        : 'border-slate-200/70 bg-slate-100/50'
                                }`}
                                aria-label={`${stage.name} column`}
                            >
                                <header className="flex items-center justify-between px-2 pb-3 pt-1">
                                    <h3 className="text-sm font-extrabold tracking-tight text-slate-800">{stage.name}</h3>
                                    <span className="rounded-full bg-white px-2.5 py-0.5 text-xs font-bold text-slate-500 shadow-sm">{inStage.length}</span>
                                </header>
                                <div className="space-y-2.5">
                                    {inStage.map((card) => (
                                        <PipelineCard
                                            key={card.id}
                                            card={card}
                                            stageIndex={stageIndex}
                                            stageCount={stages.length}
                                            onMove={moveByDelta}
                                            onEdit={(c) => setModal({ mode: 'edit', card: c })}
                                        />
                                    ))}
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setModal({ mode: 'add', stageId: stage.id })}
                                    className="mt-2.5 w-full rounded-2xl border-2 border-dashed border-slate-200 py-2.5 text-xs font-bold text-slate-400 transition-all hover:border-indigo-300 hover:text-indigo-600"
                                >
                                    + Add card
                                </button>
                            </section>
                        );
                    })}
                </div>
            )}

            {modal && (
                <CardModal
                    initial={modal.mode === 'edit' ? modal.card : null}
                    stages={stages}
                    onClose={() => setModal(null)}
                    onSave={(data) => {
                        if (modal.mode === 'edit') updateCard(modal.card.id, data);
                        else addCard({ ...data, stageId: modal.stageId });
                    }}
                    onDelete={deleteCard}
                />
            )}
        </div>
    );
}
