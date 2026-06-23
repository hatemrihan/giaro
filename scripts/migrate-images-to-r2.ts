/**
 * migrate-images-to-r2.ts
 * 
 * One-time migration script to move all product and category images
 * from Supabase Storage to Cloudflare R2, and update the DB records.
 * 
 * Usage:
 *   npx tsx scripts/migrate-images-to-r2.ts
 * 
 * Prerequisites:
 *   - R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME, R2_PUBLIC_URL in .env.local
 *   - NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local
 * 
 * What it does:
 *   1. Fetches all products and categories from Supabase DB
 *   2. Downloads each image from Supabase Storage
 *   3. Compresses to WebP (max 1200px, quality 80)
 *   4. Uploads to R2
 *   5. Updates the DB record with the new R2 URL
 *   6. Logs progress and errors
 */

import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import sharp from 'sharp';

// ─── Config ───────────────────────────────────────────────────

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID!;
const R2_ACCESS_KEY = process.env.R2_ACCESS_KEY_ID!;
const R2_SECRET_KEY = process.env.R2_SECRET_ACCESS_KEY!;
const R2_BUCKET = process.env.R2_BUCKET_NAME || 'giaro-cdn';
const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL!;

const MAX_WIDTH = 1200;
const WEBP_QUALITY = 80;

// Validate env
for (const [key, val] of Object.entries({
    NEXT_PUBLIC_SUPABASE_URL: SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY: SUPABASE_KEY,
    R2_ACCOUNT_ID, R2_ACCESS_KEY_ID: R2_ACCESS_KEY,
    R2_SECRET_ACCESS_KEY: R2_SECRET_KEY, R2_PUBLIC_URL,
})) {
    if (!val) {
        console.error(`❌ Missing env var: ${key}`);
        process.exit(1);
    }
}

// ─── Clients ──────────────────────────────────────────────────

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const r2 = new S3Client({
    region: 'auto',
    endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
        accessKeyId: R2_ACCESS_KEY,
        secretAccessKey: R2_SECRET_KEY,
    },
});

// ─── Helpers ──────────────────────────────────────────────────

const SUPABASE_STORAGE_PREFIX = `${SUPABASE_URL}/storage/v1/object/public/`;

function isSupabaseUrl(url: string | null): boolean {
    return !!url && url.includes('supabase.co/storage/');
}

async function downloadAndCompress(url: string): Promise<{ buffer: Buffer; contentType: string } | null> {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            console.warn(`  ⚠️  Failed to download: ${url} (${response.status})`);
            return null;
        }

        const rawBuffer = Buffer.from(await response.arrayBuffer());
        const contentType = response.headers.get('content-type') || '';

        // Only compress images
        if (contentType.startsWith('image/')) {
            const compressed = await sharp(rawBuffer)
                .resize({ width: MAX_WIDTH, withoutEnlargement: true })
                .webp({ quality: WEBP_QUALITY })
                .toBuffer();
            return { buffer: compressed, contentType: 'image/webp' };
        }

        // Non-image (video) — pass through
        return { buffer: rawBuffer, contentType };
    } catch (err) {
        console.warn(`  ⚠️  Error downloading ${url}:`, err);
        return null;
    }
}

async function uploadToR2(buffer: Buffer, key: string, contentType: string): Promise<string> {
    await r2.send(new PutObjectCommand({
        Bucket: R2_BUCKET,
        Key: key,
        Body: buffer,
        ContentType: contentType,
        CacheControl: 'public, max-age=31536000, immutable',
    }));
    return `${R2_PUBLIC_URL}/${key}`;
}

function generateKey(folder: string, originalUrl: string): string {
    // Extract original filename or generate new one
    const ext = 'webp'; // Everything gets compressed to WebP
    return `${folder}/${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`;
}

async function migrateUrl(url: string, folder: string): Promise<string | null> {
    if (!isSupabaseUrl(url)) return null;

    const result = await downloadAndCompress(url);
    if (!result) return null;

    const key = generateKey(folder, url);
    return await uploadToR2(result.buffer, key, result.contentType);
}

// ─── Migrate Products ─────────────────────────────────────────

