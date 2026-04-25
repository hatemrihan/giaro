import { MetadataRoute } from 'next';
import { supabaseAdmin } from '@/lib/supabase';

export const revalidate = 86400; // Regenerate sitemap every 24 hours

const BASE_URL = 'https://giaromart.com';

// Priority map for static routes
const STATIC_ROUTES: { path: string; priority: number; changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency'] }[] = [
    { path: '',          priority: 1.0, changeFrequency: 'daily'   },
    { path: '/shop',     priority: 0.9, changeFrequency: 'daily'   },
    { path: '/offers',   priority: 0.7, changeFrequency: 'daily'   },
    { path: '/about',    priority: 0.6, changeFrequency: 'monthly' },
    { path: '/contact',  priority: 0.6, changeFrequency: 'monthly' },
    { path: '/return',   priority: 0.4, changeFrequency: 'monthly' },
    { path: '/refund',   priority: 0.4, changeFrequency: 'monthly' },
    { path: '/shipping', priority: 0.4, changeFrequency: 'monthly' },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {

    // ── Static routes (both locales) ─────────────────────────
    const staticRoutes = STATIC_ROUTES.flatMap(({ path, priority, changeFrequency }) => [
        {
            url:             `${BASE_URL}/ar${path}`,
            lastModified:    new Date(),
            changeFrequency,
            priority,
            alternates: {
                languages: {
                    ar:          `${BASE_URL}/ar${path}`,
                    en:          `${BASE_URL}/en${path}`,
                    'x-default': `${BASE_URL}/ar${path}`,
                },
            },
        },
        {
            url:             `${BASE_URL}/en${path}`,
            lastModified:    new Date(),
            changeFrequency,
            priority:        priority * 0.9, // English slightly lower — Arabic is primary
            alternates: {
                languages: {
                    ar:          `${BASE_URL}/ar${path}`,
                    en:          `${BASE_URL}/en${path}`,
                    'x-default': `${BASE_URL}/ar${path}`,
                },
            },
        },
    ]);

    // ── Dynamic product routes ───────────────────────────────
    const { data: products, error } = await supabaseAdmin
        .from('products')
        .select('slug, updated_at')
        .eq('is_active', true);

    if (error) {
        console.error('[sitemap] Failed to fetch products:', error.message);
    }

    const productRoutes = (products || []).flatMap((product) => [
        {
            url:             `${BASE_URL}/ar/shop/${product.slug}`,
            lastModified:    new Date(product.updated_at || Date.now()),
            changeFrequency: 'weekly' as const,
            priority:        0.9,
            alternates: {
                languages: {
                    ar:          `${BASE_URL}/ar/shop/${product.slug}`,
                    en:          `${BASE_URL}/en/shop/${product.slug}`,
                    'x-default': `${BASE_URL}/ar/shop/${product.slug}`,
                },
            },
        },
        {
            url:             `${BASE_URL}/en/shop/${product.slug}`,
            lastModified:    new Date(product.updated_at || Date.now()),
            changeFrequency: 'weekly' as const,
            priority:        0.8,
            alternates: {
                languages: {
                    ar:          `${BASE_URL}/ar/shop/${product.slug}`,
                    en:          `${BASE_URL}/en/shop/${product.slug}`,
                    'x-default': `${BASE_URL}/ar/shop/${product.slug}`,
                },
            },
        },
    ]);

    return [...staticRoutes, ...productRoutes];
}
