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
}

export default function LimitOffer() {
    const [offers, setOffers] = useState<Offer[]>([]);
    const [loading, setLoading] = useState(true);
    const [inView, setInView] = useState(false);
    const sectionRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        fetch('/api/offers?page=homepage', { cache: 'no-store' })
            .then(res => res.json())
            .then((data: Offer[]) => {
                setOffers(data);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    // ── IntersectionObserver for in-view animation ─────────────
    useEffect(() => {
        const el = sectionRef.current;
        if (!el) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setInView(true);
                    observer.disconnect();
                }
            },
            { threshold: 0.15 }
        );

        observer.observe(el);
        return () => observer.disconnect();
    }, [loading]);

    if (!loading && offers.length === 0) return null;

    return (
        <section className="w-full py-10 sm:py-16">
            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <div className="w-5 h-5 border-2 border-neutral-300 border-t-neutral-900 rounded-full animate-spin" />
                </div>
            ) : (
                <div ref={sectionRef} className="px-6 sm:px-10 lg:px-16 max-w-6xl mx-auto">
                    {/* Center-aligned title */}
                    {/* <h2
                        className={`text-2xl sm:text-3xl lg:text-4xl font-bold text-neutral-900 tracking-tight text-center mb-14 sm:mb-20 transition-all duration-700 ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
                    >
                        العروض
                    </h2> */}

                    {/* Scroll on mobile, 3-col grid on desktop */}
                    <div
                        className="flex lg:grid lg:grid-cols-3 gap-5 sm:gap-6 overflow-auto lg:overflow-visible select-none cursor-grab active:cursor-grabbing [&::-webkit-scrollbar]:hidden"
                        style={{ scrollbarWidth: 'none' }}
                    >
                        {offers.map((offer, index) => (
                            <Link
                                key={offer.id}
                                href={offer.link || '/shop'}
                                className={`group block shrink-0 w-[70vw] sm:w-[55vw] lg:w-auto transition-all duration-700 ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
                                style={{ transitionDelay: inView ? `${index * 120}ms` : '0ms' }}
                                draggable={false}
                            >
                                {/* Title + description above image */}
                                <div className="mb-3 px-1">
                                    <h3 className="text-sm sm:text-base font-bold text-neutral-900 group-hover:text-neutral-600 transition-colors duration-300 leading-tight">
                                        {offer.title}
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
                                        src={offer.image || '/images/two.jpg'}
                                        alt={offer.title}
                                        fill
                                        className="object-cover object-center transition-transform duration-500 group-hover:scale-105"
                                        sizes="(max-width: 640px) 70vw, (max-width: 1024px) 55vw, 33vw"
                                        draggable={false}
                                    />
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            )}
        </section>
    );
}
