import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getProductBySlug, getRelatedProducts } from '@/models/product';
import { getStoreSettings } from '@/lib/settings';
import { ProductClient } from './_components/ProductClient';

const BASE_URL = 'https://giaromart.com';

type Props = {
    params: Promise<{ locale: string; slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug, locale } = await params;
    const product = await getProductBySlug(slug);

    if (!product) {
        return {
            title: 'Product Not Found | Giaro',
            robots: { index: false, follow: false },
        };
    }

    const mainImage = product.main_image || `${BASE_URL}/icon.png`;
    const description = (product.description || `Buy ${product.name} at Giaro.`).slice(0, 160);
    const canonicalUrl = `${BASE_URL}/${locale}/shop/${slug}`;

    return {
        title: `${product.name} | Giaro`,
        description,
        keywords: [product.name, ...(product.categories || []), 'Giaro'].filter(Boolean),
        robots: {
            index: !!product.is_active,
            follow: true,
            googleBot: {
                index: !!product.is_active,
                follow: true,
                'max-image-preview': 'large',
            },
        },
        alternates: {
            canonical: canonicalUrl,
            languages: {
                'ar': `${BASE_URL}/ar/shop/${slug}`,
                'en': `${BASE_URL}/en/shop/${slug}`,
                'x-default': `${BASE_URL}/ar/shop/${slug}`,
            },
        },
        other: {
            'product:price:amount': product.price.toString(),
            'product:price:currency': 'EGP',
            'product:availability': product.stock > 0 ? 'in stock' : 'out of stock',
        },
        openGraph: {
            title: `${product.name} | Giaro`,
            description,
            url: canonicalUrl,
            siteName: 'Giaro',
            type: 'website',
            locale: locale === 'ar' ? 'ar_EG' : 'en_US',
            images: [{
                url: mainImage,
                width: 1200,
                height: 630,
                alt: product.name,
            }],
        },
        twitter: {
            card: 'summary_large_image',
            title: `${product.name} | Giaro`,
            description,
            images: [mainImage],
        },
    };
}

export default async function ProductPage({ params }: Props) {
    const { slug, locale } = await params;
    const product = await getProductBySlug(slug);

    if (!product) notFound();

    const [relatedProducts, settings] = await Promise.all([
        getRelatedProducts(product.id, product.categories || [], 4),
        getStoreSettings(),
    ]);

    // ── JSON-LD: Product ─────────────────────────────────────
    // NOTE: aggregateRating & review are omitted until real reviews exist.
    // Google penalizes fake/inconsistent review data (empty reviews + high rating).
    // When you implement a review system, add them back with real data.
    const priceValidUntil = new Date();
    priceValidUntil.setFullYear(priceValidUntil.getFullYear() + 1);

    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: product.name,
        description: product.description,
        sku: product.id,
        image: [product.main_image, ...(product.images || [])].filter(Boolean),
        brand: {
            '@type': 'Brand',
            name: 'Giaro',
        },
        offers: {
            '@type': 'Offer',
            url: `${BASE_URL}/${locale}/shop/${slug}`,
            priceCurrency: 'EGP',
            price: product.price,
            priceValidUntil: priceValidUntil.toISOString().split('T')[0],
            availability: product.stock > 0
                ? 'https://schema.org/InStock'
                : 'https://schema.org/OutOfStock',
            itemCondition: 'https://schema.org/NewCondition',
            seller: {
                '@type': 'Organization',
                name: 'Giaro',
            },
        },
    };

    // ── JSON-LD: Breadcrumb ──────────────────────────────────
    const breadcrumbLd = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
            {
                '@type': 'ListItem',
                position: 1,
                name: 'Shop',
                item: `${BASE_URL}/${locale}/shop`,
            },
            {
                '@type': 'ListItem',
                position: 2,
                name: product.categories?.[0] || 'Products',
                item: `${BASE_URL}/${locale}/shop?category=${encodeURIComponent(product.categories?.[0] || '')}`,
            },
            {
                '@type': 'ListItem',
                position: 3,
                name: product.name,
                item: `${BASE_URL}/${locale}/shop/${slug}`,
            },
        ],
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
            />
            <ProductClient
                initialProduct={product}
                relatedProducts={relatedProducts}
                lowStockThreshold={settings.low_stock_threshold}
            />
        </>
    );
}