import { NextResponse } from 'next/server';

export async function GET() {
    const config = {
        hasApiKey: !!process.env.RESEND_API_KEY,
        hasFromEmail: !!process.env.RESEND_FROM_EMAIL,
    };

    return NextResponse.json({
        success: true,
        config,
        provider: 'Resend',
    });
}
