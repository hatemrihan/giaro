import type { Metadata } from "next";
import localFont from 'next/font/local';
import { Toaster } from "@/components/ui/sonner";
import { CartProvider } from "@/components/contexts/CartContext";
import { AnalyticsProvider } from '@/lib/analytics';
import WhatsAppButton from "@/app/sections/whatsapp";
import IntlClientProvider from '@/lib/IntlProvider';
import { notFound } from 'next/navigation';
import "../globals.css";
import enMessages from '../../messages/en.json';
import arMessages from '../../messages/ar.json';
const messagesMap: Record<string, typeof enMessages> = {
  en: enMessages,
  ar: arMessages,
};

const pingFont = localFont({
  src: [
    { path: '../../public/fonts/ping/ping-ar-lt-hairline.otf', weight: '100', style: 'normal' },
    { path: '../../public/fonts/ping/ping-ar-lt-thin.otf', weight: '200', style: 'normal' },
    { path: '../../public/fonts/ping/ping-ar-lt-extralight.otf', weight: '300', style: 'normal' },
    { path: '../../public/fonts/ping/ping-ar-lt-regular.otf', weight: '400', style: 'normal' },
    { path: '../../public/fonts/ping/ping-ar-lt-medium.otf', weight: '500', style: 'normal' },
    { path: '../../public/fonts/ping/ping-ar-lt-bold.otf', weight: '700', style: 'normal' },
    { path: '../../public/fonts/ping/ping-ar-lt-heavy.otf', weight: '800', style: 'normal' },
    { path: '../../public/fonts/ping/ping-ar-lt-black.otf', weight: '900', style: 'normal' },
  ],
  variable: '--font-ping',
  display: 'swap',
});

const seasonsFont = localFont({
  src: [
    { path: '../../public/fonts/fontspring/Fontspring-DEMO-theseasons-lt.otf', weight: '300', style: 'normal' },
    { path: '../../public/fonts/fontspring/Fontspring-DEMO-theseasons-ltit.otf', weight: '300', style: 'italic' },
    { path: '../../public/fonts/fontspring/Fontspring-DEMO-theseasons-reg.otf', weight: '400', style: 'normal' },
    { path: '../../public/fonts/fontspring/Fontspring-DEMO-theseasons-it.otf', weight: '400', style: 'italic' },
    { path: '../../public/fonts/fontspring/Fontspring-DEMO-theseasons-bd.otf', weight: '700', style: 'normal' },
    { path: '../../public/fonts/fontspring/Fontspring-DEMO-theseasons-bdit.otf', weight: '700', style: 'italic' },
  ],
  variable: '--font-seasons',
  display: 'swap',
});

export async function generateMetadata({
    params,
}: {
    params: Promise<{ locale: string }>;
}): Promise<Metadata> {
    const { locale } = await params;
    const isAr = locale === 'ar';

    return {
        metadataBase: new URL('https://giaromart.com'),
        title: {
            template: '%s | Giaro',
            default: isAr ? 'جيارو — منتجات فاخرة' : 'Giaro — Premium Products',
        },
        description: isAr
            ? 'منتجات فاخرة — تصنيفات مختارة، توصيل حتى باب بيتك.'
            : 'Premium products — curated selections, delivered to your door.',
        openGraph: {
            title: isAr ? 'جيارو — منتجات فاخرة' : 'Giaro — Premium Products',
            description: isAr
                ? 'منتجات فاخرة — تصنيفات مختارة، توصيل حتى باب بيتك.'
                : 'Premium products — curated selections, delivered to your door.',
            url: `https://giaromart.com/${locale}`,
            siteName: 'Giaro',
            locale: isAr ? 'ar_EG' : 'en_US',
            type: 'website',
            images: [{
                url: 'https://giaromart.com/og-default.jpg',
                width: 1200,
                height: 630,
                alt: 'Giaro',
            }],
        },
        twitter: {
            card: 'summary_large_image',
            title: isAr ? 'جيارو — منتجات فاخرة' : 'Giaro — Premium Products',
            description: isAr
                ? 'منتجات فاخرة — تصنيفات مختارة، توصيل حتى باب بيتك.'
                : 'Premium products — curated selections, delivered to your door.',
            images: ['https://giaromart.com/og-default.jpg'],
        },
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
            canonical: `https://giaromart.com/${locale}`,
            languages: {
                ar: 'https://giaromart.com/ar',
                en: 'https://giaromart.com/en',
                'x-default': 'https://giaromart.com/ar',
            },
        },
    };
}

export default async function RootLayout({
  children,
  params
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const resolvedParams = await params;
  const locale = resolvedParams.locale;

  // Validate that the incoming `locale` is valid
  if (!['en', 'ar'].includes(locale)) {
    notFound();
  }

  // Load messages directly (bypasses next-intl plugin which doesn't support Next.js 16)
  const messages = messagesMap[locale] ?? arMessages;

  return (
    <html
      lang={locale}
      dir={locale === 'ar' ? 'rtl' : 'ltr'}
      className={`${pingFont.variable} ${seasonsFont.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground font-sans">
        <IntlClientProvider messages={messages} locale={locale}>
          <CartProvider>
            <AnalyticsProvider>
              {children}
              <WhatsAppButton />
            </AnalyticsProvider>
          </CartProvider>
          <Toaster richColors closeButton />
        </IntlClientProvider>
      </body>
    </html>
  );
}
