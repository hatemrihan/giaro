import { supabaseAdmin } from '../lib/supabase';
import type { OfferRow, Database } from '../lib/database.types';

// ─── Types ────────────────────────────────────────────────────

export type Offer = OfferRow;
export type CreateOfferInput = Omit<OfferRow, 'id' | 'created_at' | 'updated_at'>;
export type UpdateOfferInput = Partial<Omit<OfferRow, 'id' | 'created_at' | 'updated_at'>>;

const PUBLIC_SELECT = 'id, title, description, image, link, show_pages, display_order, product_ids, discount_label';

// ─── Public queries ───────────────────────────────────────────

/**
 * Fetch active offers for a specific page.
 * page: 'homepage' | 'offers' | 'shop'
 * Uses show_pages array contains filter.
 */
export async function getActiveOffers(options: {
    page?: string;
    limit?: number;
} = {}): Promise<Pick<OfferRow, 'id' | 'title' | 'description' | 'image' | 'link' | 'show_pages' | 'display_order'>[]> {
    let query = supabaseAdmin
        .from('offers')
        .select(PUBLIC_SELECT)
        .eq('is_active', true)
        .order('display_order', { ascending: true });

    if (options.page) {
        query = query.contains('show_pages', [options.page]);
    }

    if (options.limit) {
        query = query.limit(options.limit);
    }

    const { data, error } = await query;
    if (error) throw new Error(`Failed to fetch offers: ${error.message}`);
    return data ?? [];
}

// ─── Admin queries ────────────────────────────────────────────

export async function getAllOffersAdmin(): Promise<Offer[]> {
    const { data, error } = await supabaseAdmin
        .from('offers')
        .select('*')
        .order('display_order', { ascending: true });

    if (error) throw new Error(`Failed to fetch offers: ${error.message}`);
    return (data as Offer[]) ?? [];
}

export async function createOffer(input: CreateOfferInput): Promise<Offer> {
    const { data, error } = await supabaseAdmin
        .from('offers')
        .insert(input as unknown as Database['public']['Tables']['offers']['Insert'])
        .select()
        .single();

    if (error) throw new Error(`Failed to create offer: ${error.message}`);
    return data as Offer;
}

export async function updateOffer(id: string, input: UpdateOfferInput): Promise<Offer | null> {
    const { data, error } = await supabaseAdmin
        .from('offers')
        .update(input as unknown as Database['public']['Tables']['offers']['Update'])
        .eq('id', id)
        .select()
        .maybeSingle();

    if (error) throw new Error(`Failed to update offer: ${error.message}`);
    return data as Offer | null;
}

export async function deleteOffer(id: string): Promise<void> {
    const { error } = await supabaseAdmin
        .from('offers')
        .delete()
        .eq('id', id);

    if (error) throw new Error(`Failed to delete offer: ${error.message}`);
}

export async function reorderOffers(
    items: { id: string; display_order: number }[]
): Promise<void> {
    const updates = items.map(({ id, display_order }) =>
        supabaseAdmin
            .from('offers')
            .update({ display_order } as unknown as Database['public']['Tables']['offers']['Update'])
            .eq('id', id)
    );

    const results = await Promise.all(updates);
    const failed = results.find(r => r.error);
    if (failed?.error) throw new Error(`Failed to reorder offers: ${failed.error.message}`);
}
