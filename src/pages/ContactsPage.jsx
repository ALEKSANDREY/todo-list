import { useState } from 'react';
import { useCrm } from '../contexts/CrmContext';

const EMPTY_FORM = { name: '', company: '', email: '', phone: '', notes: '', tags: '' };

function ContactModal({ initial, onClose, onSave }) {
    const [form, setForm] = useState(() => ({
        name: initial?.name || '',
        company: initial?.company || '',
        email: initial?.email || '',
        phone: initial?.phone || '',
        notes: initial?.notes || '',
        tags: (initial?.tags || []).join(', '),
    }));
    const [error, setError] = useState('');

    const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

    const handleSave = (e) => {
        e.preventDefault();
        if (!form.name.trim()) {
            setError('Name is required.');
            return;
        }
        onSave({
            name: form.name.trim(),
            company: form.company.trim(),
            email: form.email.trim(),
            phone: form.phone.trim(),
            notes: form.notes.trim(),
            tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean).slice(0, 10),
        });
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label={initial ? 'Edit contact' : 'Add contact'}>
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
            <form onSubmit={handleSave} className="card animate-enter relative w-full max-w-lg p-6 sm:p-8">
                <h3 className="text-xl font-extrabold tracking-tight text-slate-900">
                    {initial ? 'Edit contact' : 'Add contact'}
                </h3>
                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                        <label className="field-label" htmlFor="ct-name">Name *</label>
                        <input id="ct-name" className="input" value={form.name} onChange={set('name')} maxLength={80} autoFocus placeholder="Ada Lovelace" />
                    </div>
                    <div>
                        <label className="field-label" htmlFor="ct-company">Company</label>
                        <input id="ct-company" className="input" value={form.company} onChange={set('company')} maxLength={80} placeholder="Analytical Engines Inc." />
                    </div>
                    <div>
                        <label className="field-label" htmlFor="ct-phone">Phone</label>
                        <input id="ct-phone" className="input" value={form.phone} onChange={set('phone')} maxLength={40} placeholder="415-555-0100" />
                    </div>
                    <div className="sm:col-span-2">
                        <label className="field-label" htmlFor="ct-email">Email</label>
                        <input id="ct-email" type="email" className="input" value={form.email} onChange={set('email')} maxLength={120} placeholder="ada@example.com" />
                    </div>
                    <div className="sm:col-span-2">
                        <label className="field-label" htmlFor="ct-tags">Tags <span className="font-normal normal-case text-slate-400">(comma separated)</span></label>
                        <input id="ct-tags" className="input" value={form.tags} onChange={set('tags')} maxLength={120} placeholder="prospect, saas" />
                    </div>
                    <div className="sm:col-span-2">
                        <label className="field-label" htmlFor="ct-notes">Notes</label>
                        <textarea id="ct-notes" className="input resize-none" rows={3} value={form.notes} onChange={set('notes')} maxLength={500} placeholder="Context, last conversation, next step…" />
                    </div>
                </div>
                {error && <div className="error-banner mt-4" role="alert"><span>{error}</span></div>}
                <div className="mt-6 flex justify-end gap-2">
                    <button type="button" onClick={onClose} className="btn-ghost">Cancel</button>
                    <button type="submit" className="btn-primary">{initial ? 'Save changes' : 'Add contact'}</button>
                </div>
            </form>
        </div>
    );
}

