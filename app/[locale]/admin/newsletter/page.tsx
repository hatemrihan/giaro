'use client';

import { useState, useEffect, useCallback } from 'react';
import { Loader2, Send, Trash2, Search, Mail, CheckCircle2, XCircle, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

interface Subscriber {
    id: string;
    email: string;
    subscribedAt: string;
    isActive: boolean;
    createdAt: string;
}

export default function AdminNewsletterPage() {
    const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [selected, setSelected] = useState<Set<string>>(new Set());
    const [selectAll, setSelectAll] = useState(false);

    // Compose form
    const [showCompose, setShowCompose] = useState(false);
    const [sendForm, setSendForm] = useState({ subject: '', heading: '', message: '' });
    const [recipientType, setRecipientType] = useState<'all' | 'selected'>('all');
    const [sending, setSending] = useState(false);

    const fetchSubscribers = useCallback(async () => {
        try {
            setLoading(true);
            const res = await fetch('/api/newsletter?limit=500');
            const data = await res.json();
            if (data.success) setSubscribers(data.subscribers);
        } catch {
            toast.error('Failed to load subscribers');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchSubscribers(); }, [fetchSubscribers]);

    const filtered = subscribers.filter(s =>
        s.email.toLowerCase().includes(search.toLowerCase())
    );

    const activeCount = subscribers.filter(s => s.isActive).length;
    const inactiveCount = subscribers.length - activeCount;

    // Selection
    const toggleSelect = (id: string) => {
        setSelected(prev => {
            const s = new Set(prev);
            if (s.has(id)) { s.delete(id); } else { s.add(id); }
            return s;
        });
    };

    const handleSelectAll = () => {
        if (selectAll) {
            setSelected(new Set());
        } else {
            setSelected(new Set(filtered.map(s => s.id)));
        }
        setSelectAll(!selectAll);
    };

    // Delete subscriber
    const handleDelete = async (email: string) => {
        if (!confirm(`Unsubscribe ${email}?`)) return;
        try {
            const res = await fetch('/api/newsletter', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, unsubscribe: true }),
            });
            if (res.ok) {
                toast.success('Unsubscribed');
                fetchSubscribers();
            }
        } catch {
            toast.error('Failed');
        }
    };

    // Send newsletter
    const handleSend = async () => {
        if (!sendForm.subject.trim() || !sendForm.heading.trim() || !sendForm.message.trim()) {
            toast.error('All fields are required');
            return;
        }
        if (recipientType === 'selected' && selected.size === 0) {
            toast.error('Select at least one recipient');
            return;
        }

        setSending(true);
        try {
            const payload: Record<string, unknown> = { ...sendForm, recipientType };
            if (recipientType === 'selected') {
                payload.selectedEmails = subscribers.filter(s => selected.has(s.id)).map(s => s.email);
            }

            const res = await fetch('/api/newsletter/send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            const data = await res.json();
            if (data.success) {
                toast.success(data.message || 'Newsletter sent!');
                setSendForm({ subject: '', heading: '', message: '' });
                setShowCompose(false);
            } else {
                toast.error(data.error || 'Failed to send');
            }
        } catch {
            toast.error('Send failed');
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="space-y-5 -mt-2">

            {/* Header */}
            <div className="flex items-center justify-between pt-[2px]">
                <div className="flex items-center gap-2.5">
                    <h1 className="text-[15px] font-semibold text-white leading-none">Subscribers</h1>
                    <span className="text-[11px] text-white/30 leading-none">{subscribers.length}</span>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={fetchSubscribers}
                        className="p-1.5 text-white/20 hover:text-white/50 transition-colors"
                    >
                        <RefreshCw className="h-3.5 w-3.5" />
                    </button>
                    <button
                        onClick={() => setShowCompose(!showCompose)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-white text-black text-[11px] font-medium rounded hover:bg-white/90 transition-colors"
                    >
                        <Send className="h-3.5 w-3.5" />
                        Compose
                    </button>
                </div>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-3">
                <div className="bg-white/[0.03] border border-white/[0.06] rounded-lg px-4 py-3">
                    <div className="text-xl font-semibold text-white">{subscribers.length}</div>
                    <div className="text-[10px] text-white/30 mt-0.5">Total</div>
                </div>
                <div className="bg-white/[0.03] border border-white/[0.06] rounded-lg px-4 py-3">
                    <div className="text-xl font-semibold text-green-400">{activeCount}</div>
                    <div className="text-[10px] text-white/30 mt-0.5">Active</div>
                </div>
                <div className="bg-white/[0.03] border border-white/[0.06] rounded-lg px-4 py-3">
                    <div className="text-xl font-semibold text-white/40">{inactiveCount}</div>
                    <div className="text-[10px] text-white/30 mt-0.5">Unsubscribed</div>
                </div>
            </div>

            {/* Compose form — smooth slide */}
            <div className={`grid transition-all duration-300 ease-in-out ${showCompose ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                <div className="overflow-hidden">
                    <div className="bg-white/[0.04] border border-white/[0.06] rounded-lg p-4 space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-[13px] font-medium text-white">Compose Newsletter</span>
                            <button onClick={() => setShowCompose(false)} className="text-white/30 hover:text-white transition-colors text-[11px]">✕</button>
                        </div>

                        <div>
                            <label className="text-[11px] text-white/40 mb-1 block">Subject *</label>
                            <input
                                value={sendForm.subject}
                                onChange={e => setSendForm(f => ({ ...f, subject: e.target.value }))}
                                placeholder="New arrivals this week"
                                className="w-full bg-white/[0.06] border border-white/[0.08] rounded-md px-3 py-2 text-[12px] text-white placeholder:text-white/20 focus:outline-none focus:border-white/20"
                            />
                        </div>

                        <div>
                            <label className="text-[11px] text-white/40 mb-1 block">Heading *</label>
                            <input
                                value={sendForm.heading}
                                onChange={e => setSendForm(f => ({ ...f, heading: e.target.value }))}
                                placeholder="Check out our latest collection"
                                className="w-full bg-white/[0.06] border border-white/[0.08] rounded-md px-3 py-2 text-[12px] text-white placeholder:text-white/20 focus:outline-none focus:border-white/20"
                            />
                        </div>

                        <div>
                            <label className="text-[11px] text-white/40 mb-1 block">Message *</label>
                            <textarea
                                value={sendForm.message}
                                onChange={e => setSendForm(f => ({ ...f, message: e.target.value }))}
                                placeholder="Write your newsletter content..."
                                rows={4}
                                className="w-full bg-white/[0.06] border border-white/[0.08] rounded-md px-3 py-2 text-[12px] text-white placeholder:text-white/20 focus:outline-none focus:border-white/20 resize-none"
                            />
                        </div>

                        {/* Recipient type */}
                        <div>
                            <label className="text-[11px] text-white/40 mb-1.5 block">Send to</label>
                            <div className="flex items-center gap-4">
                                {(['all', 'selected'] as const).map(type => (
                                    <button key={type} onClick={() => setRecipientType(type)} className="flex items-center gap-2 group">
                                        <div className={`w-4 h-4 rounded-full border-[1.5px] flex items-center justify-center transition-all duration-150 ${
                                            recipientType === type ? 'border-white bg-white' : 'border-white/25 group-hover:border-white/50'
                                        }`}>
                                            {recipientType === type && <div className="w-2 h-2 rounded-full bg-black" />}
                                        </div>
                                        <span className={`text-[12px] transition-colors ${recipientType === type ? 'text-white' : 'text-white/40'}`}>
                                            {type === 'all' ? `All active (${activeCount})` : `Selected (${selected.size})`}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="flex items-center gap-2 pt-1">
                            <button
                                onClick={handleSend}
                                disabled={sending}
                                className="flex items-center gap-1.5 px-4 py-2 bg-white text-black text-[11px] font-medium rounded hover:bg-white/90 transition-colors disabled:opacity-50"
                            >
                                {sending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
                                {sending ? 'Sending...' : 'Send Newsletter'}
                            </button>
                            <button onClick={() => setShowCompose(false)} className="px-4 py-2 text-[11px] text-white/40 hover:text-white transition-colors">
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Search */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-white/20" />
                <input
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Search subscribers..."
                    className="w-full bg-white/[0.04] border border-white/[0.06] rounded-lg pl-8 pr-3 py-2 text-[12px] text-white placeholder:text-white/20 focus:outline-none focus:border-white/15"
                />
            </div>

            {/* Subscribers list */}
            {loading ? (
                <div className="flex items-center justify-center py-16">
                    <Loader2 className="h-5 w-5 animate-spin text-white/25" />
                </div>
            ) : filtered.length === 0 ? (
                <div className="text-center py-16 text-white/25 text-[12px]">
                    {search ? 'No results' : 'No subscribers yet'}
                </div>
            ) : (
                <div className="space-y-px">
                    {/* Select all header */}
                    <div className="flex items-center gap-2.5 px-3 py-2">
                        <button onClick={handleSelectAll} className="flex items-center gap-2 group">
                            <div className={`w-3.5 h-3.5 rounded-[3px] border-[1.5px] flex items-center justify-center transition-all ${
                                selectAll ? 'border-white bg-white' : 'border-white/20 group-hover:border-white/40'
                            }`}>
                                {selectAll && <div className="w-2 h-2 bg-black rounded-[1px]" />}
                            </div>
                            <span className="text-[10px] text-white/30">Select all ({filtered.length})</span>
                        </button>
                    </div>

                    {filtered.map(sub => {
                        const isSelected = selected.has(sub.id);
                        return (
                            <div
                                key={sub.id}
                                className={`flex items-center gap-3 px-3 py-2 rounded-lg border transition-all duration-200 ${
                                    sub.isActive
                                        ? 'bg-white/[0.02] border-white/[0.05]'
                                        : 'bg-white/[0.01] border-white/[0.03] opacity-40'
                                }`}
                            >
                                <button onClick={() => toggleSelect(sub.id)} className="shrink-0 group">
                                    <div className={`w-3.5 h-3.5 rounded-[3px] border-[1.5px] flex items-center justify-center transition-all ${
                                        isSelected ? 'border-white bg-white' : 'border-white/15 group-hover:border-white/40'
                                    }`}>
                                        {isSelected && <div className="w-2 h-2 bg-black rounded-[1px]" />}
                                    </div>
                                </button>

                                <Mail className="h-3.5 w-3.5 text-white/15 shrink-0" />
                                <span className="text-[12px] text-white flex-1 truncate">{sub.email}</span>

                                {sub.isActive ? (
                                    <CheckCircle2 className="h-3 w-3 text-green-400/60 shrink-0" />
                                ) : (
                                    <XCircle className="h-3 w-3 text-white/20 shrink-0" />
                                )}

                                <span className="text-[10px] text-white/20 shrink-0">
                                    {new Date(sub.subscribedAt || sub.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                </span>

                                <button
                                    onClick={() => handleDelete(sub.email)}
                                    className="p-1 rounded text-white/10 hover:text-red-400 hover:bg-red-500/10 transition-colors shrink-0"
                                >
                                    <Trash2 className="h-3 w-3" />
                                </button>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
