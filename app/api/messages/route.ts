import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';
import { verifySession } from '@/lib/auth/session';

export async function GET(request: NextRequest) {
    try {
        const session = await verifySession(request);

        if (!session) {
            return NextResponse.json(
                { success: false, message: 'Non authentifié', messages: [] },
                { status: 401 }
            );
        }

        const reports = await prisma.ownerReport.findMany({
            where: { userId: session.userId },
            orderBy: { createdAt: 'desc' },
            include: {
                matches: {
                    orderBy: { matchedAt: 'desc' },
                    include: {
                        declaration: {
                            include: {
                                depositPoint: true,
                            },
                        },
                    },
                },
            },
            take: 20,
        });

        const messages = reports.flatMap((report) => {
            const base = [{
                id: `report-${report.id}`,
                type: 'REPORT_CREATED',
                title: 'Recherche active',
                body: `Votre recherche ${report.docType} est enregistrée et surveillée par SenDocu.`,
                createdAt: report.createdAt.toISOString(),
                href: '/owner',
            }];

            const matchMessages = report.matches.map((match) => ({
                id: `match-${match.id}`,
                type: 'MATCH_DETECTED',
                title: 'Correspondance détectée',
                body: match.declaration.depositPoint
                    ? `Un document similaire est lié à ${match.declaration.depositPoint.name}.`
                    : 'Un document similaire a été signalé.',
                createdAt: match.matchedAt.toISOString(),
                href: `/owner/match/${match.id}`,
            }));

            return [...matchMessages, ...base];
        }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        return NextResponse.json({ success: true, messages });
    } catch (error) {
        console.error('Messages API error:', error);
        return NextResponse.json(
            { success: false, message: 'Erreur serveur', messages: [] },
            { status: 500 }
        );
    }
}
