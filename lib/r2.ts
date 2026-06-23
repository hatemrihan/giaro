import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';

// ─── Configuration ────────────────────────────────────────────
// Set these in your .env.local:
//   R2_ACCOUNT_ID=your_cloudflare_account_id
//   R2_ACCESS_KEY_ID=your_r2_access_key
//   R2_SECRET_ACCESS_KEY=your_r2_secret_key
//   R2_BUCKET_NAME=giaro-cdn
//   R2_PUBLIC_URL=https://cdn.giaromart.com  (your custom domain or R2.dev URL)

const ACCOUNT_ID = process.env.R2_ACCOUNT_ID!;
const BUCKET = process.env.R2_BUCKET_NAME || 'giaro-cdn';

/** Public base URL for serving files (custom domain or R2.dev) */
export const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL || `https://${BUCKET}.r2.dev`;

/** Whether R2 is configured — falls back to Supabase Storage if not */
export const isR2Configured = !!(
    process.env.R2_ACCOUNT_ID &&
    process.env.R2_ACCESS_KEY_ID &&
    process.env.R2_SECRET_ACCESS_KEY
);

// ─── S3 Client (R2-compatible) ────────────────────────────────

const r2Client = isR2Configured
    ? new S3Client({
          region: 'auto',
          endpoint: `https://${ACCOUNT_ID}.r2.cloudflarestorage.com`,
          credentials: {
              accessKeyId: process.env.R2_ACCESS_KEY_ID!,
              secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
          },
      })
    : null;

// ─── Upload ───────────────────────────────────────────────────

/**
 * Upload a file to Cloudflare R2.
 * Returns the public URL of the uploaded file.
 *
 * @param buffer  - File contents
 * @param key     - Object key (e.g. "products/1717234567-abc123.webp")
 * @param contentType - MIME type
 */
export async function uploadToR2(
    buffer: Buffer,
    key: string,
    contentType: string
): Promise<string> {
    if (!r2Client) {
        throw new Error('R2 is not configured. Set R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY in .env.local');
    }

    await r2Client.send(
        new PutObjectCommand({
            Bucket: BUCKET,
            Key: key,
            Body: buffer,
            ContentType: contentType,
            CacheControl: 'public, max-age=31536000, immutable', // 1 year — files are content-addressed
        })
    );

    return `${R2_PUBLIC_URL}/${key}`;
}

// ─── Delete ───────────────────────────────────────────────────

/**
 * Delete a file from R2 by key.
 * Best-effort — does not throw on failure.
 */
export async function deleteFromR2(key: string): Promise<void> {
    if (!r2Client) return;

    try {
        await r2Client.send(
            new DeleteObjectCommand({
                Bucket: BUCKET,
                Key: key,
            })
        );
    } catch (err) {
        console.error(`[R2] Failed to delete ${key}:`, err);
    }
}

/**
 * Generate a unique object key for a file.
 * Prefixed by folder (e.g. "products/", "categories/", "screenshots/")
 */
export function generateR2Key(folder: string, ext: string): string {
    return `${folder}/${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`;
}
