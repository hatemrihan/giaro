"use client";

import React, { useEffect, useRef, useState } from "react";
import { useTranslations } from 'next-intl';

const Words: React.FC = () => {
    const t = useTranslations('words');
    const fullText = t('fullText');
    const sectionRef = useRef<HTMLDivElement>(null);
    const [isInView, setIsInView] = useState(false);
    const [displayedChars, setDisplayedChars] = useState(0);
    const [isComplete, setIsComplete] = useState(false);

    // Detect when section is in view
    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting && !isInView) {
                    setIsInView(true);
                }
            },
            { threshold: 0.3 }
        );

        if (sectionRef.current) {
            observer.observe(sectionRef.current);
        }

        return () => observer.disconnect();
    }, [isInView]);

    // Typewriter effect
    useEffect(() => {
        if (!isInView || isComplete) return;

        const interval = setInterval(() => {
            setDisplayedChars((prev) => {
                if (prev >= fullText.length) {
                    setIsComplete(true);
                    clearInterval(interval);
                    return prev;
                }
                return prev + 1;
            });
        }, 50); // Speed of typing (50ms per character)

        return () => clearInterval(interval);
    }, [isInView, isComplete, fullText.length]);

    // Split text into visible and shadow parts
    const visibleText = fullText.slice(0, displayedChars);
    const currentChar = fullText[displayedChars] || "";
    const remainingText = fullText.slice(displayedChars + 1);

    return (
        <section
            id="about"
            ref={sectionRef}
            className="w-full bg-white min-h-[50vh] md:min-h-[60vh] flex items-center justify-center py-20 md:py-24 lg:py-32 px-6 md:px-12 lg:px-20 transition-colors duration-300"
        >
            <div className="w-full max-w-5xl mx-auto text-center" dir="rtl">
                <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-medium text-neutral-900 tracking-tight leading-relaxed transition-colors duration-300">
                    {/* Visible typed text */}
                    <span>{visibleText}</span>

                    {/* Current character with blur/shadow effect */}
                    {!isComplete && currentChar && (
                        <span
                            className="inline-block transition-all duration-100"
                            style={{
                                color: "#525252",
                                textShadow: "0 0 20px rgba(0,0,0,0.1)",
                                filter: "blur(2px)",
                            }}
                        >
                            {currentChar}
                        </span>
                    )}

                    {/* Remaining text - hidden but takes space for layout */}
                    <span className="opacity-0">{remainingText}</span>
                </h2>
            </div>
        </section>
    );
};

export default Words;
