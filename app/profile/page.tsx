'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { BadgeDisplay, LevelProgress } from '@/components/BadgeDisplay';
import { useTranslation } from '@/lib/i18n';

interface UserProfile {
    id: string;
    points: number;
    level: number;
    badges: string[];
    trustScore: number;
    declarationsCount: number;
    createdAt: string;
}

export default function ProfilePage() {
    const { t } = useTranslation();
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const response = await fetch('/api/profile');
            if (!response.ok) {
                if (response.status === 401) {
                    window.location.href = '/login';
                    return;
                }
                throw new Error('Erreur lors du chargement');
            }
            const data = await response.json();
            setProfile(data);
        } catch (err) {
            setError('Impossible de charger le profil');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex-1 flex items-center justify-center min-h-screen">
                <div className="w-8 h-8 border-2 border-[#4361ee] border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <main className="flex-1 flex flex-col min-h-screen">
            {/* Header */}
            <header className="flex items-center justify-between p-4 safe-area-top border-b border-[#2a2a45]">
                <Link href="/owner" className="text-[#a0a0b9] hover:text-white transition-colors">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                </Link>
                <h1 className="font-semibold text-lg">Mon Profil</h1>
                <div className="w-6" />
            </header>

            <div className="flex-1 p-4 space-y-6">
                {error && (
                    <Card className="bg-[#f87171]/10 border-[#f87171]/30">
                        <CardContent className="p-4 text-center text-[#f87171]">
                            {error}
                        </CardContent>
                    </Card>
                )}

                {profile && (
                    <>
                        {/* Level & Points */}
                        <Card className="bg-gradient-to-br from-[#1a1a2e] to-[#25253d] border-[#3a3a60]">
                            <CardContent className="p-6">
                                <div className="text-center mb-6">
                                    <div className="w-20 h-20 mx-auto mb-3 bg-gradient-to-br from-[#4361ee] to-[#a855f7] rounded-full flex items-center justify-center">
                                        <span className="text-4xl font-bold">{profile.level}</span>
                                    </div>
                                    <h2 className="text-xl font-bold gradient-text">Niveau {profile.level}</h2>
                                </div>
                                <LevelProgress points={profile.points} level={profile.level} />
                            </CardContent>
                        </Card>

                        {/* Stats */}
                        <div className="grid grid-cols-3 gap-3">
                            <Card className="border-[#2a2a45]">
                                <CardContent className="p-4 text-center">
                                    <p className="text-2xl font-bold text-[#4361ee]">{profile.points}</p>
                                    <p className="text-xs text-[#a0a0b9]">Points</p>
                                </CardContent>
                            </Card>
                            <Card className="border-[#2a2a45]">
                                <CardContent className="p-4 text-center">
                                    <p className="text-2xl font-bold text-[#4ade80]">{profile.declarationsCount}</p>
                                    <p className="text-xs text-[#a0a0b9]">Trouvés</p>
                                </CardContent>
                            </Card>
                            <Card className="border-[#2a2a45]">
                                <CardContent className="p-4 text-center">
                                    <p className="text-2xl font-bold text-[#a855f7]">{profile.trustScore}</p>
                                    <p className="text-xs text-[#a0a0b9]">Confiance</p>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Badges */}
                        <Card className="border-[#2a2a45]">
                            <CardContent className="p-4">
                                <h3 className="font-semibold mb-4 flex items-center gap-2">
                                    <span>🏅</span> Badges
                                </h3>
                                <BadgeDisplay badges={profile.badges} showLocked={true} />
                            </CardContent>
                        </Card>

                        {/* Member since */}
                        <div className="text-center text-sm text-[#6b6b90]">
                            <p>Membre depuis {new Date(profile.createdAt).toLocaleDateString('fr-FR', {
                                month: 'long',
                                year: 'numeric'
                            })}</p>
                        </div>
                    </>
                )}
            </div>
        </main>
    );
}
