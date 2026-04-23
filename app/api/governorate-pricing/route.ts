import { NextResponse } from 'next/server';
import { getAllGovernoratePricing } from '@/models/governoratePricing';

/**
 * GET /api/governorate-pricing
 * Public endpoint — returns all active governorate pricing for checkout.
 */
export async function GET() {
    try {
        const pricing = await getAllGovernoratePricing();

        const response = NextResponse.json({ success: true, pricing });
        response.headers.set('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600');
        return response;
    } catch (error) {
        console.error('[GET /api/governorate-pricing]', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch pricing' },
            { status: 500 },
        );
    }
}
