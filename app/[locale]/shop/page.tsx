'use client';

import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { useEffect, useMemo } from 'react';
import Nav from '../../sections/nav';
import Footer from '../../sections/footer';
import { useShop } from './_hooks/useShop';
import { ShopControls } from './_components/ShopControls';
import { ProductGrid } from './_components/ProductGrid';
import { ShopPagination } from './_components/ShopPagination';
import type { SortOption, ShopFilters, ViewMode } from './_types/shop';

/**
 * /[locale]/shop — Main shop page
 *
 * Architecture:
 *   - URL-driven state for category, page, sort
 *   - Client-side multi-filter (color, size, availability) via useShop hook
 *   - Modular components: ShopControls, ProductGrid, ShopPagination
 *   - All text in Arabic (customer-facing)
 */
export default function ShopPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();

    const locale = useMemo(() => {
        const match = pathname.match(/^\/(ar|en)/);
        return match ? match[1] : 'ar';
    }, [pathname]);

    // Read initial state from URL
    const urlCategory = searchParams.get('category') || null;
    const urlPage = parseInt(searchParams.get('page') || '1', 10);
    const urlSort = (searchParams.get('sort') as SortOption) || 'newest';

    const {
        products,
        categories,
        pagination,
        loading,
        sort,
        filters,
        viewMode,
        availableColors,
        availableSizes,
        lowStockThreshold,
        setSort,
        setFilters,
        setPage,
        setViewMode,
    } = useShop({
        initialCategory: urlCategory,
        initialPage: urlPage,
    });

    // Sync URL → hook when URL params change externally
    useEffect(() => {
        if (urlCategory !== filters.category) setFilters({ category: urlCategory });
    }, [urlCategory]); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        if (urlSort !== sort) setSort(urlSort);
    }, [urlSort]); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        if (urlPage !== pagination.page) setPage(urlPage);
    }, [urlPage]); // eslint-disable-line react-hooks/exhaustive-deps

    // ── URL update helper ───────────────────────────────────────
    const updateURL = (params: Record<string, string | null>) => {
        const current = new URLSearchParams(searchParams.toString());
        Object.entries(params).forEach(([key, value]) => {
            if (value) current.set(key, value);
            else current.delete(key);
        });
        const qs = current.toString();
        router.push(`${pathname}${qs ? `?${qs}` : ''}`, { scroll: false });
    };

    // ── Handlers ────────────────────────────────────────────────
    const handleFiltersChange = (partial: Partial<ShopFilters>) => {
        setFilters(partial);
        // Only category goes into URL (shareable)
        if ('category' in partial) {
            updateURL({
                category: partial.category || null,
                page: null, // reset page
            });
        }
    };

    const handleSortChange = (s: SortOption) => {
        setSort(s);
        updateURL({ sort: s, page: null });
    };

    const handleViewModeChange = (v: ViewMode) => {
        setViewMode(v);
    };

    const handlePageChange = (p: number) => {
        setPage(p);
        updateURL({ page: p > 1 ? String(p) : null });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const pageTitle = filters.category || 'المتجر';

    return (
        <section className="min-h-screen bg-white">
            <Nav />
            <div className="pt-24 pb-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Controls: breadcrumb + view + filter */}
                    <ShopControls
                        locale={locale}
                        categories={categories}
                        filters={filters}
                        sort={sort}
                        viewMode={viewMode}
                        total={pagination.total}
                        availableColors={availableColors}
                        availableSizes={availableSizes}
                        onFiltersChange={handleFiltersChange}
                        onSortChange={handleSortChange}
                        onViewModeChange={handleViewModeChange}
                    />

                    {/* Title */}
                    <div className="text-center mb-10">
                        <h1 className="text-2xl font-light tracking-wide text-neutral-900">
                            {pageTitle}
                        </h1>
                    </div>

                    {/* Products */}
                    <ProductGrid
                        products={products}
                        locale={locale}
                        loading={loading}
                        viewMode={viewMode}
                        lowStockThreshold={lowStockThreshold}
                    />

                    {/* Pagination info + dots */}
                    {pagination.totalPages > 1 && (
                        <ShopPagination
                            pagination={pagination}
                            onPageChange={handlePageChange}
                        />
                    )}

                    {/* Page count */}
                    {pagination.totalPages > 1 && (
                        <div className="mt-2 text-center text-[12px] text-neutral-400">
                            صفحة {pagination.page.toLocaleString('ar-EG')} من {pagination.totalPages.toLocaleString('ar-EG')} • {pagination.total.toLocaleString('ar-EG')} منتج
                        </div>
                    )}
                </div>
            </div>
            <Footer />
        </section>
    );
}
