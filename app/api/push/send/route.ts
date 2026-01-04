import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import {
    sendPushNotification,
    sendMatchNotification,
    sendPickupReminder,
    sendExpirationWarning,
    sendPointsNotification,
    sendBadgeNotification,
} from '@/lib/push/notifications';

type NotificationType = 'custom' | 'match' | 'pickup_reminder' | 'expiration' | 'points' | 'badge';

interface SendNotificationRequest {
    userId: string;
    type: NotificationType;
    // For custom notifications
    title?: string;
    body?: string;
    // For typed notifications
    docType?: string;
    location?: string;
    daysLeft?: number;
    points?: number;
    reason?: string;
    badgeName?: string;
}

export async function POST(request: NextRequest) {
    try {
        const session = await getSession();

        // Only admins can send notifications via API
        if (!session?.userId) {
            return NextResponse.json(
                { error: 'Non authentifié' },
                { status: 401 }
            );
        }

        const body: SendNotificationRequest = await request.json();
        const { userId, type } = body;

        if (!userId || !type) {
            return NextResponse.json(
                { error: 'userId et type sont requis' },
                { status: 400 }
            );
        }

        let result;

        switch (type) {
            case 'custom':
                if (!body.title || !body.body) {
                    return NextResponse.json(
                        { error: 'title et body sont requis pour custom' },
                        { status: 400 }
                    );
                }
                result = await sendPushNotification(userId, {
                    title: body.title,
                    body: body.body,
                });
                break;

            case 'match':
                if (!body.docType) {
                    return NextResponse.json(
                        { error: 'docType requis pour match' },
                        { status: 400 }
                    );
                }
                await sendMatchNotification(userId, body.docType);
                result = { success: true };
                break;

            case 'pickup_reminder':
                if (!body.location) {
                    return NextResponse.json(
                        { error: 'location requis pour pickup_reminder' },
                        { status: 400 }
                    );
                }
                await sendPickupReminder(userId, body.location);
                result = { success: true };
                break;

            case 'expiration':
                if (body.daysLeft === undefined) {
                    return NextResponse.json(
                        { error: 'daysLeft requis pour expiration' },
                        { status: 400 }
                    );
                }
                await sendExpirationWarning(userId, body.daysLeft);
                result = { success: true };
                break;

            case 'points':
                if (!body.points || !body.reason) {
                    return NextResponse.json(
                        { error: 'points et reason requis pour points' },
                        { status: 400 }
                    );
                }
                await sendPointsNotification(userId, body.points, body.reason);
                result = { success: true };
                break;

            case 'badge':
                if (!body.badgeName) {
                    return NextResponse.json(
                        { error: 'badgeName requis pour badge' },
                        { status: 400 }
                    );
                }
                await sendBadgeNotification(userId, body.badgeName);
                result = { success: true };
                break;

            default:
                return NextResponse.json(
                    { error: 'Type de notification invalide' },
                    { status: 400 }
                );
        }

        return NextResponse.json({
            ...result,
            success: true,
        });
    } catch (error) {
        console.error('Send notification error:', error);
        return NextResponse.json(
            { error: 'Erreur lors de l\'envoi' },
            { status: 500 }
        );
    }
}
