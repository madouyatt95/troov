import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

// Stats are cached for 5 minutes
let cachedStats: {
    data: Stats | null;
    timestamp: number;
} = { data: null, timestamp: 0 };

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

interface Stats {
    documentsRecovered: number;
    activeSearches: number;
    pendingDeclarations: number;
    matchRate: number;
    statsByRegion: { region: string; count: number }[];
}

export async function GET() {
    try {
        // Check cache
        const now = Date.now();
        if (cachedStats.data && now - cachedStats.timestamp < CACHE_DURATION) {
            return NextResponse.json(cachedStats.data);
        }

        // Count recovered documents (matched and picked up)
        const documentsRecovered = await prisma.match.count({
            where: {
                status: 'CONFIRMED',
            },
        });

        // Count active owner searches
        const activeSearches = await prisma.ownerReport.count({
            where: {
                status: 'SEARCHING',
            },
        });

        // Count pending declarations (waiting to be processed)
        const pendingDeclarations = await prisma.declaration.count({
            where: {
                status: {
                    in: ['PENDING', 'APPROVED', 'DEPOSITED'],
                },
            },
        });

        // Calculate match rate
        const totalReports = await prisma.ownerReport.count();
        const matchedReports = await prisma.ownerReport.count({
            where: {
                status: {
                    in: ['MATCHED', 'RECOVERED'],
                },
            },
        });
        const matchRate = totalReports > 0 ? Math.round((matchedReports / totalReports) * 100) : 0;

        // Stats by region
        const regionStats = await prisma.declaration.groupBy({
            by: ['regionFound'],
            _count: {
                id: true,
            },
            where: {
                status: 'MATCHED',
            },
            orderBy: {
                _count: {
                    id: 'desc',
                },
            },
            take: 5,
        });

        const statsByRegion = regionStats.map((r) => ({
            region: r.regionFound,
            count: r._count.id,
        }));

        const stats: Stats = {
            documentsRecovered,
            activeSearches,
            pendingDeclarations,
            matchRate,
            statsByRegion,
        };

        // Update cache
        cachedStats = { data: stats, timestamp: now };

        return NextResponse.json(stats);
    } catch (error) {
        console.error('Stats API error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch stats' },
            { status: 500 }
        );
    }
}
