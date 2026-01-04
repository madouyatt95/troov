'use client';

import { getBadgeById, BADGES } from '@/lib/gamification';

interface BadgeDisplayProps {
    badges: string[];
    size?: 'sm' | 'md' | 'lg';
    showLocked?: boolean;
}

export function BadgeDisplay({ badges, size = 'md', showLocked = false }: BadgeDisplayProps) {
    const sizeClasses = {
        sm: 'w-8 h-8 text-lg',
        md: 'w-12 h-12 text-2xl',
        lg: 'w-16 h-16 text-3xl',
    };

    const allBadges = Object.values(BADGES);
    const displayBadges = showLocked ? allBadges : allBadges.filter(b => badges.includes(b.id));

    if (displayBadges.length === 0) {
        return (
            <div className="text-center py-4 text-[#6b6b90] text-sm">
                Aucun badge obtenu pour le moment
            </div>
        );
    }

    return (
        <div className="flex flex-wrap gap-3 justify-center">
            {displayBadges.map((badge) => {
                const isUnlocked = badges.includes(badge.id);
                return (
                    <div
                        key={badge.id}
                        className={`group relative flex flex-col items-center transition-transform hover:scale-110 ${!isUnlocked && showLocked ? 'opacity-40 grayscale' : ''
                            }`}
                    >
                        <div
                            className={`${sizeClasses[size]} rounded-xl flex items-center justify-center ${isUnlocked
                                    ? 'bg-gradient-to-br from-[#4361ee]/30 to-[#a855f7]/30 border border-[#4361ee]/50'
                                    : 'bg-[#2a2a45] border border-[#3a3a60]'
                                }`}
                        >
                            <span>{badge.icon}</span>
                        </div>
                        {size !== 'sm' && (
                            <span className={`mt-1 text-xs ${isUnlocked ? 'text-[#a0a0b9]' : 'text-[#6b6b90]'}`}>
                                {badge.name}
                            </span>
                        )}
                        {/* Tooltip */}
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-[#1a1a2e] border border-[#3a3a60] rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                            <p className="text-xs font-medium text-white">{badge.name}</p>
                            <p className="text-xs text-[#a0a0b9]">{badge.description}</p>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

interface LevelProgressProps {
    points: number;
    level: number;
}

export function LevelProgress({ points, level }: LevelProgressProps) {
    // Calculate progress
    const LEVELS = [
        { level: 1, minPoints: 0, title: 'Débutant' },
        { level: 2, minPoints: 100, title: 'Initié' },
        { level: 3, minPoints: 300, title: 'Contributeur' },
        { level: 4, minPoints: 600, title: 'Expert' },
        { level: 5, minPoints: 1000, title: 'Maître' },
        { level: 6, minPoints: 2000, title: 'Champion' },
        { level: 7, minPoints: 5000, title: 'Légende' },
    ];

    const currentLevelData = LEVELS.find(l => l.level === level) || LEVELS[0];
    const nextLevelData = LEVELS.find(l => l.level === level + 1);

    let percentage = 100;
    let pointsToNext = 0;

    if (nextLevelData) {
        const currentThreshold = currentLevelData.minPoints;
        const nextThreshold = nextLevelData.minPoints;
        const progress = points - currentThreshold;
        const required = nextThreshold - currentThreshold;
        percentage = Math.min(Math.round((progress / required) * 100), 100);
        pointsToNext = nextThreshold - points;
    }

    return (
        <div className="w-full">
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold gradient-text">{level}</span>
                    <span className="text-sm text-[#a0a0b9]">{currentLevelData.title}</span>
                </div>
                <span className="text-sm text-[#6b6b90]">{points.toLocaleString()} pts</span>
            </div>
            <div className="h-2 bg-[#2a2a45] rounded-full overflow-hidden">
                <div
                    className="h-full bg-gradient-to-r from-[#4361ee] to-[#a855f7] transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                />
            </div>
            {nextLevelData && (
                <p className="text-xs text-[#6b6b90] mt-1 text-right">
                    {pointsToNext} pts pour niveau {nextLevelData.level}
                </p>
            )}
        </div>
    );
}
