import { NextRequest, NextResponse } from 'next/server';
import { getActiveOffers } from '@/models/offer';

/**
 * GET /api/offers
 * Query params:
 *   ?page=homepage  → offers tagged for homepage
 *   ?page=offers    → offers tagged for offers page
 *   ?page=shop      → offers tagged for shop page
 *   ?limit=2        → cap results
 *   (no page param) → all active offers
 */
export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const page = searchParams.get('page') || undefined;
        const limitParam = searchParams.get('limit');
        const limit = limitParam ? parseInt(limitParam, 10) : undefined;

        const offers = await getActiveOffers({ page, limit });

        return NextResponse.json(offers, {
            headers: {
                'Cache-Control': 'no-store, no-cache, must-revalidate',
            },
        });
    } catch (error) {
        console.error('❌ Offers fetch error:', error);
        return NextResponse.json({ error: 'Failed to fetch offers' }, { status: 500 });
    }
}
