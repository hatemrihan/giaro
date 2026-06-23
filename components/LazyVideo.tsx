'use client';

import { useRef, useEffect, useState } from 'react';

interface LazyVideoProps {
    src: string;
    className?: string;
    /** If true, video plays as soon as it enters viewport (default: true) */
    autoPlay?: boolean;
}

/**
 * LazyVideo — only loads and plays when the video enters the viewport.
 * Uses IntersectionObserver to avoid downloading all videos on page load.
 */
export default function LazyVideo({ src, className = '', autoPlay = true }: LazyVideoProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isInView, setIsInView] = useState(false);

    useEffect(() => {
        const el = videoRef.current;
        if (!el) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsInView(true);
                    observer.disconnect();
                }
            },
            { rootMargin: '200px' } // Start loading 200px before visible
        );

        observer.observe(el);
        return () => observer.disconnect();
    }, []);

    return (
        <video
            ref={videoRef}
            src={isInView ? src : undefined}
            autoPlay={autoPlay && isInView}
            muted
            loop
            playsInline
            preload="none"
            className={className}
        />
    );
}
