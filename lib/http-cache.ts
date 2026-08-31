/**
 * CDN cache headers for public API routes.
 *
 * IMPORTANT: Netlify's CDN (Edge + Durable cache) does NOT include query
 * string parameters in its cache key by default. Any route whose response
 * depends on query params (?category=, ?page=, ...) MUST declare them via
 * the `Netlify-Vary` header, otherwise all variants collapse into a single
 * cached response and users receive data for the wrong query.
 * See: https://docs.netlify.com/platform/caching/#netlify-vary
 */

type PublicCacheOptions = {
    /** CDN cache lifetime in seconds (s-maxage) */
    sMaxAge: number;
    /** Extra seconds a stale response may be served while revalidating */
    staleWhileRevalidate: number;
    /**
     * Query params this response varies on. Required when the route reads
     * any query param that changes the response body.
     */
    varyQuery?: readonly string[];
};

export function publicCacheHeaders({
    sMaxAge,
    staleWhileRevalidate,
    varyQuery,
}: PublicCacheOptions): Record<string, string> {
    const headers: Record<string, string> = {
        'Cache-Control': `public, s-maxage=${sMaxAge}, stale-while-revalidate=${staleWhileRevalidate}`,
    };
    if (varyQuery && varyQuery.length > 0) {
        headers['Netlify-Vary'] = `query=${varyQuery.join('|')}`;
    }
    return headers;
}

/** Headers for responses that must never be cached by any shared cache. */
export const NO_STORE_HEADERS: Record<string, string> = {
    'Cache-Control': 'private, no-store',
};
