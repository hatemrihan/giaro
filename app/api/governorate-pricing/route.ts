import { NextResponse } from 'next/server';
import { getAllGovernoratePricing } from '@/models/governoratePricing';

/**
 * GET /api/governorate-pricing
 * Public endpoint — returns all active governorate pricing for checkout.
 */
export async function GET() {
    try {
        const pricing = await getAllGovernoratePricing();

        return NextResponse.json(
            { success: true, pricing },
            { headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600' } },
        );
    } catch (error) {
        console.error('[GET /api/governorate-pricing]', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch pricing' },
            { status: 500 },
        );
    }
}
