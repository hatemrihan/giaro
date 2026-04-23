'use client';

import { useState, useEffect } from 'react';
import { Loader2, DollarSign, Check } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';

// ── Currencies ────────────────────────────────────────────────

const currencies = [
    { code: 'EGP', symbol: 'E£', name: 'Egyptian Pound', flag: '🇪🇬' },
    { code: 'SAR', symbol: 'ر.س', name: 'Saudi Riyal', flag: '🇸🇦' },
    { code: 'AED', symbol: 'د.إ', name: 'UAE Dirham', flag: '🇦🇪' },
] as const;

type CurrencyCode = 'EGP' | 'SAR' | 'AED';

// ── Page ──────────────────────────────────────────────────────

export default function CurrencySettingsPage() {
    const [defaultCurrency, setDefaultCurrency] = useState<CurrencyCode>('EGP');
    const [selectedCurrency, setSelectedCurrency] = useState<CurrencyCode>('EGP');
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => { fetchCurrencySettings(); }, []);

    const fetchCurrencySettings = async () => {
        try {
            setIsLoading(true);
            const res = await fetch('/api/admin/currency-settings');
            const data = await res.json();
            if (data.success) {
                setDefaultCurrency(data.settings.defaultCurrency);
                setSelectedCurrency(data.settings.defaultCurrency);
            }
        } catch {
            toast.error('Failed to load currency settings');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async () => {
        if (selectedCurrency === defaultCurrency || isSaving) return;
        setIsSaving(true);
        const toastId = toast.loading('Saving…');
        try {
            const res = await fetch('/api/admin/currency-settings', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ defaultCurrency: selectedCurrency }),
            });
            const data = await res.json();
            if (data.success) {
                setDefaultCurrency(selectedCurrency);
                toast.success('Currency updated', { id: toastId, duration: 2000 });
            } else {
                toast.error('Failed to update', { id: toastId });
            }
        } catch {
            toast.error('An error occurred', { id: toastId });
        } finally {
            setIsSaving(false);
        }
    };

    // ── Loading ───────────────────────────────────────────────
    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-[60vh]">
                <div className="flex flex-col items-center gap-3">
                    <Loader2 className="h-5 w-5 animate-spin text-stone-500" />
                    <span className="text-[13px] text-stone-500">Loading currency settings…</span>
                </div>
            </div>
        );
    }

    const hasChanges = selectedCurrency !== defaultCurrency;
    const activeCurrency = currencies.find(c => c.code === defaultCurrency);

    return (
        <div className="text-white max-w-4xl">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <div className="text-[13px] text-stone-500 mb-1">Settings</div>
                    <h1 className="text-xl font-semibold text-white">Currency Settings</h1>
                </div>
                <Button
                    onClick={handleSave}
                    disabled={!hasChanges || isSaving}
                    className="bg-white text-stone-900 hover:bg-stone-200 text-[13px] font-medium h-9 gap-1.5 disabled:opacity-30"
                >
                    {isSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
                    Save
                </Button>
            </div>

            {/* Current */}
            <div className="bg-stone-800/40 border border-stone-800/60 rounded-xl p-5 mb-6">
                <div className="flex items-center gap-4">
                    <div className="w-11 h-11 rounded-xl bg-green-500/10 flex items-center justify-center">
                        <DollarSign className="h-5 w-5 text-green-400" />
                    </div>
                    <div>
                        <p className="text-[11px] text-stone-500 uppercase tracking-wider font-medium">Current Default</p>
                        <p className="text-[15px] font-medium text-white mt-0.5">
                            {activeCurrency?.flag} {activeCurrency?.symbol} {defaultCurrency} — {activeCurrency?.name}
                        </p>
                    </div>
                </div>
            </div>

            {/* Currency Selector */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {currencies.map((currency) => {
                    const isSelected = selectedCurrency === currency.code;
                    return (
                        <button
                            key={currency.code}
                            onClick={() => !isSaving && setSelectedCurrency(currency.code)}
                            disabled={isSaving}
                            className={`relative bg-stone-800/40 border rounded-xl p-5 text-left transition-all duration-150 cursor-pointer
                                ${isSelected
                                    ? 'border-white/30 ring-1 ring-white/10'
                                    : 'border-stone-800/60 hover:border-stone-700/60'
                                }
                                ${isSaving ? 'opacity-50 cursor-not-allowed' : ''}
                            `}
                        >
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-2xl">{currency.flag}</span>
                                {isSelected && (
                                    <div className="w-5 h-5 rounded-full bg-white flex items-center justify-center">
                                        <Check className="h-3 w-3 text-stone-900" />
                                    </div>
                                )}
                            </div>
                            <div>
                                <div className="flex items-center gap-1.5">
                                    <span className="text-[14px] font-semibold text-white">{currency.symbol}</span>
                                    <span className="text-[14px] font-semibold text-white">{currency.code}</span>
                                </div>
                                <p className="text-[12px] text-stone-400 mt-0.5">{currency.name}</p>
                            </div>
                        </button>
                    );
                })}
            </div>

            {/* Unsaved changes */}
            {hasChanges && (
                <p className="text-[12px] text-yellow-400 mt-4">
                    You have unsaved changes — click Save to apply.
                </p>
            )}

            {/* Info */}
            <div className="mt-6 bg-stone-800/20 border border-stone-800/40 rounded-xl p-5">
                <h4 className="text-[13px] font-medium text-stone-300 mb-2">How it works</h4>
                <ul className="text-[12px] text-stone-500 space-y-1">
                    <li>• Products will display prices in the selected default currency</li>
                    <li>• Exchange rates are applied automatically for other currencies</li>
                    <li>• Changes take effect immediately for all visitors</li>
                </ul>
            </div>
        </div>
    );
}
