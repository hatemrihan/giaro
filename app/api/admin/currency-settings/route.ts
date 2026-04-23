import { NextRequest, NextResponse } from 'next/server';
import { getCurrencySettings, updateDefaultCurrency } from '@/models/currencySettings';
import type { DefaultCurrency } from '@/lib/database.types';

// GET - Fetch currency settings
export async function GET() {
    try {
        const settings = await getCurrencySettings();

        return NextResponse.json({
            success: true,
            settings: {
                defaultCurrency: settings.default_currency,
                updatedAt: settings.updated_at,
            }
        });

    } catch (error) {
        console.error('Error fetching currency settings:', error);
        return NextResponse.json({
            success: false,
            error: 'Failed to fetch currency settings'
        }, { status: 500 });
    }
}

// PUT - Update currency settings
export async function PUT(request: NextRequest) {
    try {
        const { defaultCurrency } = await request.json();

        // Validate input (matching Database.types DefaultCurrency)
        if (!['EGP', 'SAR', 'AED'].includes(defaultCurrency)) {
            return NextResponse.json({
                success: false,
                error: 'Invalid currency. Must be one of: EGP, SAR, AED'
            }, { status: 400 });
        }

        // Update settings
        const settings = await updateDefaultCurrency(defaultCurrency as DefaultCurrency);

        return NextResponse.json({
            success: true,
            settings: {
                defaultCurrency: settings.default_currency,
                updatedAt: settings.updated_at,
            }
        });

    } catch (error) {
        console.error('Error updating currency settings:', error);
        return NextResponse.json({
            success: false,
            error: 'Failed to update currency settings'
        }, { status: 500 });
    }
}
