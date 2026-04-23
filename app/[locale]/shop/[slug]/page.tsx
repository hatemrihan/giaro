'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { useParams, useRouter, usePathname } from 'next/navigation';
import Nav from '../../../sections/nav';
import Footer from '../../../sections/footer';
import { useCart } from '@/components/contexts/CartContext';
import { isSameAttributes } from '@/lib/cart-utils';
import { ProductDetailsTabs } from './_components/ProductDetailsTabs';
import type { ProductVariant, ProductOptionGroup } from '@/lib/database.types';
import Image from 'next/image';
import Link from 'next/link';

// ─── Types ────────────────────────────────────────────────────

type ProductFull = {
    id: string;
    slug: string;
    name: string;
    price: number;
    original_price: number | null;
    discount: number | null;
    main_image: string;
    images: string[];
    videos: string[];
    description: string;
    detailed_description: string;
    shipping_info: string;
    faqs: { question: string; answer: string }[];
    variants: ProductVariant[];
    option_groups: ProductOptionGroup[];
    stock: number;
    sizes: string;
    size_guide: string;
    show_out_of_stock_badge: boolean;
    show_preorder_badge: boolean;
    categories: string[];
};

type RelatedProduct = {
    id: string;
    slug: string;
    name: string;
    price: number;
    main_image: string;
    variants: ProductVariant[];
    stock: number;
};

// ─── Component ────────────────────────────────────────────────

