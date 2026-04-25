'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Plus, Trash2, ChevronUp, ChevronDown, Pencil, Loader2, Upload, X, Search, Check } from 'lucide-react';
import { toast } from 'sonner';
import Image from 'next/image';

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
    product_ids: string[];
    discount_label: string;
    created_at: string;
}

interface Product {
    id: string;
    name: string;
    slug: string;
    main_image: string;
    price: number;
    original_price: number | null;
    categories: string[];
    is_active: boolean;
}

interface Category {
    id: string;
    name: string;
}

const PAGE_OPTIONS = [
    { key: 'homepage', label: 'Homepage' },
    { key: 'offers', label: 'Offers' },
    { key: 'shop', label: 'Shop' },
] as const;

export default function AdminOffersPage() {
    const [offers, setOffers] = useState<Offer[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [togglingIds, setTogglingIds] = useState<Set<string>>(new Set());

    // Products & categories for picker
    const [allProducts, setAllProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [productSearch, setProductSearch] = useState('');
    const [showProductPicker, setShowProductPicker] = useState(false);

    // Form state
    const [form, setForm] = useState({
        title: '',
        description: '',
        image: '',
        link: '/shop',
        is_active: true,
        show_pages: ['offers'] as string[],
        product_ids: [] as string[],
        discount_label: '',
    });
    const [editingId, setEditingId] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);
    const fileRef = useRef<HTMLInputElement>(null);
    const pickerRef = useRef<HTMLDivElement>(null);

    // ── Fetch offers ──────────────────────────────────────────
    const fetchOffers = useCallback(async () => {
        try {
            setLoading(true);
            const res = await fetch('/api/admin/offers');
            if (!res.ok) throw new Error();
            setOffers(await res.json());
        } catch { toast.error('Failed to load offers'); }
        finally { setLoading(false); }
    }, []);

    // ── Fetch products & categories ───────────────────────────
    const fetchProducts = useCallback(async () => {
        try {
            const res = await fetch('/api/products?limit=200');
            if (!res.ok) throw new Error();
            const data = await res.json();
            setAllProducts(Array.isArray(data) ? data : data.products || []);
        } catch { console.error('Failed to load products'); }
    }, []);

    const fetchCategories = useCallback(async () => {
        try {
            const res = await fetch('/api/categories');
            if (!res.ok) throw new Error();
            const data = await res.json();
            setCategories(Array.isArray(data) ? data : data.categories || []);
        } catch { console.error('Failed to load categories'); }
    }, []);

    useEffect(() => { fetchOffers(); fetchProducts(); fetchCategories(); }, [fetchOffers, fetchProducts, fetchCategories]);

    // Close picker on outside click
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) setShowProductPicker(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    // ── Filtered products ─────────────────────────────────────
    const filteredProducts = allProducts.filter(p => {
        if (selectedCategory && !(p.categories || []).includes(selectedCategory)) return false;
        if (productSearch && !p.name.toLowerCase().includes(productSearch.toLowerCase())) return false;
        return true;
    });

    const toggleProduct = (productId: string) => {
        setForm(f => ({
            ...f,
            product_ids: f.product_ids.includes(productId)
                ? f.product_ids.filter(id => id !== productId)
                : [...f.product_ids, productId],
        }));
    };

    // Auto-fill from first selected product
    const autoFillFromProduct = (product: Product) => {
        setForm(f => ({
            ...f,
            image: f.image || product.main_image,
            title: f.title || product.name,
            link: `/shop/${product.slug}`,
        }));
    };

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
        } catch { toast.error('Upload failed'); }
        finally { setUploading(false); if (fileRef.current) fileRef.current.value = ''; }
    };

    const toggleFormPage = (page: string) => {
        setForm(f => ({
            ...f,
            show_pages: f.show_pages.includes(page) ? f.show_pages.filter(p => p !== page) : [...f.show_pages, page],
        }));
    };

    // ── Create / Update ───────────────────────────────────────
    const handleSubmit = async () => {
        if (!form.title.trim() && form.product_ids.length === 0) { toast.error('Add a title or select products'); return; }
        setSaving(true);
        try {
            const payload = { ...form, show_on_home: form.show_pages.includes('homepage') };
            if (editingId) {
                const res = await fetch('/api/admin/offers', {
                    method: 'PATCH', headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id: editingId, ...payload }),
                });
                if (!res.ok) throw new Error();
                toast.success('Offer updated');
            } else {
                const res = await fetch('/api/admin/offers', {
                    method: 'POST', headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ ...payload, display_order: offers.length }),
                });
                if (!res.ok) throw new Error();
                toast.success('Offer created');
            }
            resetForm(); fetchOffers();
        } catch { toast.error('Failed to save'); }
        finally { setSaving(false); }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this offer?')) return;
        try {
            const res = await fetch('/api/admin/offers', {
                method: 'DELETE', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id }),
            });
            if (!res.ok) throw new Error();
            toast.success('Offer deleted'); fetchOffers();
        } catch { toast.error('Delete failed'); }
    };

    const toggleOfferPage = async (offer: Offer, page: string) => {
        setTogglingIds(prev => new Set(prev).add(offer.id));
        const newPages = offer.show_pages.includes(page)
            ? offer.show_pages.filter(p => p !== page)
            : [...offer.show_pages, page];
        try {
            const res = await fetch('/api/admin/offers', {
                method: 'PATCH', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: offer.id, show_pages: newPages, show_on_home: newPages.includes('homepage') }),
            });
            if (!res.ok) throw new Error();
            setOffers(prev => prev.map(o => o.id === offer.id ? { ...o, show_pages: newPages, show_on_home: newPages.includes('homepage') } : o));
        } catch { toast.error('Update failed'); }
        finally { setTogglingIds(prev => { const s = new Set(prev); s.delete(offer.id); return s; }); }
    };

    const moveOffer = async (index: number, direction: 'up' | 'down') => {
        const newOffers = [...offers];
        const swapIdx = direction === 'up' ? index - 1 : index + 1;
        if (swapIdx < 0 || swapIdx >= newOffers.length) return;
        [newOffers[index], newOffers[swapIdx]] = [newOffers[swapIdx], newOffers[index]];
        const reorder = newOffers.map((o, i) => ({ id: o.id, display_order: i }));
        setOffers(newOffers);
        try {
            await fetch('/api/admin/offers', {
                method: 'PATCH', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ reorder }),
            });
        } catch { toast.error('Reorder failed'); fetchOffers(); }
    };

    const startEdit = (offer: Offer) => {
        setEditingId(offer.id);
        setForm({
            title: offer.title,
            description: offer.description,
            image: offer.image,
            link: offer.link,
            is_active: offer.is_active,
            show_pages: offer.show_pages || [],
            product_ids: offer.product_ids || [],
            discount_label: offer.discount_label || '',
        });
        setShowForm(true);
    };

    const resetForm = () => {
        setEditingId(null);
        setShowForm(false);
        setShowProductPicker(false);
        setProductSearch('');
        setSelectedCategory('');
        setForm({ title: '', description: '', image: '', link: '/shop', is_active: true, show_pages: ['offers'], product_ids: [], discount_label: '' });
    };

    // Helper: get product by id
    const getProduct = (id: string) => allProducts.find(p => p.id === id);

    return (
        <div className="space-y-4 -mt-2">
            {/* Header */}
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

            {/* Form */}
            <div className={`grid transition-all duration-300 ease-in-out ${showForm ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                <div className="overflow-hidden">
                    <div className="bg-white/[0.04] border border-white/[0.06] rounded-lg p-5 space-y-5">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-white">{editingId ? 'Edit Offer' : 'New Offer'}</span>
                            <button onClick={resetForm} className="text-white/30 hover:text-white transition-colors"><X className="h-4 w-4" /></button>
                        </div>

                        {/* ── Product Picker ── */}
                        <div ref={pickerRef}>
                            <label className="text-sm text-white/40 mb-2 block">Select Products</label>

                            {/* Selected products chips */}
                            {form.product_ids.length > 0 && (
                                <div className="flex flex-wrap gap-2 mb-3">
                                    {form.product_ids.map(pid => {
                                        const p = getProduct(pid);
                                        return (
                                            <div key={pid} className="flex items-center gap-2 bg-white/[0.08] rounded-md px-2 py-1.5">
                                                {p?.main_image && (
                                                    <div className="w-6 h-6 rounded overflow-hidden relative shrink-0">
                                                        <Image src={p.main_image} alt="" fill className="object-cover" />
                                                    </div>
                                                )}
                                                <span className="text-xs text-white truncate max-w-[120px]">{p?.name || pid}</span>
                                                <button onClick={() => toggleProduct(pid)} className="text-white/30 hover:text-white"><X className="h-3 w-3" /></button>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}

                            {/* Search + category filter */}
                            <div className="flex gap-2">
                                <div className="relative flex-1">
                                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20" />
                                    <input
                                        value={productSearch}
                                        onChange={e => { setProductSearch(e.target.value); setShowProductPicker(true); }}
                                        onFocus={() => setShowProductPicker(true)}
                                        placeholder="Search products..."
                                        className="w-full bg-white/[0.06] border border-white/[0.08] rounded-md pl-8 pr-3 py-2 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-white/20"
                                    />
                                </div>
                                <select
                                    value={selectedCategory}
                                    onChange={e => { setSelectedCategory(e.target.value); setShowProductPicker(true); }}
                                    className="bg-white/[0.06] border border-white/[0.08] rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-white/20 max-w-[180px]"
                                >
                                    <option value="">All Categories</option>
                                    {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                                </select>
                            </div>

                            {/* Dropdown */}
                            {showProductPicker && (
                                <div className="mt-2 bg-[#1a1a1a] border border-white/[0.08] rounded-lg max-h-[240px] overflow-y-auto">
                                    {filteredProducts.length === 0 ? (
                                        <div className="px-4 py-6 text-center text-white/20 text-sm">No products found</div>
                                    ) : (
                                        filteredProducts.map(product => {
                                            const selected = form.product_ids.includes(product.id);
                                            return (
                                                <button
                                                    key={product.id}
                                                    onClick={() => { toggleProduct(product.id); if (!selected) autoFillFromProduct(product); }}
                                                    className={`w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-white/[0.06] transition-colors ${selected ? 'bg-white/[0.04]' : ''}`}
                                                >
                                                    <div className="w-10 h-10 rounded overflow-hidden relative shrink-0 bg-white/[0.04]">
                                                        {product.main_image && <Image src={product.main_image} alt="" fill className="object-cover" />}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <span className="text-sm text-white block truncate">{product.name}</span>
                                                        <span className="text-xs text-white/30">{product.price} EGP</span>
                                                    </div>
                                                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-all ${selected ? 'border-white bg-white' : 'border-white/20'}`}>
                                                        {selected && <Check className="h-3 w-3 text-black" />}
                                                    </div>
                                                </button>
                                            );
                                        })
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Discount Label */}
                        <div>
                            <label className="text-sm text-white/40 mb-1 block">Discount Label</label>
                            <input
                                value={form.discount_label}
                                onChange={e => setForm(f => ({ ...f, discount_label: e.target.value }))}
                                placeholder="e.g. 30% OFF"
                                className="w-full bg-white/[0.06] border border-white/[0.08] rounded-md px-3 py-2 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-white/20"
                            />
                        </div>

                        {/* Title */}
                        <div>
                            <label className="text-sm text-white/40 mb-1 block">Title</label>
                            <input
                                value={form.title}
                                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                                placeholder="Auto-filled from product or type custom"
                                className="w-full bg-white/[0.06] border border-white/[0.08] rounded-md px-3 py-2 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-white/20"
                            />
                        </div>

                        {/* Description */}
                        <div>
                            <label className="text-sm text-white/40 mb-1 block">Description</label>
                            <textarea
                                value={form.description}
                                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                                placeholder="Optional description..."
                                rows={2}
                                className="w-full bg-white/[0.06] border border-white/[0.08] rounded-md px-3 py-2 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-white/20 resize-none"
                            />
                        </div>

                        {/* Image Upload */}
                        <div>
                            <label className="text-sm text-white/40 mb-2 block">Image {form.product_ids.length > 0 && <span className="text-white/20">(auto-filled from product)</span>}</label>
                            <div className="flex items-center gap-4">
                                {form.image && (
                                    <div className="relative w-24 h-16 rounded overflow-hidden border border-white/[0.08] shrink-0">
                                        <Image src={form.image} alt="" fill className="object-cover" />
                                        <button onClick={() => setForm(f => ({ ...f, image: '' }))} className="absolute top-0 right-0 bg-black/70 p-0.5 rounded-bl">
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

                        {/* Page targeting */}
                        <div>
                            <label className="text-sm text-white/40 mb-2 block">Show on pages</label>
                            <div className="flex items-center gap-5">
                                {PAGE_OPTIONS.map(opt => {
                                    const checked = form.show_pages.includes(opt.key);
                                    return (
                                        <button key={opt.key} type="button" onClick={() => toggleFormPage(opt.key)} className="flex items-center gap-2 group">
                                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-150 ${checked ? 'border-white bg-white' : 'border-white/25 group-hover:border-white/50'}`}>
                                                {checked && <div className="w-2 h-2 rounded-full bg-black" />}
                                            </div>
                                            <span className={`text-sm transition-colors ${checked ? 'text-white' : 'text-white/40 group-hover:text-white/60'}`}>{opt.label}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Submit */}
                        <div className="flex items-center gap-3 pt-2">
                            <button onClick={handleSubmit} disabled={saving} className="flex items-center gap-2 px-4 py-2 bg-white text-black text-sm font-medium rounded hover:bg-white/90 transition-colors disabled:opacity-50">
                                {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                                {editingId ? 'Update' : 'Create'}
                            </button>
                            <button onClick={resetForm} className="px-4 py-2 text-sm text-white/40 hover:text-white transition-colors">Cancel</button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Offers List */}
            {loading ? (
                <div className="flex items-center justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-white/25" /></div>
            ) : offers.length === 0 ? (
                <div className="text-center py-20 text-white/25 text-sm">No offers yet</div>
            ) : (
                <div className="space-y-2">
                    {offers.map((offer, index) => {
                        const isToggling = togglingIds.has(offer.id);
                        const linkedProducts = (offer.product_ids || []).map(id => getProduct(id)).filter(Boolean);
                        return (
                            <div
                                key={offer.id}
                                className={`flex items-center gap-4 px-4 py-3 rounded-lg border transition-all duration-200 ${offer.is_active ? 'bg-white/[0.03] border-white/[0.06]' : 'bg-white/[0.01] border-white/[0.03] opacity-40'}`}
                            >
                                {/* Order controls */}
                                <div className="flex flex-col shrink-0 space-y-1">
                                    <button onClick={() => moveOffer(index, 'up')} disabled={index === 0} className="text-white/20 hover:text-white disabled:opacity-10 transition-colors p-px" title="Move up"><ChevronUp className="h-4 w-4" /></button>
                                    <button onClick={() => moveOffer(index, 'down')} disabled={index === offers.length - 1} className="text-white/20 hover:text-white disabled:opacity-10 transition-colors p-px" title="Move down"><ChevronDown className="h-4 w-4" /></button>
                                </div>

                                <span className="text-sm text-white/20 font-mono w-4 text-center shrink-0">{index + 1}</span>

                                {/* Thumbnail */}
                                <div className="w-16 h-12 bg-white/[0.04] rounded overflow-hidden shrink-0 relative">
                                    {offer.image ? <Image src={offer.image} alt="" fill className="object-cover" /> : <div className="w-full h-full flex items-center justify-center text-white/10 text-xs">IMG</div>}
                                </div>

                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                    <span className="text-base font-medium text-white truncate block">{offer.title}</span>
                                    <div className="flex items-center gap-2 mt-0.5">
                                        {offer.discount_label && <span className="text-xs px-1.5 py-0.5 bg-green-500/20 text-green-400 rounded">{offer.discount_label}</span>}
                                        {linkedProducts.length > 0 && <span className="text-xs text-white/30">{linkedProducts.length} product{linkedProducts.length > 1 ? 's' : ''}</span>}
                                        {!linkedProducts.length && offer.description && <p className="text-sm text-white/30 truncate">{offer.description}</p>}
                                    </div>
                                </div>

                                {/* Page circles */}
                                {isToggling ? (
                                    <Loader2 className="h-4 w-4 animate-spin text-white/30 shrink-0" />
                                ) : (
                                    <div className="flex items-center gap-2 shrink-0">
                                        {PAGE_OPTIONS.map(opt => {
                                            const active = (offer.show_pages || []).includes(opt.key);
                                            return (
                                                <button key={opt.key} onClick={() => toggleOfferPage(offer, opt.key)} title={`${active ? 'Remove from' : 'Add to'} ${opt.label}`} className="flex items-center gap-1.5 group">
                                                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all duration-150 ${active ? 'border-white bg-white' : 'border-white/15 group-hover:border-white/40'}`}>
                                                        {active && <div className="w-1.5 h-1.5 rounded-full bg-black" />}
                                                    </div>
                                                    <span className={`text-xs transition-colors ${active ? 'text-white/70' : 'text-white/20 group-hover:text-white/40'}`}>{opt.label.charAt(0)}</span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                )}

                                {/* Edit / Delete */}
                                <div className="flex items-center gap-1 shrink-0 ml-4">
                                    <button onClick={() => startEdit(offer)} className="p-1.5 rounded text-white/15 hover:text-white/50 hover:bg-white/[0.04] transition-colors"><Pencil className="h-4 w-4" /></button>
                                    <button onClick={() => handleDelete(offer.id)} className="p-1.5 rounded text-white/15 hover:text-red-400 hover:bg-red-500/10 transition-colors"><Trash2 className="h-4 w-4" /></button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
