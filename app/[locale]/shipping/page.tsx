'use client'

import React from 'react'
import Link from 'next/link'
import Nav from '../../sections/nav'
import Footer from '../../sections/footer'

export default function ShippingPage() {
    return (
        <>
            <Nav />
            <main className="min-h-screen bg-white pt-20 transition-colors duration-300" dir="rtl">
                <div className="px-4 py-16">
                    <h1 className="font-bold pt-4 text-black max-w-4xl mx-auto px-10 mb-4 text-lg text-right">
                        الشحن والتوصيل
                    </h1>

                    <div className="px-10 space-y-6 text-gray-600 max-w-4xl mx-auto">
                        <div className="space-y-4">
                            <p className="leading-relaxed text-sm text-right">
                                جميع منتجات جيارو يتم تحضيرها بعناية فائقة واهتمام بأدق التفاصيل. يتم تعبئة وتجهيز كل منتج بعناية قبل إرساله، مما يضمن أن كل قطعة تلبي معايير الجودة والتميز الصارمة لدينا.
                            </p>
                            <p className="leading-relaxed text-sm text-right">
                                يرجى السماح بـ 10 إلى 14 يوم عمل للتجهيز قبل الشحن. يضمن هذا الإطار الزمني أن يحظى كل طلب بالاهتمام الذي يستحقه. بمجرد أن يصبح طلبك جاهزًا ويتم شحنه، ستتلقى رسالة بريد إلكتروني للتأكيد مع معلومات التتبع التفصيلية.
                            </p>
                        </div>

                        <div className="space-y-4">
                            <h2 className="font-normal pt-6 text-black underline text-right">الطلبات المحلية (مصر)</h2>
                            <p className="leading-relaxed text-sm text-right">
                                يتم شحن الطلبات داخل مصر عبر شركاء التوصيل المحليين الموثوق بهم لدينا، مما يضمن التوصيل الموثوق والفعال. ستصل منتجاتك عادةً في غضون 1 إلى 3 أيام عمل بعد الإرسال، اعتمادًا على موقعك المحدد داخل الجمهورية.
                            </p>
                        </div>



                        <div className="space-y-4">
                            <h2 className="font-normal pt-6 text-black underline text-right">التغليف الفاخر</h2>
                            <p className="leading-relaxed text-sm text-right">
                                يتم تغليف كل منتج في تغليف جيارو المميز، والذي تم تصميمه بعناية فائقة للحماية أثناء النقل ولتقديم تجربة فتح صندوق استثنائية. يعكس تغليفنا نفس الاهتمام بالتفاصيل والجودة التي نضعها في جميع منتجاتنا.
                            </p>
                        </div>

                        <div className="space-y-4">
                            <h2 className="font-normal pt-6 text-black underline text-right">سياسة الإرجاع</h2>
                            <p className="leading-relaxed text-sm text-right">
                                نظرًا لأن كل منتج يتم تحضيره خصيصًا لك باستخدام أجود المكونات، فلا يتم قبول المرتجعات إلا إذا كان المنتج معيبًا أو تالفًا عند الوصول. هذا يضمن الحفاظ على معايير الجودة العالية لدينا.
                            </p>
                        </div>

                        <div className="pt-6 border-t border-gray-200">
                            <p className="leading-relaxed text-sm text-right">
                                لأي استفسارات بخصوص الشحن أو الطلبات أو سياساتنا، يرجى عدم التردد في التواصل مع فريق خدمة العملاء لدينا عبر البريد الإلكتروني <a href="mailto:info@giaro.com" className="text-blue-600 hover:text-blue-800 underline font-medium" dir="ltr">info@giaro.com</a>
                            </p>
                        </div>
                    </div>

                    <div className="text-center mt-12">
                        <Link
                            href="/"
                            className="inline-block w-full max-w-xs mx-auto bg-[#222] text-white py-4 px-8 text-xs uppercase tracking-[0.2em] hover:bg-black transition-colors"
                        >
                            العودة للرئيسية
                        </Link>
                    </div>
                </div>
                <Footer />
            </main>
        </>
    )
}
