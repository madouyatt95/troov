import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';
import { verifySession, hasRole } from '@/lib/auth/session';
import { DeclarationStatus, MatchStatus, ReportStatus } from '@prisma/client';
import { findMatchesForDeclaration } from '@/lib/matching/engine';
import { hashAuditEntry } from '@/lib/hash';

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
        const tracking = searchParams.get('tracking')?.trim();

        const where: Record<string, unknown> = {
            depositPointId: agent.depositPointId,
        };

        if (status) {
            where.status = status;
        }

        if (tracking) {
            where.trackingCode = {
                contains: tracking.toUpperCase(),
                mode: 'insensitive',
            };
        }

        const declarations = await prisma.declaration.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            take: 50,
            include: {
                matches: {
                    select: {
                        id: true,
                        status: true,
                        confidenceScore: true,
                        matchedAt: true,
                    },
                    orderBy: { matchedAt: 'desc' },
                },
            },
        });

        const statusCounts = await prisma.declaration.groupBy({
            by: ['status'],
            where: { depositPointId: agent.depositPointId },
            _count: { status: true },
        });

        const auditLogs = await prisma.auditLog.findMany({
            where: {
                targetType: 'Declaration',
                targetId: { in: declarations.map((item) => item.id) },
            },
            orderBy: { createdAt: 'desc' },
            take: 12,
        });

        return NextResponse.json({
            success: true,
            declarations: declarations.map(d => ({
                id: d.id,
                docType: d.docType,
                status: d.status,
                trackingCode: d.trackingCode,
                createdAt: d.createdAt.toISOString(),
                regionFound: d.regionFound,
                matchCount: d.matches.length,
                latestMatch: d.matches[0]
                    ? {
                        id: d.matches[0].id,
                        status: d.matches[0].status,
                        confidenceScore: d.matches[0].confidenceScore,
                        matchedAt: d.matches[0].matchedAt.toISOString(),
                    }
                    : null,
            })),
            counts: Object.fromEntries(statusCounts.map((item) => [item.status, item._count.status])),
            activity: auditLogs.map((log) => ({
                id: log.id,
                event: log.event,
                targetId: log.targetId,
                createdAt: log.createdAt.toISOString(),
                metadata: log.metadata,
            })),
            depositPoint: {
                id: agent.depositPoint.id,
                name: agent.depositPoint.name,
                address: agent.depositPoint.address,
                phone: agent.depositPoint.phone,
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

        const agent = await prisma.agent.findUnique({
            where: { userId: session.userId },
            include: { depositPoint: true },
        });

        if (!agent && !hasRole(session, ['ADMIN', 'SUPER_ADMIN'])) {
            return NextResponse.json(
                { success: false, message: 'Agent non trouvé' },
                { status: 404 }
            );
        }

        const declaration = await prisma.declaration.findFirst({
            where: {
                id: declarationId,
                ...(agent && !hasRole(session, ['ADMIN', 'SUPER_ADMIN'])
                    ? { depositPointId: agent.depositPointId }
                    : {}),
            }
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
                newStatus = DeclarationStatus.APPROVED;
                break;
            case 'deposit':
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
                        where: agent ? { id: agent.id } : { userId: session.userId },
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

        const previousAudit = await prisma.auditLog.findFirst({
            orderBy: { createdAt: 'desc' },
            select: { hash: true },
        });
        const auditPayload = {
            event: `AGENT_DECLARATION_${String(action).toUpperCase()}`,
            userId: session.userId,
            targetType: 'Declaration',
            targetId: declarationId,
            metadata: {
                fromStatus: declaration.status,
                toStatus: newStatus,
                trackingCode: declaration.trackingCode,
                depositPointId: agent?.depositPointId || declaration.depositPointId,
            },
        };
        const previousHash = previousAudit?.hash || 'GENESIS';

        await prisma.auditLog.create({
            data: {
                ...auditPayload,
                ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
                deviceFingerprint: request.headers.get('x-device-fingerprint') || null,
                previousHash,
                hash: hashAuditEntry(previousHash, auditPayload),
            },
        });

        // If approved/deposited, trigger matching
        if (action === 'approve' || action === 'deposit') {
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
