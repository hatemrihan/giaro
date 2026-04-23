import { NextRequest, NextResponse } from 'next/server';
import { createReturn, getAllReturns } from '@/models/return';

// POST - Create new return request (public)
export async function POST(request: NextRequest) {
    try {
        const data = await request.json();
        const { email, orderNumber } = data;

        if (!email || !orderNumber) {
            return NextResponse.json(
                { success: false, error: 'يرجى إدخال البريد الإلكتروني ورقم الطلب.' },
                { status: 400 },
            );
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return NextResponse.json(
                { success: false, error: 'يرجى إدخال بريد إلكتروني صحيح.' },
                { status: 400 },
            );
        }

        const returnRequest = await createReturn({ email, orderNumber });

        return NextResponse.json({
            success: true,
            message: 'Return request submitted successfully',
            data: {
                id: returnRequest.id,
                email: returnRequest.email,
                order_number: returnRequest.order_number,
                status: returnRequest.status,
                createdAt: returnRequest.created_at,
            },
        }, { status: 201 });
    } catch (error) {
        console.error('Error submitting return request:', error);
        return NextResponse.json(
            { success: false, error: 'فشل في إرسال طلب الإرجاع. يرجى المحاولة مرة أخرى.' },
            { status: 500 },
        );
    }
}

// GET - Fetch all returns (admin)
export async function GET() {
    try {
        const returns = await getAllReturns();

        return NextResponse.json({
            success: true,
            data: returns.map(r => ({
                id: r.id,
                email: r.email,
                order_number: r.order_number,
                status: r.status,
                createdAt: r.created_at,
                updatedAt: r.updated_at,
            })),
        });
    } catch (error) {
        console.error('Error fetching returns:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch return requests.' },
            { status: 500 },
        );
    }
}
