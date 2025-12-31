'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface Declaration {
    id: string;
    docType: 'CNI' | 'PASSPORT';
    status: string;
    trackingCode: string;
    createdAt: string;
    regionFound: string;
}

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
    PENDING: { label: 'En attente', color: 'text-[#f59e0b]', bg: 'bg-[#f59e0b]/20' },
    APPROVED: { label: 'Approuvé', color: 'text-[#4cc9f0]', bg: 'bg-[#4cc9f0]/20' },
    DEPOSITED: { label: 'Déposé', color: 'text-[#4ade80]', bg: 'bg-[#4ade80]/20' },
    MATCHED: { label: 'Correspondance', color: 'text-[#a855f7]', bg: 'bg-[#a855f7]/20' },
    PICKED_UP: { label: 'Récupéré', color: 'text-[#6b6b90]', bg: 'bg-[#6b6b90]/20' },
};

export default function AgentDashboard() {
    const [declarations, setDeclarations] = useState<Declaration[]>([]);
    const [filter, setFilter] = useState<'PENDING' | 'DEPOSITED' | 'MATCHED'>('PENDING');
    const [isLoading, setIsLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    useEffect(() => {
        fetchDeclarations();
    }, [filter]);

    const fetchDeclarations = async () => {
        try {
            const response = await fetch(`/api/agent/declarations?status=${filter}`);
            if (!response.ok) {
                if (response.status === 401 || response.status === 403) {
                    window.location.href = '/login';
                    return;
                }
            }
            const data = await response.json();
            setDeclarations(data.declarations || []);
        } catch (error) {
            console.error('Failed to load declarations:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleAction = async (declarationId: string, action: 'approve' | 'reject' | 'deposit' | 'pickup') => {
        setActionLoading(declarationId);
        try {
            const response = await fetch('/api/agent/declarations', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ declarationId, action }),
            });

            if (response.ok) {
                fetchDeclarations();
            }
        } catch (error) {
            console.error('Action failed:', error);
        } finally {
            setActionLoading(null);
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
                <h1 className="font-semibold text-lg">Espace Agent</h1>
                <div className="w-6"></div>
            </header>

            {/* Filter tabs */}
            <div className="flex border-b border-[#2a2a45]">
                {(['PENDING', 'DEPOSITED', 'MATCHED'] as const).map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setFilter(tab)}
                        className={`flex-1 py-3 text-sm font-medium transition-colors ${filter === tab
                                ? 'text-[#4cc9f0] border-b-2 border-[#4cc9f0]'
                                : 'text-[#6b6b90]'
                            }`}
                    >
                        {tab === 'PENDING' && '⏳ En attente'}
                        {tab === 'DEPOSITED' && '📦 Déposés'}
                        {tab === 'MATCHED' && '✨ Matchés'}
                    </button>
                ))}
            </div>

            {/* Content */}
            <div className="flex-1 p-4 space-y-4">
                {/* Stats */}
                <div className="grid grid-cols-3 gap-3">
                    <Card className="bg-[#f59e0b]/10 border-[#f59e0b]/30">
                        <CardContent className="p-3 text-center">
                            <p className="text-2xl font-bold text-[#f59e0b]">
                                {declarations.filter(d => d.status === 'PENDING').length}
                            </p>
                            <p className="text-xs text-[#a0a0b9]">En attente</p>
                        </CardContent>
                    </Card>
                    <Card className="bg-[#4ade80]/10 border-[#4ade80]/30">
                        <CardContent className="p-3 text-center">
                            <p className="text-2xl font-bold text-[#4ade80]">
                                {declarations.filter(d => d.status === 'DEPOSITED').length}
                            </p>
                            <p className="text-xs text-[#a0a0b9]">Déposés</p>
                        </CardContent>
                    </Card>
                    <Card className="bg-[#a855f7]/10 border-[#a855f7]/30">
                        <CardContent className="p-3 text-center">
                            <p className="text-2xl font-bold text-[#a855f7]">
                                {declarations.filter(d => d.status === 'MATCHED').length}
                            </p>
                            <p className="text-xs text-[#a0a0b9]">Matchés</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Loading */}
                {isLoading && (
                    <div className="flex items-center justify-center py-12">
                        <div className="w-8 h-8 border-2 border-[#4361ee] border-t-transparent rounded-full animate-spin"></div>
                    </div>
                )}

                {/* Empty state */}
                {!isLoading && declarations.length === 0 && (
                    <div className="text-center py-12">
                        <p className="text-[#a0a0b9]">Aucune déclaration dans cette catégorie</p>
                    </div>
                )}

                {/* Declarations list */}
                {!isLoading && declarations.length > 0 && (
                    <div className="space-y-3">
                        {declarations.map((decl) => {
                            const status = statusConfig[decl.status] || statusConfig.PENDING;
                            return (
                                <Card key={decl.id} className="border-[#2a2a45]">
                                    <CardContent className="p-4">
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="flex items-center gap-3">
                                                <span className="text-2xl">
                                                    {decl.docType === 'CNI' ? '🪪' : '📘'}
                                                </span>
                                                <div>
                                                    <p className="font-medium">{decl.docType}</p>
                                                    <p className="text-xs text-[#6b6b90]">
                                                        Code: <span className="text-[#4cc9f0]">{decl.trackingCode}</span>
                                                    </p>
                                                </div>
                                            </div>
                                            <span className={`text-xs px-2 py-1 rounded-full ${status.bg} ${status.color}`}>
                                                {status.label}
                                            </span>
                                        </div>

                                        <p className="text-xs text-[#6b6b90] mb-3">
                                            {new Date(decl.createdAt).toLocaleDateString('fr-FR')} • {decl.regionFound}
                                        </p>

                                        {/* Actions */}
                                        <div className="flex gap-2">
                                            {decl.status === 'PENDING' && (
                                                <>
                                                    <Button
                                                        size="sm"
                                                        className="flex-1 bg-[#4ade80] hover:bg-[#4ade80]/80"
                                                        onClick={() => handleAction(decl.id, 'approve')}
                                                        isLoading={actionLoading === decl.id}
                                                    >
                                                        ✓ Valider dépôt
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="border-[#f87171] text-[#f87171]"
                                                        onClick={() => handleAction(decl.id, 'reject')}
                                                    >
                                                        ✗
                                                    </Button>
                                                </>
                                            )}
                                            {decl.status === 'MATCHED' && (
                                                <Button
                                                    size="sm"
                                                    className="w-full bg-[#a855f7] hover:bg-[#a855f7]/80"
                                                    onClick={() => handleAction(decl.id, 'pickup')}
                                                    isLoading={actionLoading === decl.id}
                                                >
                                                    📤 Marquer comme récupéré
                                                </Button>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                )}
            </div>
        </main>
    );
}
