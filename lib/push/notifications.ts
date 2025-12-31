import webpush from 'web-push';
import prisma from '@/lib/db/prisma';

// Configure web-push with VAPID keys
const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '';
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY || '';
const VAPID_SUBJECT = process.env.VAPID_SUBJECT || 'mailto:contact@troov.sn';

if (VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) {
    webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
}

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
    await sendPushNotification(userId, {
        title: '🎉 Bonne nouvelle !',
        body: `Votre ${docType === 'CNI' ? 'carte d\'identité' : 'passeport'} a peut-être été trouvé !`,
        tag: 'match-notification',
        data: { url: '/owner' },
        actions: [
            { action: 'view', title: 'Voir' }
        ]
    });
}

/**
 * Send deposit reminder to finder
 */
export async function sendDepositReminder(trackingCode: string): Promise<void> {
    // For anonymous declarations, we can't send push notifications
    // This would require storing a subscription at declaration time
    console.log(`[Push] Deposit reminder for ${trackingCode} - skipped (no user)`);
}
