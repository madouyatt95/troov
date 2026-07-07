import prisma from '@/lib/db/prisma';
import { DeclarationStatus, ReportStatus, MatchStatus } from '@prisma/client';
import { sendMatchNotification } from '@/lib/push/notifications';
import { hashNamePrefix, hashPartialNumber } from '@/lib/hash';

interface MatchResult {
    declarationId: string;
    reportId: string;
    confidence: number;
}

async function createPotentialMatch(match: MatchResult, ownerUserId: string, docType: string) {
    await prisma.match.upsert({
        where: {
            declarationId_reportId: {
                declarationId: match.declarationId,
                reportId: match.reportId,
            },
        },
        create: {
            declarationId: match.declarationId,
            reportId: match.reportId,
            confidenceScore: match.confidence,
            status: MatchStatus.PENDING,
        },
        update: {
            confidenceScore: match.confidence,
        },
    });

    await prisma.declaration.update({
        where: { id: match.declarationId },
        data: { status: DeclarationStatus.MATCHED },
    });

    await prisma.ownerReport.update({
        where: { id: match.reportId },
        data: { status: ReportStatus.MATCHED },
    });

    sendMatchNotification(ownerUserId, docType).catch(console.error);
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

        await createPotentialMatch(match, report.userId, declaration.docType);

        matches.push(match);
    }

    return matches;
}

/**
 * Match a just-created owner report using the raw submitted values.
 *
 * Why this exists:
 * historical rows use per-row salts, so direct hash equality between reports and
 * declarations is not reliable. At creation time we still have the raw partial
 * values, so we can safely recompute against each candidate declaration salt.
 */
export async function findMatchesForReportInput(
    reportId: string,
    fullNumber: string,
    fullName: string
): Promise<MatchResult[]> {
    const report = await prisma.ownerReport.findUnique({
        where: { id: reportId },
    });

    if (!report) {
        throw new Error('Report not found');
    }

    const declarations = await prisma.declaration.findMany({
        where: {
            docType: report.docType,
            status: {
                in: [
                    DeclarationStatus.PENDING,
                    DeclarationStatus.APPROVED,
                    DeclarationStatus.DEPOSITED,
                ],
            },
            expiresAt: {
                gt: new Date(),
            },
        },
    });

    const matches: MatchResult[] = [];

    for (const declaration of declarations) {
        const partialNumberHash = hashPartialNumber(fullNumber, declaration.salt);
        const namePrefixHash = hashNamePrefix(fullName, declaration.salt);

        if (
            partialNumberHash !== declaration.partialNumberHash ||
            namePrefixHash !== declaration.namePrefixHash
        ) {
            continue;
        }

        const match = {
            declarationId: declaration.id,
            reportId: report.id,
            confidence: 0.92,
        };

        await createPotentialMatch(match, report.userId, declaration.docType);
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

    // Only process declarations that can still be resolved.
    const matchableStatuses: DeclarationStatus[] = [
        DeclarationStatus.PENDING,
        DeclarationStatus.APPROVED,
        DeclarationStatus.DEPOSITED,
    ];

    if (!matchableStatuses.includes(declaration.status)) {
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

        await createPotentialMatch(match, report.userId, declaration.docType);

        matches.push(match);
    }

    return matches;
}

/**
 * Match a just-created found-document declaration using the submitted partials.
 * This makes matching work with existing salted rows without a DB migration.
 */
export async function findMatchesForDeclarationInput(
    declarationId: string,
    lastFourDigits: string,
    namePrefix: string
): Promise<MatchResult[]> {
    const declaration = await prisma.declaration.findUnique({
        where: { id: declarationId },
    });

    if (!declaration) {
        throw new Error('Declaration not found');
    }

    const reports = await prisma.ownerReport.findMany({
        where: {
            docType: declaration.docType,
            status: ReportStatus.SEARCHING,
        },
    });

    const matches: MatchResult[] = [];

    for (const report of reports) {
        const partialNumberHash = hashPartialNumber(lastFourDigits, report.salt);
        const namePrefixHash = hashNamePrefix(namePrefix, report.salt);

        if (
            partialNumberHash !== report.partialNumberHash ||
            namePrefixHash !== report.namePrefixHash
        ) {
            continue;
        }

        const match = {
            declarationId: declaration.id,
            reportId: report.id,
            confidence: 0.92,
        };

        await createPotentialMatch(match, report.userId, declaration.docType);
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
