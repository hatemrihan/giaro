import { NextRequest, NextResponse } from 'next/server';
import { getActiveDropPoints, getNearbyDropPoints } from '@/models/dropPoint';

/**
 * GET /api/drop-points
 * Public endpoint — returns active drop points.
 * Optional query params: lat, lng (for sorting by distance).
 */
export async function GET(req: NextRequest) {
    try {
        const { searchParams } = req.nextUrl;
        const lat = searchParams.get('lat');
        const lng = searchParams.get('lng');

        let points;
        if (lat && lng) {
            points = await getNearbyDropPoints(
                parseFloat(lat),
                parseFloat(lng),
                15,
            );
        } else {
            points = await getActiveDropPoints();
        }

        const response = NextResponse.json({ success: true, points });
        response.headers.set('Cache-Control', 'public, s-maxage=120, stale-while-revalidate=300');
        return response;
    } catch (error) {
        console.error('[GET /api/drop-points]', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch drop points' },
            { status: 500 },
        );
    }
}
