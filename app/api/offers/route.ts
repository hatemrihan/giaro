import { NextRequest, NextResponse } from 'next/server';
import { getActiveOffers } from '@/models/offer';
import { cached } from '@/lib/cache';

const CACHE_TTL = 2 * 60 * 1000; // 2 minutes

/**
 * GET /api/offers
 * Cached in-memory for 2 minutes to reduce Supabase egress.
 */
export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const page = searchParams.get('page') || undefined;
        const limitParam = searchParams.get('limit');
        const limit = limitParam ? parseInt(limitParam, 10) : undefined;

        const cacheKey = `offers:${page || 'all'}:${limit || 'none'}`;
        const offers = await cached(cacheKey, CACHE_TTL, () => getActiveOffers({ page, limit }));

        return NextResponse.json(offers, {
            headers: {
                'Cache-Control': 'public, s-maxage=120, stale-while-revalidate=300',
            },
        });
    } catch (error) {
        console.error('❌ Offers fetch error:', error);
        return NextResponse.json({ error: 'Failed to fetch offers' }, { status: 500 });
    }
}

