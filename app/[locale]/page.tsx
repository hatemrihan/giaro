import { Metadata } from 'next';
import Nav from './../sections/nav';
import Header from '../sections/header';
import Categories from './../sections/categories';
import LimitOffer from './../sections/limit';
import Footer from './../sections/footer';
import Products from '../sections/products';
import Words from '../sections/words';
import MovingWords from '../sections/MovingWords';
import { getAllCategories } from '@/models/category';
import { getActiveOffers } from '@/models/offer';

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

    // ── Fetch data server-side (eliminates client-side API round-trips) ──
    let categories: { id: string; name: string; image_url: string | null }[] = [];
    let offers: { id: string; title: string; description: string; image: string; link: string; product_ids: string[]; discount_label: string }[] = [];

    try {
        const [categoriesData, offersData] = await Promise.all([
            getAllCategories(),
            getActiveOffers({ page: 'homepage' }),
        ]);
        categories = categoriesData.map(c => ({
            id: c.id,
            name: c.name,
            image_url: c.image_url,
        }));
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        offers = (offersData as any[]).map(o => ({
            id: o.id,
            title: o.title || '',
            description: o.description || '',
            image: o.image || '',
            link: o.link || '',
            product_ids: o.product_ids || [],
            discount_label: o.discount_label || '',
        }));
    } catch (err) {
        console.error('[Home] Failed to prefetch data:', err);
        // Components will fall back to client-side fetching
    }

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
            <Categories initialCategories={categories} />
            <MovingWords />
            <LimitOffer initialOffers={offers} />
            <Products />
            <Words />
            <Footer />
        </>
    );
}
