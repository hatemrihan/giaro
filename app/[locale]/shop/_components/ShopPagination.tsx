'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { ShopPagination as PaginationType } from '../_types/shop';

type Props = {
    pagination: PaginationType;
    onPageChange: (page: number) => void;
};

/**
 * Pagination — Previous / page numbers / Next
 */
export function ShopPagination({ pagination, onPageChange }: Props) {
    const { page, totalPages } = pagination;

    if (totalPages <= 1) return null;

    // Build visible page numbers (max 5 shown)
    const pages = getVisiblePages(page, totalPages);

    return (
        <div className="flex items-center justify-between pt-10 pb-4">
            {/* Previous */}
            <button
                onClick={() => onPageChange(page - 1)}
                disabled={page <= 1}
                className="flex items-center gap-1.5 text-[13px] text-neutral-500 hover:text-neutral-900 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
                <ChevronRight className="w-3.5 h-3.5" />
                السابق
            </button>

            {/* Page numbers */}
            <div className="flex items-center gap-1">
                {pages.map((p, i) =>
                    p === '...' ? (
                        <span key={`dot-${i}`} className="px-2 text-[13px] text-neutral-300">…</span>
                    ) : (
                        <button
                            key={p}
                            onClick={() => onPageChange(p as number)}
                            className={`
                                w-8 h-8 rounded-md text-[13px] font-medium transition-all duration-150 cursor-pointer
                                ${page === p
                                    ? 'bg-neutral-900 text-white'
                                    : 'text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900'
                                }
                            `}
                        >
                            {(p as number).toLocaleString('ar-EG')}
                        </button>
                    )
                )}
            </div>

            {/* Next */}
            <button
                onClick={() => onPageChange(page + 1)}
                disabled={page >= totalPages}
                className="flex items-center gap-1.5 text-[13px] text-neutral-500 hover:text-neutral-900 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
                التالي
                <ChevronLeft className="w-3.5 h-3.5" />
            </button>
        </div>
    );
}

function getVisiblePages(current: number, total: number): (number | string)[] {
    if (total <= 5) return Array.from({ length: total }, (_, i) => i + 1);

    const pages: (number | string)[] = [];
    if (current <= 3) {
        pages.push(1, 2, 3, 4, '...', total);
    } else if (current >= total - 2) {
        pages.push(1, '...', total - 3, total - 2, total - 1, total);
    } else {
        pages.push(1, '...', current - 1, current, current + 1, '...', total);
    }
    return pages;
}
