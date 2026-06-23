import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { isR2Configured, uploadToR2, generateR2Key } from '@/lib/r2';
import sharp from 'sharp';

const BUCKET = 'instapay-screenshots';
const MAX_IMAGE_WIDTH = 1200;
const WEBP_QUALITY = 80;

/**
 * POST /api/upload/screenshot
 * Upload an InstaPay transfer screenshot.
 * Images are compressed to WebP. Uses R2 when configured.
 */
export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get('file') as File | null;

        if (!file) {
            return NextResponse.json(
                { success: false, error: 'لم يتم إرفاق ملف' },
                { status: 400 },
            );
        }

        if (!file.type.startsWith('image/')) {
            return NextResponse.json(
                { success: false, error: 'يرجى رفع صورة فقط' },
                { status: 400 },
            );
        }

        if (file.size > 5 * 1024 * 1024) {
            return NextResponse.json(
                { success: false, error: 'حجم الملف يجب أن يكون أقل من 5 ميجابايت' },
                { status: 400 },
            );
        }

        // ✅ Compress to WebP
        const rawBuffer = Buffer.from(await file.arrayBuffer());
        const compressedBuffer = await sharp(rawBuffer)
            .resize({ width: MAX_IMAGE_WIDTH, withoutEnlargement: true })
            .webp({ quality: WEBP_QUALITY })
            .toBuffer();

        let publicUrl: string;
        let filename: string;

        if (isR2Configured) {
            // ✅ R2: zero egress cost
            const key = generateR2Key('screenshots', 'webp');
            publicUrl = await uploadToR2(compressedBuffer, key, 'image/webp');
            filename = key;
        } else {
            // Fallback: Supabase Storage
            filename = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.webp`;
            const { error: uploadError } = await supabaseAdmin.storage
                .from(BUCKET)
                .upload(filename, compressedBuffer, {
                    contentType: 'image/webp',
                    upsert: false,
                });

            if (uploadError) {
                console.error('[Upload Error]', uploadError);
                return NextResponse.json(
                    { success: false, error: 'فشل في رفع الصورة' },
                    { status: 500 },
                );
            }

            const { data: publicUrlData } = supabaseAdmin.storage
                .from(BUCKET)
                .getPublicUrl(filename);
            publicUrl = publicUrlData.publicUrl;
        }

        return NextResponse.json({
            success: true,
            url: publicUrl,
            filename,
        });
    } catch (error) {
        console.error('[POST /api/upload/screenshot]', error);
        return NextResponse.json(
            { success: false, error: 'حدث خطأ أثناء رفع الصورة' },
            { status: 500 },
        );
    }
}


