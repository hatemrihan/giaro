'use client';

import { useState, useEffect } from 'react';
import { Loader2, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';

// ── Page ──────────────────────────────────────────────────────

export default function ProductVisibilityPage() {
    const [allVisible, setAllVisible] = useState(true);
    const [isLoading, setIsLoading] = useState(true);
    const [isToggling, setIsToggling] = useState(false);
    const [stats, setStats] = useState({ totalProducts: 0, activeProducts: 0, hiddenProducts: 0 });

    useEffect(() => { fetchVisibilityStatus(); }, []);

    const fetchVisibilityStatus = async () => {
        try {
            setIsLoading(true);
            const res = await fetch('/api/admin/products/visibility');
            const data = await res.json();
            if (data.success) {
                setAllVisible(data.data.allVisible);
                setStats({
                    totalProducts: data.data.totalProducts,
                    activeProducts: data.data.activeProducts,
                    hiddenProducts: data.data.hiddenProducts,
                });
            }
        } catch {
            toast.error('Failed to load visibility status');
        } finally {
            setIsLoading(false);
        }
    };

    const handleToggleVisibility = async () => {
        setIsToggling(true);
        const newVisibility = !allVisible;
        const toastId = toast.loading(newVisibility ? 'Showing all products…' : 'Hiding all products…');
        try {
            const res = await fetch('/api/admin/products/visibility', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ visible: newVisibility }),
            });
            const data = await res.json();
            if (data.success) {
                setAllVisible(newVisibility);
                await fetchVisibilityStatus();
                toast.success(newVisibility ? 'All products are now visible' : 'All products are now hidden', { id: toastId, duration: 2000 });
            } else {
                toast.error('Failed to toggle visibility', { id: toastId });
            }
        } catch {
            toast.error('An error occurred', { id: toastId });
        } finally {
            setIsToggling(false);
        }
    };

    // ── Loading ───────────────────────────────────────────────
    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-[60vh]">
                <div className="flex flex-col items-center gap-3">
                    <Loader2 className="h-5 w-5 animate-spin text-stone-500" />
                    <span className="text-[13px] text-stone-500">Loading visibility settings…</span>
                </div>
            </div>
        );
    }

    return (
        <div className="text-white max-w-4xl mt-6">
            {/* Header */}
            <div className="mb-8">
                <div className="text-[13px] text-stone-500 mb-1">Settings</div>
                <h1 className="text-xl font-semibold text-white">Product Visibility</h1>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                <div className="bg-stone-800/40 border border-stone-800/60 rounded-xl p-5">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-[11px] text-stone-500 uppercase tracking-wider font-medium">Total</p>
                            <p className="text-2xl font-semibold text-white mt-1 tabular-nums">{stats.totalProducts}</p>
                        </div>
                        <div className="w-9 h-9 rounded-lg bg-stone-700/50 flex items-center justify-center">
                            <Eye className="h-4 w-4 text-stone-400" />
                        </div>
                    </div>
                </div>
                <div className="bg-stone-800/40 border border-stone-800/60 rounded-xl p-5">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-[11px] text-stone-500 uppercase tracking-wider font-medium">Visible</p>
                            <p className="text-2xl font-semibold text-green-400 mt-1 tabular-nums">{stats.activeProducts}</p>
                        </div>
                        <div className="w-9 h-9 rounded-lg bg-green-500/10 flex items-center justify-center">
                            <Eye className="h-4 w-4 text-green-400" />
                        </div>
                    </div>
                </div>
                <div className="bg-stone-800/40 border border-stone-800/60 rounded-xl p-5">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-[11px] text-stone-500 uppercase tracking-wider font-medium">Hidden</p>
                            <p className="text-2xl font-semibold text-yellow-400 mt-1 tabular-nums">{stats.hiddenProducts}</p>
                        </div>
                        <div className="w-9 h-9 rounded-lg bg-yellow-500/10 flex items-center justify-center">
                            <EyeOff className="h-4 w-4 text-yellow-400" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Toggle Card */}
            <div className="bg-stone-800/40 border border-stone-800/60 rounded-xl p-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${allVisible ? 'bg-green-500/10' : 'bg-stone-700/50'}`}>
                            {allVisible ? <Eye className="h-5 w-5 text-green-400" /> : <EyeOff className="h-5 w-5 text-stone-400" />}
                        </div>
                        <div>
                            <h3 className="text-[15px] font-medium text-white">
                                {allVisible ? 'All Products Visible' : 'All Products Hidden'}
                            </h3>
                            <p className="text-[13px] text-stone-400 mt-0.5">
                                {allVisible ? 'Customers can see and purchase all products' : 'Products are hidden from the storefront'}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <Switch
                            checked={allVisible}
                            onCheckedChange={handleToggleVisibility}
                            disabled={isToggling}
                        />
                    </div>
                </div>
            </div>

            {/* Action button */}
            <div className="mt-6">
                <Button
                    onClick={handleToggleVisibility}
                    disabled={isToggling}
                    className={`h-10 gap-2 font-medium text-[13px] ${allVisible
                        ? 'bg-yellow-500/15 border border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/25'
                        : 'bg-green-500/15 border border-green-500/30 text-green-400 hover:bg-green-500/25'
                        }`}
                >
                    {isToggling ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : allVisible ? (
                        <EyeOff className="h-3.5 w-3.5" />
                    ) : (
                        <Eye className="h-3.5 w-3.5" />
                    )}
                    {isToggling ? 'Updating…' : allVisible ? 'Hide All Products' : 'Show All Products'}
                </Button>
            </div>
        </div>
    );
}
