'use client'

import React, { useState } from 'react'
import Nav from '@/app/sections/nav'
import Footer from '@/app/sections/footer'
import { motion } from 'framer-motion'

const ContactClient = () => {
    const [formData, setFormData] = useState({
        email: '',
        name: '',
        message: '',
    });
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [errorMessage, setErrorMessage] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('loading');
        setErrorMessage('');

        try {
            const res = await fetch('/api/contacts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            const data = await res.json();

            if (!res.ok) throw new Error(data.error || 'حدث خطأ ما');

            setStatus('success');
            setFormData({ email: '', name: '', message: '' });
        } catch (error) {
            setStatus('error');
            setErrorMessage(error instanceof Error ? error.message : 'حدث خطأ ما. يرجى المحاولة مرة أخرى.');
        }
    };

    if (status === 'success') {
        return (
            <>
                <Nav />
                <div className="min-h-[60vh] flex items-center justify-center px-4" dir="rtl">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center max-w-md"
                    >
                        <h2 className="text-2xl mb-4 font-light">تم إرسال طلبك</h2>
                        <p className="text-neutral-600 mb-8">
                            شكراً لك. سيتم الرد عليك من قبل فريق خدمة العملاء في أقرب وقت ممكن.
                        </p>
                        <button
                            onClick={() => setStatus('idle')}
                            className="text-sm underline underline-offset-4 hover:text-neutral-500 transition-colors"
                        >
                            إرسال طلب آخر
                        </button>
                    </motion.div>
                </div>
                <Footer />
            </>
        );
    }

    return (
        <>
            <Nav />
            <main className="min-h-screen bg-white pt-20 transition-colors duration-300" dir="rtl">
                <div className="px-4 py-16">
                    <div className="space-y-6 text-black transition-colors duration-300 max-w-4xl mx-auto">
                        <h2 className="pt-4 mb-4 text-black font-bold text-center text-lg">تواصل معنا</h2>

                        <div className="text-center mb-8">
                            <p className="text-sm text-right max-w-2xl mx-auto leading-relaxed">
                                لتقديم طلب التواصل، يرجى ملء النموذج أدناه. سيتواصل معك أحد أعضاء فريق خدمة العملاء لدينا في أقرب وقت.
                            </p>
                            <p className="text-sm text-right max-w-2xl mx-auto mt-2 leading-relaxed">
                                يمكنك أيضاً التواصل معنا عبر البريد الإلكتروني: <a href="mailto:info@giaro.co" className="text-neutral-900 hover:text-neutral-600 underline underline-offset-4 font-medium transition-colors">info@giaro.co</a>
                            </p>
                        </div>

                        <section>
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5 }}
                            >
                                <form onSubmit={handleSubmit} className="max-w-xl mx-auto space-y-12">
                                    <div className="text-center text-neutral-900 text-sm font-light mb-6">
                                        يرجى إدخال بياناتك أدناه:
                                    </div>

                                    <div className="space-y-8">
                                        {/* Name */}
                                        <div className="relative">
                                            <input
                                                type="text"
                                                id="contact-name"
                                                required
                                                value={formData.name}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                className="peer w-full py-2 bg-transparent border-b border-neutral-200 text-neutral-900 placeholder-transparent focus:outline-none focus:border-neutral-900 transition-colors rounded-none text-xs"
                                                placeholder="الاسم"
                                            />
                                            <label
                                                htmlFor="contact-name"
                                                className="absolute right-0 -top-3 text-neutral-500 text-xs transition-all peer-placeholder-shown:text-xs peer-placeholder-shown:text-neutral-400 peer-placeholder-shown:top-2 peer-focus:-top-3 peer-focus:text-neutral-500 peer-focus:text-xs"
                                            >
                                                الاسم:
                                            </label>
                                        </div>

                                        {/* Email */}
                                        <div className="relative">
                                            <input
                                                type="email"
                                                id="contact-email"
                                                required
                                                value={formData.email}
                                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                className="peer w-full py-2 bg-transparent border-b border-neutral-200 text-neutral-900 placeholder-transparent focus:outline-none focus:border-neutral-900 transition-colors rounded-none text-xs"
                                                placeholder="البريد الإلكتروني"
                                            />
                                            <label
                                                htmlFor="contact-email"
                                                className="absolute right-0 -top-3 text-neutral-500 text-xs transition-all peer-placeholder-shown:text-xs peer-placeholder-shown:text-neutral-400 peer-placeholder-shown:top-2 peer-focus:-top-3 peer-focus:text-neutral-500 peer-focus:text-xs"
                                            >
                                                البريد الإلكتروني:
                                            </label>
                                        </div>

                                        {/* Message */}
                                        <div className="relative">
                                            <textarea
                                                id="contact-message"
                                                rows={4}
                                                value={formData.message}
                                                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                                className="peer w-full py-2 bg-transparent border-b border-neutral-200 text-neutral-900 placeholder-transparent focus:outline-none focus:border-neutral-900 transition-colors rounded-none text-xs resize-none"
                                                placeholder="رسالتك"
                                            />
                                            <label
                                                htmlFor="contact-message"
                                                className="absolute right-0 -top-3 text-neutral-500 text-xs transition-all peer-placeholder-shown:text-xs peer-placeholder-shown:text-neutral-400 peer-placeholder-shown:top-2 peer-focus:-top-3 peer-focus:text-neutral-500 peer-focus:text-xs"
                                            >
                                                رسالتك (اختياري):
                                            </label>
                                        </div>
                                    </div>

                                    {status === 'error' && (
                                        <p className="text-red-600 text-center text-sm">{errorMessage}</p>
                                    )}

                                    <button
                                        type="submit"
                                        disabled={status === 'loading'}
                                        className="w-full bg-[#222] text-white py-4 px-8 text-xs uppercase tracking-[0.2em] hover:bg-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {status === 'loading' ? 'جاري الإرسال...' : 'إرسال'}
                                    </button>
                                </form>
                            </motion.div>
                        </section>
                    </div>
                </div>
                <Footer />
            </main>
        </>
    )
}

export default ContactClient
