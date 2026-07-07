'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { StatusTimeline } from '@/components/Timeline';

interface Match {
    id: string;
    status: 'PENDING' | 'CONFIRMED' | 'REJECTED' | 'EXPIRED';
    matchedAt: string;
    docType: 'CNI' | 'PASSPORT';
    depositPoint: {
        id: string;
        name: string;
        address: string;
        phone: string | null;
        hours: string | null;
        latitude: number;
        longitude: number;
        region: string;
    } | null;
}

const statusConfig = {
    PENDING: { label: 'En attente de récupération', color: 'text-[#f59e0b]', bg: 'bg-[#f59e0b]/20' },
    CONFIRMED: { label: 'Récupéré', color: 'text-[#4ade80]', bg: 'bg-[#4ade80]/20' },
    REJECTED: { label: 'Refusé', color: 'text-[#f87171]', bg: 'bg-[#f87171]/20' },
    EXPIRED: { label: 'Expiré', color: 'text-[#6b6b90]', bg: 'bg-[#6b6b90]/20' },
};

export default function MatchDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const [match, setMatch] = useState<Match | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [matchId, setMatchId] = useState<string>('');

    useEffect(() => {
        params.then(p => {
            setMatchId(p.id);
        });
    }, [params]);

    useEffect(() => {
        if (matchId) {
            fetchMatch();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [matchId]);

    const fetchMatch = async () => {
        try {
            const response = await fetch('/api/owner/matches');
            if (!response.ok) {
                if (response.status === 401) {
                    window.location.href = '/login';
                    return;
                }
                throw new Error('Erreur lors du chargement');
            }
            const data = await response.json();
            const foundMatch = data.matches.find((m: Match) => m.id === matchId);
            if (foundMatch) {
                setMatch(foundMatch);
            } else {
                setError('Match non trouvé');
            }
        } catch (err) {
            setError('Impossible de charger les détails');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const openDirections = () => {
        if (match?.depositPoint) {
            const url = `https://www.google.com/maps/dir/?api=1&destination=${match.depositPoint.latitude},${match.depositPoint.longitude}`;
            window.open(url, '_blank');
        }
    };

    const callDepositPoint = () => {
        if (match?.depositPoint?.phone) {
            window.location.href = `tel:${match.depositPoint.phone}`;
        }
    };

    const openMap = () => {
        if (match?.depositPoint) {
            const url = `https://www.google.com/maps?q=${match.depositPoint.latitude},${match.depositPoint.longitude}`;
            window.open(url, '_blank');
        }
    };

    if (isLoading) {
        return (
            <div className="flex-1 flex items-center justify-center min-h-screen">
                <div className="w-8 h-8 border-2 border-[#4361ee] border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (error || !match) {
        return (
            <main className="flex-1 flex flex-col min-h-screen">
                <header className="flex items-center justify-between p-4 safe-area-top border-b border-[#2a2a45]">
                    <Link href="/owner" className="text-[#a0a0b9] hover:text-white">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </Link>
                    <h1 className="font-semibold text-lg">Détails</h1>
                    <div className="w-6" />
                </header>
                <div className="flex-1 flex items-center justify-center p-4">
                    <Card className="bg-[#f87171]/10 border-[#f87171]/30">
                        <CardContent className="p-4 text-center text-[#f87171]">
                            {error || 'Match non trouvé'}
                        </CardContent>
                    </Card>
                </div>
            </main>
        );
    }

    const status = statusConfig[match.status];

    return (
        <main className="flex-1 flex flex-col min-h-screen">
            {/* Header */}
            <header className="flex items-center justify-between p-4 safe-area-top border-b border-[#2a2a45]">
                <Link href="/owner" className="text-[#a0a0b9] hover:text-white transition-colors">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                </Link>
                <h1 className="font-semibold text-lg">🎉 Document Trouvé</h1>
                <div className="w-6" />
            </header>

            <div className="flex-1 p-4 space-y-4 overflow-y-auto">
                {/* Success banner */}
                <Card className="bg-gradient-to-r from-[#4ade80]/20 to-[#22c55e]/20 border-[#4ade80]/50">
                    <CardContent className="p-4 text-center">
                        <span className="text-4xl">🎊</span>
                        <h2 className="text-xl font-bold mt-2">Bonne nouvelle !</h2>
                        <p className="text-[#a0a0b9] text-sm mt-1">
                            Votre {match.docType === 'CNI' ? 'carte d\'identité' : 'passeport'} a été retrouvé
                        </p>
                    </CardContent>
                </Card>

                {/* Status */}
                <div className={`flex items-center justify-center gap-2 py-2 px-4 rounded-xl ${status.bg}`}>
                    <span className={`text-sm font-medium ${status.color}`}>{status.label}</span>
                </div>

                {/* Timeline */}
                <Card className="border-[#2a2a45]">
                    <CardContent className="p-4">
                        <StatusTimeline
                            status="MATCHED"
                            dates={{
                                matched: new Date(match.matchedAt).toLocaleDateString('fr-FR')
                            }}
                        />
                    </CardContent>
                </Card>

                {/* Deposit Point Info */}
                {match.depositPoint && (
                    <>
                        <Card className="border-[#2a2a45]">
                            <CardContent className="p-4">
                                <h3 className="font-semibold mb-3 flex items-center gap-2">
                                    <span>📍</span> Point de retrait
                                </h3>
                                <div className="space-y-2">
                                    <p className="text-[#4cc9f0] font-medium">{match.depositPoint.name}</p>
                                    <p className="text-sm text-[#a0a0b9]">{match.depositPoint.address}</p>
                                    {match.depositPoint.hours && (
                                        <p className="text-sm text-[#6b6b90]">🕐 {match.depositPoint.hours}</p>
                                    )}
                                    {match.depositPoint.phone && (
                                        <p className="text-sm text-[#6b6b90]">📞 {match.depositPoint.phone}</p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Map Preview - Click to open */}
                        <button
                            onClick={openMap}
                            className="w-full h-40 bg-[#1a1a35] rounded-xl border border-[#2a2a45] flex items-center justify-center hover:border-[#4361ee] transition-colors"
                        >
                            <div className="text-center">
                                <span className="text-4xl">🗺️</span>
                                <p className="text-sm text-[#a0a0b9] mt-2">Voir sur la carte</p>
                            </div>
                        </button>

                        {/* Action buttons */}
                        <div className="space-y-3">
                            <Button onClick={openDirections} className="w-full bg-[#4361ee]">
                                🗺️ Itinéraire
                            </Button>
                            {match.depositPoint.phone && (
                                <Button onClick={callDepositPoint} variant="outline" className="w-full">
                                    📞 Appeler le point de dépôt
                                </Button>
                            )}
                        </div>
                    </>
                )}

                {/* Instructions */}
                <Card className="bg-[#fbbf24]/10 border-[#fbbf24]/30">
                    <CardContent className="p-4">
                        <h3 className="font-semibold mb-2 flex items-center gap-2">
                            <span>📋</span> Pour récupérer votre document
                        </h3>
                        <ol className="text-sm text-[#a0a0b9] space-y-2 list-decimal list-inside">
                            <li>Rendez-vous au point de retrait indiqué</li>
                            <li>Présentez une pièce d&apos;identité secondaire</li>
                            <li>Signez le reçu de remise</li>
                        </ol>
                    </CardContent>
                </Card>

                {/* Share */}
                <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                        if (navigator.share) {
                            navigator.share({
                                title: 'Mon document a été retrouvé !',
                                text: `Mon ${match.docType === 'CNI' ? 'CNI' : 'passeport'} a été retrouvé grâce à SenDocu !`,
                                url: window.location.origin,
                            });
                        }
                    }}
                >
                    📤 Partager la bonne nouvelle
                </Button>
            </div>
        </main>
    );
}
