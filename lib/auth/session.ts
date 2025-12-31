import { NextRequest } from 'next/server';
import { verifyToken, TokenPayload } from './jwt';

export interface Session {
    userId: string;
    role: string;
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
