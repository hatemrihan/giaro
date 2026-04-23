'use client';

import { useState, useEffect, useCallback } from 'react';
import {
    Loader2, Save, Store, Mail, Phone, Package,
    AlertTriangle,
} from 'lucide-react';
import { toast } from 'sonner';

// ── Types ─────────────────────────────────────────────────────

interface StoreSettings {
    store_name: string;
    store_email: string;
    store_phone: string;
    order_prefix: string;
    low_stock_threshold: number;
}

const defaults: StoreSettings = {
    store_name: '', store_email: '', store_phone: '',
    order_prefix: 'GR', low_stock_threshold: 5,
};

// ── Page ──────────────────────────────────────────────────────

export default function SettingsPage() {
    const [settings, setSettings] = useState<StoreSettings>(defaults);
    const [original, setOriginal] = useState<StoreSettings>(defaults);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const fetchSettings = useCallback(async () => {
        try {
            setLoading(true);
            const res = await fetch('/api/admin/settings');
            const data = await res.json();
            if (data.success && data.settings) {
                const s = data.settings;
                const mapped: StoreSettings = {
                    store_name: s.store_name || '',
                    store_email: s.store_email || '',
                    store_phone: s.store_phone || '',
                    order_prefix: s.order_prefix || 'GR',
                    low_stock_threshold: s.low_stock_threshold ?? 5,
                };
                setSettings(mapped);
                setOriginal(mapped);
            }
        } catch {
            toast.error('Failed to load settings');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchSettings(); }, [fetchSettings]);

    const hasChanges = JSON.stringify(settings) !== JSON.stringify(original);

    const handleSave = async () => {
        setSaving(true);
        const toastId = toast.loading('Saving...');
        try {
            const res = await fetch('/api/admin/settings', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(settings),
            });
            const data = await res.json();
            if (data.success) {
                setOriginal(settings);
                toast.success('Settings saved', { id: toastId, duration: 2000 });
            } else {
                toast.error(data.error || 'Failed to save', { id: toastId });
            }
        } catch {
            toast.error('Failed to save settings', { id: toastId });
        } finally {
            setSaving(false);
        }
    };

    const update = <K extends keyof StoreSettings>(key: K, value: StoreSettings[K]) => {
        setSettings(prev => ({ ...prev, [key]: value }));
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[60vh]">
                <Loader2 className="h-5 w-5 animate-spin text-white/20" />
            </div>
        );
    }

    return (
        <div className="mt-4 max-w-[640px]">

            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-[15px] font-semibold text-white leading-none">General Settings</h1>
                    <p className="text-[11px] text-white/25 mt-1.5">Store configuration & preferences</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={saving || !hasChanges}
                    className="flex items-center gap-1.5 px-4 py-2 bg-white text-black text-[12px] font-medium rounded hover:bg-white/90 transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                >
                    {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                    Save Changes
                </button>
            </div>

            {/* Unsaved indicator */}
            {hasChanges && (
                <div className="flex items-center gap-2 px-3 py-2 bg-amber-400/10 border border-amber-400/20 rounded-lg mb-6">
                    <AlertTriangle className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                    <span className="text-[11px] text-amber-400">You have unsaved changes</span>
                </div>
            )}

            {/* ── Store Identity ────────────────────────────────── */}
            <div className="space-y-6">
                <Section icon={Store} title="Store Identity" desc="Brand name and contact information">
                    <Field label="Store Name" desc="Displayed in headers, emails, and receipts">
                        <input
                            value={settings.store_name}
                            onChange={e => update('store_name', e.target.value)}
                            placeholder="Giaro"
                            className={inputClass}
                        />
                    </Field>
                    <div className="grid grid-cols-2 gap-3">
                        <Field label="Contact Email" icon={Mail}>
                            <input
                                type="email"
                                value={settings.store_email}
                                onChange={e => update('store_email', e.target.value)}
                                placeholder="support@giaro.com"
                                className={inputClass}
                            />
                        </Field>
                        <Field label="Contact Phone" icon={Phone}>
                            <input
                                value={settings.store_phone}
                                onChange={e => update('store_phone', e.target.value)}
                                placeholder="+20 100 000 0000"
                                className={inputClass}
                            />
                        </Field>
                    </div>
                </Section>

                {/* ── Order Preferences ─────────────────────────────── */}
                <Section icon={Package} title="Order & Stock" desc="Order numbering and stock alerts">
                    <div className="grid grid-cols-2 gap-3">
                        <Field label="Order Prefix" desc="Prefix for order numbers (e.g., GR-001)">
                            <input
                                value={settings.order_prefix}
                                onChange={e => update('order_prefix', e.target.value.toUpperCase().slice(0, 4))}
                                placeholder="GR"
                                maxLength={4}
                                className={inputClass}
                            />
                        </Field>
                        <Field label="Low Stock Alert" desc="Warn when stock falls below">
                            <div className="flex items-center gap-2">
                                <input
                                    type="number"
                                    min={0}
                                    max={100}
                                    value={settings.low_stock_threshold}
                                    onChange={e => update('low_stock_threshold', parseInt(e.target.value) || 0)}
                                    className={`${inputClass} w-20`}
                                />
                                <span className="text-[11px] text-white/30">units</span>
                            </div>
                        </Field>
                    </div>
                </Section>

                {/* ── Quick Links ─────────────────────────────────── */}
                <div className="bg-white/[0.03] border border-white/[0.06] rounded-lg p-5">
                    <span className="text-[11px] text-white/40 uppercase tracking-wider font-medium block mb-3">Other Settings</span>
                    <div className="grid grid-cols-2 gap-2">
                        <QuickLink icon={Package} label="Payment Methods" href="payment-settings" />
                        <QuickLink icon={Store} label="Shipping Zones" href="governorate-pricing" />
                        <QuickLink icon={Mail} label="Currency" href="currency-settings" />
                        <QuickLink icon={Package} label="Product Visibility" href="product-visibility" />
                    </div>
                </div>
            </div>
        </div>
    );
}

