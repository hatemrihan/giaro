import { supabaseAdmin } from '../lib/supabase';
import type { CurrencySettingsRow, DefaultCurrency } from '../lib/database.types';

// ─── Types ────────────────────────────────────────────────────

export type CurrencySettings = CurrencySettingsRow;

// ─── Service ──────────────────────────────────────────────────

/**
 * Get the singleton currency settings row.
 * There is always exactly one row (seeded in migration).
 */
export async function getCurrencySettings(): Promise<CurrencySettings> {
    const { data, error } = await supabaseAdmin
        .from('currency_settings')
        .select('*')
        .single();

    if (error) throw new Error(`Failed to fetch currency settings: ${error.message}`);
    return data;
}

/**
 * Update the default currency.
 * Always operates on the single existing row.
 */
export async function updateDefaultCurrency(
    currency: DefaultCurrency
): Promise<CurrencySettings> {
    // Fetch the singleton id first
    const current = await getCurrencySettings();

    const { data, error } = await supabaseAdmin
        .from('currency_settings')
        .update({ default_currency: currency })
        .eq('id', current.id)
        .select()
        .single();

    if (error) throw new Error(`Failed to update default currency: ${error.message}`);
    return data;
}