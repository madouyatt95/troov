'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { useTranslation } from '@/lib/i18n';

interface Stats {
    documentsRecovered: number;
    activeSearches: number;
    matchRate: number;
}

export default function HomePage() {
    const { t } = useTranslation();
    const [stats, setStats] = useState<Stats | null>(null);
    const [isLoadingStats, setIsLoadingStats] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await fetch('/api/stats');
                if (response.ok) {
                    const data = await response.json();
                    setStats(data);
                }
            } catch (error) {
                console.error('Failed to fetch stats:', error);
            } finally {
                setIsLoadingStats(false);
            }
        };
        fetchStats();
    }, []);

    return (
        <>
            {/* Animated background orbs */}
            <div className="orb-container">
                <div className="orb orb-1" />
                <div className="orb orb-2" />
                <div className="orb orb-3" />
            </div>

            <main className="relative z-10 flex-1 flex flex-col min-h-screen">
                {/* Header */}
                <header className="flex items-center justify-between p-4 safe-area-top">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-[#00d9ff] to-[#a855f7] rounded-xl flex items-center justify-center shadow-lg animate-pulse-glow">
                            <span className="text-white font-bold text-xl">T</span>
                        </div>
                        <span className="font-bold text-2xl gradient-text">{t('app.name')}</span>
                    </div>
                    <LanguageSwitcher />
                </header>

                {/* Main content */}
                <div className="flex-1 flex flex-col items-center justify-center px-6 pb-8">
                    {/* Geometric illustration */}
                    <div className="geo-illustration mb-8 animate-fade-in">
                        <div className="geo-card">
                            <div className="geo-card-lines">
                                <span></span>
                                <span></span>
                            </div>
                        </div>
                        <div className="geo-pin">
                            <div className="geo-pin-head">
                                <div className="geo-pin-dot"></div>
                            </div>
                        </div>
                    </div>

                    {/* Title */}
                    <div className="text-center mb-10 animate-fade-in stagger-1">
                        <h1 className="text-3xl font-bold mb-3">{t('home.welcome')}</h1>
                        <p className="text-[#8888aa] text-lg">{t('home.tagline')}</p>
                    </div>

                    {/* Action cards */}
                    <div className="w-full max-w-md space-y-4">
                        {/* Found document CTA */}
                        <Link href="/finder" className="block animate-fade-in stagger-2">
                            <div className="glow-card glow-card-cyan p-5">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 bg-gradient-to-br from-[#00d9ff]/20 to-[#00d9ff]/5 rounded-2xl flex items-center justify-center border border-[#00d9ff]/30">
                                        <span className="text-3xl">📋</span>
                                    </div>
                                    <div className="flex-1">
                                        <h2 className="font-semibold text-lg neon-text-cyan">{t('home.found')}</h2>
                                        <p className="text-sm text-[#8888aa]">{t('home.found.sub')}</p>
                                    </div>
                                    <div className="w-8 h-8 rounded-full bg-[#00d9ff]/10 flex items-center justify-center">
                                        <svg className="w-4 h-4 text-[#00d9ff]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </div>
                                </div>
                            </div>
                        </Link>

                        {/* Lost document CTA */}
                        <Link href="/login" className="block animate-fade-in stagger-3">
                            <div className="glow-card glow-card-purple p-5">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 bg-gradient-to-br from-[#a855f7]/20 to-[#a855f7]/5 rounded-2xl flex items-center justify-center border border-[#a855f7]/30">
                                        <span className="text-3xl">🔍</span>
                                    </div>
                                    <div className="flex-1">
                                        <h2 className="font-semibold text-lg neon-text-purple">{t('home.lost')}</h2>
                                        <p className="text-sm text-[#8888aa]">{t('home.lost.sub')}</p>
                                    </div>
                                    <div className="w-8 h-8 rounded-full bg-[#a855f7]/10 flex items-center justify-center">
                                        <svg className="w-4 h-4 text-[#a855f7]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </div>
                                </div>
                            </div>
                        </Link>

                        {/* Divider */}
                        <div className="flex items-center gap-4 my-8 animate-fade-in stagger-4">
                            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[#3a3a60] to-transparent"></div>
                            <span className="text-sm text-[#5555770] px-3">{t('home.or')}</span>
                            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[#3a3a60] to-transparent"></div>
                        </div>

                        {/* Track status CTA */}
                        <Link href="/status" className="block animate-fade-in stagger-4">
                            <Button variant="outline" className="w-full border-[#3a3a60] hover:border-[#00d9ff] hover:text-[#00d9ff] transition-all duration-300">
                                <span className="mr-2">📊</span>
                                {t('home.track')}
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Stats bar */}
                <div className="px-6 mb-6 animate-fade-in stagger-4">
                    <div className="stats-bar flex items-center justify-center gap-2">
                        {isLoadingStats ? (
                            <div className="w-16 h-6 bg-[#2a2a45] rounded animate-pulse" />
                        ) : (
                            <span className="stats-number">
                                {stats?.documentsRecovered?.toLocaleString('fr-FR') || '0'}
                            </span>
                        )}
                        <span className="text-[#8888aa]">{t('home.stats') || 'documents retrouvés'}</span>
                    </div>
                </div>

                {/* Security badge */}
                <footer className="p-6 safe-area-bottom">
                    <div className="flex items-center justify-center gap-2 text-sm text-[#6b6b90]">
                        <div className="w-5 h-5 rounded-full bg-[#4ade80]/20 flex items-center justify-center">
                            <span className="text-xs">🔒</span>
                        </div>
                        <span>{t('home.secure')}</span>
                    </div>
                    <p className="text-center text-xs text-[#4a4a70] mt-2">
                        {t('home.secure.sub')}
                    </p>
                </footer>
            </main>
        </>
    );
}
