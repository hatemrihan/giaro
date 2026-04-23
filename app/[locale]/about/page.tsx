'use client'

import Nav from '@/app/sections/nav'
import Footer from '@/app/sections/footer'
import { motion } from 'framer-motion'
import Image from 'next/image'

export default function AboutPage() {
    return (
        <>
            <Nav />

            {/* ─── Section 1: Hero — MOUTHWASH-style centered text ─── */}
            <section className="bg-white flex flex-col items-center relative px-6 pt-[25vh] pb-[5vh]" dir="rtl">

                {/* Top-left dot accent */}
                <div className="absolute top-8 left-8">
                    <div className="w-3 h-3 bg-black rounded-full" />
                </div>

                {/* Main centered text block */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1.2, ease: [0.25, 0.1, 0.25, 1] }}
                    className="text-center max-w-3xl"
                >
                    <h1 className="text-[clamp(2rem,5vw,3.5rem)] font-medium text-black leading-[1.3] tracking-tight">
                        جيارو ©
                    </h1>
                    <p className="text-[clamp(1.4rem,4vw,2.8rem)] font-medium text-black leading-[1.3] tracking-tight mt-1">
                        تصميم، إبداع، أناقة،
                    </p>
                    <p className="text-[clamp(1.4rem,4vw,2.8rem)] font-medium text-black leading-[1.3] tracking-tight">
                        رؤية، إنتاج
                    </p>
                </motion.div>


            </section>

            {/* ─── Section 2: Split layout (login-style) — two videos ─── */}
            <section className="min-h-[10vh] bg-white flex flex-col md:flex-row text-black relative overflow-hidden font-sans">

                {/* ─── LEFT SIDE: Video ─── */}
                <div className="w-full md:w-1/2 h-[50vh] md:h-[80vh] flex items-center justify-center p-4 md:p-8 relative">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8, ease: 'easeOut' }}
                        viewport={{ once: true }}
                        className="w-full h-full max-w-md max-h-[60vh] rounded-lg overflow-hidden"
                    >
                        <video
                            className="w-full h-full object-contain"
                            autoPlay
                            loop
                            muted
                            playsInline
                        >
                            <source src="/videos/one.mov" type="video/quicktime" />
                            <source src="/videos/one.mov" type="video/mp4" />
                        </video>
                    </motion.div>
                </div>

                {/* ─── RIGHT SIDE: Video ─── */}
                <div className="w-full md:w-1/2 h-[50vh] md:h-[80vh] flex flex-col items-center justify-center p-4 md:p-8 relative">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
                        viewport={{ once: true }}
                        className="w-full h-full max-w-md max-h-[60vh] rounded-lg overflow-hidden"
                    >
                        <video
                            className="w-full h-full object-contain"
                            autoPlay
                            loop
                            muted
                            playsInline
                        >
                            <source src="/videos/two.mov" type="video/quicktime" />
                            <source src="/videos/two.mov" type="video/mp4" />
                        </video>
                    </motion.div>
                </div>
            </section>

            {/* ─── Section 3: Portfolio card — Liam Bennett style ─── */}
            <section className="bg-white px-4 md:px-12 py-12 md:py-20" dir="rtl">
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.9, ease: [0.25, 0.1, 0.25, 1] }}
                    viewport={{ once: true }}
                    className="bg-stone-50 rounded-2xl overflow-hidden"
                >
                    {/* ── Upper area: Name + Photo ── */}
                    <div className="px-6 md:px-14 pt-10 md:pt-14 pb-8 md:pb-12">

                        {/* Brand name — large, top-right (RTL) */}
                        <h2 className="text-[clamp(2.5rem,6vw,4.5rem)] font-medium text-black leading-[1.1] tracking-tight mb-12 md:mb-20 text-right">
                            مؤسس جيارو
                        </h2>

                        {/* Portrait photo — Left on mobile, Centered on desktop */}
                        <div className="flex justify-end md:justify-center">
                            <div className="w-[180px] h-[220px] md:w-[220px] md:h-[280px] overflow-hidden relative">
                                <Image
                                    src="/images/logo.png"
                                    alt="جيارو"
                                    fill
                                    className="object-cover"
                                    priority
                                />
                            </div>
                        </div>
                    </div>

                    {/* ── Thin separator ── */}
                    <div className="mx-6 md:mx-14 h-[1px] bg-black/15" />

                    {/* ── Lower area: About label + two text columns ── */}
                    <div className="px-6 md:px-14 py-8 md:py-12">

                        {/* Desktop: 3-column grid (label | col1 | col2) */}
                        {/* Mobile: stacked with label then content */}
                        <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr_2fr] gap-6 md:gap-10">

                            {/* About Label */}
                            <div>
                                <span className="text-[13px] md:text-sm font-medium text-black tracking-wide">
                                    من نحن
                                </span>
                            </div>

                            {/* Text column 1 */}
                            <div>
                                <p className="text-[13px] md:text-[14px] leading-[1.8] text-black/80 font-light">
                                    اكتب هنا ،هاتلي احط صوره لو عايز
                                </p>
                            </div>

                            {/* Text column 2 */}
                            <div>
                                <p className="text-[13px] md:text-[14px] leading-[1.8] text-black/80 font-light">
                                    نتخصص في تقديم قطع أزياء عصرية تواكب أحدث الاتجاهات العالمية مع لمسة محلية أصيلة. عملنا على مشاريع متنوعة تُبرز جمال التصميم وتعقيد الحرفة، لأن كل قطعة تحكي قصة.
                                </p>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </section>

            <Footer />
        </>
    )
}
