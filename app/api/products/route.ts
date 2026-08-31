import { getActiveProducts, getProductsByCategory } from '@/models/product';
import { getAllCategories } from '@/models/category';
import { NextRequest, NextResponse } from 'next/server';
import { getStoreSettings } from '@/lib/settings';
import { cached } from '@/lib/cache';
import { publicCacheHeaders } from '@/lib/http-cache';

const VALID_SORTS = ['newest', 'price-asc', 'price-desc'] as const;
type Sort = typeof VALID_SORTS[number];

const CACHE_TTL = 60 * 1000; // 60 seconds

/**
 * GET /api/products
 *
 * Public product listing endpoint.
 * Supports: pagination, category filtering, sorting.
 * Cached in-memory for 60s to reduce Supabase egress.
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

        const cacheKey = `products:${page}:${limit}:${category || 'all'}:${sort}:${featured}`;

        const result = await cached(cacheKey, CACHE_TTL, async () => {
            const [categoriesResp, productsResp] = await Promise.all([
                cached('categories:all', 2 * 60 * 1000, getAllCategories),
                category
                    ? getProductsByCategory(category, { page, limit, sort, featuredOnly: featured })
                    : getActiveProducts({ page, limit, sort, featuredOnly: featured })
            ]);

            const settings = await cached('settings:store', 5 * 60 * 1000, getStoreSettings);

            return {
                success: true,
                products: productsResp.products,
                categories: categoriesResp,
                lowStockThreshold: settings.low_stock_threshold,
                pagination: {
                    page,
                    limit,
                    total: productsResp.total,
                    totalPages: Math.ceil(productsResp.total / limit),
                },
            };
        });

        return NextResponse.json(result, {
            headers: publicCacheHeaders({
                sMaxAge: 60,
                staleWhileRevalidate: 120,
                varyQuery: ['page', 'limit', 'category', 'sort', 'featured'],
            }),
        });
    } catch (error) {
        console.error('[GET /api/products]', error);
        return NextResponse.json(
            { success: false, error: 'Failed to load products' },
            { status: 500 },
        );
    }
}
