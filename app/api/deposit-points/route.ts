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
            // Case-insensitive region matching (handles DAKAR vs Dakar)
            whereClause.region = {
                contains: region.replace('_', ' '),
                mode: 'insensitive'
            };
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
            isOpen: isPointOpen(point.hours),
            serviceLabel: getServiceLabel(point.type),
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

function isPointOpen(hours?: string | null): boolean | null {
    if (!hours) return null;

    const match = hours.match(/(\d{2}):(\d{2})-(\d{2}):(\d{2})\s+(.+)/);
    if (!match) return null;

    const [, openHour, openMinute, closeHour, closeMinute, days] = match;
    const now = new Date();
    const day = now.getDay(); // 0 Sunday, 1 Monday...

    const isWeekday = day >= 1 && day <= 5;
    const isSaturday = day === 6;
    const dayAllowed = days.includes('Lun-Sam') ? (isWeekday || isSaturday) : isWeekday;

    if (!dayAllowed) return false;

    const minutes = now.getHours() * 60 + now.getMinutes();
    const open = parseInt(openHour) * 60 + parseInt(openMinute);
    const close = parseInt(closeHour) * 60 + parseInt(closeMinute);

    return minutes >= open && minutes <= close;
}

function getServiceLabel(type: string): string {
    const labels: Record<string, string> = {
        ADMIN: 'Dépôt sécurisé',
        CITY_HALL: 'Dépôt et retrait',
        POLICE: 'Dépôt et retrait prioritaire',
        PARTNER: 'Point partenaire',
        OPERATOR_SHOP: 'Point partenaire',
    };

    return labels[type] || 'Point SenDocu';
}
