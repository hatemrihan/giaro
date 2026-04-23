'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Plus, Trash2, ChevronUp, ChevronDown, Pencil, Loader2, Upload, X } from 'lucide-react';
import { toast } from 'sonner';
import Image from 'next/image';

// ── Types ─────────────────────────────────────────────────────

interface Offer {
    id: string;
    title: string;
    description: string;
    image: string;
    link: string;
    is_active: boolean;
    show_on_home: boolean;
    show_pages: string[];
    display_order: number;
    created_at: string;
}

const PAGE_OPTIONS = [
    { key: 'homepage', label: 'Homepage' },
    { key: 'offers', label: 'Offers' },
    { key: 'shop', label: 'Shop' },
] as const;

// ── Page ──────────────────────────────────────────────────────

export default function AdminOffersPage() {
    const [offers, setOffers] = useState<Offer[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [togglingIds, setTogglingIds] = useState<Set<string>>(new Set());

    // Form state
    const [form, setForm] = useState({
        title: '',
        description: '',
        image: '',
        link: '/shop',
        is_active: true,
        show_pages: ['offers'] as string[],
    });
    const [editingId, setEditingId] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);
    const fileRef = useRef<HTMLInputElement>(null);

    // ── Fetch ─────────────────────────────────────────────────
    const fetchOffers = useCallback(async () => {
        try {
            setLoading(true);
            const res = await fetch('/api/admin/offers');
            if (!res.ok) throw new Error('Failed to fetch');
            const data = await res.json();
            setOffers(data);
        } catch {
            toast.error('Failed to load offers');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchOffers(); }, [fetchOffers]);

    // ── Image upload ──────────────────────────────────────────
    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (file.size > 50 * 1024 * 1024) { toast.error('File must be under 50MB'); return; }
        setUploading(true);
        try {
            const fd = new FormData();
            fd.append('file', file);
            fd.append('bucket', 'products');
            const res = await fetch('/api/admin/upload', { method: 'POST', body: fd });
            const data = await res.json();
            if (!res.ok || !data.success) throw new Error(data.error || 'Upload failed');
            setForm(f => ({ ...f, image: data.url }));
            toast.success('Image uploaded');
        } catch {
            toast.error('Upload failed');
        } finally {
            setUploading(false);
            if (fileRef.current) fileRef.current.value = '';
        }
    };

    // ── Toggle page in form ───────────────────────────────────
    const toggleFormPage = (page: string) => {
        setForm(f => ({
            ...f,
            show_pages: f.show_pages.includes(page)
                ? f.show_pages.filter(p => p !== page)
                : [...f.show_pages, page],
        }));
    };

    // ── Create / Update ───────────────────────────────────────
    const handleSubmit = async () => {
        if (!form.title.trim()) { toast.error('Title is required'); return; }
        setSaving(true);
        try {
            const payload = {
                ...form,
                show_on_home: form.show_pages.includes('homepage'),
            };
            if (editingId) {
                const res = await fetch('/api/admin/offers', {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id: editingId, ...payload }),
                });
                if (!res.ok) throw new Error();
                toast.success('Offer updated');
            } else {
                const res = await fetch('/api/admin/offers', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ ...payload, display_order: offers.length }),
                });
                if (!res.ok) throw new Error();
                toast.success('Offer created');
            }
            resetForm();
            fetchOffers();
        } catch {
            toast.error('Failed to save');
        } finally {
            setSaving(false);
        }
    };

    // ── Delete ─────────────────────────────────────────────────
    const handleDelete = async (id: string) => {
        if (!confirm('Delete this offer?')) return;
        try {
            const res = await fetch('/api/admin/offers', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id }),
            });
            if (!res.ok) throw new Error();
            toast.success('Offer deleted');
            fetchOffers();
        } catch {
            toast.error('Delete failed');
        }
    };

    // ── Toggle page tag on existing offer ─────────────────────
    const toggleOfferPage = async (offer: Offer, page: string) => {
        setTogglingIds(prev => new Set(prev).add(offer.id));
        const newPages = offer.show_pages.includes(page)
            ? offer.show_pages.filter(p => p !== page)
            : [...offer.show_pages, page];
        try {
            const res = await fetch('/api/admin/offers', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: offer.id,
                    show_pages: newPages,
                    show_on_home: newPages.includes('homepage'),
                }),
            });
            if (!res.ok) throw new Error();
            setOffers(prev => prev.map(o => o.id === offer.id ? { ...o, show_pages: newPages, show_on_home: newPages.includes('homepage') } : o));
        } catch {
            toast.error('Update failed');
        } finally {
            setTogglingIds(prev => { const s = new Set(prev); s.delete(offer.id); return s; });
        }
    };

    // ── Move order ────────────────────────────────────────────
    const moveOffer = async (index: number, direction: 'up' | 'down') => {
        const newOffers = [...offers];
        const swapIdx = direction === 'up' ? index - 1 : index + 1;
        if (swapIdx < 0 || swapIdx >= newOffers.length) return;
        [newOffers[index], newOffers[swapIdx]] = [newOffers[swapIdx], newOffers[index]];
        const reorder = newOffers.map((o, i) => ({ id: o.id, display_order: i }));
        setOffers(newOffers);
        try {
            await fetch('/api/admin/offers', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ reorder }),
            });
        } catch {
            toast.error('Reorder failed');
            fetchOffers();
        }
    };

    // ── Edit / Reset ──────────────────────────────────────────
    const startEdit = (offer: Offer) => {
        setEditingId(offer.id);
        setForm({
            title: offer.title,
            description: offer.description,
            image: offer.image,
            link: offer.link,
            is_active: offer.is_active,
            show_pages: offer.show_pages || [],
        });
        setShowForm(true);
    };

    const resetForm = () => {
        setEditingId(null);
        setShowForm(false);
        setForm({ title: '', description: '', image: '', link: '/shop', is_active: true, show_pages: ['offers'] });
    };

    // ── Render ─────────────────────────────────────────────────

    return (
        <div className="space-y-4 -mt-2">

            {/* Header — pushed down to align with sidebar logo */}
            <div className="flex items-center justify-between pt-[2px] mt-12">
                <div className="flex items-center gap-2.5">
                    <h1 className="text-base font-semibold text-white leading-none">Offers</h1>
                    <span className="text-sm text-white/30 leading-none">{offers.length}</span>
                </div>
                <button
                    onClick={() => { resetForm(); setShowForm(true); }}
                    className="flex items-center gap-2 px-4 py-2 bg-white text-black text-sm font-medium rounded hover:bg-white/90 transition-colors"
                >
                    <Plus className="h-4 w-4" />
                    Add
                </button>
            </div>

            {/* Create / Edit Form — smooth slide */}
            <div className={`grid transition-all duration-300 ease-in-out ${showForm ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                <div className="overflow-hidden">
                    <div className="bg-white/[0.04] border border-white/[0.06] rounded-lg p-5 space-y-5">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-white">{editingId ? 'Edit Offer' : 'New Offer'}</span>
                            <button onClick={resetForm} className="text-white/30 hover:text-white transition-colors">
                                <X className="h-4 w-4" />
                            </button>
                        </div>

                        <div>
                            <label className="text-sm text-white/40 mb-1 block">Title *</label>
                            <input
                                value={form.title}
                                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                                placeholder="Summer Sale"
                                className="w-full bg-white/[0.06] border border-white/[0.08] rounded-md px-3 py-2 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-white/20"
                            />
                        </div>

                        <div>
                            <label className="text-sm text-white/40 mb-1 block">Description</label>
                            <textarea
                                value={form.description}
                                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                                placeholder="30% off all products..."
                                rows={2}
                                className="w-full bg-white/[0.06] border border-white/[0.08] rounded-md px-3 py-2 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-white/20 resize-none"
                            />
                        </div>

                        {/* Image Upload */}
                        <div>
                            <label className="text-sm text-white/40 mb-2 block">Image</label>
                            <div className="flex items-center gap-4">
                                {form.image && (
                                    <div className="relative w-24 h-16 rounded overflow-hidden border border-white/[0.08] shrink-0">
                                        <Image src={form.image} alt="" fill className="object-cover" />
                                        <button
                                            onClick={() => setForm(f => ({ ...f, image: '' }))}
                                            className="absolute top-0 right-0 bg-black/70 p-0.5 rounded-bl"
                                        >
                                            <X className="h-4 w-4 text-white" />
                                        </button>
                                    </div>
                                )}
                                <button
                                    onClick={() => fileRef.current?.click()}
                                    disabled={uploading}
                                    className="flex items-center gap-2 px-3 py-2 bg-white/[0.06] border border-white/[0.08] rounded text-sm text-white/60 hover:text-white hover:bg-white/[0.08] transition-colors disabled:opacity-50"
                                >
                                    {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                                    {uploading ? 'Uploading...' : 'Upload'}
                                </button>
                                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                            </div>
                        </div>

                        {/* Page targeting — circle checkboxes */}
                        <div>
                            <label className="text-sm text-white/40 mb-2 block">Show on pages</label>
                            <div className="flex items-center gap-5">
                                {PAGE_OPTIONS.map(opt => {
                                    const checked = form.show_pages.includes(opt.key);
                                    return (
                                        <button
                                            key={opt.key}
                                            type="button"
                                            onClick={() => toggleFormPage(opt.key)}
                                            className="flex items-center gap-2 group"
                                        >
                                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-150 ${checked
                                                ? 'border-white bg-white'
                                                : 'border-white/25 group-hover:border-white/50'
                                                }`}>
                                                {checked && <div className="w-2 h-2 rounded-full bg-black" />}
                                            </div>
                                            <span className={`text-sm transition-colors ${checked ? 'text-white' : 'text-white/40 group-hover:text-white/60'}`}>
                                                {opt.label}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="flex items-center gap-3 pt-2">
                            <button
                                onClick={handleSubmit}
                                disabled={saving}
                                className="flex items-center gap-2 px-4 py-2 bg-white text-black text-sm font-medium rounded hover:bg-white/90 transition-colors disabled:opacity-50"
                            >
                                {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                                {editingId ? 'Update' : 'Create'}
                            </button>
                            <button onClick={resetForm} className="px-4 py-2 text-sm text-white/40 hover:text-white transition-colors">
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Offers List */}
            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="h-6 w-6 animate-spin text-white/25" />
                </div>
            ) : offers.length === 0 ? (
                <div className="text-center py-20 text-white/25 text-sm">
                    No offers yet
                </div>
            ) : (
                <div className="space-y-2">
                    {offers.map((offer, index) => {
                        const isToggling = togglingIds.has(offer.id);
                        return (
                            <div
                                key={offer.id}
                                className={`flex items-center gap-4 px-4 py-3 rounded-lg border transition-all duration-200 ${offer.is_active
                                    ? 'bg-white/[0.03] border-white/[0.06]'
                                    : 'bg-white/[0.01] border-white/[0.03] opacity-40'
                                    }`}
                            >
                                {/* Order controls */}
                                <div className="flex flex-col shrink-0 space-y-1">
                                    <button
                                        onClick={() => moveOffer(index, 'up')}
                                        disabled={index === 0}
                                        className="text-white/20 hover:text-white disabled:opacity-10 transition-colors p-px"
                                        title="Move up"
                                    >
                                        <ChevronUp className="h-4 w-4" />
                                    </button>
                                    <button
                                        onClick={() => moveOffer(index, 'down')}
                                        disabled={index === offers.length - 1}
                                        className="text-white/20 hover:text-white disabled:opacity-10 transition-colors p-px"
                                        title="Move down"
                                    >
                                        <ChevronDown className="h-4 w-4" />
                                    </button>
                                </div>

                                {/* Order number */}
                                <span className="text-sm text-white/20 font-mono w-4 text-center shrink-0">{index + 1}</span>

                                {/* Thumbnail */}
                                <div className="w-16 h-12 bg-white/[0.04] rounded overflow-hidden shrink-0 relative">
                                    {offer.image ? (
                                        <Image src={offer.image} alt="" fill className="object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-white/10 text-xs">IMG</div>
                                    )}
                                </div>

                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                    <span className="text-base font-medium text-white truncate block">{offer.title}</span>
                                    {offer.description && (
                                        <p className="text-sm text-white/30 truncate mt-0.5">{offer.description}</p>
                                    )}
                                </div>

                                {/* Page circles */}
                                {isToggling ? (
                                    <Loader2 className="h-4 w-4 animate-spin text-white/30 shrink-0" />
                                ) : (
                                    <div className="flex items-center gap-2 shrink-0">
                                        {PAGE_OPTIONS.map(opt => {
                                            const active = (offer.show_pages || []).includes(opt.key);
                                            return (
                                                <button
                                                    key={opt.key}
                                                    onClick={() => toggleOfferPage(offer, opt.key)}
                                                    title={`${active ? 'Remove from' : 'Add to'} ${opt.label}`}
                                                    className="flex items-center gap-1.5 group"
                                                >
                                                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all duration-150 ${active
                                                        ? 'border-white bg-white'
                                                        : 'border-white/15 group-hover:border-white/40'
                                                        }`}>
                                                        {active && <div className="w-1.5 h-1.5 rounded-full bg-black" />}
                                                    </div>
                                                    <span className={`text-xs transition-colors ${active ? 'text-white/70' : 'text-white/20 group-hover:text-white/40'}`}>
                                                        {opt.label.charAt(0)}
                                                    </span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                )}

                                {/* Edit / Delete */}
                                <div className="flex items-center gap-1 shrink-0 ml-4">
                                    <button
                                        onClick={() => startEdit(offer)}
                                        className="p-1.5 rounded text-white/15 hover:text-white/50 hover:bg-white/[0.04] transition-colors"
                                    >
                                        <Pencil className="h-4 w-4" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(offer.id)}
                                        className="p-1.5 rounded text-white/15 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
