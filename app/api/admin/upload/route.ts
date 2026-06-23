import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/route';
import { isR2Configured, uploadToR2, generateR2Key } from '@/lib/r2';
import sharp from 'sharp';

/** Max dimension for uploaded images (px) */
const MAX_IMAGE_WIDTH = 1200;
/** WebP quality (0-100) */
const WEBP_QUALITY = 80;

export async function POST(req: NextRequest) {
    try {
        // Authenticate admin securely
        const session = await getServerSession(authOptions);
        if (!session?.user?.isAdmin) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const formData = await req.formData();
        const file = formData.get('file') as File | null;
        const bucket = (formData.get('bucket') as string) || 'products';

        if (!file) {
            return NextResponse.json({ success: false, error: 'No file provided' }, { status: 400 });
        }

        // Validate basic file info 
        if (file.size > 50 * 1024 * 1024) { // 50MB limit for raw uploads
            return NextResponse.json({ success: false, error: 'File size must be less than 50MB' }, { status: 400 });
        }

        // Make sure it's a media file
        if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
            return NextResponse.json({ success: false, error: 'File must be an image or video' }, { status: 400 });
        }

        const rawBuffer = Buffer.from(await file.arrayBuffer());
        let finalBuffer: Buffer;
        let contentType: string;
        let ext: string;

        if (file.type.startsWith('image/')) {
            // ✅ Compress & resize images to WebP before upload
            finalBuffer = await sharp(rawBuffer)
                .resize({ width: MAX_IMAGE_WIDTH, withoutEnlargement: true })
                .webp({ quality: WEBP_QUALITY })
                .toBuffer();
            contentType = 'image/webp';
            ext = 'webp';
        } else {
            // Videos pass through unchanged
            finalBuffer = rawBuffer;
            contentType = file.type;
            ext = file.name.split('.').pop() || 'mp4';
        }

        // ── Upload to R2 (preferred) or Supabase Storage (fallback) ──
        let publicUrl: string;

        if (isR2Configured) {
            // ✅ R2: zero egress cost, served via Cloudflare CDN
            const key = generateR2Key(bucket, ext);
            publicUrl = await uploadToR2(finalBuffer, key, contentType);
        } else {
            // Fallback: Supabase Storage (counts against egress quota)
            const filename = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`;
            const { error: uploadError } = await supabaseAdmin.storage
                .from(bucket)
                .upload(filename, finalBuffer, { contentType, upsert: false });

            if (uploadError) {
                console.error('[Upload Error]', uploadError);
                return NextResponse.json({ success: false, error: 'Failed to upload media to storage', details: uploadError.message }, { status: 500 });
            }

            const { data } = supabaseAdmin.storage.from(bucket).getPublicUrl(filename);
            publicUrl = data.publicUrl;
        }

        return NextResponse.json({ success: true, url: publicUrl }, { status: 201 });
    } catch (error) {
        console.error('[POST /api/admin/upload]', error);
        const message = error instanceof Error ? error.message : 'Upload failed';
        return NextResponse.json(
            { success: false, error: message },
            { status: 500 },
        );
    }
}


