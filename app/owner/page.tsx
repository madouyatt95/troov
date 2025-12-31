'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useTranslation } from '@/lib/i18n';

interface Report {
    id: string;
    docType: 'CNI' | 'PASSPORT';
    status: 'SEARCHING' | 'MATCHED' | 'RECOVERED' | 'CANCELLED';
    createdAt: string;
    matchCount?: number;
}

const statusConfig = {
    SEARCHING: { label: 'En recherche', color: 'text-[#f59e0b]', bg: 'bg-[#f59e0b]/20', icon: '🔍' },
    MATCHED: { label: 'Correspondance trouvée!', color: 'text-[#4ade80]', bg: 'bg-[#4ade80]/20', icon: '✨' },
    RECOVERED: { label: 'Récupéré', color: 'text-[#4cc9f0]', bg: 'bg-[#4cc9f0]/20', icon: '✅' },
    CANCELLED: { label: 'Annulé', color: 'text-[#6b6b90]', bg: 'bg-[#6b6b90]/20', icon: '❌' },
};

const docTypeLabels = {
    CNI: 'Carte Nationale d\'Identité',
    PASSPORT: 'Passeport',
};

export default function OwnerDashboard() {
    const { t } = useTranslation();
    const [reports, setReports] = useState<Report[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchReports();
    }, []);

    const fetchReports = async () => {
        try {
            const response = await fetch('/api/reports');
            if (!response.ok) {
                if (response.status === 401) {
                    window.location.href = '/login';
                    return;
                }
                throw new Error('Erreur lors du chargement');
            }
            const data = await response.json();
            setReports(data.reports || []);
        } catch (err) {
            setError('Impossible de charger vos signalements');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <main className="flex-1 flex flex-col min-h-screen">
            {/* Header */}
            <header className="flex items-center justify-between p-4 safe-area-top border-b border-[#2a2a45]">
                <Link href="/" className="text-[#a0a0b9] hover:text-white transition-colors">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                </Link>
                <h1 className="font-semibold text-lg">Mes documents</h1>
                <div className="w-6"></div>
            </header>

            {/* Content */}
            <div className="flex-1 p-4 space-y-4">
                {/* Stats banner */}
                <Card className="bg-gradient-to-r from-[#4361ee]/20 to-[#a855f7]/20 border-[#4361ee]/30">
                    <CardContent className="p-4 flex items-center justify-between">
                        <div>
                            <p className="text-sm text-[#a0a0b9]">Signalements actifs</p>
                            <p className="text-2xl font-bold">{reports.filter(r => r.status === 'SEARCHING').length}</p>
                        </div>
                        <div className="w-12 h-12 bg-[#4361ee]/30 rounded-xl flex items-center justify-center">
                            <span className="text-2xl">📋</span>
                        </div>
                    </CardContent>
                </Card>

                {/* Match notification */}
                {reports.some(r => r.status === 'MATCHED') && (
                    <Card className="bg-[#4ade80]/10 border-[#4ade80]/30 animate-pulse">
                        <CardContent className="p-4 flex items-center gap-3">
                            <span className="text-2xl">🎉</span>
                            <div>
                                <p className="font-semibold text-[#4ade80]">Bonne nouvelle!</p>
                                <p className="text-sm text-[#a0a0b9]">Un document correspondant a été trouvé</p>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Loading state */}
                {isLoading && (
                    <div className="flex items-center justify-center py-12">
                        <div className="w-8 h-8 border-2 border-[#4361ee] border-t-transparent rounded-full animate-spin"></div>
                    </div>
                )}

                {/* Error state */}
                {error && (
                    <Card className="bg-[#f87171]/10 border-[#f87171]/30">
                        <CardContent className="p-4 text-center text-[#f87171]">
                            {error}
                        </CardContent>
                    </Card>
                )}

                {/* Empty state */}
                {!isLoading && !error && reports.length === 0 && (
                    <div className="text-center py-12">
                        <div className="w-20 h-20 mx-auto mb-4 bg-[#2a2a45] rounded-full flex items-center justify-center">
                            <span className="text-4xl">📭</span>
                        </div>
                        <h3 className="font-semibold mb-2">Aucun signalement</h3>
                        <p className="text-sm text-[#a0a0b9] mb-6">
                            Vous n'avez pas encore signalé de document perdu
                        </p>
                    </div>
                )}

                {/* Reports list */}
                {!isLoading && reports.length > 0 && (
                    <div className="space-y-3">
                        <h2 className="text-sm font-medium text-[#a0a0b9]">Vos signalements</h2>
                        {reports.map((report) => {
                            const status = statusConfig[report.status];
                            return (
                                <Card key={report.id} className="border-[#2a2a45] hover:border-[#4361ee]/50 transition-colors">
                                    <CardContent className="p-4">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-12 h-12 ${status.bg} rounded-xl flex items-center justify-center`}>
                                                <span className="text-xl">{status.icon}</span>
                                            </div>
                                            <div className="flex-1">
                                                <p className="font-medium">{docTypeLabels[report.docType]}</p>
                                                <p className={`text-sm ${status.color}`}>{status.label}</p>
                                            </div>
                                            <svg className="w-5 h-5 text-[#6b6b90]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                            </svg>
                                        </div>
                                        <p className="text-xs text-[#6b6b90] mt-2">
                                            Signalé le {new Date(report.createdAt).toLocaleDateString('fr-FR')}
                                        </p>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Fixed bottom button */}
            <div className="p-4 safe-area-bottom border-t border-[#2a2a45]">
                <Link href="/owner/report">
                    <Button className="w-full bg-gradient-to-r from-[#a855f7] to-[#4361ee]">
                        <span className="mr-2">➕</span>
                        Signaler une perte
                    </Button>
                </Link>
            </div>
        </main>
    );
}
