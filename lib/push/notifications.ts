import webpush from 'web-push';
import { prisma } from '@/lib/db/prisma';

// Configure web-push with VAPID keys
const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '';
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY || '';
const VAPID_SUBJECT = process.env.VAPID_SUBJECT || 'mailto:contact@troov.sn';

if (VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) {
    webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
}

// Notification templates
export const NOTIFICATION_TEMPLATES = {
    MATCH_FOUND: {
        title: '🎉 Bonne nouvelle !',
        getBody: (docType: string) =>
            `Votre ${docType === 'CNI' ? 'carte d\'identité' : 'passeport'} a peut-être été trouvé !`,
        tag: 'match-notification',
        url: '/owner',
    },
    PICKUP_REMINDER: {
        title: '⏰ N\'oubliez pas !',
        getBody: (location: string) =>
            `Votre document vous attend au point de dépôt: ${location}`,
        tag: 'pickup-reminder',
        url: '/owner',
    },
    EXPIRATION_WARNING: {
        title: '⚠️ Attention',
        getBody: (days: number) =>
            `Il vous reste ${days} jours pour récupérer votre document`,
        tag: 'expiration-warning',
        url: '/owner',
    },
    POINTS_EARNED: {
        title: '⭐ Félicitations !',
        getBody: (points: number, reason: string) =>
            `Vous avez gagné ${points} points pour: ${reason}`,
        tag: 'points-notification',
        url: '/profile',
    },
    BADGE_UNLOCKED: {
        title: '🏅 Nouveau badge !',
        getBody: (badgeName: string) =>
            `Vous avez débloqué le badge "${badgeName}"`,
        tag: 'badge-notification',
        url: '/profile',
    },
    LEVEL_UP: {
        title: '🚀 Niveau supérieur !',
        getBody: (level: number) =>
            `Félicitations ! Vous êtes maintenant niveau ${level}`,
        tag: 'level-notification',
        url: '/profile',
    },
} as const;

interface NotificationPayload {
    title: string;
    body: string;
    icon?: string;
    badge?: string;
    tag?: string;
    data?: Record<string, unknown>;
    actions?: Array<{ action: string; title: string }>;
}

/**
 * Send a push notification to a specific user
 */
export async function sendPushNotification(
    userId: string,
    payload: NotificationPayload
): Promise<{ success: boolean; sent: number; failed: number }> {
    if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
        console.warn('[Push] VAPID keys not configured');
        return { success: false, sent: 0, failed: 0 };
    }

    // Get all subscriptions for the user
    const subscriptions = await prisma.pushSubscription.findMany({
        where: { userId }
    });

    if (subscriptions.length === 0) {
        return { success: true, sent: 0, failed: 0 };
    }

    let sent = 0;
    let failed = 0;

    const notificationPayload = JSON.stringify({
        title: payload.title,
        body: payload.body,
        icon: payload.icon || '/icon-512.png',
        badge: payload.badge || '/icon-512.png',
        tag: payload.tag || 'troov-notification',
        data: payload.data || {},
        actions: payload.actions || []
    });

    for (const sub of subscriptions) {
        try {
            await webpush.sendNotification(
                {
                    endpoint: sub.endpoint,
                    keys: {
                        p256dh: sub.p256dh,
                        auth: sub.auth
                    }
                },
                notificationPayload
            );
            sent++;
        } catch (error: unknown) {
            console.error('[Push] Send failed:', error);
            failed++;

            // If subscription is invalid, remove it
            const pushError = error as { statusCode?: number };
            if (pushError.statusCode === 410 || pushError.statusCode === 404) {
                await prisma.pushSubscription.delete({
                    where: { id: sub.id }
                }).catch(() => { });
            }
        }
    }

    return { success: sent > 0, sent, failed };
}

/**
 * Send match notification to document owner
 */
export async function sendMatchNotification(userId: string, docType: string): Promise<void> {
    const template = NOTIFICATION_TEMPLATES.MATCH_FOUND;
    await sendPushNotification(userId, {
        title: template.title,
        body: template.getBody(docType),
        tag: template.tag,
        data: { url: template.url },
        actions: [{ action: 'view', title: 'Voir' }]
    });
}

/**
 * Send pickup reminder (48h after match)
 */
export async function sendPickupReminder(userId: string, location: string): Promise<void> {
    const template = NOTIFICATION_TEMPLATES.PICKUP_REMINDER;
    await sendPushNotification(userId, {
        title: template.title,
        body: template.getBody(location),
        tag: template.tag,
        data: { url: template.url },
        actions: [
            { action: 'view', title: 'Voir détails' },
            { action: 'navigate', title: 'Itinéraire' }
        ]
    });
}

/**
 * Send expiration warning
 */
export async function sendExpirationWarning(userId: string, daysLeft: number): Promise<void> {
    const template = NOTIFICATION_TEMPLATES.EXPIRATION_WARNING;
    await sendPushNotification(userId, {
        title: template.title,
        body: template.getBody(daysLeft),
        tag: template.tag,
        data: { url: template.url, urgent: daysLeft <= 3 },
    });
}

/**
 * Send points earned notification
 */
export async function sendPointsNotification(userId: string, points: number, reason: string): Promise<void> {
    const template = NOTIFICATION_TEMPLATES.POINTS_EARNED;
    await sendPushNotification(userId, {
        title: template.title,
        body: template.getBody(points, reason),
        tag: template.tag,
        data: { url: template.url, points },
    });
}

/**
 * Send badge unlocked notification
 */
export async function sendBadgeNotification(userId: string, badgeName: string): Promise<void> {
    const template = NOTIFICATION_TEMPLATES.BADGE_UNLOCKED;
    await sendPushNotification(userId, {
        title: template.title,
        body: template.getBody(badgeName),
        tag: template.tag,
        data: { url: template.url },
    });
}

/**
 * Send level up notification
 */
export async function sendLevelUpNotification(userId: string, newLevel: number): Promise<void> {
    const template = NOTIFICATION_TEMPLATES.LEVEL_UP;
    await sendPushNotification(userId, {
        title: template.title,
        body: template.getBody(newLevel),
        tag: template.tag,
        data: { url: template.url, level: newLevel },
    });
}

/**
 * Check for pending pickup reminders (called by cron)
 */
export async function checkPendingReminders(): Promise<{ sent: number }> {
    // Find matches older than 48h that haven't been picked up
    const twoDaysAgo = new Date(Date.now() - 48 * 60 * 60 * 1000);

    const pendingMatches = await prisma.match.findMany({
        where: {
            status: 'CONFIRMED',
            matchedAt: { lt: twoDaysAgo },
        },
        include: {
            report: {
                include: { user: true }
            },
            declaration: {
                include: { depositPoint: true }
            }
        },
        take: 50, // Limit to prevent overwhelming
    });

    let sent = 0;
    for (const match of pendingMatches) {
        if (match.declaration.depositPoint) {
            await sendPickupReminder(
                match.report.userId,
                match.declaration.depositPoint.name
            );
            sent++;
        }
    }

    return { sent };
}

