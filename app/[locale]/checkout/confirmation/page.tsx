'use client';

import { useSearchParams, usePathname } from 'next/navigation';
import Link from 'next/link';
import Nav from '../../../sections/nav';
import Footer from '../../../sections/footer';
import { Suspense } from 'react';

function ConfirmationContent() {
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const locale = pathname.match(/^\/(ar|en)/)?.[1] || 'ar';

    const orderId = searchParams.get('orderId') || '---';

    return (
        <div className="min-h-screen bg-white">
            <Nav />

            <div className="pt-28 pb-20">
                <div className="max-w-xl mx-auto px-6 text-center">
                    {/* Success icon */}
                    <div className="w-20 h-20 bg-neutral-900 rounded-full flex items-center justify-center mx-auto mb-8">
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>

                    {/* Title */}
                    <h1 className="text-2xl font-light text-neutral-900 mb-3">
                        شكراً لطلبك!
                    </h1>

                    <p className="text-sm text-neutral-500 mb-8 leading-relaxed">
                        تم استلام طلبك بنجاح وسيتم مراجعته قريباً.
                        <br />
                        سنتواصل معك لتأكيد الطلب.
                    </p>

                    {/* Order ID */}
                    <div className="border border-neutral-200 p-6 mb-8">
                        <p className="text-[11px] font-medium tracking-widest text-neutral-500 uppercase mb-2">
                            رقم الطلب
                        </p>
                        <p className="text-xl font-medium text-neutral-900 tracking-wider" dir="ltr">
                            {orderId}
                        </p>
                    </div>

                    {/* Info */}
                    <div className="text-sm text-neutral-500 space-y-2 mb-10">
                        <p>احتفظ برقم الطلب للمتابعة</p>
                        <p>سيصلك إشعار عند تأكيد الطلب وشحنه</p>
                    </div>

                    {/* Actions */}
                    <div className="space-y-3">
                        <Link
                            href={`/${locale}/shop`}
                            className="block w-full bg-neutral-900 text-white py-4 text-sm font-medium tracking-wide hover:bg-neutral-800 transition-colors"
                        >
                            متابعة التسوق
                        </Link>

                        <Link
                            href={`/${locale}`}
                            className="block text-sm text-neutral-500 underline underline-offset-4 hover:text-neutral-900 transition-colors"
                        >
                            العودة للرئيسية
                        </Link>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
}

export default function OrderConfirmationPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-neutral-900" />
            </div>
        }>
            <ConfirmationContent />
        </Suspense>
    );
}
