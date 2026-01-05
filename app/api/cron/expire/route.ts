import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';

// Cron job endpoint to expire stale declarations
// Should be called every hour by Vercel Cron or external service
export async function GET(request: NextRequest) {
    try {
        // Verify cron secret (optional but recommended)
        const authHeader = request.headers.get('authorization');
        const cronSecret = process.env.CRON_SECRET;

        if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const now = new Date();

        // Mark expired PENDING declarations
        const expiredResult = await prisma.declaration.updateMany({
            where: {
                status: 'PENDING',
                expiresAt: { lt: now }
            },
            data: {
                status: 'EXPIRED'
            }
        });

        // Also mark expired APPROVED declarations (deposited but not matched after 7 days)
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const staleApprovedResult = await prisma.declaration.updateMany({
            where: {
                status: 'APPROVED',
                createdAt: { lt: sevenDaysAgo }
            },
            data: {
                status: 'EXPIRED'
            }
        });

        // Expire stale matches (pending for more than 30 days)
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        const staleMatchesResult = await prisma.match.updateMany({
            where: {
                status: 'PENDING',
                matchedAt: { lt: thirtyDaysAgo }
            },
            data: {
                status: 'EXPIRED'
            }
        });

        return NextResponse.json({
            success: true,
            timestamp: now.toISOString(),
            expired: {
                pendingDeclarations: expiredResult.count,
                staleApproved: staleApprovedResult.count,
                staleMatches: staleMatchesResult.count
            }
        });
    } catch (error) {
        console.error('Cron expiration error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// Vercel Cron config
export const dynamic = 'force-dynamic';
