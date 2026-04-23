'use client';

import { ComicText } from "@/components/ui/comic-text";
import { useTranslations } from 'next-intl';

export default function OneWord() {
    const t = useTranslations('oneword');
    return (
        <section className="w-full bg-white py-12 sm:py-24 flex items-center justify-center overflow-hidden">
            <div className="w-full max-w-[1600px] flex justify-center items-center px-4">
                {/* Ensure it stays on one line and fits on mobile, while being slightly smaller on laptop */}
                <div className="scale-[0.65] sm:scale-90 md:scale-100 lg:scale-110 transform origin-center whitespace-nowrap">
                    <ComicText fontSize={5}>
                        {t('title')}
                    </ComicText>
                </div>
            </div>
        </section>
    );
}
