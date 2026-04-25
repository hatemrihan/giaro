import { MetadataRoute } from 'next';

const BASE_URL = 'https://giaromart.com';

export default function robots(): MetadataRoute.Robots {
    return {
        rules: [
            {
                userAgent: '*',
                allow: '/',
                disallow: [
                    '/api/',
                    '/api',
                    '/admin/',
                    '/admin',
                    '/ar/admin/',
                    '/ar/admin',
                    '/en/admin/',
                    '/en/admin',
                    '/cart/',
                    '/cart',
                    '/ar/cart/',
                    '/ar/cart',
                    '/en/cart/',
                    '/en/cart',
                    '/checkout/',
                    '/checkout',
                    '/ar/checkout/',
                    '/ar/checkout',
                    '/en/checkout/',
                    '/en/checkout',
                    '/ar/checkout/confirmation/',
                    '/ar/checkout/confirmation',
                    '/en/checkout/confirmation/',
                    '/en/checkout/confirmation',
                ],
            },
            {
                // Block AI training crawlers
                userAgent: ['GPTBot', 'ChatGPT-User', 'CCBot', 'anthropic-ai', 'Claude-Web'],
                disallow: '/',
            },
        ],
        sitemap: `${BASE_URL}/sitemap.xml`,
        host: BASE_URL,
    };
}