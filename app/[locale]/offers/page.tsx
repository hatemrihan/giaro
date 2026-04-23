'use client';

import Image from 'next/image';
import Link from 'next/link';
import Nav from '@/app/sections/nav';
import Footer from '@/app/sections/footer';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

interface Offer {
    id: string;
    title: string;
    description: string;
    image: string;
    link: string;
    display_order: number;
}

export default function OffersPage() {
    const [offers, setOffers] = useState<Offer[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/offers')
            .then(res => res.json())
            .then((data: Offer[]) => {
                setOffers(data);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    return (
        <>
            <Nav />

            {/* Hero */}
            <section className="bg-white pt-[18vh] pb-12 px-6" dir="rtl">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="max-w-4xl mx-auto text-center"
                >
                    <h1 className="text-[clamp(2rem,5vw,3.5rem)] font-medium text-black tracking-tight leading-[1.2]">
                        العروض الحصرية
                    </h1>
                    <p className="text-neutral-500 text-sm sm:text-base mt-3 max-w-xl mx-auto leading-relaxed">
                        اكتشف أحدث العروض والتخفيضات المتاحة لفترة محدودة
                    </p>
                </motion.div>
            </section>

            {/* Offers Grid */}
            <section className="bg-white pb-20 px-4 sm:px-6" dir="rtl">
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="w-6 h-6 border-2 border-neutral-300 border-t-neutral-900 rounded-full animate-spin" />
                    </div>
                ) : offers.length === 0 ? (
                    <div className="text-center py-20 text-neutral-400 text-sm">
                        لا توجد عروض حالياً
                    </div>
                ) : (
                    <div className="max-w-6xl mx-auto space-y-0">
                        {offers.map((offer, index) => {
                            const isReversed = index % 2 !== 0;
                            return (
                                <motion.div
                                    key={offer.id}
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.6, delay: index * 0.05 }}
                                    viewport={{ once: true }}
                                    className={`flex flex-col ${isReversed ? 'md:flex-row-reverse' : 'md:flex-row'} items-stretch w-full border-t border-neutral-100 first:border-t-0`}
                                >
                                    {/* Text Side */}
                                    <div className="w-full md:w-[55%] flex items-center justify-center py-14 px-6 sm:py-18 md:px-12 lg:px-20">
                                        <div className="w-full max-w-lg flex flex-col items-start gap-4 sm:gap-5">
                                            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-medium text-neutral-900 tracking-wider uppercase">
                                                {offer.title}
                                            </h2>
                                            {offer.description && (
                                                <p className="text-sm sm:text-base text-neutral-600 leading-relaxed">
                                                    {offer.description}
                                                </p>
                                            )}
                                            <Link
                                                href={offer.link || '/offers'}
                                                className="inline-block border-b border-neutral-900 pb-1 mt-2 text-xs sm:text-sm font-semibold text-neutral-900 transition-colors hover:text-neutral-600 hover:border-neutral-600 uppercase tracking-widest"
                                            >
                                                تسوق الآن
                                            </Link>
                                        </div>
                                    </div>

                                    {/* Image Side */}
                                    <div className="w-full md:w-[45%] relative min-h-[300px] sm:min-h-[400px] lg:min-h-[450px]">
                                        {offer.image ? (
                                            <Image
                                                src={offer.image}
                                                alt={offer.title}
                                                fill
                                                className="object-cover object-center"
                                                sizes="(max-width: 768px) 100vw, 45vw"
                                            />
                                        ) : (
                                            <div className="w-full h-full bg-neutral-100 flex items-center justify-center">
                                                <span className="text-neutral-300 text-sm">لا توجد صورة</span>
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                )}
            </section>

            <Footer />
        </>
    );
}
