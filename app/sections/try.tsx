'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

// ── Types ─────────────────────────────────────────────────────

interface Product {
    id: string;
    slug: string;
    name: string;
    price: number;
    main_image: string;
}

// ── OGL Carousel Component ────────────────────────────────────

export default function TrySection() {
    const pathname = usePathname();
    const locale = pathname.match(/^\/(ar|en)/)?.[1] || 'ar';
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
    const [inView, setInView] = useState(false);
    const sectionRef = useRef<HTMLElement>(null);

    // ── Fetch products ────────────────────────────────────────
    useEffect(() => {
        fetch('/api/products?limit=8', { cache: 'no-store' })
            .then(res => res.json())
            .then(data => {
                if (data.success && data.products) {
                    setProducts(data.products);
                }
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    // ── InView detection ──────────────────────────────────────
    useEffect(() => {
        const el = sectionRef.current;
        if (!el) return;
        const obs = new IntersectionObserver(
            ([entry]) => { if (entry.isIntersecting) { setInView(true); obs.disconnect(); } },
            { threshold: 0.1 }
        );
        obs.observe(el);
        return () => obs.disconnect();
    }, [loading]);

    // ── OGL WebGL setup ───────────────────────────────────────
    const cleanupRef = useRef<(() => void) | null>(null);

    const initOGL = useCallback(async () => {
        const canvas = canvasRef.current;
        const container = containerRef.current;
        if (!canvas || !container || products.length === 0) return;

        // Dynamic import OGL
        const OGL = await import('ogl');
        const { Renderer, Camera, Transform, Plane, Mesh, Program, Texture } = OGL;

        const renderer = new Renderer({
            canvas,
            alpha: true,
            antialias: true,
            dpr: Math.min(window.devicePixelRatio, 2),
        });
        const gl = renderer.gl;

        const camera = new Camera(gl, { fov: 45 });
        camera.position.z = 5;

        const scene = new Transform();

        // ── Load textures from product images ─────────────────
        const textures: InstanceType<typeof Texture>[] = [];
        const meshes: InstanceType<typeof Mesh>[] = [];

        const vertex = /* glsl */ `
            attribute vec3 position;
            attribute vec2 uv;
            uniform mat4 modelViewMatrix;
            uniform mat4 projectionMatrix;
            uniform float uHover;
            varying vec2 vUv;
            varying float vHover;
            void main() {
                vUv = uv;
                vHover = uHover;
                vec3 pos = position;
                pos.z += uHover * 0.15;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
            }
        `;

        const fragment = /* glsl */ `
            precision highp float;
            uniform sampler2D tMap;
            uniform float uAlpha;
            uniform float uHover;
            varying vec2 vUv;
            varying float vHover;
            void main() {
                vec4 color = texture2D(tMap, vUv);
                // slight brightness boost on hover
                color.rgb += vHover * 0.08;
                gl_FragColor = vec4(color.rgb, color.a * uAlpha);
            }
        `;

        const cardWidth = 1.4;
        const cardHeight = 1.8;
        const gap = 0.25;
        const totalWidth = products.length * (cardWidth + gap) - gap;
        const startX = -totalWidth / 2 + cardWidth / 2;

        const planeGeo = new Plane(gl, {
            width: cardWidth,
            height: cardHeight,
            widthSegments: 1,
            heightSegments: 1,
        });

        for (let i = 0; i < products.length; i++) {
            const texture = new Texture(gl);
            textures.push(texture);

            // Load image
            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.onload = () => {
                texture.image = img;
            };
            img.src = products[i].main_image;

            const program = new Program(gl, {
                vertex,
                fragment,
                uniforms: {
                    tMap: { value: texture },
                    uAlpha: { value: 1.0 },
                    uHover: { value: 0.0 },
                },
                transparent: true,
            });

            const mesh = new Mesh(gl, { geometry: planeGeo, program });
            mesh.position.x = startX + i * (cardWidth + gap);
            mesh.setParent(scene);
            meshes.push(mesh);
        }

        // ── Scroll / drag state ───────────────────────────────
        let scrollTarget = 0;
        let scrollCurrent = 0;
        let isDragging = false;
        let dragStartX = 0;
        let dragStartScroll = 0;

        const onWheel = (e: WheelEvent) => {
            e.preventDefault();
            scrollTarget += e.deltaY * 0.003;
        };

        const onPointerDown = (e: PointerEvent) => {
            isDragging = true;
            dragStartX = e.clientX;
            dragStartScroll = scrollTarget;
            canvas.style.cursor = 'grabbing';
        };

        const onPointerMove = (e: PointerEvent) => {
            if (!isDragging) return;
            const dx = (e.clientX - dragStartX) * 0.005;
            scrollTarget = dragStartScroll - dx;

            // Detect hovered card
            const rect = canvas.getBoundingClientRect();
            const mouseX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
            const worldX = mouseX * (camera.position.z * Math.tan((45 * Math.PI) / 360));
            let closest = -1;
            let minDist = Infinity;
            meshes.forEach((m, idx) => {
                const dist = Math.abs(m.position.x - worldX);
                if (dist < minDist && dist < cardWidth / 2) {
                    minDist = dist;
                    closest = idx;
                }
            });
            setHoveredIndex(closest >= 0 ? closest : null);
        };

        const onPointerUp = () => {
            isDragging = false;
            canvas.style.cursor = 'grab';
        };

        const onMouseMove = (e: MouseEvent) => {
            if (isDragging) return;
            const rect = canvas.getBoundingClientRect();
            const mouseX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
            const worldX = mouseX * (camera.position.z * Math.tan((45 * Math.PI) / 360));
            let closest = -1;
            let minDist = Infinity;
            meshes.forEach((m, idx) => {
                const dist = Math.abs(m.position.x - worldX);
                if (dist < minDist && dist < cardWidth / 2) {
                    minDist = dist;
                    closest = idx;
                }
            });
            setHoveredIndex(closest >= 0 ? closest : null);
        };

        const onMouseLeave = () => setHoveredIndex(null);

        // Touch support
        let touchStartX = 0;
        let touchStartScroll = 0;

        const onTouchStart = (e: TouchEvent) => {
            touchStartX = e.touches[0].clientX;
            touchStartScroll = scrollTarget;
        };

        const onTouchMove = (e: TouchEvent) => {
            e.preventDefault();
            const dx = (e.touches[0].clientX - touchStartX) * 0.005;
            scrollTarget = touchStartScroll - dx;
        };

        canvas.addEventListener('wheel', onWheel, { passive: false });
        canvas.addEventListener('pointerdown', onPointerDown);
        window.addEventListener('pointermove', onPointerMove);
        window.addEventListener('pointerup', onPointerUp);
        canvas.addEventListener('mousemove', onMouseMove);
        canvas.addEventListener('mouseleave', onMouseLeave);
        canvas.addEventListener('touchstart', onTouchStart, { passive: true });
        canvas.addEventListener('touchmove', onTouchMove, { passive: false });

        canvas.style.cursor = 'grab';

        // ── Resize ────────────────────────────────────────────
        const resize = () => {
            const { width, height } = container.getBoundingClientRect();
            renderer.setSize(width, height);
            camera.perspective({ aspect: width / height });
        };
        resize();
        window.addEventListener('resize', resize);

        // ── Animation loop ────────────────────────────────────
        let raf: number;
        const animate = () => {
            raf = requestAnimationFrame(animate);

            // Smooth scroll
            scrollCurrent += (scrollTarget - scrollCurrent) * 0.08;

            // Move meshes
            meshes.forEach((mesh, i) => {
                mesh.position.x = startX + i * (cardWidth + gap) - scrollCurrent;

                // Hover animation
                const targetHover = hoveredIndex === i ? 1.0 : 0.0;
                const prog = mesh.program as InstanceType<typeof Program>;
                const currentHover = prog.uniforms.uHover.value as number;
                prog.uniforms.uHover.value = currentHover + (targetHover - currentHover) * 0.1;
            });

            renderer.render({ scene, camera });
        };
        animate();

        // ── Cleanup ───────────────────────────────────────────
        cleanupRef.current = () => {
            cancelAnimationFrame(raf);
            canvas.removeEventListener('wheel', onWheel);
            canvas.removeEventListener('pointerdown', onPointerDown);
            window.removeEventListener('pointermove', onPointerMove);
            window.removeEventListener('pointerup', onPointerUp);
            canvas.removeEventListener('mousemove', onMouseMove);
            canvas.removeEventListener('mouseleave', onMouseLeave);
            canvas.removeEventListener('touchstart', onTouchStart);
            canvas.removeEventListener('touchmove', onTouchMove);
            window.removeEventListener('resize', resize);
        };
    }, [products, hoveredIndex]);

    useEffect(() => {
        if (products.length > 0 && inView) {
            initOGL();
        }
        return () => {
            if (cleanupRef.current) cleanupRef.current();
        };
    }, [products, inView, initOGL]);

    // ── Render ────────────────────────────────────────────────

    if (!loading && products.length === 0) return null;

    const currencySymbol = 'ج.م';

    return (
        <section ref={sectionRef} className="w-full py-10 sm:py-16">
            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <div className="w-5 h-5 border-2 border-neutral-300 border-t-neutral-900 rounded-full animate-spin" />
                </div>
            ) : (
                <div className="px-4 sm:px-6 lg:px-8">
                    {/* Title */}
                    <h2
                        className={`text-2xl sm:text-3xl lg:text-4xl font-bold text-neutral-900 tracking-tight text-center mb-10 sm:mb-14 transition-all duration-700 ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
                    >
                        تشكيلتنا
                    </h2>

                    {/* OGL Canvas */}
                    <div
                        ref={containerRef}
                        className={`relative w-full h-[350px] sm:h-[420px] lg:h-[500px] transition-all duration-700 delay-200 ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
                    >
                        <canvas ref={canvasRef} className="w-full h-full" />

                        {/* Hovered product info overlay */}
                        {hoveredIndex !== null && products[hoveredIndex] && (
                            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-sm px-6 py-3 rounded-xl shadow-lg text-center transition-all duration-300 pointer-events-none">
                                <p className="text-sm font-bold text-neutral-900">{products[hoveredIndex].name}</p>
                                <p className="text-xs text-neutral-500 mt-1">
                                    {products[hoveredIndex].price.toLocaleString('ar-EG')} {currencySymbol}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Product names strip below */}
                    <div className={`flex justify-center gap-4 sm:gap-6 mt-6 flex-wrap transition-all duration-700 delay-300 ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                        {products.map((p) => (
                            <Link
                                key={p.id}
                                href={`/${locale}/shop/${p.slug}`}
                                className="text-xs sm:text-sm text-neutral-500 hover:text-neutral-900 transition-colors duration-200"
                            >
                                {p.name}
                            </Link>
                        ))}
                    </div>
                </div>
            )}
        </section>
    );
}
