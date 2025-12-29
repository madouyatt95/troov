import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit } from '@/lib/rate-limit';
import { generateOtp, hashOtp, hashData, generateSalt } from '@/lib/hash';
import prisma from '@/lib/db/prisma';

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

        // In development, log the OTP
        if (process.env.NODE_ENV === 'development') {
            console.log(`[DEV] OTP for ${phone}: ${otp}`);
        }

        // TODO: Send SMS in production
        // await sendSms(phone, getOtpMessage(otp, language));

        // Generate message based on language
        const messages = {
            fr: 'Code envoyé par SMS',
            wo: 'Dañu yónnee code bi SMS',
            en: 'Code sent via SMS'
        };

        return NextResponse.json({
            success: true,
            message: messages[language as keyof typeof messages] || messages.fr,
            expiresIn: 300, // 5 minutes in seconds
            attemptsRemaining: rateLimitResult.remaining
        });

    } catch (error) {
        console.error('OTP request error:', error);
        return NextResponse.json(
            { success: false, message: 'Erreur serveur' },
            { status: 500 }
        );
    }
}
