import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/route';
import {
    getAllOffersAdmin,
    createOffer,
    updateOffer,
    deleteOffer,
    reorderOffers,
} from '@/models/offer';

export async function GET() {
    try {
        const offers = await getAllOffersAdmin();
        return NextResponse.json(offers);
    } catch (error) {
        console.error('❌ Admin offers fetch error:', error);
        return NextResponse.json({ error: 'Failed to fetch offers' }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.isAdmin) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const offer = await createOffer({
            title: body.title || '',
            description: body.description || '',
            image: body.image || '',
            link: body.link || '/shop',
            is_active: body.is_active ?? true,
            show_on_home: body.show_on_home ?? false,
            show_pages: body.show_pages ?? ['offers'],
            display_order: body.display_order ?? 0,
        });
        revalidatePath('/');
        revalidatePath('/shop');
        revalidatePath('/api/offers');
        return NextResponse.json(offer, { status: 201 });
    } catch (error) {
        console.error('❌ Admin offer create error:', error);
        return NextResponse.json({ error: 'Failed to create offer' }, { status: 500 });
    }
}

export async function PATCH(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.isAdmin) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();

        if (body.reorder && Array.isArray(body.reorder)) {
            await reorderOffers(body.reorder);
            return NextResponse.json({ success: true });
        }

        if (!body.id) {
            return NextResponse.json({ error: 'Missing offer id' }, { status: 400 });
        }

        const { id, ...fields } = body;
        const updated = await updateOffer(id, fields);
        if (!updated) {
            return NextResponse.json({ error: 'Offer not found' }, { status: 404 });
        }
        revalidatePath('/');
        revalidatePath('/shop');
        revalidatePath('/api/offers');
        return NextResponse.json(updated);
    } catch (error) {
        console.error('❌ Admin offer update error:', error);
        return NextResponse.json({ error: 'Failed to update offer' }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.isAdmin) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        if (!body.id) {
            return NextResponse.json({ error: 'Missing offer id' }, { status: 400 });
        }
        await deleteOffer(body.id);
        revalidatePath('/');
        revalidatePath('/shop');
        revalidatePath('/api/offers');
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('❌ Admin offer delete error:', error);
        return NextResponse.json({ error: 'Failed to delete offer' }, { status: 500 });
    }
}