// ── Sub Components ────────────────────────────────────────────

const inputClass = "w-full bg-white/[0.06] border border-white/[0.08] rounded-md px-3 py-2 text-[12px] text-white placeholder:text-white/20 focus:outline-none focus:border-white/20 disabled:opacity-30 transition-colors";

function Section({ icon: Icon, title, desc, children }: {
    icon: React.ElementType; title: string; desc: string; children: React.ReactNode;
}) {
    return (
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-lg p-5 space-y-3">
            <div className="flex items-center gap-2.5 mb-1">
                <Icon className="h-4 w-4 text-white/30" />
                <div>
                    <h2 className="text-[13px] font-medium text-white leading-none">{title}</h2>
                    <p className="text-[10px] text-white/25 mt-0.5">{desc}</p>
                </div>
            </div>
            {children}
        </div>
    );
}

function Field({ label, desc, icon: Icon, children }: {
    label: string; desc?: string; icon?: React.ElementType; children: React.ReactNode;
}) {
    return (
        <div>
            <div className="flex items-center gap-1.5 mb-1">
                {Icon && <Icon className="h-3 w-3 text-white/20" />}
                <label className="text-[11px] text-white/40">{label}</label>
            </div>
            {desc && <p className="text-[9px] text-white/20 mb-1">{desc}</p>}
            {children}
        </div>
    );
}

function QuickLink({ icon: Icon, label, href }: { icon: React.ElementType; label: string; href: string }) {
    return (
        <a
            href={href}
            className="flex items-center gap-2 px-3 py-2 rounded-md bg-white/[0.02] border border-white/[0.04] hover:border-white/[0.1] hover:bg-white/[0.04] transition-colors group"
        >
            <Icon className="h-3.5 w-3.5 text-white/20 group-hover:text-white/40 transition-colors" />
            <span className="text-[11px] text-white/50 group-hover:text-white/70 transition-colors">{label}</span>
        </a>
    );
}
