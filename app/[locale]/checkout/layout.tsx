import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'إتمام الطلب | Giaro',
    robots: {
        index: false,
        follow: false,
    },
};

export default function CheckoutLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
