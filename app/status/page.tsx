'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';

interface StatusResult {
    trackingCode: string;
    status: string;
    statusLabel: { fr: string; wo: string; en: string };
    docType: string;
    createdAt: string;
    depositPoint?: {
        name: string;
        address: string;
        phone?: string;
        hours?: string;
    };
}

export default function StatusPage() {
    const [trackingCode, setTrackingCode] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [result, setResult] = useState<StatusResult | null>(null);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setResult(null);
        setIsLoading(true);

        try {
            const response = await fetch(`/api/declarations/status/${trackingCode}`);
            const data = await response.json();

            if (!response.ok) {
                setError(data.message || 'Déclaration non trouvée');
                return;
            }

            setResult(data);
        } catch {
            setError('Connexion impossible. Vérifiez votre connexion internet.');
        } finally {
            setIsLoading(false);
        }
    };

    const getStatusColor = (status: string) => {
        const colors: Record<string, string> = {
            PENDING: 'text-[#fbbf24]',
            APPROVED: 'text-[#4361ee]',
            DEPOSITED: 'text-[#4cc9f0]',
            MATCHED: 'text-[#4ade80]',
            PICKED_UP: 'text-[#4ade80]',
            CLOSED: 'text-[#a0a0b9]',
            REJECTED: 'text-[#f87171]',
            EXPIRED: 'text-[#f87171]'
        };
        return colors[status] || 'text-white';
    };

    const getStatusIcon = (status: string) => {
        const icons: Record<string, string> = {
            PENDING: '⏳',
            APPROVED: '✓',
            DEPOSITED: '📍',
            MATCHED: '🎉',
            PICKED_UP: '✅',
            CLOSED: '✓',
            REJECTED: '❌',
            EXPIRED: '⏰'
        };
        return icons[status] || '•';
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('fr-FR', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <main className="flex-1 flex flex-col">
            {/* Header */}
            <header className="flex items-center p-4 safe-area-top">
                <Link href="/" className="text-[#a0a0b9] hover:text-white transition-colors">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                </Link>
                <h1 className="flex-1 text-center font-semibold">Suivi</h1>
                <div className="w-6"></div>
            </header>

            {/* Content */}
            <div className="flex-1 flex flex-col px-6 py-4 pb-8">
                <div className="w-full max-w-md mx-auto">
                    <div className="text-center mb-8">
                        <div className="text-4xl mb-4">📊</div>
                        <h2 className="text-2xl font-bold mb-2">Suivre ma déclaration</h2>
                        <p className="text-[#a0a0b9]">Entrez votre code de suivi</p>
                    </div>

                    <form onSubmit={handleSearch} className="space-y-4">
                        <Input
                            type="text"
                            value={trackingCode}
                            onChange={e => setTrackingCode(e.target.value.toUpperCase())}
                            placeholder="SDC-2026-XXXXXX"
                            className="text-center font-mono"
                        />
                        <Button type="submit" className="w-full" isLoading={isLoading}>
                            Rechercher
                        </Button>
                    </form>

                    {error && (
                        <Card className="mt-6 bg-[#f87171]/10 border border-[#f87171]/30">
                            <CardContent className="p-4 text-center text-[#f87171]">
                                {error}
                            </CardContent>
                        </Card>
                    )}

                    {result && (
                        <div className="mt-8 animate-fade-in">
                            <Card className="mb-4">
                                <CardContent>
                                    <div className="flex items-center justify-between mb-4">
                                        <span className="text-[#a0a0b9]">Code</span>
                                        <code className="font-mono text-[#4cc9f0]">{result.trackingCode}</code>
                                    </div>
                                    <div className="flex items-center justify-between mb-4">
                                        <span className="text-[#a0a0b9]">Document</span>
                                        <span>{result.docType === 'CNI' ? '🪪 CNI' : '📕 Passeport'}</span>
                                    </div>
                                    <div className="flex items-center justify-between mb-4">
                                        <span className="text-[#a0a0b9]">Statut</span>
                                        <span className={`font-medium ${getStatusColor(result.status)}`}>
                                            {getStatusIcon(result.status)} {result.statusLabel.fr}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-[#a0a0b9]">Créé le</span>
                                        <span className="text-sm">{formatDate(result.createdAt)}</span>
                                    </div>
                                </CardContent>
                            </Card>

                            {result.depositPoint && (
                                <Card>
                                    <CardContent>
                                        <p className="text-sm text-[#a0a0b9] mb-2">📍 Point de dépôt</p>
                                        <p className="font-medium">{result.depositPoint.name}</p>
                                        <p className="text-sm text-[#a0a0b9]">{result.depositPoint.address}</p>
                                        {result.depositPoint.phone && (
                                            <p className="text-sm text-[#4cc9f0] mt-2">
                                                📞 {result.depositPoint.phone}
                                            </p>
                                        )}
                                    </CardContent>
                                </Card>
                            )}

                            {/* Status timeline */}
                            <Card className="mt-4">
                                <CardContent>
                                    <p className="text-sm text-[#a0a0b9] mb-4">Historique</p>
                                    <div className="space-y-3">
                                        {['PENDING', 'APPROVED', 'DEPOSITED', 'MATCHED', 'CLOSED'].map((s, i) => {
                                            const isActive = ['PENDING', 'APPROVED', 'DEPOSITED', 'MATCHED', 'PICKED_UP', 'CLOSED'].indexOf(result.status) >= i;
                                            return (
                                                <div key={s} className="flex items-center gap-3">
                                                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${isActive ? 'bg-[#4361ee] text-white' : 'bg-[#3a3a50] text-[#6b6b80]'
                                                        }`}>
                                                        {isActive ? '✓' : (i + 1)}
                                                    </div>
                                                    <span className={isActive ? 'text-white' : 'text-[#6b6b80]'}>
                                                        {s === 'PENDING' && 'Déclaré'}
                                                        {s === 'APPROVED' && 'Approuvé'}
                                                        {s === 'DEPOSITED' && 'Déposé'}
                                                        {s === 'MATCHED' && 'Correspondance'}
                                                        {s === 'CLOSED' && 'Clôturé'}
                                                    </span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
}
