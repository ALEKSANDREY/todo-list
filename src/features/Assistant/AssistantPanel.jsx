import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router';
import { useAssistant } from '../../contexts/AssistantContext';

const SUGGESTIONS = [
    'Prioritize my day',
    'Break down my biggest open task',
    'Draft a follow-up email for my hottest pipeline card',
];

function MessageBubble({ role, content }) {
    const isUser = role === 'user';
    return (
        <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
            <div
                className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                    isUser
                        ? 'rounded-br-md text-white shadow-[0_6px_16px_-6px_rgba(99,102,241,0.6)]'
                        : 'rounded-bl-md border border-slate-200/80 bg-white text-slate-800'
                }`}
                style={isUser ? { background: 'linear-gradient(135deg, var(--accent-from), var(--accent-to))' } : undefined}
            >
                {content}
            </div>
        </div>
    );
}

export default function AssistantPanel() {
    const {
        isOpen, closePanel, messages, sending, error, clearError,
        sendMessage, clearChat, hasKey,
    } = useAssistant();
    const [draft, setDraft] = useState('');
    const scrollRef = useRef(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, sending, isOpen]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!draft.trim() || sending) return;
        sendMessage(draft);
        setDraft('');
    };

    return (
        <>
            {/* Backdrop */}
            <div
                onClick={closePanel}
                aria-hidden="true"
                className={`fixed inset-0 z-[64] bg-slate-900/30 backdrop-blur-[2px] transition-opacity duration-300 ${
                    isOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
                }`}
            />
            {/* Slide-over */}
            <aside
                aria-label="AI assistant"
                className={`fixed right-0 top-0 z-[65] flex h-full w-full max-w-md flex-col border-l border-slate-200/80 bg-[#f7f9fd] shadow-[-24px_0_64px_-24px_rgba(15,23,42,0.35)] transition-transform duration-300 ease-out ${
                    isOpen ? 'translate-x-0' : 'translate-x-full'
                }`}
            >
                {/* Header */}
                <div className="flex items-center justify-between gap-3 border-b border-slate-200/70 bg-white/80 px-5 py-4 backdrop-blur">
                    <div>
                        <h2 className="text-base font-extrabold tracking-tight text-slate-900">Assistant</h2>
                        <p className="text-xs font-medium text-slate-500">
                            Workspace-aware · bring your own API key
                        </p>
                    </div>
                    <div className="flex items-center gap-1">
                        {messages.length > 0 && (
                            <button type="button" onClick={clearChat} className="btn-ghost px-3 py-1.5 text-xs">
                                Clear
                            </button>
                        )}
                        <button
                            type="button"
                            onClick={closePanel}
                            aria-label="Close assistant"
                            className="rounded-xl p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="h-5 w-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Messages */}
                <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-5 py-5">
                    {!hasKey && (
                        <div className="card animate-enter p-5">
                            <p className="text-sm font-bold text-slate-900">Connect your AI key to start</p>
                            <p className="mt-1 text-sm leading-relaxed text-slate-600">
                                The assistant uses your own OpenAI-compatible API key. It is stored
                                only in this browser and sent only to the API endpoint you configure.
                            </p>
                            <Link to="/settings" onClick={closePanel} className="btn-primary mt-4 w-full px-4 py-2.5 text-sm">
                                Open Settings
                            </Link>
                        </div>
                    )}

                    {hasKey && messages.length === 0 && (
                        <div className="animate-enter">
                            <div className="card p-5">
                                <p className="text-sm font-bold text-slate-900">What should we tackle first?</p>
                                <p className="mt-1 text-sm leading-relaxed text-slate-600">
                                    I can see your open tasks, contacts, and pipeline — ask me to
                                    prioritize, break work down, or draft a follow-up.
                                </p>
                            </div>
                            <div className="mt-3 flex flex-wrap gap-2">
                                {SUGGESTIONS.map((s) => (
                                    <button
                                        key={s}
                                        type="button"
                                        onClick={() => sendMessage(s)}
                                        disabled={sending}
                                        className="rounded-full border border-indigo-200 bg-indigo-50/70 px-3.5 py-1.5 text-xs font-semibold text-indigo-700 transition-all hover:border-indigo-300 hover:bg-indigo-100 disabled:opacity-50"
                                    >
                                        {s}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {messages.map((m, i) => (
                        <MessageBubble key={`${i}-${m.role}`} role={m.role} content={m.content} />
                    ))}

                    {sending && (
                        <div className="flex justify-start">
                            <div className="flex items-center gap-2 rounded-2xl rounded-bl-md border border-slate-200/80 bg-white px-4 py-3">
                                <span className="spinner !h-4 !w-4 !border-2" />
                                <span className="text-xs font-semibold text-slate-500">Thinking…</span>
                            </div>
                        </div>
                    )}

                    {error && (
                        <div className="error-banner" role="alert">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-5 w-5 shrink-0">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
                            </svg>
                            <span className="flex-1">{error}</span>
                            <button type="button" onClick={clearError} className="font-bold underline underline-offset-2">Dismiss</button>
                        </div>
                    )}
                </div>

                {/* Composer */}
                <form onSubmit={handleSubmit} className="border-t border-slate-200/70 bg-white/80 px-5 py-4 backdrop-blur">
                    <div className="flex items-end gap-2">
                        <textarea
                            value={draft}
                            onChange={(e) => setDraft(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSubmit(e);
                                }
                            }}
                            placeholder={hasKey ? 'Ask about your tasks, contacts, pipeline…' : 'Add an API key in Settings to chat'}
                            rows={2}
                            disabled={!hasKey || sending}
                            className="input resize-none"
                        />
                        <button type="submit" disabled={!hasKey || sending || !draft.trim()} className="btn-primary shrink-0 px-4 py-2.5" aria-label="Send message">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.2} stroke="currentColor" className="h-5 w-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.126A59.768 59.768 0 0 1 21.485 12 59.77 59.77 0 0 1 3.27 20.876L5.999 12Zm0 0h7.5" />
                            </svg>
                        </button>
                    </div>
                    <p className="mt-2 text-[0.7rem] leading-relaxed text-slate-400">
                        Conversations stay in this tab. Your key never leaves your browser except to your configured API endpoint.
                    </p>
                </form>
            </aside>
        </>
    );
}
