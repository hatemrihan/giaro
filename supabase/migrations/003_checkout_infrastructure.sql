-- ═══════════════════════════════════════════════════════════════
-- Migration: Checkout Infrastructure
-- Tables: governorate_pricing, drop_points
-- Storage: instapay-screenshots bucket
-- ═══════════════════════════════════════════════════════════════

-- ─── 1. Governorate Pricing ──────────────────────────────────
-- Admin-managed shipping costs and COD fees per governorate.

CREATE TABLE IF NOT EXISTS governorate_pricing (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    governorate TEXT NOT NULL UNIQUE,
    shipping_cost NUMERIC(10,2) NOT NULL DEFAULT 0,
    cod_fee     NUMERIC(10,2) NOT NULL DEFAULT 0,
    is_active   BOOLEAN NOT NULL DEFAULT true,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS
ALTER TABLE governorate_pricing ENABLE ROW LEVEL SECURITY;

-- Public read (checkout needs to see pricing)
CREATE POLICY "governorate_pricing_read"
    ON governorate_pricing FOR SELECT
    USING (true);

-- Service role only for write
CREATE POLICY "governorate_pricing_write"
    ON governorate_pricing FOR ALL
    USING (auth.role() = 'service_role');

-- Index for fast lookup by governorate name
CREATE INDEX IF NOT EXISTS idx_governorate_pricing_name
    ON governorate_pricing (governorate);


-- ─── 2. Drop Points ─────────────────────────────────────────
-- Pickup locations managed by admin, queried by customer location.

CREATE TABLE IF NOT EXISTS drop_points (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name        TEXT NOT NULL,
    address     TEXT NOT NULL,
    governorate TEXT NOT NULL,
    city        TEXT NOT NULL,
    lat         DOUBLE PRECISION NOT NULL,
    lng         DOUBLE PRECISION NOT NULL,
    is_active   BOOLEAN NOT NULL DEFAULT true,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS
ALTER TABLE drop_points ENABLE ROW LEVEL SECURITY;

-- Public read (checkout needs to fetch drop points)
CREATE POLICY "drop_points_read"
    ON drop_points FOR SELECT
    USING (true);

-- Service role only for write
CREATE POLICY "drop_points_write"
    ON drop_points FOR ALL
    USING (auth.role() = 'service_role');

-- Index for governorate filtering
CREATE INDEX IF NOT EXISTS idx_drop_points_governorate
    ON drop_points (governorate);

-- Spatial-ish index (helpful for coordinate range queries)
CREATE INDEX IF NOT EXISTS idx_drop_points_coords
    ON drop_points (lat, lng);


-- ─── 3. Supabase Storage Bucket ──────────────────────────────
-- For InstaPay transfer screenshots.

INSERT INTO storage.buckets (id, name, public)
VALUES ('instapay-screenshots', 'instapay-screenshots', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public uploads to instapay-screenshots bucket
CREATE POLICY "instapay_screenshots_insert"
    ON storage.objects FOR INSERT
    WITH CHECK (bucket_id = 'instapay-screenshots');

-- Allow public read of instapay-screenshots
CREATE POLICY "instapay_screenshots_read"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'instapay-screenshots');
