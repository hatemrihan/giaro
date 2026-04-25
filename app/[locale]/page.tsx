import { Metadata } from 'next';
import Nav from './../sections/nav';
import Header from '../sections/header';
import Categories from './../sections/categories';
import LimitOffer from './../sections/limit';
import Footer from './../sections/footer';
import Products from '../sections/products';
import Words from '../sections/words';
import MovingWords from '../sections/MovingWords';

const BASE_URL = 'https://giaromart.com';

type Props = {
    params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { locale } = await params;
    const isAr = locale === 'ar';

    const title = isAr ? 'جيارو — منتجات غذائية فاخرة' : 'Giaro — Premium Food Products';
    const description = isAr
        ? 'منتجات غذائية فاخرة — تصنيفات مختارة، منتجات طازجة، توصيل حتى باب بيتك.'
        : 'Premium food products — curated categories, fresh products, delivered to your door.';

    return {
        title,
        description,
        alternates: {
            canonical: `${BASE_URL}/${locale}`,
            languages: {
                'ar': `${BASE_URL}/ar`,
                'en': `${BASE_URL}/en`,
                'x-default': `${BASE_URL}/ar`,
            },
        },
        openGraph: {
            title,
            description,
            url: `${BASE_URL}/${locale}`,
            locale: isAr ? 'ar_EG' : 'en_US',
        },
    };
}

export default async function Home({ params }: Props) {
    const { locale } = await params;

    // ── JSON-LD: Organization & WebSite ──────────────────────
    const organizationLd = {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: 'Giaro',
        url: BASE_URL,
        logo: `${BASE_URL}/icon.png`,
        sameAs: [
            'https://instagram.com/giaromart',
            'https://facebook.com/giaromart',
        ],
    };

    const websiteLd = {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: 'Giaro',
        url: BASE_URL,
        potentialAction: {
            '@type': 'SearchAction',
            target: `${BASE_URL}/${locale}/shop?q={search_term_string}`,
            'query-input': 'required name=search_term_string',
        },
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationLd) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteLd) }}
            />
            <Nav />
            <Header />
            <Categories />
            <MovingWords />
            <LimitOffer />
            <Products />
            <Words />
            <Footer />
        </>
    );
}