export default function ProductDetailPage() {
    const params = useParams();
    const router = useRouter();
    const pathname = usePathname();
    const locale = pathname.match(/^\/(ar|en)/)?.[1] || 'ar';

    const [product, setProduct] = useState<ProductFull | null>(null);
    const [relatedProducts, setRelatedProducts] = useState<RelatedProduct[]>([]);
    const [loading, setLoading] = useState(true);

    // Selection state
    const [selectedAttrs, setSelectedAttrs] = useState<Record<string, string>>({});
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);
    const [showCartNotification, setShowCartNotification] = useState(false);
    const [isAddingToCart, setIsAddingToCart] = useState(false);
    const [cartError, setCartError] = useState('');
    const [lowStockThreshold, setLowStockThreshold] = useState(5);
    const [touchStartX, setTouchStartX] = useState<number | null>(null);

    // ── Derived: find matching variant from selected attributes ──
    const optionGroups = useMemo(() =>
        (product?.option_groups ?? []).filter(g => g.name?.trim() && g.values?.length > 0),
        [product?.option_groups]);
    const hasOptions = optionGroups.length > 0;
    const allOptionsSelected = useMemo(() =>
        !hasOptions || optionGroups.every(g => selectedAttrs[g.name]),
        [optionGroups, selectedAttrs, hasOptions]);

    const matchedVariant = useMemo<ProductVariant | null>(() => {
        if (!product || !allOptionsSelected || !hasOptions) return null;
        return product.variants.find(v => {
            const keys = Object.keys(selectedAttrs);
            return keys.length === Object.keys(v.attributes).length &&
                keys.every(k => v.attributes[k] === selectedAttrs[k]);
        }) ?? null;
    }, [product, selectedAttrs, allOptionsSelected, hasOptions]);

    const imageRefs = useRef<(HTMLDivElement | null)[]>([]);
    const { addItem, state } = useCart();
    const currencySymbol = 'ج.م';

    const currentStock = useMemo(() =>
        matchedVariant ? matchedVariant.stock : product?.stock ?? 0,
    [matchedVariant, product?.stock]);

    const hasDiscount = useMemo(() =>
        !!(product?.original_price && product.original_price > (product?.price ?? 0)),
    [product?.original_price, product?.price]);

    const localeRef = useRef(locale);
    useEffect(() => { localeRef.current = locale; }, [locale]);

    // ── Fetch product data ──────────────────────────────────────
    useEffect(() => {
        const controller = new AbortController();
        const fetchData = async () => {

            try {
                const slug = params.slug as string;
                const res = await fetch(`/api/products/${slug}`, {
                    signal: controller.signal
                });
                if (!res.ok) { router.push(`/${localeRef.current}/shop`); return; }

                const data = await res.json();
                if (!data.success) { router.push(`/${localeRef.current}/shop`); return; }

                setProduct(data.product);
                setRelatedProducts(data.relatedProducts || []);
                if (data.lowStockThreshold !== undefined) {
                    setLowStockThreshold(data.lowStockThreshold);
                }

                // Default: auto-select first value of each option group
                if (data.product.option_groups?.length > 0) {
                    const defaultAttrs: Record<string, string> = {};
                    for (const group of data.product.option_groups) {
                        if (group.values.length > 0) {
                            defaultAttrs[group.name] = group.values[0];
                        }
                    }
                    setSelectedAttrs(defaultAttrs);
                    setSelectedImageIndex(0);
                }
            } catch (err: unknown) {
                if (err instanceof Error && err.name === 'AbortError') return;
                router.push(`/${localeRef.current}/shop`);
            } finally {
                setLoading(false);
            }
        };

        if (params.slug) fetchData();

        return () => controller.abort();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [params.slug]);

    // ── Polling — live stock updates ────────────────────────────
    useEffect(() => {
        if (!product?.id) return;

        const interval = setInterval(async () => {
            try {
                const res = await fetch(`/api/products/stock?id=${product.id}`);
                if (!res.ok) return;
                const data = await res.json();

                if (data.success) {
                    setProduct(prev => {
                        if (!prev) return prev;
                        return { ...prev, stock: data.stock, variants: data.variants ?? prev.variants };
                    });
                }
            } catch {
                // Silently handle fetch errors during polling
            }
        }, 30000);

        return () => clearInterval(interval);
    }, [product?.id]);

    // ── Media ───────────────────────────────────────────────────
    const allMedia = useMemo(() => {
        if (!product) return [];

        // Variant-specific images first
        if (matchedVariant?.images?.length) {
            return [
                ...matchedVariant.images,
                ...(matchedVariant.videos || []),
            ];
        }

        // Fallback to main product images
        return [
            product.main_image,
            ...(product.images || []),
            ...(product.videos || []),
        ].filter(Boolean);
    }, [product, matchedVariant]);

    // ── Intersection Observer for desktop thumbnail sync ────────
    useEffect(() => {
        imageRefs.current = imageRefs.current.slice(0, allMedia.length);
    }, [allMedia.length]);

    const mountedRef = useRef(true);
    useEffect(() => {
        mountedRef.current = true;
        return () => { mountedRef.current = false; };
    }, []);

    useEffect(() => {
        if (!product || allMedia.length === 0) return;

        const observers: IntersectionObserver[] = [];
        const options = { root: null, rootMargin: '-50% 0px -50% 0px', threshold: 0 };

        imageRefs.current.forEach((ref, index) => {
            if (ref) {
                const observer = new IntersectionObserver((entries) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting && mountedRef.current) setSelectedImageIndex(index);
                    });
                }, options);
                observer.observe(ref);
                observers.push(observer);
            }
        });

        return () => observers.forEach(o => o.disconnect());
    }, [allMedia.length, product]);

    // ── Add to Cart ─────────────────────────────────────────────
    const handleAddToCart = async () => {
        if (!product || isAddingToCart) return;
        setCartError('');

        // Require all options selected if product has option groups
        if (hasOptions && !allOptionsSelected) {
            setCartError('يرجى اختيار جميع الخيارات أولاً');
            return;
        }

        const availableStock = matchedVariant ? matchedVariant.stock : product.stock;
        if (availableStock <= 0) {
            setCartError(`عذراً، "${product.name}" غير متوفر حالياً`);
            return;
        }

        // Check existing cart quantity — match by attributes
        const cartAttrs = hasOptions ? selectedAttrs : undefined;
        const existing = state.items.find(i => 
            i.id === product.id && isSameAttributes(cartAttrs, i.variant?.attributes)
        );

        if (existing && existing.quantity >= availableStock) {
            setCartError(`عذراً، لديك الحد الأقصى المتاح (${availableStock}) من هذا المنتج في السلة`);
            return;
        }

        try {
            setIsAddingToCart(true);

            addItem({
                id: product.id,
                name: product.name,
                image: product.main_image,
                price: matchedVariant?.price || product.price,
                maxStock: availableStock,
                variant: cartAttrs ? { attributes: cartAttrs } : undefined,
            }, 1);

            setShowCartNotification(true);
            setTimeout(() => setShowCartNotification(false), 3000);
        } catch {
            setCartError('فشل في الإضافة إلى السلة');
        } finally {
            setIsAddingToCart(false);
        }
    };

    // ── Loading ─────────────────────────────────────────────────
    if (loading) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-neutral-900" />
            </div>
        );
    }

    if (!product) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-xl font-medium text-neutral-800 mb-4">المنتج غير موجود</h2>
                    <button
                        onClick={() => router.push(`/${locale}/shop`)}
                        className="bg-neutral-900 text-white px-6 py-3 text-sm font-medium hover:bg-neutral-800 transition-colors cursor-pointer"
                    >
                        العودة إلى المتجر
                    </button>
                </div>
            </div>
        );
    }

    // ── Render ───────────────────────────────────────────────────
    return (
        <>
            <div className="min-h-screen bg-white">
                <Nav />

                <div className="pt-20">
                    <div className="max-w-[1100px] mx-auto px-6 lg:px-0 py-8">
                        {/* ═══ Main Product Section ═══ */}
                        {/* RTL layout: Details RIGHT | Images CENTER | Thumbnails LEFT */}
                        <div className="grid grid-cols-1 lg:grid-cols-[420px_minmax(400px,600px)_100px] gap-4 lg:gap-10 mb-8 lg:mb-16">

                            {/* ── RIGHT (RTL): Product Details ──────────── */}
                            <div className="space-y-4 order-2 lg:order-1">
                                {/* Breadcrumb — desktop */}
                                <nav className="hidden lg:block text-xs text-neutral-500 mb-4">
                                    <span>{product.categories?.[0] || 'المنتجات'}</span>
                                    <span className="mx-2">·</span>
                                    <span>{product.name}</span>
                                </nav>

                                {/* Name + Price */}
                                <div>
                                    <h1 className="text-xl lg:text-2xl font-light text-neutral-800 mb-2">
                                        {product.name}
                                    </h1>
                                    <div className="flex items-center gap-3 mt-4">
                                        <p className="text-base lg:text-lg text-neutral-900 font-light">
                                            {(matchedVariant?.price || product.price).toLocaleString('ar-EG')} {currencySymbol}
                                        </p>
                                        {hasDiscount && (
                                            <p className="text-sm text-neutral-400 line-through">
                                                {product.original_price?.toLocaleString('ar-EG')} {currencySymbol}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* Dynamic Attribute Selection */}
                                {hasOptions && optionGroups.map((group) => (
                                    <div key={group.name} className="space-y-3 pt-6 border-t border-neutral-200">
                                        <p className="text-sm text-neutral-700">
                                            {group.name}: <span className="font-normal">{selectedAttrs[group.name] || '—'}</span>
                                        </p>
                                        <div className="flex flex-wrap gap-2">
                                            {group.values.map((value) => {
                                                const isSelected = selectedAttrs[group.name] === value;
                                                return (
                                                    <button
                                                        key={value}
                                                        onClick={() => {
                                                            setSelectedAttrs(prev => ({ ...prev, [group.name]: value }));
                                                            setSelectedImageIndex(0);
                                                        }}
                                                        className={`px-4 py-2 text-sm border transition-all duration-200 cursor-pointer ${isSelected
                                                            ? 'border-neutral-900 bg-neutral-900 text-white'
                                                            : 'border-neutral-300 text-neutral-700 hover:border-neutral-900'
                                                            }`}
                                                    >
                                                        {value}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ))}

                                {/* Error */}
                                {cartError && (
                                    <p className="text-red-500 text-sm">{cartError}</p>
                                )}

                                {/* Add to Cart */}
                                <button
                                    onClick={handleAddToCart}
                                    disabled={isAddingToCart || currentStock <= 0}
                                    className={`w-full py-4 text-sm font-medium tracking-wide transition-colors cursor-pointer ${currentStock <= 0
                                        ? 'bg-neutral-200 text-neutral-400 cursor-not-allowed'
                                        : 'bg-neutral-900 hover:bg-neutral-800 text-white'
                                        }`}
                                >
                                    {isAddingToCart
                                        ? 'جاري الإضافة...'
                                        : currentStock <= 0
                                            ? 'نفذ المخزون'
                                            : 'أضف إلى السلة'
                                    }
                                </button>

                                {/* Low stock warning */}
                                {currentStock > 0 && currentStock <= lowStockThreshold && (
                                    <p className="text-xs text-amber-600 font-medium">بقي {currentStock} فقط في المخزون</p>
                                )}

                                {/* Short description */}
                                {product.description && (
                                    <div className="text-sm text-neutral-600 leading-relaxed pt-4">
                                        <p className="font-light">{product.description}</p>
                                    </div>
                                )}

                                {/* Expandable details tabs */}
                                <ProductDetailsTabs
                                    description={product.description}
                                    detailedDescription={product.detailed_description}
                                    shippingInfo={product.shipping_info}
                                    faqs={product.faqs}
                                />
                            </div>

                            {/* ── CENTER: Stacked Images — Desktop ─────── */}
                            <div className="hidden lg:block order-2">
                                <div className="flex flex-col gap-4 w-full">
                                    {allMedia.map((src, index) => (
                                        <div
                                            key={src}
                                            ref={(el) => { imageRefs.current[index] = el; }}
                                            className="flex items-center justify-center w-full"
                                        >
                                            <Image
                                                src={src}
                                                alt={`${product.name} - ${index + 1}`}
                                                width={1000}
                                                height={1000}
                                                unoptimized={src.startsWith('blob:')}
                                                className="object-contain w-full h-auto"
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* ── LEFT (RTL): Thumbnails — Desktop ──────── */}
                            <div className="hidden lg:block order-3">
                                {allMedia.length > 1 && (
                                    <div className="flex flex-col gap-3 sticky top-24">
                                        {allMedia.map((src, index) => (
                                            <button
                                                key={src}
                                                onClick={() => {
                                                    imageRefs.current[index]?.scrollIntoView({
                                                        behavior: 'smooth',
                                                        block: 'center',
                                                    });
                                                }}
                                                className={`w-full aspect-square overflow-hidden border transition-all duration-200 bg-white flex items-center justify-center cursor-pointer ${selectedImageIndex === index
                                                    ? 'border-neutral-900 border-2'
                                                    : 'border-neutral-200 hover:border-neutral-400'
                                                    }`}
                                            >
                                                <Image
                                                    src={src}
                                                    alt={`عرض ${index + 1}`}
                                                    width={400}
                                                    height={400}
                                                    unoptimized={src.startsWith('blob:')}
                                                    className="w-full h-full object-cover"
                                                />
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* ── MOBILE: Swipeable Gallery ────────────── */}
                            <div className="lg:hidden col-span-1 order-1">
                                <div dir="ltr" className="overflow-hidden relative flex items-center justify-center">
                                    <div
                                        className="w-full flex transition-transform duration-300 ease-out"
                                        style={{ transform: `translateX(-${selectedImageIndex * 100}%)` }}
                                        onTouchStart={(e) => setTouchStartX(e.touches[0].clientX)}
                                        onTouchEnd={(e) => {
                                            if (touchStartX === null) return;
                                            const diff = touchStartX - e.changedTouches[0].clientX;
                                            if (Math.abs(diff) > 50) {
                                                setSelectedImageIndex(prev =>
                                                    diff > 0
                                                        ? Math.min(prev + 1, allMedia.length - 1)
                                                        : Math.max(prev - 1, 0)
                                                );
                                            }
                                            setTouchStartX(null);
                                        }}
                                    >
                                        {allMedia.map((src, index) => (
                                            <div key={src} className="w-full flex-shrink-0 flex items-center justify-center">
                                                <Image
                                                    src={src}
                                                    alt={`${product.name} ${index + 1}`}
                                                    width={1000}
                                                    height={1000}
                                                    unoptimized={src.startsWith('blob:')}
                                                    className="w-full h-auto object-contain"
                                                />
                                            </div>
                                        ))}
                                    </div>

                                    {/* Mobile dots */}
                                    {allMedia.length > 1 && (
                                        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-1.5 z-10 bg-white/80 px-3 py-2 rounded-full">
                                            {allMedia.map((src, index) => (
                                                <button
                                                    key={src}
                                                    onClick={() => setSelectedImageIndex(index)}
                                                    className={`h-1.5 rounded-full transition-all duration-200 cursor-pointer ${selectedImageIndex === index
                                                        ? 'bg-neutral-900 w-5'
                                                        : 'bg-neutral-300 w-1.5'
                                                        }`}
                                                />
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Mobile thumbnail strip */}
                                {allMedia.length > 1 && (
                                    <div className="grid grid-cols-7 gap-2 mt-3">
                                        {allMedia.map((src, index) => (
                                            <button
                                                key={src}
                                                onClick={() => setSelectedImageIndex(index)}
                                                className={`relative aspect-square overflow-hidden border transition-all duration-200 bg-white flex items-center justify-center cursor-pointer ${selectedImageIndex === index
                                                    ? 'border-neutral-900 border-2'
                                                    : 'border-neutral-200'
                                                    }`}
                                            >
                                                <Image
                                                    src={src}
                                                    alt={`عرض ${index + 1}`}
                                                    fill
                                                    sizes="60px"
                                                    className="object-cover"
                                                />
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* ═══ Related Products ═══ */}
                        {relatedProducts.length > 0 && (
                            <section className="py-16 border-t border-neutral-200 mt-16">
                                <h2 className="text-xl lg:text-2xl font-light text-neutral-900 mb-12">
                                    المزيد من المنتجات
                                </h2>
                                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-8">
                                    {relatedProducts.map((rp) => (
                                        <Link
                                            key={rp.id}
                                            href={`/${locale}/shop/${rp.slug}`}
                                            className="cursor-pointer group block"
                                        >
                                            <div className="mb-4 overflow-hidden flex items-center justify-center  aspect-[3/4]">
                                                {rp.main_image ? (
                                                    <Image
                                                        src={rp.main_image}
                                                        alt={rp.name}
                                                        width={600}
                                                        height={800}
                                                        unoptimized={rp.main_image.startsWith('blob:')}
                                                        className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-neutral-300">
                                                        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                        </svg>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="space-y-1.5">
                                                <h3 className="text-sm font-light text-neutral-900 leading-tight line-clamp-2">
                                                    {rp.name}
                                                </h3>
                                                <p className="text-sm text-neutral-900 font-light">
                                                    {rp.price.toLocaleString('ar-EG')} {currencySymbol}
                                                </p>
                                                {/* Variant count indicator */}
                                                {rp.variants?.length > 0 && (
                                                    <p className="text-[11px] text-neutral-400 pt-0.5">
                                                        {rp.variants.length} {rp.variants.length === 1 ? 'خيار' : 'خيارات'}
                                                    </p>
                                                )}
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </section>
                        )}
                    </div>
                </div>
            </div>

            {/* Cart notification toast */}
            {showCartNotification && (
                <div className="fixed top-4 left-4 bg-neutral-900 text-white px-6 py-3 rounded-lg z-50 shadow-lg text-sm animate-in slide-in-from-top-2 fade-in duration-300">
                    ✓ تمت الإضافة إلى السلة
                </div>
            )}

            <Footer />
        </>
    );
}
