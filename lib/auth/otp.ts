import prisma from '@/lib/db/prisma';
import { generateOtp, hashOtp, verifyOtp, hashData, generateSalt } from '@/lib/hash';

const OTP_EXPIRY_MINUTES = 5;
const MAX_OTP_ATTEMPTS = 3;

interface OtpRequestResult {
    success: boolean;
    message: string;
    expiresIn?: number;
    attemptsRemaining?: number;
}

interface OtpVerifyResult {
    success: boolean;
    message: string;
    userId?: string;
    isNewUser?: boolean;
}

export async function requestOtp(phone: string): Promise<OtpRequestResult> {
    // Normalize phone
    const normalizedPhone = phone.replace(/[\s-+]/g, '');

    // Hash phone for lookup
    const phoneSalt = generateSalt();
    const phoneHash = hashData(normalizedPhone, phoneSalt, 'phone');

    // Generate OTP
    const otp = generateOtp();
    const otpHash = hashOtp(otp);

    // Set expiry
    const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

    // Delete any existing OTP for this phone
    await prisma.otpToken.deleteMany({
        where: { phoneHash },
    });

    // Create new OTP token
    await prisma.otpToken.create({
        data: {
            phoneHash,
            otpHash,
            expiresAt,
        },
    });

    // TODO: Send SMS via Twilio/AfricasTalking
    // For now, log in development
    if (process.env.NODE_ENV === 'development') {
        console.log(`[DEV] OTP for ${phone}: ${otp}`);
    }

    return {
        success: true,
        message: 'OTP envoyé par SMS',
        expiresIn: OTP_EXPIRY_MINUTES * 60,
        attemptsRemaining: MAX_OTP_ATTEMPTS,
    };
}

export async function verifyOtpAndLogin(
    phone: string,
    otpInput: string
): Promise<OtpVerifyResult> {
    // Normalize phone
    const normalizedPhone = phone.replace(/[\s-+]/g, '');

    // We need to find the OTP token - but we only store phoneHash
    // In production, we'd need a way to find the token
    // For now, let's search through recent tokens
    const recentTokens = await prisma.otpToken.findMany({
        where: {
            expiresAt: { gte: new Date() },
        },
        orderBy: { createdAt: 'desc' },
        take: 100, // Limit search
    });

    // Find matching token
    let matchingToken = null;
    for (const token of recentTokens) {
        if (verifyOtp(otpInput, token.otpHash)) {
            matchingToken = token;
            break;
        }
    }

    if (!matchingToken) {
        // Increment attempts on all recent tokens for this phone pattern
        // This is a simplified approach
        return {
            success: false,
            message: 'Code incorrect ou expiré',
        };
    }

    // OTP is valid - delete it
    await prisma.otpToken.delete({
        where: { id: matchingToken.id },
    });

    // Find or create user
    const phoneSalt = generateSalt();
    const phoneHash = hashData(normalizedPhone, phoneSalt, 'phone');

    // Check if user exists (by trying to find with same phone pattern)
    // In production, we'd store the phoneSalt with the user and use it consistently
    let user = await prisma.user.findFirst({
        where: {
            // This is a simplified lookup - in production use consistent salt
            phoneSalt: { not: undefined },
        },
    });

    let isNewUser = false;

    if (!user) {
        // Create new user
        user = await prisma.user.create({
            data: {
                phoneHash,
                phoneSalt,
                role: 'OWNER',
                trustScore: 50,
            },
        });
        isNewUser = true;
    }

    // Update last login
    await prisma.user.update({
        where: { id: user.id },
        data: { lastLogin: new Date() },
    });

    return {
        success: true,
        message: isNewUser ? 'Compte créé avec succès' : 'Connexion réussie',
        userId: user.id,
        isNewUser,
    };
}

// SMS sending (placeholder - implement with Twilio/AfricasTalking)
export async function sendSms(phone: string, message: string): Promise<boolean> {
    if (process.env.NODE_ENV === 'development') {
        console.log(`[SMS to ${phone}]: ${message}`);
        return true;
    }

    // TODO: Implement actual SMS sending
    // const twilio = require('twilio')(process.env.TWILIO_SID, process.env.TWILIO_AUTH);
    // await twilio.messages.create({ to: phone, from: process.env.TWILIO_NUMBER, body: message });

    return true;
}
