import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { restoreStock } from '@/models/product';
import { createOrder, getOrders, updateOrderStatus } from '@/models/order';
import { sendOrderConfirmationEmail } from '@/lib/email/email';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/route';

// ─── Types ────────────────────────────────────────────────────

type CheckoutPayload = {
    customer: {
        firstName: string;
        lastName: string;
        address: string;
        moreInfo?: string;
        governorate: string;
        city: string;
        phone: string;
        email: string;
    };
    deliveryMethod: string;
    paymentMethod: 'instaPay' | 'cashOnDelivery';
    transactionScreenshot?: string;
    promoCode?: string;
    discountAmount?: number;
    items: {
        productId: string;
        name: string;
        price: number;
        quantity: number;
        size?: string;
        color?: string;
        attributes?: Record<string, string>;
        image: string;
    }[];
    subtotal: number;
    shippingCost: number;
    codFee: number;
    totalAmount: number;
    lat?: number;
    lng?: number;
};

// ─── POST — Create a new order ────────────────────────────────

export async function POST(req: NextRequest) {
    try {
        const body = (await req.json()) as CheckoutPayload;

        // ── Validate required fields ────────────────────────
        if (!body.customer?.firstName || !body.customer?.phone || !body.customer?.address) {
            return NextResponse.json(
                { success: false, error: 'بيانات العميل غير مكتملة' },
                { status: 400 },
            );
        }

        if (!body.items || body.items.length === 0) {
            return NextResponse.json(
                { success: false, error: 'السلة فارغة' },
                { status: 400 },
            );
        }

        // ── Atomic stock deduction with rollback ────────────
        // Each deduct_stock call uses FOR UPDATE row lock.
        // If ANY item fails, we restore all previously deducted items.
        const deductedItems: { productId: string; quantity: number; variantName?: string; variantAttrs?: Record<string, string> }[] = [];

        // Helper to perform rollback of deducted items using Promise.allSettled
        const performRollback = async () => {
            const results = await Promise.allSettled(
                deductedItems.map(d => restoreStock(d.productId, d.quantity, d.variantName, d.variantAttrs))
            );
            results.forEach((r, i) => {
                if (r.status === 'rejected') {
                    console.error(`[POST /api/orders] Stock restore failed for item ${i} (${deductedItems[i].productId}):`, r.reason);
                }
            });
        };

        for (const item of body.items) {
            try {
                const { error } = await supabaseAdmin.rpc('deduct_stock', {
                    p_product_id: item.productId,
                    p_quantity: item.quantity,
                    p_variant_name: item.color ?? null,
                });

                if (error) {
                    // Stock deduction failed — rollback all previously deducted items
                    await performRollback();

                    // Parse the Postgres error for a user-friendly message
                    const msg = error.message.includes('Insufficient stock')
                        ? `"${item.name}" — الكمية المطلوبة غير متوفرة في المخزون`
                        : error.message.includes('not found')
                            ? `المنتج "${item.name}" غير متوفر`
                            : `خطأ في المخزون: ${error.message}`;

                    return NextResponse.json(
                        { success: false, error: msg },
                        { status: 400 },
                    );
                }

                // Track successful deductions for potential rollback
                deductedItems.push({
                    productId: item.productId,
                    quantity: item.quantity,
                    variantName: item.color,
                    variantAttrs: item.attributes,
                });
            } catch (rpcError) {
                // Unexpected error — rollback
                await performRollback();
                throw rpcError;
            }
        }

        // ── Handle promo code ───────────────────────────────
        let promoCode: string | undefined;
        let discountAmount = 0;

        if (body.promoCode) {
            try {
                const { claimPromo } = await import('@/models/promo');
                const result = await claimPromo(body.promoCode, body.subtotal);
                promoCode = body.promoCode;
                discountAmount = result.discountAmount;
            } catch (promoError) {
                // Promo failed — restore all deducted stock
                await performRollback();
                return NextResponse.json(
                    { success: false, error: `كود الخصم غير صالح: ${(promoError as Error).message}` },
                    { status: 400 },
                );
            }
        }

        // ── Recalculate total (server-side) ─────────────────
        const subtotal = body.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
        const shippingCost = body.shippingCost || 0;
        const codFee = body.paymentMethod === 'cashOnDelivery' ? (body.codFee || 0) : 0;
        const total = subtotal + shippingCost + codFee - discountAmount;

        // ── Build notes ─────────────────────────────────────
        const notesParts: string[] = [];
        if (body.customer.moreInfo) notesParts.push(body.customer.moreInfo);
        if (promoCode) notesParts.push(`كود خصم: ${promoCode} (-${discountAmount})`);
        if (body.transactionScreenshot) notesParts.push(`إيصال: ${body.transactionScreenshot}`);

        // ── Build customer address string ────────────────────
        const addressParts = [body.customer.address, body.customer.city, body.customer.governorate].filter(Boolean);
        const addressStr = addressParts.join(', ') + (body.lat && body.lng ? ` [${body.lat},${body.lng}]` : '');
        if (addressStr) notesParts.push(`العنوان: ${addressStr}`);

        // ── Create order ────────────────────────────────────
        let order;
        try {
            order = await createOrder({
                customerName:           `${body.customer.firstName} ${body.customer.lastName}`.trim(),
                customerEmail:          body.customer.email || undefined,
                customerPhone:          body.customer.phone,
                shippingAddress: {
                    address: body.customer.address,
                    city:    body.customer.city,
                    lat:     body.lat,
                    lng:     body.lng,
                },
                governorate:            body.customer.governorate,
                items:                  body.items.map(item => ({
                    productId: item.productId,
                    name:      item.name,
                    price:     item.price,
                    quantity:  item.quantity,
                    size:      item.size,
                    color:     item.color,
                    attributes: item.attributes,
                    image:     item.image,
                })),
                subtotal,
                shippingCost,
                codFee,
                totalAmount:            total,
                paymentMethod:          body.paymentMethod,
                status:                 body.paymentMethod === 'instaPay' ? 'pending_payment' : 'pending',
                paymentStatus:          'pending',
                promoCode:              promoCode,
                discountAmount,
                notes:                  notesParts.join(' | ') || undefined,
                transactionScreenshot:  body.transactionScreenshot,
            });
        } catch (orderError) {
            // Order creation failed — restore all stock
            await performRollback();
            throw orderError;
        }

        // ── Send confirmation email (fire-and-forget — never blocks the order) ──
        if (body.customer.email) {
            sendOrderConfirmationEmail({
                customerEmail: body.customer.email,
                customerName: `${body.customer.firstName} ${body.customer.lastName}`.trim(),
                orderId: order.order_number,
                orderItems: body.items.map((i: { name: string; quantity: number; price: number }) => ({
                    name: i.name,
                    quantity: i.quantity,
                    price: i.price,
                })),
                totalAmount: total,
                shippingCost,
                paymentMethod: body.paymentMethod === 'cashOnDelivery' ? 'Cash on Delivery' : 'InstaPay',
                shippingAddress: {
                    country: body.customer.governorate || 'Egypt',
                    address: body.customer.address || '',
                },
                customerPhone: body.customer.phone,
            }).catch(err => console.error('[Order Email]', err));
        }

        return NextResponse.json({
            success: true,
            order: {
                id:          order.id,
                orderId:     order.order_number,
                totalAmount: order.total,
            },
        });
    } catch (error) {
        console.error('[POST /api/orders]', error);
        return NextResponse.json(
            { success: false, error: 'فشل في إنشاء الطلب. يرجى المحاولة مرة أخرى.' },
            { status: 500 },
        );
    }
}

