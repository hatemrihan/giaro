'use client';

import { ProductCard } from './ProductCard';
import type { ShopProduct, ViewMode } from '../_types/shop';

type Props = {
    products: ShopProduct[];
    locale: string;
    loading: boolean;
    viewMode: ViewMode;
    lowStockThreshold?: number;
};

/**
 * Product grid — supports 'grid' (4 cols) and 'large' (2 cols) view modes.
 * Includes loading skeleton and empty state.
 */
export function ProductGrid({ products, locale, loading, viewMode, lowStockThreshold }: Props) {
    const gridClass = viewMode === 'large'
        ? 'grid grid-cols-1 sm:grid-cols-2 gap-6 lg:gap-10'
        : 'grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-8';

    // ── Loading skeleton ──────────────────────────────────────────
    if (loading) {
        const skeletonCount = viewMode === 'large' ? 4 : 8;
        return (
            <div className={gridClass}>
                {Array.from({ length: skeletonCount }).map((_, i) => (
                    <div key={i} className="animate-pulse">
                        <div className="bg-neutral-100 aspect-[3/4] rounded-sm mb-4" />
                        <div className="space-y-2">
                            <div className="h-4 bg-neutral-100 rounded w-3/4" />
                            <div className="h-4 bg-neutral-100 rounded w-1/2" />
                            <div className="flex gap-1 mt-2">
                                {Array.from({ length: 3 }).map((_, j) => (
                                    <div key={j} className="w-4 h-4 bg-neutral-100 rounded-sm" />
                                ))}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    // ── Empty state ───────────────────────────────────────────────
    if (products.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-24 text-center">
                <div className="w-20 h-20 bg-neutral-50 rounded-full flex items-center justify-center mb-5">
                    <svg className="w-8 h-8 text-neutral-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                </div>
                <h3 className="text-[15px] font-medium text-neutral-600 mb-1">لا توجد منتجات</h3>
                <p className="text-[13px] text-neutral-400">لم يتم العثور على منتجات بالفلاتر المحددة</p>
            </div>
        );
    }

    // ── Grid ──────────────────────────────────────────────────────
    return (
        <div className={gridClass}>
            {products.map((product) => (
                <ProductCard
                    key={product.id}
                    product={product}
                    locale={locale}
                    lowStockThreshold={lowStockThreshold}
                />
            ))}
        </div>
    );
}
