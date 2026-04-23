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
