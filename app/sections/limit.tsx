'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState, useRef } from 'react';

interface Offer {
    id: string;
    title: string;
    description: string;
    image: string;
    link: string;
    product_ids: string[];
    discount_label: string;
}

interface Product {
    id: string;
    name: string;
    slug: string;
    main_image: string;
    price: number;
    original_price: number | null;
}

export default function LimitOffer() {
    const [offers, setOffers] = useState<Offer[]>([]);
    const [products, setProducts] = useState<Map<string, Product>>(new Map());
    const [loading, setLoading] = useState(true);
    const [inView, setInView] = useState(false);
    const sectionRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        fetch('/api/offers?page=homepage', { cache: 'no-store' })
            .then(res => res.json())
            .then(async (data: Offer[]) => {
                setOffers(data);

                // Collect all product IDs from offers
                const allProductIds = data.flatMap(o => o.product_ids || []);
                if (allProductIds.length > 0) {
                    try {
                        const res = await fetch('/api/products/batch', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ ids: allProductIds }),
                        });
                        if (res.ok) {
                            const productData = await res.json();
                            const map = new Map<string, Product>();
                            (Array.isArray(productData) ? productData : []).forEach((p: Product) => map.set(p.id, p));
                            setProducts(map);
                        }
                    } catch { /* products will use offer fallback data */ }
                }
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    // IntersectionObserver for in-view animation
    useEffect(() => {
        const el = sectionRef.current;
        if (!el) return;
        const observer = new IntersectionObserver(
            ([entry]) => { if (entry.isIntersecting) { setInView(true); observer.disconnect(); } },
            { threshold: 0.15 }
        );
        observer.observe(el);
        return () => observer.disconnect();
    }, [loading]);

    if (!loading && offers.length === 0) return null;

    // Get display data for an offer (use product data if linked)
    const getOfferDisplay = (offer: Offer) => {
        const firstProductId = (offer.product_ids || [])[0];
        const product = firstProductId ? products.get(firstProductId) : null;
        return {
            image: offer.image || product?.main_image || '/images/two.jpg',
            title: offer.title || product?.name || '',
            link: product ? `/shop/${product.slug}` : (offer.link || '/shop'),
            discount_label: offer.discount_label || '',
        };
    };

    return (
        <section className="w-full py-10 sm:py-16">
            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <div className="w-5 h-5 border-2 border-neutral-300 border-t-neutral-900 rounded-full animate-spin" />
                </div>
            ) : (
                <div ref={sectionRef} className="px-6 sm:px-10 lg:px-16 max-w-6xl mx-auto">
                    {/* Scroll on mobile, 3-col grid on desktop */}
                    <div
                        className="flex lg:grid lg:grid-cols-3 gap-5 sm:gap-6 overflow-auto lg:overflow-visible select-none cursor-grab active:cursor-grabbing [&::-webkit-scrollbar]:hidden"
                        style={{ scrollbarWidth: 'none' }}
                    >
                        {offers.map((offer, index) => {
                            const display = getOfferDisplay(offer);
                            return (
                                <Link
                                    key={offer.id}
                                    href={display.link}
                                    className={`group block shrink-0 w-[70vw] sm:w-[55vw] lg:w-auto transition-all duration-700 ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
                                    style={{ transitionDelay: inView ? `${index * 120}ms` : '0ms' }}
                                    draggable={false}
                                >
                                    {/* Title + description above image */}
                                    <div className="mb-3 px-1">
                                        <h3 className="text-sm sm:text-base font-bold text-neutral-900 group-hover:text-neutral-600 transition-colors duration-300 leading-tight">
                                            {display.title}
                                        </h3>
                                        {offer.description && (
                                            <p className="text-[11px] sm:text-xs text-neutral-400 mt-1 line-clamp-1">
                                                {offer.description}
                                            </p>
                                        )}
                                    </div>

                                    {/* Image */}
                                    <div className="relative w-full aspect-[5/4] overflow-hidden">
                                        <Image
                                            src={display.image}
                                            alt={display.title}
                                            fill
                                            className="object-cover object-center transition-transform duration-500 group-hover:scale-105"
                                            sizes="(max-width: 640px) 70vw, (max-width: 1024px) 55vw, 33vw"
                                            draggable={false}
                                        />
                                        {display.discount_label && (
                                            <div className="absolute top-3 left-3 bg-black/80 text-white text-[10px] sm:text-xs font-bold px-2.5 py-1 rounded">
                                                {display.discount_label}
                                            </div>
                                        )}
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                </div>
            )}
        </section>
    );
}
