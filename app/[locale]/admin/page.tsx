'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

// ── /admin root → redirect to login (locale-aware) ──────────────
export default function AdminRootPage() {
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        // Extract locale from pathname (e.g. /ar/admin → ar)
        const locale = pathname.split('/')[1] || 'ar';
        router.replace(`/${locale}/admin/login`);
    }, [router, pathname]);

    return (
        <div className="min-h-screen bg-stone-900 flex items-center justify-center">
            <div className="flex flex-col items-center gap-3 text-stone-500">
                <div className="w-5 h-5 border-2 border-stone-600 border-t-white rounded-full animate-spin" />
                <span className="text-[13px]">Redirecting…</span>
            </div>
        </div>
    );
}
