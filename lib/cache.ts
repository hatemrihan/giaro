/**
 * Simple in-memory TTL cache.
 * Reduces Supabase API calls for storefront data that rarely changes.
 * This prevents cached egress quota exhaustion on the free plan.
 */

interface CacheEntry<T> {
    data: T;
    expiresAt: number;
}

const store = new Map<string, CacheEntry<unknown>>();

/**
 * Get a value from cache, or compute and store it.
 * @param key   Cache key
 * @param ttlMs Time-to-live in milliseconds (default: 60s)
 * @param fn    Async function to compute the value if not cached
 */
export async function cached<T>(
    key: string,
    ttlMs: number,
    fn: () => Promise<T>
): Promise<T> {
    const now = Date.now();
    const existing = store.get(key) as CacheEntry<T> | undefined;

    if (existing && existing.expiresAt > now) {
        return existing.data;
    }

    const data = await fn();
    store.set(key, { data, expiresAt: now + ttlMs });
    return data;
}

/**
 * Invalidate a specific cache key or all keys matching a prefix.
 */
export function invalidateCache(keyOrPrefix: string) {
    if (store.has(keyOrPrefix)) {
        store.delete(keyOrPrefix);
        return;
    }
    // Prefix invalidation
    for (const key of store.keys()) {
        if (key.startsWith(keyOrPrefix)) {
            store.delete(key);
        }
    }
}

/**
 * Clear entire cache.
 */
export function clearCache() {
    store.clear();
}
