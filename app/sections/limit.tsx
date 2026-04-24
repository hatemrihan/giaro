'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';

interface Offer {
    id: string;
    title: string;
    description: string;
    image: string;
    link: string;
}

export default function LimitOffer() {
    const t = useTranslations('limit');
    const [offers, setOffers] = useState<Offer[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/offers?page=homepage', { cache: 'no-store' })
            .then(res => res.json())
            .then((data: Offer[]) => {
                setOffers(data);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    if (!loading && offers.length === 0) return null;

    const offer = offers[0];

    return (
        <section className="bg-white relative w-full overflow-hidden">
            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <div className="w-5 h-5 border-2 border-neutral-300 border-t-neutral-900 rounded-full animate-spin" />
                </div>
            ) : (
                <>
                    <div className="flex flex-col md:flex-row items-stretch w-full">
                        <div className="w-full md:w-[55%] flex items-center justify-center pt-10 pb-4 px-6 sm:py-20 md:px-12 lg:px-20 order-1 md:order-none">
                            <div className="w-full max-w-lg flex flex-col items-start gap-4 sm:gap-6">
                                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-medium text-neutral-900 tracking-wider uppercase mb-2">
                                    {offer?.title || t('title')}
                                </h2>
                                <p className="text-sm sm:text-base text-neutral-700 leading-relaxed">
                                    {offer?.description || t('desc')}
                                </p>
                                <Link
                                    href={offer?.link || '/shop'}
                                    className="inline-block border-b border-neutral-900 pb-1 mt-4 text-xs sm:text-sm font-semibold text-neutral-900 transition-colors hover:text-neutral-600 hover:border-neutral-600 uppercase tracking-widest"
                                >
                                    {t('explore')}
                                </Link>
                            </div>
                        </div>
                        <div className="w-full md:w-[45%] relative min-h-[350px] sm:min-h-[450px] lg:min-h-[500px] order-2 md:order-none">
                            <Image
                                src={offer?.image || '/images/two.jpg'}
                                alt={offer?.title || 'عرض لفترة محدودة'}
                                fill
                                className="object-cover object-center mix-blend-multiply"
                                sizes="(max-width: 768px) 100vw, 45vw"
                            />
                        </div>
                    </div>

                    {offers.slice(1).map(o => (
                        <div key={o.id} className="flex flex-col md:flex-row-reverse items-stretch w-full border-t border-neutral-100">
                            <div className="w-full md:w-[55%] flex items-center justify-center pt-10 pb-4 px-6 sm:py-20 md:px-12 lg:px-20">
                                <div className="w-full max-w-lg flex flex-col items-start gap-4 sm:gap-6">
                                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-medium text-neutral-900 tracking-wider uppercase mb-2">
                                        {o.title}
                                    </h2>
                                    <p className="text-sm sm:text-base text-neutral-700 leading-relaxed">
                                        {o.description}
                                    </p>
                                    <Link
                                        href={o.link || '/shop'}
                                        className="inline-block border-b border-neutral-900 pb-1 mt-4 text-xs sm:text-sm font-semibold text-neutral-900 transition-colors hover:text-neutral-600 hover:border-neutral-600 uppercase tracking-widest"
                                    >
                                        {t('explore')}
                                    </Link>
                                </div>
                            </div>
                            <div className="w-full md:w-[45%] relative min-h-[350px] sm:min-h-[450px] lg:min-h-[500px]">
                                <Image
                                    src={o.image || '/images/two.jpg'}
                                    alt={o.title}
                                    fill
                                    className="object-cover object-center mix-blend-multiply"
                                    sizes="(max-width: 768px) 100vw, 45vw"
                                />
                            </div>
                        </div>
                    ))}
                </>
            )}
        </section>
    );
}
