import { getAllCategories } from '@/models/category';
import { NextResponse } from 'next/server';
import { cached } from '@/lib/cache';

const CACHE_TTL = 2 * 60 * 1000; // 2 minutes

/**
 * GET /api/categories
 *
 * Public endpoint — returns all categories for the storefront.
 * Cached in-memory for 2 minutes to reduce Supabase egress.
 */
export async function GET() {
    try {
        const categories = await cached('categories:all', CACHE_TTL, getAllCategories);

        return NextResponse.json(
            { success: true, categories },
            { headers: { 'Cache-Control': 'public, s-maxage=120, stale-while-revalidate=300' } },
        );
    } catch (error) {
        console.error('[GET /api/categories]', error);
        return NextResponse.json(
            { success: false, error: 'Failed to load categories' },
            { status: 500 },
        );
    }
}

