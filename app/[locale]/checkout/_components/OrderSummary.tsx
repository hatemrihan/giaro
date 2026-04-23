'use client';

import type { CartItem } from '@/components/contexts/CartContext';
import Image from 'next/image';

type Props = {
    items: CartItem[];
    subtotal: number;
    shippingCost: number;
    codFee: number;
    promoDiscount: number;
    total: number;
    promoCode: string;
    promoApplied: boolean;
    promoError: string;
    onPromoChange: (code: string) => void;
    onPromoApply: () => void;
    onPromoRemove: () => void;
    isSubmitting: boolean;
    submitError: string;
    onSubmit: () => void;
    totalItems: number;
};

const CURRENCY = 'ج.م';

export function OrderSummary({
    items,
    subtotal,
    shippingCost,
    codFee,
    promoDiscount,
    total,
    promoCode,
    promoApplied,
    promoError,
    onPromoChange,
    onPromoApply,
    onPromoRemove,
    isSubmitting,
    submitError,
    onSubmit,
    totalItems,
}: Props) {
    return (
        <div className="border border-neutral-200 p-6">
            {/* ── Header ──────────────────────────────── */}
            <h3 className="text-[13px] font-medium tracking-widest text-neutral-900 uppercase mb-6">
                ملخص الطلب
            </h3>

            {/* ── Item thumbnails ─────────────────────── */}
            <div className="space-y-4 mb-6 pb-6 border-b border-neutral-100">
                {items.map((item, index) => (
                    <div key={`${item.id}-${index}`} className="flex gap-3 items-start">
                        {/* Image */}
                        <div className="relative w-14 h-14 flex items-center justify-center shrink-0 overflow-hidden">
                            {item.image ? (
                                <Image
                                    src={item.image}
                                    alt={item.name}
                                    fill
                                    sizes="56px"
                                    className="object-contain"
                                />
                            ) : (
                                <div className="w-6 h-6 text-neutral-300">
                                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                </div>
                            )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                            <p className="text-sm text-neutral-800 font-light leading-tight line-clamp-1">
                                {item.name}
                            </p>
                            <div className="flex items-center gap-2 mt-0.5">
                                {item.variant?.attributes && Object.entries(item.variant.attributes).map(([key, val]) => (
                                    <span key={key} className="text-[11px] text-neutral-400">{key}: {val}</span>
                                ))}
                                <span className="text-[11px] text-neutral-400">×{item.quantity.toLocaleString('ar-EG')}</span>
                            </div>
                        </div>

                        {/* Price */}
                        <p className="text-sm text-neutral-900 font-light shrink-0">
                            {(item.price * item.quantity).toLocaleString('ar-EG')} {CURRENCY}
                        </p>
                    </div>
                ))}
            </div>

            {/* ── Promo code ──────────────────────────── */}
            <div className="mb-6 pb-6 border-b border-neutral-100">
                {promoApplied ? (
                    <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200">
                        <div className="flex items-center gap-2">
                            <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <span className="text-sm text-green-700 font-medium">{promoCode}</span>
                        </div>
                        <button
                            onClick={onPromoRemove}
                            className="text-xs text-neutral-500 underline hover:text-neutral-900 cursor-pointer"
                        >
                            إزالة
                        </button>
                    </div>
                ) : (
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={promoCode}
                            onChange={(e) => onPromoChange(e.target.value.toUpperCase())}
                            placeholder="كود الخصم"
                            className="flex-1 border-b border-neutral-300 bg-transparent text-sm text-neutral-900 pb-2 outline-none focus:border-neutral-900 transition-colors placeholder:text-neutral-300"
                            dir="ltr"
                        />
                        <button
                            onClick={onPromoApply}
                            className="text-sm text-neutral-900 underline underline-offset-4 hover:text-neutral-600 transition-colors cursor-pointer shrink-0"
                        >
                            تطبيق
                        </button>
                    </div>
                )}
                {promoError && <p className="text-red-500 text-xs mt-2">{promoError}</p>}
            </div>

            {/* ── Price breakdown ─────────────────────── */}
            <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                    <span className="text-neutral-500">
                        المجموع الفرعي ({totalItems.toLocaleString('ar-EG')} {totalItems === 1 ? 'منتج' : 'منتجات'})
                    </span>
                    <span className="text-neutral-900">{subtotal.toLocaleString('ar-EG')} {CURRENCY}</span>
                </div>

                <div className="flex justify-between text-sm">
                    <span className="text-neutral-500">الشحن</span>
                    <span className="text-neutral-900">
                        {shippingCost > 0 ? `${shippingCost.toLocaleString('ar-EG')} ${CURRENCY}` : 'يحسب عند اختيار المحافظة'}
                    </span>
                </div>

                {codFee > 0 && (
                    <div className="flex justify-between text-sm">
                        <span className="text-neutral-500">رسوم الدفع عند الاستلام</span>
                        <span className="text-neutral-900">{codFee.toLocaleString('ar-EG')} {CURRENCY}</span>
                    </div>
                )}

                {promoDiscount > 0 && (
                    <div className="flex justify-between text-sm">
                        <span className="text-green-600">الخصم</span>
                        <span className="text-green-600">-{promoDiscount.toLocaleString('ar-EG')} {CURRENCY}</span>
                    </div>
                )}
            </div>

            {/* ── Total ───────────────────────────────── */}
            <div className="border-t border-neutral-200 pt-4 mb-6">
                <div className="flex justify-between items-baseline">
                    <span className="text-[13px] font-medium tracking-widest text-neutral-900 uppercase">الإجمالي</span>
                    <span className="text-lg font-medium text-neutral-900">
                        {total.toLocaleString('ar-EG')} {CURRENCY}
                    </span>
                </div>
            </div>

            {/* ── Submit error ─────────────────────────── */}
            {submitError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200">
                    <p className="text-sm text-red-700">{submitError}</p>
                </div>
            )}

            {/* ── Submit button ────────────────────────── */}
            <button
                onClick={onSubmit}
                disabled={isSubmitting}
                className="w-full bg-neutral-900 text-white py-4 text-sm font-medium tracking-wide hover:bg-neutral-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
                {isSubmitting ? (
                    <span className="flex items-center justify-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                        جاري إنشاء الطلب...
                    </span>
                ) : (
                    'إتمام الطلب'
                )}
            </button>
        </div>
    );
}
