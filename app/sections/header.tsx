'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import Image from 'next/image';

export default function Header() {
    const t = useTranslations('header');

    return (
        <>
            {/* Full-Screen Video Section with Centered Overlay Text */}
            <section className="relative w-full h-[60dvh] md:h-[100dvh]  overflow-hidden flex items-center justify-center">
                <Image
                    src="/images/newheader.jpeg"
                    width={1920}
                    height={1080}
                    alt="Hero Image"
                    priority
                    className="absolute inset-0 w-full h-full object-contain md:object-cover"
                />
                {/* <video
                    src="/videos/three.mov"
                    autoPlay
                    muted
                    loop
                    playsInline
                    className="absolute inset-0 w-full h-full object-cover"
                /> */}
                <div className="absolute inset-0  pointer-events-none" />

                {/* Text & CTA Overlay */}
                <div className="relative z-10 flex flex-col items-center text-center px-4 sm:px-6 lg:px-8">
                    {/* Heading */}
                    <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-[1.15] drop-shadow-md">
                        {t('title1')}
                        <br />
                        <span className="text-yellow-500 bg-clip-text bg-gradient-to-l from-amber-300 via-amber-400 to-amber-500 mt-2 inline-block drop-shadow-sm">
                            {t('title2')}
                        </span>
                    </h1>

                    {/* CTA Link */}
                    <div className="text-center mt-8">
                        <Link
                            href="/shop"
                            className="inline-block text-sm font-semibold uppercase tracking-[0.2em] text-white pb-1 border-b border-white hover:text-amber-400 hover:border-amber-400 transition-colors drop-shadow-sm"
                        >
                            {t('shopNow')}
                        </Link>
                    </div>
                </div>
            </section>
        </>
    );
}
