import { NextRequest, NextResponse } from 'next/server';
import { getProductsByIdsLean } from '@/models/product';

/**
 * POST /api/products/batch
 * Fetch multiple products by IDs (lean — only card-level fields).
 * Body: { ids: string[] }
 */
export async function POST(req: NextRequest) {
    try {
        const { ids } = await req.json();
        if (!Array.isArray(ids) || ids.length === 0) {
            return NextResponse.json([]);
        }
        // ✅ Fetches only 6 columns at the DB level — no wasteful SELECT *
        const products = await getProductsByIdsLean(ids.slice(0, 50));
        return NextResponse.json(products);
    } catch (error) {
        console.error('[POST /api/products/batch]', error);
        return NextResponse.json([], { status: 500 });
    }
}

