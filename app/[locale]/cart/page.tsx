'use client';

import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import Nav from '../../sections/nav';
import Footer from '../../sections/footer';
import { useCart } from '@/components/contexts/CartContext';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Image from 'next/image';

const CURRENCY = 'ج.م';

export default function CartPage() {
    const router = useRouter();
    const pathname = usePathname();
    const locale = pathname.match(/^\/(ar|en)/)?.[1] || 'ar';

    const {
        state,
        removeItem,
        updateQuantity,
        totalItems,
        totalPrice,
    } = useCart();

    const items = state.items;

    // ── Empty cart ───────────────────────────────────────────────
    if (items.length === 0) {
        return (
            <div className="min-h-screen bg-white">
                <Nav />
                <div className="pt-28 pb-20">
                    <div className="max-w-3xl mx-auto px-6 text-center">
                        <div className="w-24 h-24 bg-neutral-50 rounded-full flex items-center justify-center mx-auto mb-8">
                            <svg className="w-10 h-10 text-neutral-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                            </svg>
                        </div>
                        <h1 className="text-2xl font-light text-neutral-800 mb-3">السلة فارغة</h1>
                        <p className="text-sm text-neutral-500 mb-8">لم تقم بإضافة أي منتجات بعد</p>
                        <Link
                            href={`/${locale}/shop`}
                            className="inline-block bg-neutral-900 text-white px-10 py-3.5 text-sm font-medium hover:bg-neutral-800 transition-colors"
                        >
                            تصفح المنتجات
                        </Link>
                    </div>
                </div>
                <Footer />
            </div>
        );
    }

    // ── Cart with items ─────────────────────────────────────────
    return (
        <div className="min-h-screen bg-white">
            <Nav />

            <div className="pt-24 pb-20">
                <div className="max-w-5xl mx-auto px-6">

                    {/* ── Header ─────────────────────────────── */}
                    <div className="text-center mb-14">
                        <h1 className="text-2xl font-light tracking-wide text-neutral-900 mb-1">
                            سلة التسوق
                        </h1>
                        <p className="text-sm text-neutral-400">
                            {totalItems.toLocaleString('ar-EG')} {totalItems === 1 ? 'منتج' : 'منتجات'}
                        </p>
                    </div>

                    {/* ── Cart items ──────────────────────────── */}
                    <div className="divide-y divide-neutral-200">
                        {items.map((item, index) => (
                            <CartItemRow
                                key={`${item.id}-${item.variant ? Object.entries(item.variant.attributes || {}).sort().map(([k,v]) => `${k}:${v}`).join('|') : 'no-variant'}-${index}`}
                                item={item}
                                onRemove={() => removeItem(item.id, item.variant)}
                                onQuantityChange={(qty) => updateQuantity(item.id, item.variant, qty)}
                                locale={locale}
                            />
                        ))}
                    </div>

                    {/* ── Summary ─────────────────────────────── */}
                    <div className="border-t border-neutral-200 mt-2 pt-10">
                        <div className="max-w-md mr-0 ml-auto">
                            {/* Subtotal */}
                            <div className="flex justify-between items-center mb-3">
                                <span className="text-sm text-neutral-500">المجموع الفرعي</span>
                                <span className="text-sm text-neutral-900">
                                    {totalPrice.toLocaleString('ar-EG')} {CURRENCY}
                                </span>
                            </div>

                            {/* Shipping notice */}
                            <div className="flex justify-between items-center mb-6">
                                <span className="text-sm text-neutral-500">الشحن</span>
                                <span className="text-sm text-neutral-400">يحسب عند الدفع</span>
                            </div>

                            {/* Divider */}
                            <div className="border-t border-neutral-200 my-4" />

                            {/* Total */}
                            <div className="flex justify-between items-center mb-8">
                                <span className="text-base font-medium text-neutral-900">الإجمالي</span>
                                <span className="text-base font-medium text-neutral-900">
                                    {totalPrice.toLocaleString('ar-EG')} {CURRENCY}
                                </span>
                            </div>

                            {/* Checkout button */}
                            <button
                                onClick={() => router.push(`/${locale}/checkout`)}
                                className="w-full bg-neutral-900 text-white py-4 text-sm font-medium tracking-wide hover:bg-neutral-800 transition-colors cursor-pointer"
                            >
                                إتمام الطلب
                            </button>

                            {/* Continue shopping */}
                            <div className="text-center mt-5">
                                <Link
                                    href={`/${locale}/shop`}
                                    className="text-sm text-neutral-500 underline underline-offset-4 hover:text-neutral-900 transition-colors"
                                >
                                    متابعة التسوق
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
}

// ─── Individual Cart Item Row ─────────────────────────────────

type CartItemRowProps = {
    item: {
        id: string;
        name: string;
        image: string;
        price: number;
        quantity: number;
        maxStock?: number;
        variant?: { attributes: Record<string, string> };
    };
    onRemove: () => void;
    onQuantityChange: (qty: number) => void;
    locale: string;
};

function CartItemRow({ item, onRemove, onQuantityChange }: CartItemRowProps) {
    const lineTotal = item.price * item.quantity;

    return (
        <div className="py-10 grid grid-cols-1 sm:grid-cols-[200px_1fr_auto] gap-6 sm:gap-10 items-start">
            {/* ── Image ─────────────────────────────────────── */}
            <div className="relative aspect-square overflow-hidden w-full sm:w-[200px]">
                {item.image ? (
                    <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        sizes="200px"
                        className="object-contain"
                        unoptimized={item.image.startsWith('blob:')}
                    />
                ) : (
                    <div className="flex items-center justify-center h-full text-neutral-300">
                        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                    </div>
                )}
            </div>

            {/* ── Details ────────────────────────────────────── */}
            <div className="flex-1 space-y-3 min-w-0">
                {/* Name */}
                <h3 className="text-base font-light text-neutral-800 leading-snug">
                    {item.name}
                </h3>

                {/* Variant details — dynamic attributes */}
                <div className="space-y-1.5">
                    {item.variant?.attributes && Object.entries(item.variant.attributes).map(([key, value]) => (
                        <div key={key} className="flex items-baseline gap-6 text-sm">
                            <span className="text-neutral-400 w-14 shrink-0">{key}</span>
                            <span className="text-neutral-700">{value}</span>
                        </div>
                    ))}
                </div>

                {/* Quantity selector + Remove — in a row */}
                <div className="flex items-center gap-6 pt-3">
                    {/* Quantity dropdown */}
                    <Select
                        value={String(item.quantity)}
                        onValueChange={(val) => onQuantityChange(parseInt(val, 10))}
                    >
                        <SelectTrigger className="w-[72px] h-10 border border-neutral-300 bg-white text-neutral-900 text-sm">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-white border border-neutral-200">
                            {Array.from({ length: Math.min(item.maxStock || 10, 10) }, (_, i) => i + 1).map((num) => (
                                <SelectItem
                                    key={num}
                                    value={String(num)}
                                    className="cursor-pointer text-sm"
                                >
                                    {num.toLocaleString('ar-EG')}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    {/* Remove */}
                    <button
                        onClick={onRemove}
                        className="text-sm text-neutral-500 underline underline-offset-4 hover:text-neutral-900 transition-colors cursor-pointer"
                    >
                        إزالة
                    </button>
                </div>
            </div>

            {/* ── Price ──────────────────────────────────────── */}
            <div className="text-left sm:text-left shrink-0 sm:pt-0">
                <p className="text-base text-neutral-900 font-medium">
                    {lineTotal.toLocaleString('ar-EG')} {CURRENCY}
                </p>
                {item.quantity > 1 && (
                    <p className="text-xs text-neutral-400 mt-1">
                        {item.price.toLocaleString('ar-EG')} {CURRENCY} / للقطعة
                    </p>
                )}
            </div>
        </div>
    );
}