function ContactCard({ contact, onEdit, onDelete }) {
    const [confirming, setConfirming] = useState(false);

    return (
        <div className="card card-hover animate-enter-1 flex flex-col p-5">
            <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                    <p className="truncate text-base font-extrabold tracking-tight text-slate-900">{contact.name}</p>
                    {contact.company && <p className="truncate text-sm font-medium text-slate-500">{contact.company}</p>}
                </div>
                <span className="logo-mark !h-9 !w-9 !rounded-xl text-sm font-extrabold">
                    {contact.name.charAt(0).toUpperCase()}
                </span>
            </div>

            {(contact.email || contact.phone) && (
                <div className="mt-3 space-y-1 text-sm">
                    {contact.email && (
                        <a href={`mailto:${contact.email}`} className="block truncate font-medium text-indigo-600 hover:text-indigo-800">
                            {contact.email}
                        </a>
                    )}
                    {contact.phone && (
                        <a href={`tel:${contact.phone}`} className="block font-medium text-indigo-600 hover:text-indigo-800">
                            {contact.phone}
                        </a>
                    )}
                </div>
            )}

            {contact.tags?.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                    {contact.tags.map((tag) => (
                        <span key={tag} className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-[0.7rem] font-bold text-indigo-700">
                            {tag}
                        </span>
                    ))}
                </div>
            )}

            {contact.notes && (
                <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-slate-600">{contact.notes}</p>
            )}

            <div className="mt-4 flex items-center gap-2 border-t border-slate-100 pt-3">
                <button type="button" onClick={onEdit} className="btn-ghost flex-1 px-3 py-1.5 text-xs">Edit</button>
                {confirming ? (
                    <>
                        <button type="button" onClick={() => onDelete(contact.id)} className="flex-1 rounded-xl bg-red-600 px-3 py-1.5 text-xs font-bold text-white transition-colors hover:bg-red-700">
                            Confirm
                        </button>
                        <button type="button" onClick={() => setConfirming(false)} className="btn-ghost px-3 py-1.5 text-xs">Keep</button>
                    </>
                ) : (
                    <button type="button" onClick={() => setConfirming(true)} className="flex-1 rounded-xl px-3 py-1.5 text-xs font-bold text-red-600 transition-colors hover:bg-red-50">
                        Delete
                    </button>
                )}
            </div>
        </div>
    );
}

export default function ContactsPage() {
    const { contacts, addContact, updateContact, deleteContact, loadSampleCrm } = useCrm();
    const [query, setQuery] = useState('');
    const [modal, setModal] = useState(null); // null | { mode: 'add' } | { mode: 'edit', contact }

    const term = query.trim().toLowerCase();
    const filtered = term
        ? contacts.filter((c) =>
            [c.name, c.company, c.email, c.phone, c.notes, (c.tags || []).join(' ')]
                .join(' ')
                .toLowerCase()
                .includes(term)
        )
        : contacts;

    return (
        <div className="mx-auto max-w-5xl">
            <div className="animate-enter mb-8 flex flex-wrap items-end justify-between gap-4">
                <div>
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-indigo-500">CRM-lite</p>
                    <h2 className="mt-2 text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
                        Your <span className="gradient-text">contacts</span>
                    </h2>
                    <p className="mt-2 text-sm text-slate-500">
                        People and companies behind your tasks and pipeline.
                    </p>
                </div>
                <button type="button" onClick={() => setModal({ mode: 'add' })} className="btn-primary">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="h-4 w-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                    Add contact
                </button>
            </div>

            {contacts.length > 0 && (
                <div className="animate-enter-1 mb-5">
                    <input
                        type="search"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search name, company, tag…"
                        className="input max-w-md"
                        aria-label="Search contacts"
                    />
                </div>
            )}

            {contacts.length === 0 ? (
                <div className="card animate-enter-2 p-10 text-center">
                    <p className="text-lg font-extrabold tracking-tight text-slate-900">No contacts yet</p>
                    <p className="mx-auto mt-2 max-w-sm text-sm text-slate-500">
                        Add the people you work with — link them to tasks and pipeline cards to keep every conversation in context.
                    </p>
                    <div className="mt-6 flex flex-wrap justify-center gap-2">
                        <button type="button" onClick={() => setModal({ mode: 'add' })} className="btn-primary">Add your first contact</button>
                        <button type="button" onClick={loadSampleCrm} className="btn-ghost">Load sample data</button>
                    </div>
                </div>
            ) : filtered.length === 0 ? (
                <div className="card animate-enter-2 p-10 text-center">
                    <p className="text-sm font-semibold text-slate-500">No contacts match “{query}”.</p>
                </div>
            ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {filtered.map((contact) => (
                        <ContactCard
                            key={contact.id}
                            contact={contact}
                            onEdit={() => setModal({ mode: 'edit', contact })}
                            onDelete={deleteContact}
                        />
                    ))}
                </div>
            )}

            {modal && (
                <ContactModal
                    initial={modal.mode === 'edit' ? modal.contact : null}
                    onClose={() => setModal(null)}
                    onSave={(data) => {
                        if (modal.mode === 'edit') updateContact(modal.contact.id, data);
                        else addContact(data);
                    }}
                />
            )}
        </div>
    );
}
