'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import type { ShopProduct } from '../_types/shop';

type Props = {
    product: ShopProduct;
    locale: string;
    currencySymbol?: string;
    lowStockThreshold?: number;
    priority?: boolean;
};

/**
 * Product card — minimal, clean, with variant color swatches.
 * Aspect ratio 3:4 like the JAYASH reference.
 */
export function ProductCard({ product, locale, currencySymbol = 'ج.م', lowStockThreshold = 5, priority = false }: Props) {
    const hasDiscount = product.original_price && product.original_price > product.price;

    // Determine stock status from variants or product-level stock
    const getStatus = (): 'pre-order' | 'sold-out' | null => {
        const hasStock = product.variants?.length
            ? product.variants.some(v => v.stock > 0)
            : product.stock > 0;

        if (!hasStock) {
            if (product.show_preorder_badge) return 'pre-order';
            if (product.show_out_of_stock_badge) return 'sold-out';
            return 'sold-out';
        }
        return null;
    };

    const statusLabel: Record<string, string> = {
        'pre-order': 'طلب مسبق',
        'sold-out': 'نفذ',
    };

    const status = getStatus();

    // Low stock indicator (when <= lowStockThreshold and in stock)
    const totalStock = product.variants?.length
        ? product.variants.reduce((sum, v) => sum + (v.stock || 0), 0)
        : product.stock || 0;

    return (
        <Link
            href={`/${locale}/shop/${product.slug}`}
            className="group block"
        >
            {/* ── Image ────────────────────────────────────────── */}
            <div className="relative mb-4 aspect-[3/4] overflow-hidden flex items-center justify-center">
                {/* Status badge */}
                {status && (
                    <div className="absolute top-3 right-3 z-10">
                        <Badge
                            variant="secondary"
                            className="bg-neutral-200/80 backdrop-blur-sm text-neutral-700 text-[11px] px-2.5 py-1 font-medium"
                        >
                            {statusLabel[status]}
                        </Badge>
                    </div>
                )}

                {/* Discount badge */}
                {hasDiscount && !status && (
                    <div className="absolute top-3 left-3 z-10">
                        <Badge
                            variant="destructive"
                            className="text-[11px] px-2 py-0.5 font-bold"
                        >
                            {product.discount ? `-${product.discount}%` : 'تخفيض'}
                        </Badge>
                    </div>
                )}

                {product.main_image ? (
                    <Image
                        src={product.main_image}
                        alt={product.name}
                        fill
                        unoptimized={product.main_image.startsWith('blob:')}
                        className="object-contain group-hover:scale-105 transition-transform duration-500"
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                        priority={priority}
                        quality={85}
                    />
                ) : (
                    <div className="flex items-center justify-center h-full text-neutral-300">
                        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                    </div>
                )}
            </div>

            {/* ── Info ──────────────────────────────────────────── */}
            <div className="space-y-1.5">
                {/* Name */}
                <h3 className="text-sm font-normal text-neutral-900 leading-snug line-clamp-2 group-hover:text-neutral-500 transition-colors">
                    {product.name}
                </h3>

                {/* Price */}
                <div className="flex items-center gap-2">
                    <p className="text-sm text-neutral-900 font-medium">
                        {product.price.toLocaleString('ar-EG')} {currencySymbol}
                    </p>
                    {hasDiscount && (
                        <>
                            <p className="text-xs text-neutral-400 line-through">
                                {product.original_price?.toLocaleString('ar-EG')} {currencySymbol}
                            </p>
                        </>
                    )}
                </div>



                {/* Low stock warning */}
                {totalStock > 0 && totalStock <= lowStockThreshold && !status && (
                    <p className="text-[11px] text-amber-600 font-medium pt-0.5">
                        بقي {totalStock} فقط
                    </p>
                )}
            </div>
        </Link>
    );
}
