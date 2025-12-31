import prisma from '@/lib/db/prisma';
import { DeclarationStatus, ReportStatus, MatchStatus } from '@prisma/client';
import { sendMatchNotification } from '@/lib/push/notifications';

interface MatchResult {
    declarationId: string;
    reportId: string;
    confidence: number;
}

/**
 * Find matching declarations for a new owner report
 * Uses hash comparison for privacy-preserving matching
 */
export async function findMatchesForReport(reportId: string): Promise<MatchResult[]> {
    const report = await prisma.ownerReport.findUnique({
        where: { id: reportId },
    });

    if (!report) {
        throw new Error('Report not found');
    }

    // Find declarations with matching partial hashes
    const candidates = await prisma.declaration.findMany({
        where: {
            docType: report.docType,
            partialNumberHash: report.partialNumberHash,
            namePrefixHash: report.namePrefixHash,
            status: {
                in: [DeclarationStatus.APPROVED, DeclarationStatus.DEPOSITED],
            },
        },
    });

    const matches: MatchResult[] = [];

    for (const declaration of candidates) {
        // Hash comparison is already done in the query
        // Both partial hashes match = high confidence match
        const match: MatchResult = {
            declarationId: declaration.id,
            reportId: report.id,
            confidence: 1.0, // Exact hash match
        };

        // Create or update match record
        await prisma.match.upsert({
            where: {
                declarationId_reportId: {
                    declarationId: declaration.id,
                    reportId: report.id,
                },
            },
            create: {
                declarationId: declaration.id,
                reportId: report.id,
                confidenceScore: match.confidence,
                status: MatchStatus.PENDING,
            },
            update: {
                confidenceScore: match.confidence,
            },
        });

        // Update statuses
        await prisma.declaration.update({
            where: { id: declaration.id },
            data: { status: DeclarationStatus.MATCHED },
        });

        await prisma.ownerReport.update({
            where: { id: report.id },
            data: { status: ReportStatus.MATCHED },
        });

        // Send push notification to the owner
        sendMatchNotification(report.userId, declaration.docType).catch(console.error);

        matches.push(match);
    }

    return matches;
}

/**
 * Find matching reports for a new declaration
 * Called when a finder submits a new declaration
 */
export async function findMatchesForDeclaration(declarationId: string): Promise<MatchResult[]> {
    const declaration = await prisma.declaration.findUnique({
        where: { id: declarationId },
    });

    if (!declaration) {
        throw new Error('Declaration not found');
    }

    // Only process approved declarations
    if (declaration.status !== DeclarationStatus.APPROVED &&
        declaration.status !== DeclarationStatus.DEPOSITED) {
        return [];
    }

    // Find reports with matching partial hashes
    const candidates = await prisma.ownerReport.findMany({
        where: {
            docType: declaration.docType,
            partialNumberHash: declaration.partialNumberHash,
            namePrefixHash: declaration.namePrefixHash,
            status: ReportStatus.SEARCHING,
        },
    });

    const matches: MatchResult[] = [];

    for (const report of candidates) {
        const match: MatchResult = {
            declarationId: declaration.id,
            reportId: report.id,
            confidence: 1.0,
        };

        await prisma.match.upsert({
            where: {
                declarationId_reportId: {
                    declarationId: declaration.id,
                    reportId: report.id,
                },
            },
            create: {
                declarationId: declaration.id,
                reportId: report.id,
                confidenceScore: match.confidence,
                status: MatchStatus.PENDING,
            },
            update: {
                confidenceScore: match.confidence,
            },
        });

        // Update report status
        await prisma.ownerReport.update({
            where: { id: report.id },
            data: { status: ReportStatus.MATCHED },
        });

        // Update declaration status
        await prisma.declaration.update({
            where: { id: declaration.id },
            data: { status: DeclarationStatus.MATCHED },
        });

        // Send push notification to the owner
        sendMatchNotification(report.userId, declaration.docType).catch(console.error);

        matches.push(match);
    }

    return matches;
}

/**
 * Confirm a match (when owner picks up document)
 */
export async function confirmMatch(matchId: string): Promise<void> {
    const match = await prisma.match.findUnique({
        where: { id: matchId },
        include: {
            declaration: true,
            report: true,
        },
    });

    if (!match) {
        throw new Error('Match not found');
    }

    await prisma.$transaction([
        prisma.match.update({
            where: { id: matchId },
            data: {
                status: MatchStatus.CONFIRMED,
                resolvedAt: new Date(),
            },
        }),
        prisma.declaration.update({
            where: { id: match.declarationId },
            data: { status: DeclarationStatus.CLOSED },
        }),
        prisma.ownerReport.update({
            where: { id: match.reportId },
            data: { status: ReportStatus.RECOVERED },
        }),
    ]);
}
