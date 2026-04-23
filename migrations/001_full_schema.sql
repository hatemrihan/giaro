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
