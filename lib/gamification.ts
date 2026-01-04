import { prisma } from '@/lib/db/prisma';

// Badge definitions
export const BADGES = {
    BON_SAMARITAIN: {
        id: 'bon_samaritain',
        name: 'Bon Samaritain',
        description: 'A déclaré son premier document trouvé',
        icon: '🤝',
        requirement: 1,
    },
    HEROS_LOCAL: {
        id: 'heros_local',
        name: 'Héros Local',
        description: 'A déclaré 5 documents trouvés',
        icon: '🦸',
        requirement: 5,
    },
    LEGENDE: {
        id: 'legende',
        name: 'Légende',
        description: 'A déclaré 20 documents trouvés',
        icon: '🏆',
        requirement: 20,
    },
    ECLAIREUR: {
        id: 'eclaireur',
        name: 'Éclaireur',
        description: 'A permis 3 récupérations',
        icon: '⭐',
        requirement: 3,
    },
    CITOYEN_MODELE: {
        id: 'citoyen_modele',
        name: 'Citoyen Modèle',
        description: 'Score de confiance supérieur à 80',
        icon: '🎖️',
        requirement: 80,
    },
} as const;

// Points configuration
export const POINTS = {
    DECLARATION_CREATED: 50,      // Finder declares a found document
    DOCUMENT_DEPOSITED: 25,       // Document deposited at collection point
    MATCH_CONFIRMED: 100,         // Owner confirms match
    DOCUMENT_RECOVERED: 150,      // Owner recovers document
    DAILY_LOGIN: 5,               // Daily login bonus
} as const;

// Level thresholds
export const LEVELS = [
    { level: 1, minPoints: 0, title: 'Débutant' },
    { level: 2, minPoints: 100, title: 'Initié' },
    { level: 3, minPoints: 300, title: 'Contributeur' },
    { level: 4, minPoints: 600, title: 'Expert' },
    { level: 5, minPoints: 1000, title: 'Maître' },
    { level: 6, minPoints: 2000, title: 'Champion' },
    { level: 7, minPoints: 5000, title: 'Légende' },
] as const;

/**
 * Calculate level from points
 */
export function calculateLevel(points: number): { level: number; title: string } {
    for (let i = LEVELS.length - 1; i >= 0; i--) {
        if (points >= LEVELS[i].minPoints) {
            return { level: LEVELS[i].level, title: LEVELS[i].title };
        }
    }
    return { level: 1, title: 'Débutant' };
}

/**
 * Get progress to next level
 */
export function getLevelProgress(points: number): { current: number; next: number; percentage: number } {
    const currentLevelData = calculateLevel(points);
    const currentLevelIndex = LEVELS.findIndex(l => l.level === currentLevelData.level);
    const nextLevelIndex = currentLevelIndex + 1;

    if (nextLevelIndex >= LEVELS.length) {
        return { current: points, next: points, percentage: 100 };
    }

    const currentThreshold = LEVELS[currentLevelIndex].minPoints;
    const nextThreshold = LEVELS[nextLevelIndex].minPoints;
    const progress = points - currentThreshold;
    const required = nextThreshold - currentThreshold;

    return {
        current: progress,
        next: required,
        percentage: Math.round((progress / required) * 100),
    };
}

/**
 * Check and award badges based on user stats
 */
export function checkBadges(
    currentBadges: string[],
    declarationsCount: number,
    recoveredCount: number,
    trustScore: number
): string[] {
    const newBadges = [...currentBadges];

    // Check declaration badges
    if (declarationsCount >= BADGES.BON_SAMARITAIN.requirement && !newBadges.includes(BADGES.BON_SAMARITAIN.id)) {
        newBadges.push(BADGES.BON_SAMARITAIN.id);
    }
    if (declarationsCount >= BADGES.HEROS_LOCAL.requirement && !newBadges.includes(BADGES.HEROS_LOCAL.id)) {
        newBadges.push(BADGES.HEROS_LOCAL.id);
    }
    if (declarationsCount >= BADGES.LEGENDE.requirement && !newBadges.includes(BADGES.LEGENDE.id)) {
        newBadges.push(BADGES.LEGENDE.id);
    }

    // Check recovery badge
    if (recoveredCount >= BADGES.ECLAIREUR.requirement && !newBadges.includes(BADGES.ECLAIREUR.id)) {
        newBadges.push(BADGES.ECLAIREUR.id);
    }

    // Check trust score badge
    if (trustScore >= BADGES.CITOYEN_MODELE.requirement && !newBadges.includes(BADGES.CITOYEN_MODELE.id)) {
        newBadges.push(BADGES.CITOYEN_MODELE.id);
    }

    return newBadges;
}

/**
 * Award points to a user and update their level
 */
export async function awardPoints(userId: string, points: number, reason: keyof typeof POINTS) {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { points: true, badges: true, declarationsCount: true, trustScore: true },
    });

    if (!user) return null;

    const newPoints = user.points + points;
    const newLevel = calculateLevel(newPoints);

    // Check for new badges
    const recoveredCount = await prisma.match.count({
        where: {
            report: { userId },
            status: 'CONFIRMED',
        },
    });

    const newBadges = checkBadges(
        user.badges,
        user.declarationsCount,
        recoveredCount,
        user.trustScore
    );

    return prisma.user.update({
        where: { id: userId },
        data: {
            points: newPoints,
            level: newLevel.level,
            badges: newBadges,
        },
    });
}

/**
 * Get badge details by ID
 */
export function getBadgeById(badgeId: string) {
    return Object.values(BADGES).find(b => b.id === badgeId) || null;
}

/**
 * Get all available badges
 */
export function getAllBadges() {
    return Object.values(BADGES);
}
