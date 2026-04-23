-- ================================================================
-- Migration 008: Add offers table
-- Supports the dashboard offers widget and homepage promotional banners.
-- ================================================================

CREATE TABLE IF NOT EXISTS offers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    image TEXT NOT NULL DEFAULT '',
    link TEXT NOT NULL DEFAULT '',
    is_active BOOLEAN NOT NULL DEFAULT true,
    show_on_home BOOLEAN NOT NULL DEFAULT false,
    show_pages TEXT[] NOT NULL DEFAULT '{}',
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Auto-update updated_at on row modification
CREATE TRIGGER offers_updated_at
    BEFORE UPDATE ON offers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Enable Row Level Security
ALTER TABLE offers ENABLE ROW LEVEL SECURITY;

-- Allow public read access (offers are promotional content)
CREATE POLICY "offers_public_read"
    ON offers FOR SELECT
    USING (true);

-- Only service_role can modify offers (admin operations go through supabaseAdmin)
CREATE POLICY "offers_service_role_all"
    ON offers
    USING (auth.role() = 'service_role')
    WITH CHECK (auth.role() = 'service_role');
