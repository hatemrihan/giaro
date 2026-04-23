import { NextResponse } from 'next/server';
import { getExchangeRates, upsertExchangeRates, isRatesStale } from '@/models/exchangeRates';
import { currencyConfig } from '@/lib/currency-config/route';

const FALLBACK_RATES: Record<string, number> = {
    EGP: 1,
    SAR: currencyConfig.SAR?.rate || 0.08,
    AED: currencyConfig.AED?.rate || 0.076,
};

export async function GET() {
    try {
        // Check cache first
        const cached = await getExchangeRates('EGP');

        if (cached && !isRatesStale(cached)) {
            return NextResponse.json({
                success: true,
                rates: cached.rates,
                source: 'cache',
                fetchedAt: cached.fetched_at
            });
        }

        // Fetch fresh rates
        const apiKey = process.env.EXCHANGE_RATE_API_KEY;
        if (!apiKey) {
            // No API key — return fallback rates
            return NextResponse.json({
                success: true,
                rates: FALLBACK_RATES,
                source: 'fallback'
            });
        }

        const response = await fetch(
            `https://v6.exchangerate-api.com/v6/${apiKey}/latest/EGP`,
            { next: { revalidate: 0 } }
        );

        if (!response.ok) {
            throw new Error(`ExchangeRate API returned ${response.status}`);
        }

        const data = await response.json();

        if (data.result !== 'success') {
            throw new Error('ExchangeRate API returned error result');
        }

        // Extract only the currencies we support
        const rates: Record<string, number> = {
            EGP: 1,
            SAR: data.conversion_rates.SAR || FALLBACK_RATES.SAR,
            AED: data.conversion_rates.AED || FALLBACK_RATES.AED,
        };

        // Save to DB (upsert)
        const updated = await upsertExchangeRates({ base: 'EGP', rates });

        return NextResponse.json({
            success: true,
            rates: updated.rates,
            source: 'live',
            fetchedAt: updated.fetched_at
        });

    } catch (error) {
        console.error('Exchange rate fetch error:', error);

        // Try to return last cached rates even if stale
        try {
            const staleCache = await getExchangeRates('EGP');
            if (staleCache) {
                return NextResponse.json({
                    success: true,
                    rates: staleCache.rates,
                    source: 'stale_cache',
                    fetchedAt: staleCache.fetched_at
                });
            }
        } catch {
            // ignore
        }

        // Last resort — hardcoded fallback
        return NextResponse.json({
            success: true,
            rates: FALLBACK_RATES,
            source: 'fallback'
        });
    }
}
