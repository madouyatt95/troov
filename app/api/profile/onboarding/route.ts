import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { getSession } from '@/lib/auth/session';

export async function POST() {
    try {
        const session = await getSession();

        if (!session?.userId) {
            return NextResponse.json(
                { error: 'Non authentifié' },
                { status: 401 }
            );
        }

        await prisma.user.update({
            where: { id: session.userId },
            data: { hasSeenOnboarding: true },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Onboarding API error:', error);
        return NextResponse.json(
            { error: 'Erreur serveur' },
            { status: 500 }
        );
    }
}
