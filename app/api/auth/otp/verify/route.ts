import { NextRequest, NextResponse } from 'next/server';
import { verifyOtp as verifyOtpHash, hashData, generateSalt } from '@/lib/hash';
import { signAccessToken, signRefreshToken, setAuthCookies } from '@/lib/auth/jwt';
import prisma from '@/lib/db/prisma';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { phone, otp } = body;

        if (!phone || !otp) {
            return NextResponse.json(
                { success: false, message: 'Numéro et code requis' },
                { status: 400 }
            );
        }

        // Find valid OTP tokens (not expired)
        const recentTokens = await prisma.otpToken.findMany({
            where: {
                expiresAt: { gte: new Date() }
            },
            orderBy: { createdAt: 'desc' },
            take: 50
        });

        // Find matching token
        let matchingToken = null;
        for (const token of recentTokens) {
            if (verifyOtpHash(otp, token.otpHash)) {
                matchingToken = token;
                break;
            }
        }

        if (!matchingToken) {
            return NextResponse.json(
                { success: false, message: 'Code incorrect ou expiré' },
                { status: 400 }
            );
        }

        // Delete used token
        await prisma.otpToken.delete({
            where: { id: matchingToken.id }
        });

        // Normalize phone
        const normalizedPhone = phone.replace(/[\s\-+]/g, '');

        // Find existing user or create new one
        // We need a consistent way to find users by phone
        // For simplicity, we'll search all users and verify hash
        const allUsers = await prisma.user.findMany({
            where: { isBlocked: false },
            select: { id: true, phoneHash: true, phoneSalt: true, role: true }
        });

        let user = null;
        for (const u of allUsers) {
            const testHash = hashData(normalizedPhone, u.phoneSalt, 'phone');
            if (testHash === u.phoneHash) {
                user = u;
                break;
            }
        }

        let isNewUser = false;

        if (!user) {
            // Create new user
            const phoneSalt = generateSalt();
            const phoneHash = hashData(normalizedPhone, phoneSalt, 'phone');

            const newUser = await prisma.user.create({
                data: {
                    phoneHash,
                    phoneSalt,
                    role: 'OWNER',
                    trustScore: 50,
                    lastLogin: new Date()
                }
            });

            user = { id: newUser.id, role: newUser.role };
            isNewUser = true;
        } else {
            // Update last login
            await prisma.user.update({
                where: { id: user.id },
                data: { lastLogin: new Date() }
            });
        }

        // Generate tokens
        const accessToken = await signAccessToken(user.id, user.role);
        const refreshToken = await signRefreshToken(user.id, user.role);

        // Set cookies
        await setAuthCookies(accessToken, refreshToken);

        return NextResponse.json({
            success: true,
            message: isNewUser ? 'Compte créé avec succès' : 'Connexion réussie',
            user: {
                id: user.id,
                role: user.role,
                verified: true
            },
            isNewUser
        });

    } catch (error) {
        console.error('OTP verify error:', error);
        return NextResponse.json(
            { success: false, message: 'Erreur serveur' },
            { status: 500 }
        );
    }
}
