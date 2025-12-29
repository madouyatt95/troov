import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';

// Get declaration status by tracking code (public)
export async function GET(
    _request: NextRequest,
    { params }: { params: Promise<{ code: string }> }
) {
    try {
        const { code } = await params;

        if (!code) {
            return NextResponse.json(
                { success: false, message: 'Code de suivi requis' },
                { status: 400 }
            );
        }

        const declaration = await prisma.declaration.findUnique({
            where: { trackingCode: code },
            include: {
                depositPoint: {
                    select: {
                        name: true,
                        address: true,
                        phone: true,
                        hours: true
                    }
                }
            }
        });

        if (!declaration) {
            return NextResponse.json(
                { success: false, message: 'Déclaration non trouvée' },
                { status: 404 }
            );
        }

        // Status labels in multiple languages
        const statusLabels: Record<string, { fr: string; wo: string; en: string }> = {
            PENDING: { fr: 'En attente', wo: 'Ngi xaar', en: 'Pending' },
            APPROVED: { fr: 'Approuvé', wo: 'Nangu nañu ko', en: 'Approved' },
            DEPOSITED: { fr: 'Déposé', wo: 'Dafay nekk', en: 'Deposited' },
            MATCHED: { fr: 'Correspondance trouvée', wo: 'Gis nañu borom bi', en: 'Match found' },
            PICKED_UP: { fr: 'Récupéré', wo: 'Jël nañu ko', en: 'Picked up' },
            CLOSED: { fr: 'Clôturé', wo: 'Jeex na', en: 'Closed' },
            REJECTED: { fr: 'Rejeté', wo: 'Ñu ko bañ', en: 'Rejected' },
            EXPIRED: { fr: 'Expiré', wo: 'Jeex na waxtu', en: 'Expired' }
        };

        return NextResponse.json({
            trackingCode: declaration.trackingCode,
            status: declaration.status,
            statusLabel: statusLabels[declaration.status] || statusLabels.PENDING,
            docType: declaration.docType,
            createdAt: declaration.createdAt.toISOString(),
            depositPoint: declaration.depositPoint
        });

    } catch (error) {
        console.error('Status lookup error:', error);
        return NextResponse.json(
            { success: false, message: 'Erreur serveur' },
            { status: 500 }
        );
    }
}
