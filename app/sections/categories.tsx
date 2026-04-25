'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { usePathname } from 'next/navigation';

// ── Types ─────────────────────────────────────────────────────

type Category = {
    id: string;
    name: string;
    image_url: string | null;
};

// ── Component ─────────────────────────────────────────────────

export default function Categories() {
    const t = useTranslations('categories');
    const pathname = usePathname();
    const locale = pathname.match(/^\/(ar|en)/)?.[1] || 'ar';
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    // ── Drag-to-scroll state ──────────────────────────────────
    const scrollRef = useRef<HTMLDivElement>(null);
    const isDragging = useRef(false);
    const startX = useRef(0);
    const startY = useRef(0);
    const scrollLeftStart = useRef(0);
    const scrollTopStart = useRef(0);
    const hasMoved = useRef(false);
    const [grabbing, setGrabbing] = useState(false);

    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        const el = scrollRef.current;
        if (!el) return;
        isDragging.current = true;
        hasMoved.current = false;
        startX.current = e.pageX;
        startY.current = e.pageY;
        scrollLeftStart.current = el.scrollLeft;
        scrollTopStart.current = el.scrollTop;
        setGrabbing(true);
    }, []);

    const handleMouseMove = useCallback((e: React.MouseEvent) => {
        if (!isDragging.current || !scrollRef.current) return;
        e.preventDefault();
        const dx = e.pageX - startX.current;
        const dy = e.pageY - startY.current;
        if (Math.abs(dx) > 3 || Math.abs(dy) > 3) hasMoved.current = true;
        scrollRef.current.scrollLeft = scrollLeftStart.current - dx;
        scrollRef.current.scrollTop = scrollTopStart.current - dy;
    }, []);

    const handleMouseUp = useCallback(() => {
        isDragging.current = false;
        setGrabbing(false);
    }, []);

    const handleClick = useCallback((e: React.MouseEvent) => {
        // Prevent link navigation if user was dragging
        if (hasMoved.current) {
            e.preventDefault();
            e.stopPropagation();
        }
    }, []);

    useEffect(() => {
        let cancelled = false;

        async function fetchCategories() {
            try {
                const res = await fetch('/api/categories', { cache: 'no-store' });
                const data = await res.json();
                if (!cancelled && data.success) {
                    setCategories(data.categories);
                }
            } catch (err) {
                console.error('Failed to fetch categories:', err);
                if (!cancelled) setError(true);
            } finally {
                if (!cancelled) setLoading(false);
            }
        }

        fetchCategories();
        return () => { cancelled = true; };
    }, []);

    // ── Don't render if no categories ─────────────────────────
    if (!loading && error) return null;
    if (!loading && categories.length === 0) return null;

    return (
        <section id="categories" aria-labelledby="categories-heading" className="bg-white py-10 sm:py-16">
            <div className="px-4 sm:px-6 lg:px-8">

                {/* Section Title */}
                <div className="mb-8 sm:mb-10">
                    <h2 id="categories-heading" className="text-xl sm:text-2xl md:text-3xl font-bold text-neutral-900 tracking-tight">
                        {t('title')}
                    </h2>
                </div>

                {/* Loading Skeleton */}
                {loading ? (
                    <div className="flex items-center justify-center py-16 min-h-[250px]">
                        <Loader2 className="h-6 w-6 animate-spin text-neutral-300" />
                    </div>
                ) : (
                    /* Categories Horizontal Scroll */
                    <div className="relative">
                        <div
                            ref={scrollRef}
                            className={`flex overflow-auto gap-3 sm:gap-4 pb-4 select-none [&::-webkit-scrollbar]:hidden ${grabbing ? 'cursor-grabbing' : 'cursor-grab'}`}
                            style={{ scrollbarWidth: 'none' }}
                            onMouseDown={handleMouseDown}
                            onMouseMove={handleMouseMove}
                            onMouseUp={handleMouseUp}
                            onMouseLeave={handleMouseUp}
                        >
                            {categories.map((category, index) => (
                                <Link
                                    key={category.id}
                                    href={`/${locale}/shop?category=${encodeURIComponent(category.name)}`}
                                    className="group block shrink-0 w-[55vw] sm:w-[220px] lg:w-[260px]"
                                    onClick={handleClick}
                                    draggable={false}
                                >
                                    <div className="flex flex-col gap-3">
                                        {/* Image Container */}
                                        <div className="relative overflow-hidden aspect-[3/4] rounded-xl">
                                            {category.image_url ? (
                                                <Image
                                                    src={category.image_url}
                                                    alt={category.name}
                                                    fill
                                                    sizes="(max-width: 640px) 55vw, 260px"
                                                    priority={index < 3}
                                                    className="object-contain transition-transform duration-500 group-hover:scale-105 mix-blend-multiply"
                                                    draggable={false}
                                                />
                                            ) : (
                                                <div className="absolute inset-0 flex items-center justify-center">
                                                    <span className="text-3xl font-bold text-neutral-300/50">
                                                        {category.name.charAt(0)}
                                                    </span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Text & Icon */}
                                        <div className="flex items-center justify-between px-1">
                                            <div className="flex flex-col gap-0.5">
                                                <h3 className="text-sm sm:text-base font-bold text-neutral-900 group-hover:text-neutral-600 transition-colors duration-300">
                                                    {category.name}
                                                </h3>
                                                <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-neutral-400 group-hover:text-neutral-900 transition-colors duration-300">
                                                    {t('browse')}
                                                </span>
                                            </div>
                                            <div className="w-8 h-8 rounded-full border border-neutral-200 flex items-center justify-center group-hover:bg-[#B6D0E2] group-hover:border-[#B6D0E2] group-hover:text-black text-neutral-400 transition-all duration-300">
                                                {locale === 'ar' ? <ChevronLeft className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>

                        {/* Fade hint — shows there's more to scroll */}
                        <div className={`pointer-events-none absolute top-0 ${locale === 'ar' ? 'left-0' : 'right-0'} w-16 h-full bg-gradient-to-${locale === 'ar' ? 'r' : 'l'} from-transparent to-white/80`} />
                    </div>
                )}

            </div>
        </section>
    );
}
