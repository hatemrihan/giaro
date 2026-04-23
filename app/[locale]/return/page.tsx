'use client'

import React from 'react'
import Link from 'next/link'
import Nav from '../../sections/nav'
import Footer from '../../sections/footer'

export default function ReturnPage() {
    return (
        <>
            <Nav />
            <main className="min-h-screen bg-white pt-20 transition-colors duration-300" dir="rtl">
                <div className="px-4 py-16">
                    <div className="px-10 space-y-6 text-gray-600 max-w-4xl mx-auto">
                        <div className="space-y-4">
                            <h1 className="font-bold text-black text-lg max-w-4xl mx-auto text-right">الاستبدال والاسترجاع</h1>
                            <p className="leading-relaxed text-sm text-right">
                                كل منتج من منتجات جيارو يتم تحضيره وتعبئته بعناية فائقة. لهذا السبب، لا يتم قبول المرتجعات إلا في الحالات النادرة التي يكون فيها المنتج معيبًا أو تالفًا عند الاستلام.
                            </p>
                        </div>

                        <div className="space-y-4">
                            <ul className="space-y-3 leading-relaxed text-sm text-right list-disc list-inside">
                                <li>إذا كنت تعتقد أن منتجك معيب، يرجى إكمال نموذج الإرجاع في غضون 3 أيام من استلام طلبك.</li>
                                <li>سيقوم فريق خدمة العملاء لدينا بمراجعة طلبك والتواصل معك في غضون يوم عمل واحد لتزويدك بتصريح الإرجاع والخطوات التالية.</li>
                                <li>يمكن فقط إرجاع المنتجات التي حصلت على تصريح إرجاع معتمد.</li>
                                <li>لكي تكون مؤهلاً للإرجاع، يجب أن يكون المنتج في حالته الأصلية، مع الحفاظ على جميع الملصقات والتغليف.</li>
                                <li>بمجرد استلام المنتج وفحصه، يرجى السماح بمدة تصل إلى 10 أيام عمل لمعالجة طلبك.</li>
                                <li>إذا لم يستوفِ المنتج هذه الشروط، فسيتم إرساله إليك مرة أخرى وسيتم رفض الإرجاع.</li>
                                <li>رسوم الشحن غير قابلة للاسترداد.</li>
                            </ul>
                        </div>

                        <div className="space-y-4">
                            <h2 className="font-normal pt-6 text-black underline text-right">الاستبدال</h2>
                            <ul className="space-y-3 leading-relaxed text-sm text-right list-disc list-inside">
                                <li>يُقبل استبدال المنتجات وفقاً للشروط المحددة.</li>
                                <li>يرجى التواصل مع <a href="mailto:info@giaro.com" className="text-blue-600 hover:text-blue-800 underline" dir="ltr">info@giaro.com</a> في غضون 7 أيام من تاريخ الاستلام لطلب الاستبدال.</li>
                                <li>يجب أن يكون المنتج غير مستخدم ومُعاد في تغليفه الأصلي ولم يتم فتحه.</li>
                                <li>يتحمل العميل تكاليف الشحن الخاصة بالاستبدال.</li>
                            </ul>
                        </div>

                        <div className="space-y-4">
                            <h2 className="font-normal pt-6 text-black underline text-right">المرتجعات المحلية</h2>
                            <ul className="space-y-3 leading-relaxed text-sm text-right list-disc list-inside">
                                <li>ستوفر جيارو بوليصة إرجاع مدفوعة مسبقًا للمرتجعات المعتمدة التي تنشأ من داخل مصر.</li>
                                <li>بالنسبة لجميع المناطق الأخرى، يتحمل العميل مسؤولية ترتيب وتغطية تكلفة شحن الإرجاع بمجرد إصدار تصريح الإرجاع.</li>
                            </ul>
                        </div>

                        <div className="pt-6 border-t border-gray-200">
                            <p className="leading-relaxed text-sm text-right">
                                لمزيد من المعلومات أو المساعدة، يرجى التواصل مع خدمة العملاء عبر البريد الإلكتروني <a href="mailto:info@giaro.com" className="text-blue-600 hover:text-blue-800 underline font-medium" dir="ltr">info@giaro.com</a>
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
