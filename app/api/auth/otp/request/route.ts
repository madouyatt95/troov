import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit } from '@/lib/rate-limit';
import { generateOtp, hashOtp, hashData, generateSalt } from '@/lib/hash';
import prisma from '@/lib/db/prisma';
import { sendWhatsAppOTP } from '@/lib/whatsapp';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { phone, language = 'fr' } = body;

        if (!phone) {
            return NextResponse.json(
                { success: false, message: 'Numéro de téléphone requis' },
                { status: 400 }
            );
        }

        // Rate limiting
        const ip = request.headers.get('x-forwarded-for') || 'unknown';
        const rateLimitResult = await checkRateLimit('otp', ip);

        if (!rateLimitResult.success) {
            const retryAfter = Math.ceil((rateLimitResult.reset - Date.now()) / 1000);
            return NextResponse.json(
                {
                    success: false,
                    error: 'RATE_LIMITED',
                    message: `Trop de tentatives. Réessayez dans ${Math.ceil(retryAfter / 60)} minute(s).`,
                    retryAfter
                },
                { status: 429 }
            );
        }

        // Normalize phone
        const normalizedPhone = phone.replace(/[\s\-+]/g, '');

        // Generate salt and hash phone for lookup
        const phoneSalt = generateSalt();
        const phoneHash = hashData(normalizedPhone, phoneSalt, 'phone');

        // Generate OTP
        const otp = generateOtp();
        const otpHash = hashOtp(otp);

        // Set expiry (5 minutes)
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

        // Store OTP token
        // First, clean up expired tokens
        await prisma.otpToken.deleteMany({
            where: {
                expiresAt: { lt: new Date() }
            }
        });

        // Create new token
        await prisma.otpToken.create({
            data: {
                phoneHash,
                otpHash,
                expiresAt,
            }
        });

        // Check if WhatsApp is configured
        const isWhatsAppConfigured = !!(process.env.WHATSAPP_PHONE_NUMBER_ID && process.env.WHATSAPP_ACCESS_TOKEN);

        // Log OTP in development or if WhatsApp is not configured
        if (process.env.NODE_ENV === 'development' || !isWhatsAppConfigured) {
            console.log(`[OTP] Code for ${phone}: ${otp}`);
        }

        let whatsappResult: { success: boolean; messageId?: string; error?: string } = { success: false, messageId: 'demo-mode', error: '' };

        // Only try WhatsApp if configured
        if (isWhatsAppConfigured) {
            const lang = language as 'fr' | 'en' | 'wo';
            whatsappResult = await sendWhatsAppOTP(phone, otp, lang);

            if (!whatsappResult.success) {
                console.error('[OTP] WhatsApp send failed:', whatsappResult.error);
            }
        }

        // Determine if we're in demo mode (WhatsApp not configured or failed)
        const isDemoMode = !isWhatsAppConfigured || whatsappResult.messageId === 'demo-mode' || whatsappResult.messageId === 'dev-mode';

        // Generate message based on mode
        const lang = language as 'fr' | 'en' | 'wo';
        const messages = isDemoMode
            ? {
                fr: `Mode démo - Votre code est affiché ci-dessous`,
                wo: `Mode démo - Sa code bi ci suuf`,
                en: `Demo mode - Your code is shown below`
            }
            : {
                fr: `Code envoyé par WhatsApp`,
                wo: `Dañu yónnee code bi WhatsApp`,
                en: `Code sent via WhatsApp`
            };

        return NextResponse.json({
            success: true,
            message: messages[lang] || messages.fr,
            expiresIn: 300,
            attemptsRemaining: rateLimitResult.remaining,
            // Include OTP in demo mode for testing
            ...(isDemoMode && { demoCode: otp, isDemoMode: true })
        });

    } catch (error) {
        console.error('OTP request error:', error);
        return NextResponse.json(
            { success: false, message: 'Erreur serveur' },
            { status: 500 }
        );
    }
}
