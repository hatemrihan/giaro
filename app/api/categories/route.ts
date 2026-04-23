import { getAllCategories } from '@/models/category';
import { NextResponse } from 'next/server';

/**
 * GET /api/categories
 *
 * Public endpoint — returns all categories for the storefront.
 * Cached aggressively (5 min CDN + stale-while-revalidate).
 * Single query, no N+1.
 */
export async function GET() {
    try {
        const categories = await getAllCategories();

        const response = NextResponse.json({ success: true, categories });
        response.headers.set(
            'Cache-Control',
            'public, s-maxage=300, stale-while-revalidate=600',
        );
        return response;
    } catch (error) {
        console.error('[GET /api/categories]', error);
        return NextResponse.json(
            { success: false, error: 'Failed to load categories' },
            { status: 500 },
        );
    }
}
