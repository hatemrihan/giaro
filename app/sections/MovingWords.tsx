'use client'

import React, { useEffect, useRef } from 'react'

const MovingWords = () => {
    const scrollerRef = useRef<HTMLDivElement>(null);
    const speed = 1.5; // adjust speed here

    useEffect(() => {
        const scroller = scrollerRef.current;
        if (!scroller) return;

        let scrollPos = 0;
        let animationFrameId: number;

        const loop = () => {
            if (!scroller) return;
            // The scroller contains two identical sets of words.
            // When we've scrolled exactly half its width (the width of one set), we reset to 0.
            if (scrollPos >= scroller.scrollWidth / 2) {
                scrollPos = 0;
            }
            scrollPos += speed;
            // Negative translation because we want to move the items to the right/left depending on what looks best.
            // If dir="rtl", moving negative translates to the right. Let's use a standard left-scroll.
            // Actually, for RTL, scrolling left means content moves from left to right.
            scroller.style.transform = `translateX(${-scrollPos}px)`;
            
            animationFrameId = requestAnimationFrame(loop);
        };

        animationFrameId = requestAnimationFrame(loop);

        return () => cancelAnimationFrame(animationFrameId);
    }, []);

    // Create a single array of items to duplicate
    const items = [...Array(8)].map((_, index) => (
        <div
            key={index}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl min-w-max text-black font-bold flex-shrink-0 mx-8 sm:mx-14 flex items-center tracking-wide"
        >
            <span className="mx-4 text-2xl sm:text-3xl opacity-40">✦</span>
            <span>عروض جيارو</span>
        </div>
    ));

    return (
        <div className="w-full overflow-hidden bg-[#B6D0E2] py-6 sm:py-8 relative" dir="ltr">
            {/* The wrapper that will be animated */}
            <div 
                ref={scrollerRef} 
                className="flex whitespace-nowrap w-max"
                style={{ willChange: 'transform' }}
            >
                {/* First set */}
                <div className="flex shrink-0">
                    {items}
                </div>
                {/* Second set for seamless loop */}
                <div className="flex shrink-0">
                    {items}
                </div>
            </div>
        </div>
    )
}

export default MovingWords