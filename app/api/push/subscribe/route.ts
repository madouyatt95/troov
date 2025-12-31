import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';
import { verifySession } from '@/lib/auth/session';

// POST /api/push/subscribe - Subscribe to push notifications
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
        const { subscription } = body;

        if (!subscription || !subscription.endpoint || !subscription.keys) {
            return NextResponse.json(
                { success: false, message: 'Subscription invalide' },
                { status: 400 }
            );
        }

        // Upsert the subscription
        await prisma.pushSubscription.upsert({
            where: { endpoint: subscription.endpoint },
            create: {
                userId: session.userId,
                endpoint: subscription.endpoint,
                p256dh: subscription.keys.p256dh,
                auth: subscription.keys.auth,
            },
            update: {
                userId: session.userId,
                p256dh: subscription.keys.p256dh,
                auth: subscription.keys.auth,
            },
        });

        return NextResponse.json({
            success: true,
            message: 'Notifications activées'
        });
    } catch (error) {
        console.error('Push subscription error:', error);
        return NextResponse.json(
            { success: false, message: 'Erreur serveur' },
            { status: 500 }
        );
    }
}

// DELETE /api/push/subscribe - Unsubscribe from push notifications
export async function DELETE(request: NextRequest) {
    try {
        const session = await verifySession(request);

        if (!session) {
            return NextResponse.json(
                { success: false, message: 'Non authentifié' },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { endpoint } = body;

        if (!endpoint) {
            return NextResponse.json(
                { success: false, message: 'Endpoint requis' },
                { status: 400 }
            );
        }

        await prisma.pushSubscription.deleteMany({
            where: { endpoint, userId: session.userId }
        });

        return NextResponse.json({
            success: true,
            message: 'Notifications désactivées'
        });
    } catch (error) {
        console.error('Push unsubscribe error:', error);
        return NextResponse.json(
            { success: false, message: 'Erreur serveur' },
            { status: 500 }
        );
    }
}