async function migrateProducts() {
    console.log('\n📦 Migrating products...\n');

    const { data: products, error } = await supabase
        .from('products')
        .select('id, name, main_image, images');

    if (error) {
        console.error('❌ Failed to fetch products:', error.message);
        return;
    }

    console.log(`Found ${products.length} products\n`);
    let migrated = 0;
    let skipped = 0;
    let failed = 0;

    for (const product of products) {
        const updates: Record<string, unknown> = {};
        let changed = false;

        // Migrate main_image
        if (isSupabaseUrl(product.main_image)) {
            process.stdout.write(`  🔄 [${product.name}] main_image... `);
            const newUrl = await migrateUrl(product.main_image, 'products');
            if (newUrl) {
                updates.main_image = newUrl;
                changed = true;
                console.log('✅');
            } else {
                console.log('❌');
                failed++;
            }
        }

        // Migrate images array
        if (Array.isArray(product.images) && product.images.length > 0) {
            const newImages: string[] = [];
            let arrayChanged = false;

            for (let i = 0; i < product.images.length; i++) {
                const imgUrl = product.images[i];
                if (isSupabaseUrl(imgUrl)) {
                    process.stdout.write(`  🔄 [${product.name}] images[${i}]... `);
                    const newUrl = await migrateUrl(imgUrl, 'products');
                    if (newUrl) {
                        newImages.push(newUrl);
                        arrayChanged = true;
                        console.log('✅');
                    } else {
                        newImages.push(imgUrl); // Keep original on failure
                        console.log('❌ (kept original)');
                        failed++;
                    }
                } else {
                    newImages.push(imgUrl);
                }
            }

            if (arrayChanged) {
                updates.images = newImages;
                changed = true;
            }
        }

        // Update DB if anything changed
        if (changed) {
            const { error: updateError } = await supabase
                .from('products')
                .update(updates)
                .eq('id', product.id);

            if (updateError) {
                console.error(`  ❌ Failed to update product ${product.name}:`, updateError.message);
                failed++;
            } else {
                migrated++;
            }
        } else {
            skipped++;
        }
    }

    console.log(`\n📦 Products done: ${migrated} migrated, ${skipped} skipped, ${failed} failed\n`);
}

// ─── Migrate Categories ───────────────────────────────────────

async function migrateCategories() {
    console.log('\n📂 Migrating categories...\n');

    const { data: categories, error } = await supabase
        .from('categories')
        .select('id, name, image_url');

    if (error) {
        console.error('❌ Failed to fetch categories:', error.message);
        return;
    }

    console.log(`Found ${categories.length} categories\n`);
    let migrated = 0;
    let skipped = 0;
    let failed = 0;

    for (const category of categories) {
        if (!isSupabaseUrl(category.image_url)) {
            skipped++;
            continue;
        }

        process.stdout.write(`  🔄 [${category.name}] image_url... `);
        const newUrl = await migrateUrl(category.image_url, 'categories');

        if (newUrl) {
            const { error: updateError } = await supabase
                .from('categories')
                .update({ image_url: newUrl })
                .eq('id', category.id);

            if (updateError) {
                console.error('❌', updateError.message);
                failed++;
            } else {
                console.log('✅');
                migrated++;
            }
        } else {
            console.log('❌');
            failed++;
        }
    }

    console.log(`\n📂 Categories done: ${migrated} migrated, ${skipped} skipped, ${failed} failed\n`);
}

// ─── Main ─────────────────────────────────────────────────────

async function main() {
    console.log('═══════════════════════════════════════════');
    console.log('  Giaro Image Migration: Supabase → R2');
    console.log('═══════════════════════════════════════════');
    console.log(`  R2 Bucket:  ${R2_BUCKET}`);
    console.log(`  R2 URL:     ${R2_PUBLIC_URL}`);
    console.log(`  Supabase:   ${SUPABASE_URL}`);
    console.log('═══════════════════════════════════════════');

    await migrateProducts();
    await migrateCategories();

    console.log('\n✅ Migration complete!\n');
    console.log('Next steps:');
    console.log('  1. Verify images load correctly on giaromart.com');
    console.log('  2. Deploy to Netlify with the R2 env vars');
    console.log('  3. After confirming, you can delete old Supabase Storage files');
}

main().catch(err => {
    console.error('💥 Migration failed:', err);
    process.exit(1);
});
