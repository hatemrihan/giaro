'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { ShopCategory, ShopFilters, SortOption, ViewMode } from '../_types/shop';

type Props = {
    locale: string;
    categories: ShopCategory[];
    filters: ShopFilters;
    sort: SortOption;
    viewMode: ViewMode;
    total: number;
    availableSizes: string[];
    onFiltersChange: (f: Partial<ShopFilters>) => void;
    onSortChange: (s: SortOption) => void;
    onViewModeChange: (v: ViewMode) => void;
};

type FilterView = 'main' | 'sizes' | 'availability' | 'sort';

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
    { value: 'newest', label: 'الأحدث' },
    { value: 'price-asc', label: 'السعر: من الأقل' },
    { value: 'price-desc', label: 'السعر: من الأعلى' },
];

/**
 * Combined controls bar — Breadcrumb (right) + View/Filter (left in RTL).
 * Like the JAYASH reference but fully Arabic, enhanced with sort inside filter.
 */
export function ShopControls({
    locale,
    categories,
    filters,
    sort,
    viewMode,
    total,
    availableSizes,
    onFiltersChange,
    onSortChange,
    onViewModeChange,
}: Props) {
    const [filterView, setFilterView] = useState<FilterView>('main');

    // Active filter count (excluding category which is shown in breadcrumb)
    const activeFilterCount = [
        filters.color,
        filters.size,
        filters.availability !== 'all' ? filters.availability : null,
    ].filter(Boolean).length;

    return (
        <div className="flex justify-between items-center mb-8">
            {/* ── Breadcrumb (RTL: appears on the right) ──────────── */}
            <nav className="flex items-center text-sm text-neutral-500">
                <Link
                    href={`/${locale}`}
                    className="hover:text-neutral-900 transition-colors"
                >
                    الرئيسية
                </Link>
                <ChevronLeft className="mx-1.5 w-3.5 h-3.5 text-neutral-300" />
                <Link
                    href={`/${locale}/shop`}
                    className={`transition-colors ${!filters.category ? 'text-neutral-900 font-medium' : 'hover:text-neutral-900'}`}
                    onClick={() => onFiltersChange({ category: null })}
                >
                    المتجر
                </Link>
                {filters.category && (
                    <>
                        <ChevronLeft className="mx-1.5 w-3.5 h-3.5 text-neutral-300" />
                        <span className="text-neutral-900 font-medium">{filters.category}</span>
                    </>
                )}
            </nav>

            {/* ── View + Filter controls (RTL: appears on the left) ── */}
            <div className="flex items-center gap-6 text-sm">
                {/* View toggle — desktop only */}
                <div className="hidden lg:flex items-center gap-2">
                    <span className="text-neutral-500">عرض:</span>
                    <button
                        className={`transition-all cursor-pointer ${viewMode === 'grid'
                                ? 'text-neutral-900 underline underline-offset-4 hover:no-underline'
                                : 'text-neutral-400 hover:text-neutral-900'
                            }`}
                        onClick={() => onViewModeChange('grid')}
                    >
                        شبكة
                    </button>
                    <button
                        className={`transition-all cursor-pointer ${viewMode === 'large'
                                ? 'text-neutral-900 underline underline-offset-4 hover:no-underline'
                                : 'text-neutral-400 hover:text-neutral-900'
                            }`}
                        onClick={() => onViewModeChange('large')}
                    >
                        كبير
                    </button>
                </div>

                {/* Result count */}
                {total > 0 && (
                    <span className="hidden sm:inline text-neutral-400 text-[13px]">
                        {total.toLocaleString('ar-EG')} منتج
                    </span>
                )}

                {/* Filter dropdown */}
                <div className="flex items-center gap-2">
                    <span className="text-neutral-500">تصفية</span>
                    <DropdownMenu onOpenChange={(open) => { if (!open) setFilterView('main'); }}>
                        <DropdownMenuTrigger className="text-neutral-900 hover:text-neutral-600 transition-colors flex items-center gap-1 cursor-pointer outline-none">
                            <span className="flex items-center gap-1">
                                +
                                {activeFilterCount > 0 && (
                                    <span className="bg-neutral-900 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                                        {activeFilterCount}
                                    </span>
                                )}
                            </span>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                            align="start"
                            className="w-52 max-h-[75vh] overflow-y-auto bg-white shadow-xl border border-neutral-100 rounded-xl p-0"
                        >
                            {/* ─── Main view ────────────────────── */}
                            {filterView === 'main' && (
                                <div className="animate-in fade-in slide-in-from-right-2 duration-200">
                                    {/* Category section */}
                                    <div className="px-1.5 py-2 border-b border-neutral-100">
                                        <div className="px-2 mb-1.5">
                                            <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">التصنيف</span>
                                        </div>
                                        <DropdownMenuItem
                                            onClick={() => onFiltersChange({ category: null })}
                                            className="cursor-pointer text-[13px] rounded-lg"
                                        >
                                            <span className="flex-1">الكل</span>
                                            {!filters.category && <span className="text-neutral-900">✓</span>}
                                        </DropdownMenuItem>
                                        {categories.map((cat) => (
                                            <DropdownMenuItem
                                                key={cat.id}
                                                onClick={() => onFiltersChange({ category: cat.name })}
                                                className="cursor-pointer text-[13px] rounded-lg"
                                            >
                                                <span className="flex-1">{cat.name}</span>
                                                {filters.category === cat.name && <span className="text-neutral-900">✓</span>}
                                            </DropdownMenuItem>
                                        ))}
                                    </div>

                                    {/* Sort section */}
                                    <div className="px-1.5 py-2 border-b border-neutral-100">
                                        <div className="px-2 mb-1.5">
                                            <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">الترتيب</span>
                                        </div>
                                        {SORT_OPTIONS.map((opt) => (
                                            <DropdownMenuItem
                                                key={opt.value}
                                                onClick={() => onSortChange(opt.value)}
                                                className="cursor-pointer text-[13px] rounded-lg"
                                            >
                                                <span className="flex-1">{opt.label}</span>
                                                {sort === opt.value && <span className="text-neutral-900">✓</span>}
                                            </DropdownMenuItem>
                                        ))}
                                    </div>

                                    {/* More filters */}
                                    <div className="px-1.5 py-2">
                                        <div className="px-2 mb-1.5">
                                            <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">فلاتر إضافية</span>
                                        </div>


                                        {availableSizes.length > 0 && (
                                            <button
                                                onClick={() => setFilterView('sizes')}
                                                className="w-full text-right px-2.5 py-2 text-[13px] hover:bg-neutral-50 rounded-lg flex items-center justify-between transition-colors"
                                            >
                                                <span className="flex items-center gap-2">
                                                    المقاسات
                                                    {filters.size && (
                                                        <span className="text-[10px] bg-neutral-100 text-neutral-600 px-1.5 py-0.5 rounded-md">{filters.size}</span>
                                                    )}
                                                </span>
                                                <ChevronLeft className="w-3.5 h-3.5 text-neutral-400" />
                                            </button>
                                        )}

                                        <button
                                            onClick={() => setFilterView('availability')}
                                            className="w-full text-right px-2.5 py-2 text-[13px] hover:bg-neutral-50 rounded-lg flex items-center justify-between transition-colors"
                                        >
                                            <span className="flex items-center gap-2">
                                                التوفر
                                                {filters.availability !== 'all' && (
                                                    <span className="text-[10px] bg-neutral-100 text-neutral-600 px-1.5 py-0.5 rounded-md">
                                                        {filters.availability === 'in-stock' ? 'متوفر' : 'نفذ'}
                                                    </span>
                                                )}
                                            </span>
                                            <ChevronLeft className="w-3.5 h-3.5 text-neutral-400" />
                                        </button>
                                    </div>

                                    {/* Clear all filters */}
                                    {activeFilterCount > 0 && (
                                        <div className="px-1.5 pb-2 border-t border-neutral-100 pt-2">
                                            <DropdownMenuItem
                                                onClick={() => onFiltersChange({ color: null, size: null, availability: 'all' })}
                                                className="cursor-pointer text-[12px] text-red-500 rounded-lg justify-center"
                                            >
                                                مسح كل الفلاتر
                                            </DropdownMenuItem>
                                        </div>
                                    )}
                                </div>
                            )}


                            {/* ─── Sizes sub-view ───────────────── */}
                            {filterView === 'sizes' && (
                                <SubFilterView
                                    title="المقاسات"
                                    onBack={() => setFilterView('main')}
                                >
                                    <DropdownMenuItem
                                        onClick={() => onFiltersChange({ size: null })}
                                        className="cursor-pointer text-[13px] rounded-lg"
                                    >
                                        <span className="flex-1">الكل</span>
                                        {!filters.size && <span>✓</span>}
                                    </DropdownMenuItem>
                                    {availableSizes.map((size) => (
                                        <DropdownMenuItem
                                            key={size}
                                            onClick={() => onFiltersChange({ size })}
                                            className="cursor-pointer text-[13px] rounded-lg"
                                        >
                                            <span className="flex-1">{size}</span>
                                            {filters.size === size && <span>✓</span>}
                                        </DropdownMenuItem>
                                    ))}
                                </SubFilterView>
                            )}

                            {/* ─── Availability sub-view ────────── */}
                            {filterView === 'availability' && (
                                <SubFilterView
                                    title="التوفر"
                                    onBack={() => setFilterView('main')}
                                >
                                    {([
                                        { value: 'all', label: 'الكل' },
                                        { value: 'in-stock', label: 'متوفر' },
                                        { value: 'out-of-stock', label: 'نفذ المخزون' },
                                    ] as const).map((opt) => (
                                        <DropdownMenuItem
                                            key={opt.value}
                                            onClick={() => onFiltersChange({ availability: opt.value })}
                                            className="cursor-pointer text-[13px] rounded-lg"
                                        >
                                            <span className="flex-1">{opt.label}</span>
                                            {filters.availability === opt.value && <span>✓</span>}
                                        </DropdownMenuItem>
                                    ))}
                                </SubFilterView>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </div>
    );
}

// ── Reusable sub-filter view with back button ────────────────
function SubFilterView({
    title,
    onBack,
    children,
}: {
    title: string;
    onBack: () => void;
    children: React.ReactNode;
}) {
    return (
        <div className="animate-in fade-in slide-in-from-left-2 duration-200">
            <div className="px-1.5 py-2 border-b border-neutral-100">
                <button
                    onClick={onBack}
                    className="flex items-center gap-2 px-2 py-1 text-[13px] text-neutral-500 hover:text-neutral-900 transition-colors rounded-lg"
                >
                    <svg className="w-3.5 h-3.5 rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    رجوع
                </button>
                <div className="px-2 mt-1">
                    <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">{title}</span>
                </div>
            </div>
            <div className="px-1.5 py-2">
                {children}
            </div>
        </div>
    );
}