// ─── GET — Fetch orders (Admin) ────────────────────────────────

export async function GET(req: NextRequest) {
    try {
        // ── Auth Check ──────────────────────────────────────
        const session = await getServerSession(authOptions);
        if (!session?.user?.isAdmin) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const page = parseInt(searchParams.get('page') || '1', 10);
        const limit = parseInt(searchParams.get('limit') || '50', 10);
        const status = searchParams.get('status') || undefined;

        const result = await getOrders({ page, limit, status });
        
        return NextResponse.json({ success: true, ...result });
    } catch (error) {
        console.error('[GET /api/orders]', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch orders' },
            { status: 500 },
        );
    }
}

// ─── PATCH — Update order status (Admin) ───────────────────────

export async function PATCH(req: NextRequest) {
    try {
        // ── Auth Check ──────────────────────────────────────
        const session = await getServerSession(authOptions);
        if (!session?.user?.isAdmin) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        if (!body.id || !body.status) {
            return NextResponse.json(
                { success: false, error: 'Missing id or status' },
                { status: 400 },
            );
        }

        // ── Restore stock on cancellation ───────────────────
        if (body.status === 'cancelled') {
            // Fetch the order to get items
            const { data: order } = await supabaseAdmin
                .from('orders')
                .select('items, status')
                .eq('id', body.id)
                .single();

            // Only restore if the order wasn't already cancelled
            if (order && order.status !== 'cancelled') {
                const items = order.items as {
                    productId: string;
                    quantity: number;
                    color?: string;
                }[];

                // Restore stock for all items in parallel with logging for failures
                const results = await Promise.allSettled(
                    items.map(item => restoreStock(
                        item.productId,
                        item.quantity,
                        item.color,
                    ))
                );

                results.forEach((r, i) => {
                    if (r.status === 'rejected') {
                        console.error(`[PATCH /api/orders] Stock restore failed for item ${i} (${items[i].productId}):`, r.reason);
                    }
                });
            }
        }

        const updatedOrder = await updateOrderStatus(body.id, body.status);
        
        return NextResponse.json({ success: true, order: updatedOrder });
    } catch (error) {
        console.error('[PATCH /api/orders]', error);
        return NextResponse.json(
            { success: false, error: (error as Error).message },
            { status: 500 },
        );
    }
}
