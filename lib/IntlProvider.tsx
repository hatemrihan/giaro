'use client';

import { IntlProvider } from 'use-intl';
import type { ReactNode } from 'react';

type Props = {
    locale: string;
    messages: Record<string, unknown>;
    children: ReactNode;
};

export default function IntlClientProvider({ locale, messages, children }: Props) {
    return (
        <IntlProvider locale={locale} messages={messages as Record<string, string>}>
            {children}
        </IntlProvider>
    );
}
