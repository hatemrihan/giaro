import { searchProducts } from '@/models/product';
import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/search?q=keyword
 *
 * Public product search endpoint.
 * Returns up to 10 matching active products.
 */
export async function GET(req: NextRequest) {
    try {
        const query = req.nextUrl.searchParams.get('q')?.trim() || '';

        if (query.length < 1) {
            return NextResponse.json({ success: true, products: [] });
        }

        const products = await searchProducts(query, 10);

        return NextResponse.json({ success: true, products });
    } catch (error) {
        console.error('[GET /api/search]', error);
        return NextResponse.json(
            { success: false, error: 'Search failed' },
            { status: 500 },
        );
    }
}
