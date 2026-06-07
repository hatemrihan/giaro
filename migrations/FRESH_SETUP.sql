-- ══════════════════════════════════════════════════════════════
-- Giaro — CLEAN Fresh Database Setup (New Supabase Project)
-- Run in: Supabase SQL Editor (Dashboard → SQL Editor → New query)
-- ══════════════════════════════════════════════════════════════
-- This is the FINAL schema — run this ONCE on a brand-new project.
-- ══════════════════════════════════════════════════════════════


-- ─── Shared trigger function ──────────────────────────────────

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
    image_url  TEXT DEFAULT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "categories_select_public" ON categories;
CREATE POLICY "categories_select_public"
    ON categories FOR SELECT
    TO anon, authenticated
    USING (true);

DROP TRIGGER IF EXISTS set_updated_at ON categories;
CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON categories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


-- ═══════════════════════════════════════════════════════════════
-- 2. PRODUCTS (final schema with all columns)
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS products (
    id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name                   TEXT NOT NULL,
    slug                   TEXT NOT NULL,
    description            TEXT,
    detailed_description   TEXT,
    price                  NUMERIC NOT NULL DEFAULT 0,
    original_price         NUMERIC,
    discount               NUMERIC,
    main_image             TEXT,
    images                 TEXT[] DEFAULT '{}',
    videos                 TEXT[] DEFAULT '{}',
    variants               JSONB NOT NULL DEFAULT '[]',
    faqs                   JSONB NOT NULL DEFAULT '[]',
    city_pricing           JSONB NOT NULL DEFAULT '[]',
    option_groups          JSONB,
    is_active              BOOLEAN NOT NULL DEFAULT true,
    is_featured            BOOLEAN NOT NULL DEFAULT false,
    stock                  INTEGER NOT NULL DEFAULT 0,
    sizes                  TEXT,
    size_guide             TEXT,
    show_out_of_stock_badge BOOLEAN NOT NULL DEFAULT false,
    show_preorder_badge    BOOLEAN NOT NULL DEFAULT false,
    categories             TEXT[] DEFAULT '{}',
    "order"                INTEGER NOT NULL DEFAULT 0,
    promo_code             TEXT,
    shipping_info          TEXT,
    sku                    TEXT,
    weight                 NUMERIC,
    dimensions             TEXT,
    shipping_cost          NUMERIC DEFAULT 0,
    cod_fee                NUMERIC DEFAULT 0,
    default_currency       TEXT NOT NULL DEFAULT 'EGP',
    created_at             TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at             TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "products_select_visible" ON products;
CREATE POLICY "products_select_visible"
    ON products FOR SELECT
    TO anon, authenticated
    USING (is_active = true);

DROP TRIGGER IF EXISTS set_updated_at ON products;
CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE UNIQUE INDEX IF NOT EXISTS idx_products_slug ON products (slug);
CREATE INDEX IF NOT EXISTS idx_products_active ON products (is_active);
CREATE INDEX IF NOT EXISTS idx_products_created ON products (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_products_categories ON products USING GIN (categories);


-- ═══════════════════════════════════════════════════════════════
-- 3. ORDERS
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

DROP TRIGGER IF EXISTS set_updated_at ON orders;
CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX IF NOT EXISTS idx_orders_status ON orders (status);
CREATE INDEX IF NOT EXISTS idx_orders_created ON orders (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_number ON orders (order_number);


-- ═══════════════════════════════════════════════════════════════
-- 4. CONTACTS
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

DROP TRIGGER IF EXISTS set_updated_at ON contacts;
CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON contacts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX IF NOT EXISTS idx_contacts_status ON contacts (status);


-- ═══════════════════════════════════════════════════════════════
-- 5. NEWSLETTERS
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS newsletters (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email      TEXT NOT NULL UNIQUE,
    is_active  BOOLEAN NOT NULL DEFAULT true,
    subscribed BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE newsletters ENABLE ROW LEVEL SECURITY;

DROP TRIGGER IF EXISTS set_updated_at ON newsletters;
CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON newsletters
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX IF NOT EXISTS idx_newsletters_email ON newsletters (email);


-- ═══════════════════════════════════════════════════════════════
-- 6. RETURNS
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

DROP TRIGGER IF EXISTS set_updated_at ON returns;
CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON returns
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX IF NOT EXISTS idx_returns_status ON returns (status);


-- ═══════════════════════════════════════════════════════════════
-- 7. PROMOS (final aligned schema)
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS promos (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code            TEXT NOT NULL UNIQUE,
    discount_type   TEXT NOT NULL DEFAULT 'percentage',
    discount_value  NUMERIC NOT NULL DEFAULT 0,
    usage_limit     INTEGER NOT NULL DEFAULT 0,
    used_count      INTEGER NOT NULL DEFAULT 0,
    minimum_order   NUMERIC DEFAULT NULL,
    maximum_discount NUMERIC DEFAULT NULL,
    description     TEXT DEFAULT NULL,
    is_active       BOOLEAN NOT NULL DEFAULT true,
    expires_at      TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE promos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "promos_select_active" ON promos;
CREATE POLICY "promos_select_active"
    ON promos FOR SELECT
    TO anon, authenticated
    USING (is_active = true);

DROP TRIGGER IF EXISTS set_updated_at ON promos;
CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON promos
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX IF NOT EXISTS idx_promos_code ON promos (code);
CREATE INDEX IF NOT EXISTS idx_promos_active ON promos (is_active);


-- ═══════════════════════════════════════════════════════════════
-- 8. PAYMENT SETTINGS
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS payment_settings (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cod_enabled      BOOLEAN NOT NULL DEFAULT true,
    insta_pay_enabled BOOLEAN NOT NULL DEFAULT false,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE payment_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "payment_settings_select_public" ON payment_settings;
CREATE POLICY "payment_settings_select_public"
    ON payment_settings FOR SELECT
    TO anon, authenticated
    USING (true);

DROP TRIGGER IF EXISTS set_updated_at ON payment_settings;
CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON payment_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Seed default row
INSERT INTO payment_settings (cod_enabled, insta_pay_enabled)
SELECT true, false
WHERE NOT EXISTS (SELECT 1 FROM payment_settings);


-- ═══════════════════════════════════════════════════════════════
-- 9. CURRENCY SETTINGS
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS currency_settings (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    default_currency TEXT NOT NULL DEFAULT 'EGP',
    created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE currency_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "currency_settings_select_public" ON currency_settings;
CREATE POLICY "currency_settings_select_public"
    ON currency_settings FOR SELECT
    TO anon, authenticated
    USING (true);

DROP TRIGGER IF EXISTS set_updated_at ON currency_settings;
CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON currency_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


-- ═══════════════════════════════════════════════════════════════
-- 10. EXCHANGE RATES
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

DROP POLICY IF EXISTS "exchange_rates_select_public" ON exchange_rates;
CREATE POLICY "exchange_rates_select_public"
    ON exchange_rates FOR SELECT
    TO anon, authenticated
    USING (true);

DROP TRIGGER IF EXISTS set_updated_at ON exchange_rates;
CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON exchange_rates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


-- ═══════════════════════════════════════════════════════════════
-- 11. NOTIFICATIONS
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS notifications (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type       TEXT NOT NULL,
    title      TEXT NOT NULL DEFAULT '',
    message    TEXT NOT NULL,
    is_read    BOOLEAN NOT NULL DEFAULT false,
    data       JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

DROP TRIGGER IF EXISTS set_updated_at ON notifications;
CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON notifications
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


-- ═══════════════════════════════════════════════════════════════
-- 12. GOVERNORATE PRICING
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS governorate_pricing (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    governorate     TEXT NOT NULL UNIQUE,
    shipping_cost   NUMERIC NOT NULL DEFAULT 0,
    cod_fee         NUMERIC NOT NULL DEFAULT 0,
    is_active       BOOLEAN NOT NULL DEFAULT true,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE governorate_pricing ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "governorate_pricing_select_public" ON governorate_pricing;
CREATE POLICY "governorate_pricing_select_public"
    ON governorate_pricing FOR SELECT
    TO anon, authenticated
    USING (true);

DROP TRIGGER IF EXISTS set_updated_at ON governorate_pricing;
CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON governorate_pricing
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX IF NOT EXISTS idx_governorate_pricing_governorate ON governorate_pricing (governorate);

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


-- ═══════════════════════════════════════════════════════════════
-- 13. OFFERS
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS offers (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title          TEXT NOT NULL,
    description    TEXT NOT NULL DEFAULT '',
    image          TEXT NOT NULL DEFAULT '',
    link           TEXT NOT NULL DEFAULT '',
    is_active      BOOLEAN NOT NULL DEFAULT true,
    show_on_home   BOOLEAN NOT NULL DEFAULT false,
    show_pages     TEXT[] NOT NULL DEFAULT '{}',
    display_order  INTEGER NOT NULL DEFAULT 0,
    product_ids    TEXT[] DEFAULT '{}',
    discount_label TEXT DEFAULT '',
    created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE offers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "offers_public_read" ON offers;
CREATE POLICY "offers_public_read"
    ON offers FOR SELECT
    USING (true);

DROP TRIGGER IF EXISTS offers_updated_at ON offers;
CREATE TRIGGER offers_updated_at
    BEFORE UPDATE ON offers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


-- ═══════════════════════════════════════════════════════════════
-- 14. ANALYTICS EVENTS
-- ═══════════════════════════════════════════════════════════════

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

ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_events_name_created ON analytics_events (event_name, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_events_session ON analytics_events (session_id, created_at);
CREATE INDEX IF NOT EXISTS idx_events_created ON analytics_events USING BRIN (created_at);


-- ═══════════════════════════════════════════════════════════════
-- 15. STORE SETTINGS
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS store_settings (
    id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_name           TEXT NOT NULL DEFAULT 'Giaro',
    low_stock_threshold  INTEGER NOT NULL DEFAULT 5,
    created_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at           TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE store_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "store_settings_select_public" ON store_settings;
CREATE POLICY "store_settings_select_public"
    ON store_settings FOR SELECT
    TO anon, authenticated
    USING (true);

-- Seed default
INSERT INTO store_settings (store_name, low_stock_threshold)
SELECT 'Giaro', 5
WHERE NOT EXISTS (SELECT 1 FROM store_settings);


-- ═══════════════════════════════════════════════════════════════
-- 16. RPC FUNCTIONS
-- ═══════════════════════════════════════════════════════════════

-- Drop any existing versions first (avoids return-type conflicts)
DROP FUNCTION IF EXISTS deduct_stock(UUID, INTEGER, TEXT, JSONB);
DROP FUNCTION IF EXISTS restore_stock(UUID, INTEGER, TEXT, JSONB);
DROP FUNCTION IF EXISTS claim_promo(TEXT, NUMERIC);
DROP FUNCTION IF EXISTS toggle_all_products_visibility(BOOLEAN);

-- Deduct stock atomically
CREATE OR REPLACE FUNCTION deduct_stock(
    p_product_id UUID,
    p_quantity INTEGER,
    p_variant_name TEXT DEFAULT NULL,
    p_variant_attrs JSONB DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_product RECORD;
    v_variants JSONB;
    v_idx INTEGER;
    v_variant JSONB;
    v_current_stock INTEGER;
BEGIN
    SELECT * INTO v_product FROM products WHERE id = p_product_id FOR UPDATE;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Product not found';
    END IF;

    IF p_variant_name IS NOT NULL OR p_variant_attrs IS NOT NULL THEN
        v_variants := v_product.variants;
        v_idx := -1;
        FOR i IN 0..jsonb_array_length(v_variants)-1 LOOP
            v_variant := v_variants->i;
            IF p_variant_attrs IS NOT NULL AND v_variant->'attributes' @> p_variant_attrs THEN
                v_idx := i; EXIT;
            ELSIF p_variant_name IS NOT NULL AND v_variant->>'name' = p_variant_name THEN
                v_idx := i; EXIT;
            END IF;
        END LOOP;
        IF v_idx < 0 THEN RAISE EXCEPTION 'Variant not found'; END IF;
        v_current_stock := (v_variants->v_idx->>'stock')::integer;
        IF v_current_stock < p_quantity THEN RAISE EXCEPTION 'Insufficient variant stock'; END IF;
        v_variants := jsonb_set(v_variants, ARRAY[v_idx::text, 'stock'], to_jsonb(v_current_stock - p_quantity));
        UPDATE products SET variants = v_variants, updated_at = now() WHERE id = p_product_id;
    ELSE
        IF v_product.stock < p_quantity THEN RAISE EXCEPTION 'Insufficient stock'; END IF;
        UPDATE products SET stock = stock - p_quantity, updated_at = now() WHERE id = p_product_id;
    END IF;
END;
$$;

-- Restore stock atomically
CREATE OR REPLACE FUNCTION restore_stock(
    p_product_id UUID,
    p_quantity INTEGER,
    p_variant_name TEXT DEFAULT NULL,
    p_variant_attrs JSONB DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_product RECORD;
    v_variants JSONB;
    v_idx INTEGER;
    v_variant JSONB;
    v_current_stock INTEGER;
BEGIN
    SELECT * INTO v_product FROM products WHERE id = p_product_id FOR UPDATE;
    IF NOT FOUND THEN RETURN; END IF;

    IF p_variant_name IS NOT NULL OR p_variant_attrs IS NOT NULL THEN
        v_variants := v_product.variants;
        v_idx := -1;
        FOR i IN 0..jsonb_array_length(v_variants)-1 LOOP
            v_variant := v_variants->i;
            IF p_variant_attrs IS NOT NULL AND v_variant->'attributes' @> p_variant_attrs THEN
                v_idx := i; EXIT;
            ELSIF p_variant_name IS NOT NULL AND v_variant->>'name' = p_variant_name THEN
                v_idx := i; EXIT;
            END IF;
        END LOOP;
        IF v_idx < 0 THEN RETURN; END IF;
        v_current_stock := (v_variants->v_idx->>'stock')::integer;
        v_variants := jsonb_set(v_variants, ARRAY[v_idx::text, 'stock'], to_jsonb(v_current_stock + p_quantity));
        UPDATE products SET variants = v_variants, updated_at = now() WHERE id = p_product_id;
    ELSE
        UPDATE products SET stock = stock + p_quantity, updated_at = now() WHERE id = p_product_id;
    END IF;
END;
$$;

-- Atomic promo claim
CREATE OR REPLACE FUNCTION claim_promo(p_code TEXT, p_subtotal NUMERIC)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_promo RECORD;
    v_result JSONB;
BEGIN
    SELECT * INTO v_promo FROM promos WHERE code = UPPER(TRIM(p_code)) FOR UPDATE;
    IF NOT FOUND THEN RAISE EXCEPTION 'PROMO_INVALID: Promo code not found'; END IF;
    IF NOT v_promo.is_active THEN RAISE EXCEPTION 'PROMO_INACTIVE: Promo code is not active'; END IF;
    IF v_promo.expires_at IS NOT NULL AND v_promo.expires_at < NOW() THEN RAISE EXCEPTION 'PROMO_EXPIRED: Promo code has expired'; END IF;
    IF v_promo.usage_limit IS NOT NULL AND v_promo.usage_limit > 0 AND v_promo.used_count >= v_promo.usage_limit THEN RAISE EXCEPTION 'PROMO_EXHAUSTED: Usage limit reached'; END IF;
    IF v_promo.minimum_order IS NOT NULL AND p_subtotal < v_promo.minimum_order THEN RAISE EXCEPTION 'PROMO_MIN_ORDER: Minimum order not met'; END IF;

    UPDATE promos SET used_count = used_count + 1, updated_at = NOW() WHERE id = v_promo.id;

    v_result := jsonb_build_object(
        'id', v_promo.id, 'code', v_promo.code,
        'discount_type', v_promo.discount_type, 'discount_value', v_promo.discount_value,
        'minimum_order', v_promo.minimum_order, 'maximum_discount', v_promo.maximum_discount,
        'usage_limit', v_promo.usage_limit, 'used_count', v_promo.used_count + 1,
        'is_active', v_promo.is_active, 'expires_at', v_promo.expires_at,
        'description', v_promo.description,
        'created_at', v_promo.created_at, 'updated_at', NOW()
    );
    RETURN v_result;
END;
$$;

-- Toggle all products visibility
CREATE OR REPLACE FUNCTION toggle_all_products_visibility(p_visible BOOLEAN)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_count INTEGER;
BEGIN
    UPDATE products SET is_active = p_visible, updated_at = NOW();
    GET DIAGNOSTICS v_count = ROW_COUNT;
    RETURN v_count;
END;
$$;


-- ═══════════════════════════════════════════════════════════════
-- DONE ✅
-- ═══════════════════════════════════════════════════════════════
