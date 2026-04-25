'use client';

import { useEffect, useState } from 'react';
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
        <section id="categories" aria-labelledby="categories-heading" className="bg-white py-16 sm:py-24">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

                {/* Section Title */}
                <div className="mb-12 sm:mb-16">
                    <h2 id="categories-heading" className="text-2xl sm:text-3xl md:text-4xl font-bold text-neutral-900 tracking-tight">
                        {t('title')}
                    </h2>
                </div>

                {/* Loading Skeleton */}
                {loading ? (
                    <div className="flex items-center justify-center py-20 min-h-[400px]">
                        <Loader2 className="h-6 w-6 animate-spin text-neutral-300" />
                    </div>
                ) : (
                    /* Categories Grid */
                    <div className="space-y-10 sm:space-y-14">
                        {categories.map((category, index) => (
                            <Link
                                key={category.id}
                                href={`/${locale}/shop?category=${encodeURIComponent(category.name)}`}
                                className="group block"
                            >
                                <div className="flex flex-col-reverse sm:flex-row items-center gap-6 sm:gap-10 lg:gap-16">

                                    {/* Image */}
                                    <div className="w-full sm:w-1/2 lg:w-[55%]">
                                        <div className="relative overflow-hidden aspect-[4/5]">
                                            {category.image_url ? (
                                                <Image
                                                    src={category.image_url}
                                                    alt={category.name}
                                                    fill
                                                    sizes="(max-width: 640px) 100vw, 55vw"
                                                    priority={index === 0}
                                                    className="object-contain transition-transform duration-500 group-hover:scale-105 mix-blend-multiply"
                                                />
                                            ) : (
                                                <div className="absolute inset-0 flex items-center justify-center">
                                                    <span className="text-4xl font-bold text-neutral-300/50">
                                                        {category.name.charAt(0)}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Text */}
                                    <div className="w-full sm:w-1/2 lg:w-[45%] flex flex-col items-start gap-4">
                                        <h3 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-neutral-900 group-hover:text-neutral-600 transition-colors duration-300">
                                            {category.name}
                                        </h3>
                                        <span className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-neutral-900 group-hover:gap-3 transition-all duration-300">
                                            {t('browse')}
                                            {locale === 'ar' ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                                        </span>
                                    </div>

                                </div>
                            </Link>
                        ))}
                    </div>
                )}

            </div>
        </section>
    );
}
