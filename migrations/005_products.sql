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
