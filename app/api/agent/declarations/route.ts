import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';
import { verifySession, hasRole } from '@/lib/auth/session';
import { DeclarationStatus, MatchStatus, ReportStatus } from '@prisma/client';
import { findMatchesForDeclaration } from '@/lib/matching/engine';

// GET /api/agent/declarations - Get declarations for agent's deposit point
export async function GET(request: NextRequest) {
    try {
        const session = await verifySession(request);

        if (!session || !hasRole(session, ['AGENT', 'MODERATOR', 'ADMIN', 'SUPER_ADMIN'])) {
            return NextResponse.json(
                { success: false, message: 'Accès non autorisé' },
                { status: 403 }
            );
        }

        // Get agent's deposit point
        const agent = await prisma.agent.findUnique({
            where: { userId: session.userId },
            include: { depositPoint: true }
        });

        if (!agent) {
            return NextResponse.json(
                { success: false, message: 'Agent non trouvé' },
                { status: 404 }
            );
        }

        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status') as DeclarationStatus | null;

        const where: Record<string, unknown> = {
            depositPointId: agent.depositPointId,
        };

        if (status) {
            where.status = status;
        }

        const declarations = await prisma.declaration.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            take: 50
        });

        return NextResponse.json({
            success: true,
            declarations: declarations.map(d => ({
                id: d.id,
                docType: d.docType,
                status: d.status,
                trackingCode: d.trackingCode,
                createdAt: d.createdAt.toISOString(),
                regionFound: d.regionFound
            })),
            depositPoint: {
                id: agent.depositPoint.id,
                name: agent.depositPoint.name
            }
        });
    } catch (error) {
        console.error('Error fetching agent declarations:', error);
        return NextResponse.json(
            { success: false, message: 'Erreur serveur' },
            { status: 500 }
        );
    }
}

// PATCH /api/agent/declarations - Update declaration status
export async function PATCH(request: NextRequest) {
    try {
        const session = await verifySession(request);

        if (!session || !hasRole(session, ['AGENT', 'MODERATOR', 'ADMIN', 'SUPER_ADMIN'])) {
            return NextResponse.json(
                { success: false, message: 'Accès non autorisé' },
                { status: 403 }
            );
        }

        const body = await request.json();
        const { declarationId, action } = body;

        if (!declarationId || !action) {
            return NextResponse.json(
                { success: false, message: 'Paramètres manquants' },
                { status: 400 }
            );
        }

        const declaration = await prisma.declaration.findUnique({
            where: { id: declarationId }
        });

        if (!declaration) {
            return NextResponse.json(
                { success: false, message: 'Déclaration non trouvée' },
                { status: 404 }
            );
        }

        let newStatus: DeclarationStatus;

        switch (action) {
            case 'approve':
                newStatus = DeclarationStatus.DEPOSITED;
                break;
            case 'reject':
                newStatus = DeclarationStatus.REJECTED;
                break;
            case 'pickup':
                newStatus = DeclarationStatus.PICKED_UP;
                // Also update the match and report
                const match = await prisma.match.findFirst({
                    where: { declarationId, status: MatchStatus.PENDING }
                });
                if (match) {
                    await prisma.match.update({
                        where: { id: match.id },
                        data: { status: MatchStatus.CONFIRMED, resolvedAt: new Date() }
                    });
                    await prisma.ownerReport.update({
                        where: { id: match.reportId },
                        data: { status: ReportStatus.RECOVERED }
                    });
                    // Increment agent's completed pickups
                    await prisma.agent.updateMany({
                        where: { userId: session.userId },
                        data: { completedPickups: { increment: 1 } }
                    });
                }
                break;
            default:
                return NextResponse.json(
                    { success: false, message: 'Action invalide' },
                    { status: 400 }
                );
        }

        await prisma.declaration.update({
            where: { id: declarationId },
            data: { status: newStatus }
        });

        // If approved/deposited, trigger matching
        if (action === 'approve') {
            findMatchesForDeclaration(declarationId).catch(console.error);
        }

        return NextResponse.json({
            success: true,
            message: 'Statut mis à jour',
            status: newStatus
        });
    } catch (error) {
        console.error('Error updating declaration:', error);
        return NextResponse.json(
            { success: false, message: 'Erreur serveur' },
            { status: 500 }
        );
    }
}
