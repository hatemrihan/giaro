import { getActiveProducts, getProductsByCategory } from '@/models/product';
import { getAllCategories } from '@/models/category';
import { NextRequest, NextResponse } from 'next/server';
import { getStoreSettings } from '@/lib/settings';

const VALID_SORTS = ['newest', 'price-asc', 'price-desc'] as const;
type Sort = typeof VALID_SORTS[number];

/**
 * GET /api/products
 *
 * Public product listing endpoint.
 * Supports: pagination, category filtering, sorting.
 *
 * Query params:
 *   ?page=1          — page number (default 1)
 *   ?limit=16        — items per page (default 16, max 100)
 *   ?category=candy  — filter by category name
 *   ?sort=newest     — sort: newest | price-asc | price-desc
 *   ?featured=true   — only featured products
 */
export async function GET(req: NextRequest) {
    try {
        const { searchParams } = req.nextUrl;

        const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
        const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '16', 10)));
        const category = searchParams.get('category')?.trim() || null;
        const sortRaw = searchParams.get('sort');
        const sort = (VALID_SORTS.includes(sortRaw as Sort) ? sortRaw : 'newest') as Sort;
        const featured = searchParams.get('featured') === 'true';

        const [categoriesResp, productsResp] = await Promise.all([
            getAllCategories(),
            category
                ? getProductsByCategory(category, { page, limit, sort, featuredOnly: featured })
                : getActiveProducts({ page, limit, sort, featuredOnly: featured })
        ]);

        const products = productsResp.products;
        const total = productsResp.total;

        const settings = await getStoreSettings();

        return NextResponse.json({
            success: true,
            products,
            categories: categoriesResp,
            lowStockThreshold: settings.low_stock_threshold,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        }, {
            headers: {
                'Cache-Control': 'no-store, no-cache, must-revalidate',
            },
        });
    } catch (error) {
        console.error('[GET /api/products]', error);
        return NextResponse.json(
            { success: false, error: 'Failed to load products' },
            { status: 500 },
        );
    }
}


