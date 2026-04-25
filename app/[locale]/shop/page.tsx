import { Metadata } from 'next';
import { ShopClient } from './_components/ShopClient';

const BASE_URL = 'https://giaromart.com';

type Props = {
    params:       Promise<{ locale: string }>;
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

function getCategoryFromParams(
    sp: { [key: string]: string | string[] | undefined }
): string | null {
    return typeof sp.category === 'string' ? sp.category : null;
}

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
    const { locale }        = await params;
    const resolvedSP        = await searchParams;
    const category          = getCategoryFromParams(resolvedSP);
    const isAr              = locale === 'ar';
    const categoryParam     = category ? `?category=${encodeURIComponent(category)}` : '';

    const title = category
        ? `${category} | Giaro`
        : isAr
            ? 'تسوق المنتجات الفاخرة | Giaro'
            : 'Shop Premium Products | Giaro';

    const description = isAr
        ? `اكتشف أحدث مجموعة من ${category || 'المنتجات الفاخرة'} في مصر. تسوق الآن من Giaro.`
        : `Discover the latest collection of ${category || 'premium products'} in Egypt. Shop now at Giaro.`;

    const url = `${BASE_URL}/${locale}/shop${categoryParam}`;

    return {
        title,
        description,
        robots: {
            index: true,
            follow: true,
            googleBot: {
                index: true,
                follow: true,
                'max-image-preview': 'large',
                'max-snippet': -1,
            },
        },
        alternates: {
            canonical:  url,
            languages: {
                ar:          `${BASE_URL}/ar/shop${categoryParam}`,
                en:          `${BASE_URL}/en/shop${categoryParam}`,
                'x-default': `${BASE_URL}/ar/shop${categoryParam}`,
            },
        },
        openGraph: {
            title,
            description,
            url,
            siteName: 'Giaro',
            type:     'website',
            locale:   isAr ? 'ar_EG' : 'en_US',
            images: [{
                url:    `${BASE_URL}/og-default.jpg`,
                width:  1200,
                height: 630,
                alt:    title,
            }],
        },
        twitter: {
            card:        'summary_large_image',
            title,
            description,
            images:      [`${BASE_URL}/og-default.jpg`],
        },
    };
}

export default async function ShopPage({ params, searchParams }: Props) {
    const { locale }    = await params;
    const resolvedSP    = await searchParams;
    const category      = getCategoryFromParams(resolvedSP);
    const isAr          = locale === 'ar';
    const categoryParam = category ? `?category=${encodeURIComponent(category)}` : '';

    const title = category || (isAr ? 'المتجر' : 'Shop');
    const description = isAr
        ? `تسوق أحدث مجموعة من ${category || 'المنتجات الفاخرة'} في Giaro.`
        : `Shop the latest collection of ${category || 'premium products'} at Giaro.`;

    const jsonLd = {
        '@context':   'https://schema.org',
        '@type':      'CollectionPage',
        name:          title,
        description,
        url:          `${BASE_URL}/${locale}/shop${categoryParam}`,
        inLanguage:    locale,
        publisher: {
            '@type': 'Organization',
            name:    'Giaro',
            url:      BASE_URL,
            logo: {
                '@type': 'ImageObject',
                url:     `${BASE_URL}/icon.png`,
            },
        },
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <ShopClient />
        </>
    );
}
