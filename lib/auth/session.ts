import { NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from './jwt';

export interface Session {
    userId: string;
    role: string;
}

/**
 * Get session from cookies (for API routes and server components)
 * Returns session data or null if not authenticated
 */
export async function getSession(): Promise<Session | null> {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('access_token')?.value;

        if (!token) {
            return null;
        }

        const payload = await verifyToken(token);

        if (!payload || payload.type !== 'access') {
            return null;
        }

        return {
            userId: payload.userId,
            role: payload.role
        };
    } catch {
        return null;
    }
}

/**
 * Verify session from request cookies
 * Returns session data or null if not authenticated
 */
export async function verifySession(request: NextRequest): Promise<Session | null> {
    const token = request.cookies.get('access_token')?.value;

    if (!token) {
        return null;
    }

    const payload = await verifyToken(token);

    if (!payload || payload.type !== 'access') {
        return null;
    }

    return {
        userId: payload.userId,
        role: payload.role
    };
}

/**
 * Check if user has required role
 */
export function hasRole(session: Session, requiredRoles: string[]): boolean {
    return requiredRoles.includes(session.role);
}
