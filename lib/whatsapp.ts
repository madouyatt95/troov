// WhatsApp Cloud API Integration for OTP
// Documentation: https://developers.facebook.com/docs/whatsapp/cloud-api/

interface WhatsAppConfig {
    phoneNumberId: string;
    accessToken: string;
}

interface SendMessageResponse {
    success: boolean;
    messageId?: string;
    error?: string;
}

const config: WhatsAppConfig = {
    phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID || '',
    accessToken: process.env.WHATSAPP_ACCESS_TOKEN || '',
};

/**
 * Send an OTP code via WhatsApp
 * Uses the WhatsApp Cloud API with a pre-approved OTP template
 */
export async function sendWhatsAppOTP(
    phoneNumber: string,
    otp: string,
    language: 'fr' | 'en' | 'wo' = 'fr'
): Promise<SendMessageResponse> {
    if (!config.phoneNumberId || !config.accessToken) {
        console.warn('[WhatsApp] API not configured, falling back to dev mode');
        return { success: true, messageId: 'dev-mode' };
    }

    // Normalize phone number to international format
    const normalizedPhone = normalizePhoneNumber(phoneNumber);

    try {
        const response = await fetch(
            `https://graph.facebook.com/v18.0/${config.phoneNumberId}/messages`,
            {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${config.accessToken}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    messaging_product: 'whatsapp',
                    recipient_type: 'individual',
                    to: normalizedPhone,
                    type: 'template',
                    template: {
                        name: 'troov_otp', // You'll need to create this template in Meta Business
                        language: {
                            code: language === 'wo' ? 'fr' : language, // Wolof falls back to French
                        },
                        components: [
                            {
                                type: 'body',
                                parameters: [
                                    {
                                        type: 'text',
                                        text: otp,
                                    },
                                ],
                            },
                            {
                                type: 'button',
                                sub_type: 'url',
                                index: '0',
                                parameters: [
                                    {
                                        type: 'text',
                                        text: otp,
                                    },
                                ],
                            },
                        ],
                    },
                }),
            }
        );

        const data = await response.json();

        if (response.ok) {
            return {
                success: true,
                messageId: data.messages?.[0]?.id,
            };
        } else {
            console.error('[WhatsApp] API Error:', data);
            return {
                success: false,
                error: data.error?.message || 'Unknown error',
            };
        }
    } catch (error) {
        console.error('[WhatsApp] Network Error:', error);
        return {
            success: false,
            error: 'Network error',
        };
    }
}

/**
 * Send a simple text message (for testing)
 * Note: This requires the user to have messaged you first (24h window)
 */
export async function sendWhatsAppText(
    phoneNumber: string,
    message: string
): Promise<SendMessageResponse> {
    if (!config.phoneNumberId || !config.accessToken) {
        console.warn('[WhatsApp] API not configured');
        return { success: false, error: 'Not configured' };
    }

    const normalizedPhone = normalizePhoneNumber(phoneNumber);

    try {
        const response = await fetch(
            `https://graph.facebook.com/v18.0/${config.phoneNumberId}/messages`,
            {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${config.accessToken}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    messaging_product: 'whatsapp',
                    recipient_type: 'individual',
                    to: normalizedPhone,
                    type: 'text',
                    text: {
                        preview_url: false,
                        body: message,
                    },
                }),
            }
        );

        const data = await response.json();

        if (response.ok) {
            return { success: true, messageId: data.messages?.[0]?.id };
        } else {
            return { success: false, error: data.error?.message };
        }
    } catch (error) {
        return { success: false, error: 'Network error' };
    }
}

/**
 * Normalize Senegalese phone numbers to international format
 * Examples:
 *   77 123 45 67 -> 221771234567
 *   +221 77 123 45 67 -> 221771234567
 *   0771234567 -> 221771234567
 */
function normalizePhoneNumber(phone: string): string {
    // Remove all spaces, dashes, and parentheses
    let cleaned = phone.replace(/[\s\-\(\)]/g, '');

    // Remove leading +
    if (cleaned.startsWith('+')) {
        cleaned = cleaned.slice(1);
    }

    // If starts with 0, replace with 221 (Senegal)
    if (cleaned.startsWith('0')) {
        cleaned = '221' + cleaned.slice(1);
    }

    // If doesn't start with country code, add 221
    if (!cleaned.startsWith('221')) {
        cleaned = '221' + cleaned;
    }

    return cleaned;
}

/**
 * Generate OTP messages in different languages
 */
export function getOtpMessage(otp: string, language: 'fr' | 'en' | 'wo' = 'fr'): string {
    const messages = {
        fr: `Votre code SenDocu est : ${otp}\nIl expire dans 5 minutes.\nNe partagez ce code avec personne.`,
        en: `Your SenDocu code is: ${otp}\nIt expires in 5 minutes.\nDo not share this code with anyone.`,
        wo: `Sa code SenDocu mooy: ${otp}\nDi nëpp ci 5 simili.\nBul ko jox keneen.`,
    };

    return messages[language];
}
