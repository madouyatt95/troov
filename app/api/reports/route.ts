import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';
import { verifySession } from '@/lib/auth/session';

// GET /api/reports - Get user's reports
export async function GET(request: NextRequest) {
    try {
        const session = await verifySession(request);

        if (!session) {
            return NextResponse.json(
                { success: false, message: 'Non authentifié' },
                { status: 401 }
            );
        }

        const reports = await prisma.ownerReport.findMany({
            where: { userId: session.userId },
            orderBy: { createdAt: 'desc' },
            include: {
                matches: {
                    where: { status: 'PENDING' },
                    select: { id: true }
                }
            }
        });

        return NextResponse.json({
            success: true,
            reports: reports.map(r => ({
                id: r.id,
                docType: r.docType,
                status: r.status,
                createdAt: r.createdAt.toISOString(),
                matchCount: r.matches.length,
                matchId: r.matches.length > 0 ? r.matches[0].id : null,
            }))
        });
    } catch (error) {
        console.error('Error fetching reports:', error);
        return NextResponse.json(
            { success: false, message: 'Erreur serveur' },
            { status: 500 }
        );
    }
}

// POST /api/reports - Create a new loss report
export async function POST(request: NextRequest) {
    try {
        const session = await verifySession(request);

        if (!session) {
            return NextResponse.json(
                { success: false, message: 'Non authentifié' },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { docType, fullNumber, fullName, dob } = body;

        if (!docType || !fullNumber || !fullName || !dob) {
            return NextResponse.json(
                { success: false, message: 'Informations manquantes' },
                { status: 400 }
            );
        }

        // Import hash functions
        const { hashData, generateSalt, hashPartialNumber, hashNamePrefix } = await import('@/lib/hash');

        const salt = generateSalt();

        // Create hashes
        const fullNumberHash = hashData(fullNumber, salt, 'document');
        const fullNameHash = hashData(fullName.toLowerCase(), salt, 'name');
        const dobHash = hashData(dob, salt, 'dob');

        // Partial hashes for matching - use existing functions
        const partialNumberHash = hashPartialNumber(fullNumber, salt);
        const namePrefixHash = hashNamePrefix(fullName, salt);

        const report = await prisma.ownerReport.create({
            data: {
                userId: session.userId,
                docType,
                fullNumberHash,
                fullNameHash,
                dobHash,
                partialNumberHash,
                namePrefixHash,
                salt,
                status: 'SEARCHING'
            }
        });

        // Trigger matching in background (we'll implement this later)
        // matchReportWithDeclarations(report.id);

        return NextResponse.json({
            success: true,
            report: {
                id: report.id,
                docType: report.docType,
                status: report.status,
                createdAt: report.createdAt.toISOString()
            }
        });
    } catch (error) {
        console.error('Error creating report:', error);
        return NextResponse.json(
            { success: false, message: 'Erreur serveur' },
            { status: 500 }
        );
    }
}
