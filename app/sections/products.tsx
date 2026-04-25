'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

export default function Products() {
    const t = useTranslations('productsSection');

    return (
        <>
            <section className="w-full bg-white py-16 sm:py-24 lg:py-32 overflow-hidden">
                <div className="mx-auto max-w-[1600px] px-6 sm:px-12 md:px-16 lg:px-24 xl:px-32">

                    {/* Header */}
                    <div className="flex justify-between items-center mb-12 sm:mb-16 md:mb-32">
                        <h2 className="text-xl sm:text-2xl md:text-3xl font-medium tracking-wide text-neutral-900 uppercase">
                            {t('title')}
                        </h2>
                        <Link
                            href="/shop"
                            className="text-xs sm:text-sm underline font-bold tracking-[0.2em] text-neutral-900 hover:text-neutral-500 uppercase transition-colors"
                        >
                            {t('shop')}
                        </Link>
                    </div>

                    {/* Grid Container */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-6 sm:gap-x-8 lg:gap-x-16 xl:gap-x-24 gap-y-16 lg:gap-y-0">

                        {/* First Column */}
                        <div className="flex flex-col gap-y-16 sm:gap-y-24 md:gap-y-40">


                            {/* Product 2 */}
                            <div className="flex flex-col xl:flex-row items-start gap-3 sm:gap-6 group cursor-pointer">
                                {/* Image Container */}
                                <div className="relative w-full xl:w-[320px] overflow-hidden transition-transform duration-500 group-hover:scale-[1.02]">
                                    <Image
                                        src="/images/productone.jpg"
                                        alt="Product 1"
                                        width={1000}
                                        height={1000}
                                        className="w-full h-auto"
                                    />
                                </div>
                                {/* Text Content */}
                                <div className="mt-2 xl:mt-12 xl:w-48 flex-shrink-0">
                                    <p className="text-[9px] sm:text-[10px] text-neutral-500 tracking-[0.1em] sm:tracking-[0.15em] uppercase mb-1 sm:mb-2 font-medium">
                                        {t('product1.subtitle')}
                                    </p>
                                    <h3 className="text-sm sm:text-sm md:text-base font-bold text-neutral-900 uppercase leading-snug group-hover:text-neutral-600 transition-colors">
                                        {t('product1.titlePart1')}<br className="hidden xl:block" /> {t('product1.titlePart2')}
                                    </h3>
                                </div>
                            </div>

                            {/* Product 4 */}
                            <div className="flex flex-col xl:flex-row items-start gap-3 sm:gap-6 group cursor-pointer">
                                {/* Image Container */}
                                <div className="relative w-full xl:w-[380px] overflow-hidden transition-transform duration-500 group-hover:scale-[1.02]">
                                    <video
                                        src="/videos/four.mov"
                                        autoPlay
                                        muted
                                        loop
                                        playsInline
                                        className="w-full h-auto object-cover"
                                    />
                                </div>
                                {/* Text Content */}
                                <div className="mt-2 xl:mt-12 xl:w-48 flex-shrink-0">

                                    <h3 className="text-sm sm:text-sm md:text-base font-bold text-neutral-900 uppercase leading-snug group-hover:text-neutral-600 transition-colors">
                                        {t('product2.titlePart1')}<br className="hidden xl:block" /> {t('product2.titlePart2')}
                                    </h3>
                                </div>
                            </div>

                        </div>

                        {/* Second Column */}
                        <div className="flex flex-col gap-y-16 sm:gap-y-24 md:gap-y-40 mt-16 sm:mt-24 md:mt-32">

                            {/* Product 1 */}
                            <div className="flex flex-col items-start gap-3 sm:gap-6 group cursor-pointer w-full">
                                {/* Image Container */}
                                <div className="relative w-full overflow-hidden transition-transform duration-500 group-hover:scale-[1.02]">
                                    <video
                                        src="/videos/five.mov"
                                        autoPlay
                                        muted
                                        loop
                                        playsInline
                                        className="w-full h-auto object-cover border-none outline-none"
                                    />
                                </div>
                                {/* Text Content */}
                                <div className="mt-2 w-full">
                                    <p className="text-[9px] sm:text-[10px] text-neutral-500 tracking-[0.1em] sm:tracking-[0.15em] uppercase mb-1 sm:mb-2 font-medium">
                                        {t('product3.subtitle')}
                                    </p>
                                    <h3 className="text-sm sm:text-sm md:text-base font-bold text-neutral-900 uppercase leading-snug group-hover:text-neutral-600 transition-colors">
                                        {t('product3.titlePart1')}
                                    </h3>
                                </div>
                            </div>



                        </div>
                    </div>
                </div>
            </section>

            {/* Video Section */}
            <section className="relative w-full h-[75dvh] overflow-hidden">
                <video
                    src="/videos/one.mov"
                    autoPlay
                    muted
                    loop
                    playsInline
                    className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 pointer-events-none" />
            </section>
        </>
    );
}

