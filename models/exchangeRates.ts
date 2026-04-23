import { supabaseAdmin, supabase } from '../lib/supabase';
import type { ExchangeRatesRow } from '../lib/database.types';

// ─── Types ────────────────────────────────────────────────────

export type ExchangeRates = ExchangeRatesRow;

export type UpsertExchangeRatesInput = {
    base: string;
    rates: Record<string, number>;
};

// How old rates can be before they're considered stale (1 hour)
const STALE_THRESHOLD_MS = 60 * 60 * 1000;

// ─── Service ──────────────────────────────────────────────────

/**
 * Get exchange rates for a given base currency.
 * Uses the public client — safe for client-side calls since
 * we added a public read policy in the migration.
 */
export async function getExchangeRates(base: string): Promise<ExchangeRates | null> {
    const { data, error } = await supabase
        .from('exchange_rates')
        .select('*')
        .eq('base', base.toUpperCase())
        .maybeSingle();

    if (error) throw new Error(`Failed to fetch exchange rates: ${error.message}`);
    return data;
}

/**
 * Check if cached rates are stale and need a refresh.
 */
export function isRatesStale(rates: ExchangeRates): boolean {
    const age = Date.now() - new Date(rates.fetched_at).getTime();
    return age > STALE_THRESHOLD_MS;
}

/**
 * Upsert exchange rates for a base currency.
 * Called by your rate-refresh cron job / API route.
 * Uses admin client — write operation.
 */
export async function upsertExchangeRates(
    input: UpsertExchangeRatesInput
): Promise<ExchangeRates> {
    const { data, error } = await supabaseAdmin
        .from('exchange_rates')
        .upsert(
            {
                base: input.base.toUpperCase(),
                rates: input.rates,
                fetched_at: new Date().toISOString(),
            },
            { onConflict: 'base' }    // update existing row if base already exists
        )
        .select()
        .single();

    if (error) throw new Error(`Failed to upsert exchange rates: ${error.message}`);
    return data;
}

/**
 * Get rates, auto-refreshing from an external API if stale.
 * Pass a fetcher function so this service stays decoupled
 * from the specific exchange rate provider you use.
 *
 * Usage:
 *   const rates = await getFreshRates('EUR', () => fetchFromOpenExchangeRates());
 */
export async function getFreshRates(
    base: string,
    fetcher: () => Promise<Record<string, number>>
): Promise<ExchangeRates> {
    const existing = await getExchangeRates(base);

    if (existing && !isRatesStale(existing)) {
        return existing;
    }

    // Stale or missing — fetch fresh from external source
    const freshRates = await fetcher();
    return upsertExchangeRates({ base, rates: freshRates });
}