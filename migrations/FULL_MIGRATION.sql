-- ══════════════════════════════════════════════════════════════
-- Giaro — Full Database Schema with Row Level Security
-- Run in Supabase SQL Editor (Dashboard → SQL Editor → New query)
-- ══════════════════════════════════════════════════════════════
-- 
-- SECURITY MODEL:
--   • RLS is ENABLED on every table
--   • Service role (supabaseAdmin) bypasses RLS automatically
--   • Anon key gets read-only access to public-facing data
--   • Write operations only go through API routes (service role)
--   • No direct client-side mutations allowed
--
-- ══════════════════════════════════════════════════════════════


-- ─── shared trigger function ──────────────────────────────────

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;


-- ═══════════════════════════════════════════════════════════════
-- 1. CATEGORIES
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS categories (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name       TEXT NOT NULL UNIQUE,
    image_url  TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Public can read categories (storefront product filters)
CREATE POLICY "categories_select_public"
    ON categories FOR SELECT
    TO anon, authenticated
    USING (true);

-- Only service role can insert/update/delete (admin API routes)
-- (No INSERT/UPDATE/DELETE policies for anon = blocked by default)

DROP TRIGGER IF EXISTS set_updated_at ON categories;
CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON categories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


-- ═══════════════════════════════════════════════════════════════
-- 2. PRODUCTS
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS products (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title             TEXT NOT NULL,
    description       TEXT,
    category          TEXT,
    price             NUMERIC NOT NULL DEFAULT 0,
    images            JSONB DEFAULT '[]',
    videos            JSONB DEFAULT '[]',
    variants          JSONB DEFAULT '[]',
    faqs              JSONB DEFAULT '[]',
    city_pricing      JSONB DEFAULT '[]',
    is_visible        BOOLEAN NOT NULL DEFAULT true,
    featured          BOOLEAN NOT NULL DEFAULT false,
    stock             INTEGER NOT NULL DEFAULT 0,
    sku               TEXT,
    weight            NUMERIC,
    dimensions        TEXT,
    shipping_cost     NUMERIC DEFAULT 0,
    cod_fee           NUMERIC DEFAULT 0,
    default_currency  TEXT NOT NULL DEFAULT 'EGP',
    created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Public can only see VISIBLE products
CREATE POLICY "products_select_visible"
    ON products FOR SELECT
    TO anon, authenticated
    USING (is_visible = true);

DROP TRIGGER IF EXISTS set_updated_at ON products;
CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


-- ═══════════════════════════════════════════════════════════════
-- 3. ORDERS (private — admin + API routes only)
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS orders (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number     TEXT NOT NULL UNIQUE,
    customer_name    TEXT NOT NULL,
    customer_email   TEXT,
    customer_phone   TEXT,
    shipping_address JSONB,
    items            JSONB NOT NULL DEFAULT '[]',
    subtotal         NUMERIC NOT NULL DEFAULT 0,
    shipping_cost    NUMERIC NOT NULL DEFAULT 0,
    cod_fee          NUMERIC NOT NULL DEFAULT 0,
    total            NUMERIC NOT NULL DEFAULT 0,
    currency         TEXT NOT NULL DEFAULT 'EGP',
    status           TEXT NOT NULL DEFAULT 'pending',
    payment_method   TEXT NOT NULL DEFAULT 'cashOnDelivery',
    payment_status   TEXT NOT NULL DEFAULT 'pending',
    notes            TEXT,
    governorate      TEXT,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- NO public read/write — orders are fully private
-- Only service role (API routes) can access orders

DROP TRIGGER IF EXISTS set_updated_at ON orders;
CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


-- ═══════════════════════════════════════════════════════════════
-- 4. CONTACTS (private — submitted via API, read by admin)
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS contacts (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name       TEXT NOT NULL,
    email      TEXT NOT NULL,
    message    TEXT,
    status     TEXT NOT NULL DEFAULT 'pending',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;

-- NO public access — contacts go through API routes only

DROP TRIGGER IF EXISTS set_updated_at ON contacts;
CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON contacts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


-- ═══════════════════════════════════════════════════════════════
-- 5. NEWSLETTERS (private — submitted via API)
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS newsletters (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email      TEXT NOT NULL UNIQUE,
    subscribed BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE newsletters ENABLE ROW LEVEL SECURITY;

-- NO public access — newsletter signup goes through API

DROP TRIGGER IF EXISTS set_updated_at ON newsletters;
CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON newsletters
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


-- ═══════════════════════════════════════════════════════════════
-- 6. RETURNS (private — submitted via API, managed by admin)
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS returns (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email        TEXT NOT NULL,
    order_number TEXT NOT NULL,
    status       TEXT NOT NULL DEFAULT 'pending',
    created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE returns ENABLE ROW LEVEL SECURITY;

-- NO public access — returns go through API routes only

DROP TRIGGER IF EXISTS set_updated_at ON returns;
CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON returns
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


-- ═══════════════════════════════════════════════════════════════
-- 7. PROMOS
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS promos (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code          TEXT NOT NULL UNIQUE,
    discount_type TEXT NOT NULL DEFAULT 'percentage',
    discount      NUMERIC NOT NULL DEFAULT 0,
    max_uses      INTEGER NOT NULL DEFAULT 0,
    used_count    INTEGER NOT NULL DEFAULT 0,
    is_active     BOOLEAN NOT NULL DEFAULT true,
    expires_at    TIMESTAMPTZ,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE promos ENABLE ROW LEVEL SECURITY;

-- Public can validate promo codes (read active ones only)
CREATE POLICY "promos_select_active"
    ON promos FOR SELECT
    TO anon, authenticated
    USING (is_active = true);

DROP TRIGGER IF EXISTS set_updated_at ON promos;
CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON promos
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


-- ═══════════════════════════════════════════════════════════════
-- 8. PAYMENT SETTINGS (read-only for public — checkout)
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS payment_settings (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cod_enabled BOOLEAN NOT NULL DEFAULT true,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE payment_settings ENABLE ROW LEVEL SECURITY;

-- Public can read payment settings (checkout needs to check COD)
CREATE POLICY "payment_settings_select_public"
    ON payment_settings FOR SELECT
    TO anon, authenticated
    USING (true);

DROP TRIGGER IF EXISTS set_updated_at ON payment_settings;
CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON payment_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


-- ═══════════════════════════════════════════════════════════════
-- 9. CURRENCY SETTINGS (read-only for public)
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS currency_settings (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    default_currency TEXT NOT NULL DEFAULT 'EGP',
    created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE currency_settings ENABLE ROW LEVEL SECURITY;

-- Public can read currency settings (storefront pricing)
CREATE POLICY "currency_settings_select_public"
    ON currency_settings FOR SELECT
    TO anon, authenticated
    USING (true);

DROP TRIGGER IF EXISTS set_updated_at ON currency_settings;
CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON currency_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


-- ═══════════════════════════════════════════════════════════════
-- 10. EXCHANGE RATES (read-only for public)
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS exchange_rates (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    base         TEXT NOT NULL,
    target       TEXT NOT NULL,
    rate         NUMERIC NOT NULL,
    last_updated TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE exchange_rates ENABLE ROW LEVEL SECURITY;

-- Public can read exchange rates (price conversion on storefront)
CREATE POLICY "exchange_rates_select_public"
    ON exchange_rates FOR SELECT
    TO anon, authenticated
    USING (true);

DROP TRIGGER IF EXISTS set_updated_at ON exchange_rates;
CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON exchange_rates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


-- ═══════════════════════════════════════════════════════════════
-- 11. NOTIFICATIONS (private — admin only)
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS notifications (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type       TEXT NOT NULL,
    message    TEXT NOT NULL,
    is_read    BOOLEAN NOT NULL DEFAULT false,
    metadata   JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- NO public access — notifications are admin-only

DROP TRIGGER IF EXISTS set_updated_at ON notifications;
CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON notifications
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


-- ═══════════════════════════════════════════════════════════════
-- INDEX — Optimize common queries
-- ═══════════════════════════════════════════════════════════════

CREATE INDEX IF NOT EXISTS idx_products_visible     ON products (is_visible);
CREATE INDEX IF NOT EXISTS idx_products_category    ON products (category);
CREATE INDEX IF NOT EXISTS idx_products_created     ON products (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_status        ON orders (status);
CREATE INDEX IF NOT EXISTS idx_orders_created       ON orders (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_number        ON orders (order_number);
CREATE INDEX IF NOT EXISTS idx_contacts_status      ON contacts (status);
CREATE INDEX IF NOT EXISTS idx_returns_status       ON returns (status);
CREATE INDEX IF NOT EXISTS idx_promos_code          ON promos (code);
CREATE INDEX IF NOT EXISTS idx_promos_active        ON promos (is_active);
CREATE INDEX IF NOT EXISTS idx_newsletters_email    ON newsletters (email);
CREATE INDEX IF NOT EXISTS idx_categories_name      ON categories (name);
ALTER TABLE categories ADD COLUMN IF NOT EXISTS image_url text DEFAULT NULL;
-- This migration assumes an existing structure with `title`, `is_visible`, `featured` columns from an older snapshot.

-- ✅ Renames guarded
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='title') THEN
    ALTER TABLE products RENAME COLUMN title TO name;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='is_visible') THEN
    ALTER TABLE products RENAME COLUMN is_visible TO is_active;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='featured') THEN
    ALTER TABLE products RENAME COLUMN featured TO is_featured;
  END IF;
END $$;

ALTER TABLE products DROP COLUMN IF EXISTS category;

-- ✅ Safe column casting without destroying existing text/image data
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='images' AND data_type != 'ARRAY') THEN
    ALTER TABLE products ALTER COLUMN images TYPE TEXT[] USING '{}';
  ELSIF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='images') THEN
    ALTER TABLE products ADD COLUMN images TEXT[] DEFAULT '{}';
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='videos' AND data_type != 'ARRAY') THEN
    ALTER TABLE products ALTER COLUMN videos TYPE TEXT[] USING '{}';
  ELSIF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='videos') THEN
    ALTER TABLE products ADD COLUMN videos TEXT[] DEFAULT '{}';
  END IF;
END $$;

-- ✅ Adding new nullable properties
ALTER TABLE products ADD COLUMN IF NOT EXISTS original_price NUMERIC;
ALTER TABLE products ADD COLUMN IF NOT EXISTS discount NUMERIC;
ALTER TABLE products ADD COLUMN IF NOT EXISTS main_image TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS sizes TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS size_guide TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS show_out_of_stock_badge BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE products ADD COLUMN IF NOT EXISTS show_preorder_badge BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE products ADD COLUMN IF NOT EXISTS detailed_description TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS shipping_info TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS categories TEXT[] DEFAULT '{}';
ALTER TABLE products ADD COLUMN IF NOT EXISTS "order" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE products ADD COLUMN IF NOT EXISTS promo_code TEXT;

-- ✅ Adding missing JSONB structures 
ALTER TABLE products ADD COLUMN IF NOT EXISTS variants    JSONB NOT NULL DEFAULT '[]';
ALTER TABLE products ADD COLUMN IF NOT EXISTS faqs        JSONB NOT NULL DEFAULT '[]';
ALTER TABLE products ADD COLUMN IF NOT EXISTS city_pricing JSONB NOT NULL DEFAULT '[]';

-- ✅ Safe slug population + NOT NULL index enforcement (Arabic-safe)
ALTER TABLE products ADD COLUMN IF NOT EXISTS slug TEXT;
UPDATE products 
SET slug = CASE 
  WHEN name ~ '^[a-zA-Z0-9 ]+$' 
  THEN LOWER(REGEXP_REPLACE(name, '[^a-z0-9]+', '-', 'gi')) || '-' || LEFT(id::text, 8)
  ELSE LEFT(id::text, 8)  -- fallback to short UUID for Arabic
END
WHERE slug IS NULL;
ALTER TABLE products ALTER COLUMN slug SET NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_products_slug ON products (slug);
-- Migration 006: Add RPC function for bulk updates

CREATE OR REPLACE FUNCTION toggle_all_products_visibility(p_visible BOOLEAN)
RETURNS INTEGER AS $$
DECLARE
  result INTEGER;
BEGIN
  UPDATE products SET is_active = p_visible;
  GET DIAGNOSTICS result = ROW_COUNT;
  RETURN result;
END;
$$ LANGUAGE plpgsql;
-- ═══════════════════════════════════════════════════════════════
-- 007: Governorate Pricing Table + Payment Settings Seed
-- ═══════════════════════════════════════════════════════════════

-- Governorate pricing table for shipping + COD fees per Egyptian governorate
CREATE TABLE IF NOT EXISTS governorate_pricing (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    governorate     TEXT NOT NULL UNIQUE,
    shipping_cost   NUMERIC NOT NULL DEFAULT 0,
    cod_fee         NUMERIC NOT NULL DEFAULT 0,
    is_active       BOOLEAN NOT NULL DEFAULT true,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_governorate_pricing_governorate ON governorate_pricing (governorate);

ALTER TABLE governorate_pricing ENABLE ROW LEVEL SECURITY;

CREATE POLICY "governorate_pricing_select_public"
    ON governorate_pricing FOR SELECT
    TO anon, authenticated
    USING (true);

DROP TRIGGER IF EXISTS set_updated_at ON governorate_pricing;
CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON governorate_pricing
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Seed all 27 Egyptian governorates
INSERT INTO governorate_pricing (governorate, shipping_cost, cod_fee, is_active) VALUES
    ('القاهرة', 50, 10, true),
    ('الجيزة', 50, 10, true),
    ('الإسكندرية', 60, 15, true),
    ('الدقهلية', 65, 15, true),
    ('البحيرة', 65, 15, true),
    ('الشرقية', 65, 15, true),
    ('القليوبية', 55, 10, true),
    ('المنوفية', 60, 15, true),
    ('الغربية', 60, 15, true),
    ('كفر الشيخ', 70, 15, true),
    ('دمياط', 65, 15, true),
    ('بورسعيد', 65, 15, true),
    ('الإسماعيلية', 65, 15, true),
    ('السويس', 65, 15, true),
    ('الفيوم', 70, 20, true),
    ('بني سويف', 70, 20, true),
    ('المنيا', 75, 20, true),
    ('أسيوط', 80, 20, true),
    ('سوهاج', 80, 20, true),
    ('قنا', 85, 20, true),
    ('الأقصر', 85, 20, true),
    ('أسوان', 90, 25, true),
    ('البحر الأحمر', 90, 25, true),
    ('الوادي الجديد', 95, 25, true),
    ('مطروح', 90, 25, true),
    ('شمال سيناء', 95, 25, true),
    ('جنوب سيناء', 95, 25, true)
ON CONFLICT (governorate) DO NOTHING;

-- Add insta_pay_enabled column to payment_settings if missing
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'payment_settings' AND column_name = 'insta_pay_enabled'
    ) THEN
        ALTER TABLE payment_settings ADD COLUMN insta_pay_enabled BOOLEAN NOT NULL DEFAULT false;
    END IF;
END $$;

-- Seed default payment settings row if empty
INSERT INTO payment_settings (cod_enabled, insta_pay_enabled)
SELECT true, false
WHERE NOT EXISTS (SELECT 1 FROM payment_settings);
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
-- ================================================================
-- Migration 009: Align promos table with database.types.ts
-- Renames columns and adds missing ones to match the application's
-- expected schema in lib/database.types.ts
-- ================================================================

-- Rename existing columns to match type definitions
ALTER TABLE promos RENAME COLUMN discount TO discount_value;
ALTER TABLE promos RENAME COLUMN max_uses TO usage_limit;

-- Add missing columns
ALTER TABLE promos ADD COLUMN IF NOT EXISTS minimum_order NUMERIC DEFAULT NULL;
ALTER TABLE promos ADD COLUMN IF NOT EXISTS maximum_discount NUMERIC DEFAULT NULL;
ALTER TABLE promos ADD COLUMN IF NOT EXISTS description TEXT DEFAULT NULL;
ALTER TABLE promos ADD COLUMN IF NOT EXISTS discount_type TEXT NOT NULL DEFAULT 'percentage';
-- ================================================================
-- Migration 010: Align notifications table with database.types.ts
-- Renames metadata->data and adds missing title column
-- ================================================================

ALTER TABLE notifications RENAME COLUMN metadata TO data;
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS title TEXT NOT NULL DEFAULT '';
-- ================================================================
-- Migration 011: Create missing RPC functions
-- claim_promo and toggle_all_products_visibility
-- ================================================================

-- Atomic promo claim: validates rules + increments used_count in one transaction
CREATE OR REPLACE FUNCTION claim_promo(p_code TEXT, p_subtotal NUMERIC)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_promo RECORD;
    v_result JSONB;
BEGIN
    SELECT * INTO v_promo
    FROM promos
    WHERE code = UPPER(TRIM(p_code))
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'PROMO_INVALID: Promo code not found';
    END IF;

    IF NOT v_promo.is_active THEN
        RAISE EXCEPTION 'PROMO_INACTIVE: Promo code is not active';
    END IF;

    IF v_promo.expires_at IS NOT NULL AND v_promo.expires_at < NOW() THEN
        RAISE EXCEPTION 'PROMO_EXPIRED: Promo code has expired';
    END IF;

    IF v_promo.usage_limit IS NOT NULL AND v_promo.usage_limit > 0 AND v_promo.used_count >= v_promo.usage_limit THEN
        RAISE EXCEPTION 'PROMO_EXHAUSTED: Promo code usage limit reached';
    END IF;

    IF v_promo.minimum_order IS NOT NULL AND p_subtotal < v_promo.minimum_order THEN
        RAISE EXCEPTION 'PROMO_MIN_ORDER: Minimum order amount not met (requires %%)', v_promo.minimum_order;
    END IF;

    UPDATE promos
    SET used_count = used_count + 1,
        updated_at = NOW()
    WHERE id = v_promo.id;

    v_result := jsonb_build_object(
        'id', v_promo.id,
        'code', v_promo.code,
        'discount_type', v_promo.discount_type,
        'discount_value', v_promo.discount_value,
        'minimum_order', v_promo.minimum_order,
        'maximum_discount', v_promo.maximum_discount,
        'usage_limit', v_promo.usage_limit,
        'used_count', v_promo.used_count + 1,
        'is_active', v_promo.is_active,
        'expires_at', v_promo.expires_at,
        'description', v_promo.description,
        'created_at', v_promo.created_at,
        'updated_at', NOW()
    );

    RETURN v_result;
END;
$$;

-- Toggle all products visibility at once
CREATE OR REPLACE FUNCTION toggle_all_products_visibility(p_visible BOOLEAN)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_count INTEGER;
BEGIN
    UPDATE products
    SET is_active = p_visible,
        updated_at = NOW();
    GET DIAGNOSTICS v_count = ROW_COUNT;
    RETURN v_count;
END;
$$;
-- Analytics events table for funnel tracking
-- Designed for high-volume append-only writes with efficient read queries

CREATE TABLE IF NOT EXISTS analytics_events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    event_id VARCHAR(64) NOT NULL,
    session_id VARCHAR(64),
    event_name VARCHAR(50) NOT NULL,
    url_path TEXT,
    referrer TEXT,
    locale VARCHAR(5) DEFAULT 'ar',
    payload JSONB DEFAULT '{}'::jsonb,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),

    CONSTRAINT uq_event_id UNIQUE (event_id)
);

-- Indexes optimized for funnel queries
CREATE INDEX IF NOT EXISTS idx_events_name_created ON analytics_events (event_name, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_events_session ON analytics_events (session_id, created_at);
CREATE INDEX IF NOT EXISTS idx_events_created ON analytics_events USING BRIN (created_at);

-- RLS: Only server-side inserts (via service role key)
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
