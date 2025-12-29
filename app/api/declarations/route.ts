import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit } from '@/lib/rate-limit';
import { generateSalt, hashPartialNumber, hashNamePrefix, generateTrackingCode } from '@/lib/hash';
import prisma from '@/lib/db/prisma';
import { findMatchesForDeclaration } from '@/lib/matching/engine';

// Create a new declaration (guest/finder)
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { docType, lastFourDigits, namePrefix, regionFound, depositPointId } = body;

        // Validate required fields
        if (!docType || !lastFourDigits || !namePrefix || !regionFound || !depositPointId) {
            return NextResponse.json(
                { success: false, message: 'Tous les champs sont requis' },
                { status: 400 }
            );
        }

        // Validate doc type
        if (!['CNI', 'PASSPORT'].includes(docType)) {
            return NextResponse.json(
                { success: false, message: 'Type de document invalide' },
                { status: 400 }
            );
        }

        // Validate last 4 digits
        if (!/^\d{4}$/.test(lastFourDigits)) {
            return NextResponse.json(
                { success: false, message: '4 chiffres numériques requis' },
                { status: 400 }
            );
        }

        // Validate name prefix (3 letters)
        if (!/^[A-Za-z]{3}$/.test(namePrefix)) {
            return NextResponse.json(
                { success: false, message: '3 lettres requises pour le nom' },
                { status: 400 }
            );
        }

        // Rate limiting
        const ip = request.headers.get('x-forwarded-for') || 'unknown';
        const fingerprint = request.headers.get('x-device-fingerprint') || '';

        const rateLimitResult = await checkRateLimit('declaration', ip);

        if (!rateLimitResult.success) {
            const retryAfter = Math.ceil((rateLimitResult.reset - Date.now()) / 1000);
            return NextResponse.json(
                {
                    success: false,
                    error: 'RATE_LIMITED',
                    message: `Trop de déclarations. Réessayez dans ${Math.ceil(retryAfter / 60)} minute(s).`,
                    retryAfter
                },
                { status: 429 }
            );
        }

        // Verify deposit point exists
        const depositPoint = await prisma.depositPoint.findUnique({
            where: { id: depositPointId, isActive: true }
        });

        if (!depositPoint) {
            return NextResponse.json(
                { success: false, message: 'Point de dépôt invalide' },
                { status: 400 }
            );
        }

        // Generate salt for hashing
        const salt = generateSalt();

        // Hash the partial data
        const partialNumberHash = hashPartialNumber(lastFourDigits, salt);
        const namePrefixHash = hashNamePrefix(namePrefix, salt);

        // Generate tracking code
        const trackingCode = generateTrackingCode();

        // Set expiration (48h)
        const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000);

        // Create declaration
        const declaration = await prisma.declaration.create({
            data: {
                docType,
                partialNumberHash,
                namePrefixHash,
                salt,
                regionFound,
                depositPointId,
                status: 'PENDING',
                deviceFingerprintHash: fingerprint || null,
                ipAddress: ip,
                trackingCode,
                expiresAt
            },
            include: {
                depositPoint: true
            }
        });

        // Check for matches asynchronously (don't block response)
        findMatchesForDeclaration(declaration.id).catch(err => {
            console.error('Matching error:', err);
        });

        return NextResponse.json({
            success: true,
            declaration: {
                id: declaration.id,
                trackingCode: declaration.trackingCode,
                status: declaration.status,
                depositPoint: {
                    name: depositPoint.name,
                    address: depositPoint.address,
                    phone: depositPoint.phone
                }
            },
            message: 'Déclaration enregistrée. Déposez le document au point indiqué.'
        }, { status: 201 });

    } catch (error) {
        console.error('Declaration creation error:', error);
        return NextResponse.json(
            { success: false, message: 'Erreur serveur' },
            { status: 500 }
        );
    }
}
