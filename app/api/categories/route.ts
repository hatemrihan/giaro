import { getAllCategories } from '@/models/category';
import { NextResponse } from 'next/server';

/**
 * GET /api/categories
 *
 * Public endpoint — returns all categories for the storefront.
 * No caching — always returns fresh data for real-time consistency.
 * Single query, no N+1.
 */
export async function GET() {
    try {
        const categories = await getAllCategories();

        return NextResponse.json(
            { success: true, categories },
            { headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate' } },
        );
    } catch (error) {
        console.error('[GET /api/categories]', error);
        return NextResponse.json(
            { success: false, error: 'Failed to load categories' },
            { status: 500 },
        );
    }
}
