import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';

// Get deposit points (with optional filtering)
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const region = searchParams.get('region');
        const lat = searchParams.get('lat');
        const lng = searchParams.get('lng');
        const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50);

        // Build query
        const whereClause: Record<string, unknown> = {
            isActive: true
        };

        if (region) {
            whereClause.region = region;
        }

        let depositPoints = await prisma.depositPoint.findMany({
            where: whereClause,
            take: limit,
            orderBy: { name: 'asc' }
        });

        // If lat/lng provided, calculate distances and sort
        if (lat && lng) {
            const userLat = parseFloat(lat);
            const userLng = parseFloat(lng);

            if (!isNaN(userLat) && !isNaN(userLng)) {
                depositPoints = depositPoints
                    .map(point => ({
                        ...point,
                        distance: calculateDistance(userLat, userLng, point.latitude, point.longitude)
                    }))
                    .sort((a, b) => (a.distance ?? 0) - (b.distance ?? 0));
            }
        }

        // Format response
        const formattedPoints = depositPoints.map(point => ({
            id: point.id,
            name: point.name,
            type: point.type,
            operator: point.operator,
            address: point.address,
            phone: point.phone,
            hours: point.hours,
            region: point.region,
            latitude: point.latitude,
            longitude: point.longitude,
            // Also include lat/lng for map component
            lat: point.latitude,
            lng: point.longitude,
            distance: 'distance' in point ? Math.round((point.distance as number) * 10) / 10 : undefined,
            isActive: point.isActive
        }));

        return NextResponse.json({
            depositPoints: formattedPoints,
            total: formattedPoints.length
        });

    } catch (error) {
        console.error('Deposit points error:', error);
        return NextResponse.json(
            { success: false, message: 'Erreur serveur' },
            { status: 500 }
        );
    }
}

// Haversine formula to calculate distance between two points (in km)
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth's radius in km
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

function toRad(deg: number): number {
    return deg * (Math.PI / 180);
}
