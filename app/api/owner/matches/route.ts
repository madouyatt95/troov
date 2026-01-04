import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { verifySession } from '@/lib/auth/session';

// GET /api/owner/matches - Get matches for owner
export async function GET(request: NextRequest) {
    try {
        const session = await verifySession(request);

        if (!session) {
            return NextResponse.json(
                { error: 'Non authentifié' },
                { status: 401 }
            );
        }

        // Get all matches for the user's reports
        const matches = await prisma.match.findMany({
            where: {
                report: { userId: session.userId },
            },
            include: {
                declaration: {
                    include: {
                        depositPoint: true,
                    },
                },
                report: true,
            },
            orderBy: { matchedAt: 'desc' },
        });

        const formattedMatches = matches.map(match => ({
            id: match.id,
            status: match.status,
            matchedAt: match.matchedAt.toISOString(),
            resolvedAt: match.resolvedAt?.toISOString() || null,
            confidenceScore: match.confidenceScore,
            docType: match.declaration.docType,
            depositPoint: match.declaration.depositPoint ? {
                id: match.declaration.depositPoint.id,
                name: match.declaration.depositPoint.name,
                address: match.declaration.depositPoint.address,
                phone: match.declaration.depositPoint.phone,
                hours: match.declaration.depositPoint.hours,
                latitude: match.declaration.depositPoint.latitude,
                longitude: match.declaration.depositPoint.longitude,
                region: match.declaration.depositPoint.region,
            } : null,
        }));

        return NextResponse.json({
            matches: formattedMatches,
            total: formattedMatches.length,
        });
    } catch (error) {
        console.error('Get matches error:', error);
        return NextResponse.json(
            { error: 'Erreur serveur' },
            { status: 500 }
        );
    }
}
