"use client";

import React, { useEffect, useState } from "react";
import { signIn } from "next-auth/react";

const Typewriter = ({
    text,
    delay = 0,
    speed = 50,
    className = '',
    showCursor = false
}: {
    text: string,
    delay?: number,
    speed?: number,
    className?: string,
    showCursor?: boolean
}) => {
    const [displayedText, setDisplayedText] = useState('')
    const [isTyping, setIsTyping] = useState(false)

    useEffect(() => {
        let interval: NodeJS.Timeout

        const timeout = setTimeout(() => {
            setIsTyping(true)
            let i = 0
            interval = setInterval(() => {
                setDisplayedText(text.slice(0, i + 1))
                i++
                if (i >= text.length) {
                    clearInterval(interval)
                    setIsTyping(false)
                }
            }, speed)
        }, delay)

        return () => {
            clearTimeout(timeout)
            clearInterval(interval)
        }
    }, [text, delay, speed])

    return (
        <div className={`inline-block ${className}`}>
            {displayedText}
            {(isTyping || (!displayedText && showCursor)) && <span className="animate-pulse ml-1 opacity-70">|</span>}
        </div>
    )
}

function LoginContent() {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")

    const handleGoogleSignIn = async () => {
        setError("")
        setLoading(true)
        try {
            await signIn("google", {
                callbackUrl: "/admin/analytics",
            })
        } catch {
            setError("Unable to start sign-in. Please try again.")
            setLoading(false)
        }
    }

    return (
        <main className="min-h-screen bg-stone-900 flex flex-col md:flex-row text-white relative overflow-hidden font-sans">

            {/* Center Dividing Line (Vertical on desktop, Horizontal on mobile) */}
            <div className="absolute left-0 top-1/2 w-full h-[1px] md:left-1/2 md:top-0 md:w-[1px] md:h-full bg-stone-800 z-10" />

            {/* ─── LEFT SIDE: Typewriter Animations ─── */}
            <div className="w-full md:w-1/2 h-[50vh] md:h-screen flex items-center justify-center p-8 relative">

                {/* Top Section */}
                <div className="absolute top-[10%] md:top-[15%] left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-[#888] text-[10px] md:text-xs tracking-[0.2em] font-light uppercase w-full text-center">
                    <div className="h-4 flex items-center justify-center">
                        <Typewriter text="GIARO STORE" delay={300} speed={25} />
                    </div>
                    <div className="h-4 flex items-center justify-center">
                        <Typewriter text="ADMIN DASHBOARD" delay={700} speed={25} />
                    </div>
                    <div className="h-4 flex items-center justify-center">
                        <Typewriter text="AUTHORIZED ACCESS ONLY" delay={1200} speed={25} />
                    </div>
                </div>

                {/* Center Huge Text */}
                <div className="text-center w-full">
                    <Typewriter
                        text="LOG IN By Admin Email →"
                        delay={2000}
                        speed={100}
                        className="text-[7vw] md:text-[4vw] xl:text-[4.5rem] font-medium tracking-[0.05em] text-[#EFEFEF] leading-none"
                    />
                </div>

                {/* Bottom Link Section */}
                <div className="absolute bottom-[10%] md:bottom-[15%] left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-[#888] text-[10px] md:text-[11px] tracking-[0.15em] font-light uppercase w-full px-8 md:px-12 lg:px-24 text-center">

                    <div className="flex items-center justify-center leading-relaxed">
                        <Typewriter text="Welcome Gario Fam, This Is Me, Your Developer, Hatem. I Just Want To Say A Small Message , Whatver You Want To Do, Just Say It To Me, And I Will Do It Right Away." delay={5800} speed={40} />
                    </div>

                    <div className="flex items-center justify-center mt-1">
                        <Typewriter text="Your Success Is Always My Success." delay={12600} speed={40} />
                    </div>

                    <div className="text-lg flex items-center justify-center mt-8 text-[#b3b3b3] tracking-widest font-normal" style={{ direction: 'rtl' }}>
                        <Typewriter text=" 'Giaro Version 1.0.0' " delay={13800} speed={50} />
                    </div>
                </div>
            </div>

            {/* ─── RIGHT SIDE: Google Sign In ─── */}
            <div className="w-full md:w-1/2 h-[50vh] md:h-screen flex flex-col items-center justify-center p-8 relative">
                <button
                    onClick={handleGoogleSignIn}
                    disabled={loading}
                    className="h-10 flex items-center justify-center transition-colors duration-500 cursor-pointer relative group bg-transparent border-none appearance-none"
                >
                    <div className="flex items-center gap-3">
                        <div className="w-5 h-5 flex items-center justify-center">
                            {loading ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                            ) : (
                                <svg className="w-full h-full" viewBox="0 0 24 24">
                                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                </svg>
                            )}
                        </div>
                        <span className="text-xs uppercase tracking-widest font-medium text-[#888] group-hover:text-white transition-colors duration-500">
                            {loading ? "SIGNING IN..." : "CONTINUE WITH GOOGLE"}
                        </span>
                    </div>
                    <span className="absolute -bottom-2 left-0 w-0 h-[1px] bg-white transition-all duration-500 group-hover:w-full opacity-0 group-hover:opacity-100"></span>
                </button>

                {error && (
                    <div className="mt-6 text-red-500 text-[10px] tracking-widest uppercase text-center">
                        {error}
                    </div>
                )}
            </div>

        </main>
    )
}

export default function AdminLoginPage() {
    return <LoginContent />
}