'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { SenDocuShell } from '@/components/SenDocuShell';

interface Declaration {
    id: string;
    docType: 'CNI' | 'PASSPORT';
    status: string;
    trackingCode: string;
    createdAt: string;
    regionFound: string;
}

type Filter = 'PENDING' | 'DEPOSITED' | 'MATCHED';

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
    PENDING: { label: 'À valider', color: 'text-[#f6c945]', bg: 'bg-[#f6c945]/12' },
    APPROVED: { label: 'Validé', color: 'text-[#53a9ff]', bg: 'bg-[#53a9ff]/12' },
    DEPOSITED: { label: 'Déposé', color: 'text-[#34f58b]', bg: 'bg-[#34f58b]/12' },
    MATCHED: { label: 'Correspondance', color: 'text-[#b57cff]', bg: 'bg-[#b57cff]/12' },
    PICKED_UP: { label: 'Récupéré', color: 'text-[#8ba0b8]', bg: 'bg-white/8' },
};

const filterLabels: Record<Filter, string> = {
    PENDING: 'À valider',
    DEPOSITED: 'Déposés',
    MATCHED: 'Matchés',
};

export default function AgentDashboard() {
    const [declarations, setDeclarations] = useState<Declaration[]>([]);
    const [depositPointName, setDepositPointName] = useState('');
    const [filter, setFilter] = useState<Filter>('PENDING');
    const [isLoading, setIsLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [error, setError] = useState('');

    const fetchDeclarations = useCallback(async () => {
        setIsLoading(true);
        setError('');

        try {
            const response = await fetch(`/api/agent/declarations?status=${filter}`);

            if (response.status === 401 || response.status === 403) {
                window.location.href = '/login';
                return;
            }

            const data = await response.json();

            if (!response.ok) {
                setError(data.message || 'Chargement impossible');
                return;
            }

            setDeclarations(data.declarations || []);
            setDepositPointName(data.depositPoint?.name || '');
        } catch {
            setError('Connexion impossible');
        } finally {
            setIsLoading(false);
        }
    }, [filter]);

    useEffect(() => {
        fetchDeclarations();
    }, [fetchDeclarations]);

    const handleAction = async (declarationId: string, action: 'approve' | 'reject' | 'pickup') => {
        setActionLoading(declarationId);
        setError('');

        try {
            const response = await fetch('/api/agent/declarations', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ declarationId, action }),
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.message || 'Action impossible');
                return;
            }

            fetchDeclarations();
        } catch {
            setError('Action impossible');
        } finally {
            setActionLoading(null);
        }
    };

    return (
        <SenDocuShell>
            <header className="flex items-center justify-between px-5 pt-[calc(env(safe-area-inset-top)+18px)]">
                <Link href="/" className="grid h-9 w-9 place-items-center rounded-xl text-white">‹</Link>
                <div className="text-center">
                    <h1 className="text-xl font-black tracking-[-0.04em] text-white">Espace agent</h1>
                    {depositPointName && <p className="text-xs text-[#8094ad]">{depositPointName}</p>}
                </div>
                <button onClick={fetchDeclarations} className="grid h-9 w-9 place-items-center rounded-xl text-[#34f58b]">↻</button>
            </header>

            <section className="grid grid-cols-3 gap-2 px-5 pt-6">
                {(['PENDING', 'DEPOSITED', 'MATCHED'] as Filter[]).map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setFilter(tab)}
                        className={`rounded-[16px] px-3 py-3 text-sm font-black transition ${filter === tab
                            ? 'bg-[#34f58b] text-[#04111d]'
                            : 'border border-white/10 bg-white/[0.045] text-[#9aacbf]'
                            }`}
                    >
                        {filterLabels[tab]}
                    </button>
                ))}
            </section>

            <section className="space-y-3 px-5 pt-5">
                {error && (
                    <div className="rounded-[18px] border border-[#ff6b6b]/30 bg-[#ff6b6b]/10 p-4 text-sm text-[#ff8585]">
                        {error}
                    </div>
                )}

                {isLoading && <div className="sen-card p-5 text-[#9aacbf]">Chargement des dépôts...</div>}

                {!isLoading && declarations.length === 0 && !error && (
                    <div className="sen-card p-5">
                        <h2 className="text-2xl font-black tracking-[-0.05em] text-white">Aucun dossier</h2>
                        <p className="mt-3 text-sm leading-5 text-[#9aacbf]">
                            Aucun document dans cette catégorie pour votre point de dépôt.
                        </p>
                    </div>
                )}

                {declarations.map((declaration) => {
                    const status = statusConfig[declaration.status] || statusConfig.PENDING;

                    return (
                        <article key={declaration.id} className="sen-card-mini p-4">
                            <div className="flex items-start justify-between gap-3">
                                <div>
                                    <p className="font-black text-white">{declaration.docType}</p>
                                    <p className="mt-1 font-mono text-xs text-[#53a9ff]">{declaration.trackingCode}</p>
                                    <p className="mt-2 text-xs text-[#8094ad]">
                                        {new Date(declaration.createdAt).toLocaleDateString('fr-FR')} · {declaration.regionFound}
                                    </p>
                                </div>
                                <span className={`rounded-full px-3 py-1 text-xs font-black ${status.bg} ${status.color}`}>
                                    {status.label}
                                </span>
                            </div>

                            {declaration.status === 'PENDING' && (
                                <div className="mt-4 grid grid-cols-[1fr_auto] gap-2">
                                    <button
                                        className="sen-action min-h-10"
                                        onClick={() => handleAction(declaration.id, 'approve')}
                                        disabled={actionLoading === declaration.id}
                                    >
                                        Valider le dépôt
                                    </button>
                                    <button
                                        className="rounded-xl border border-[#ff6b6b]/30 bg-[#ff6b6b]/10 px-4 font-black text-[#ff8585]"
                                        onClick={() => handleAction(declaration.id, 'reject')}
                                        disabled={actionLoading === declaration.id}
                                    >
                                        Rejeter
                                    </button>
                                </div>
                            )}

                            {declaration.status === 'MATCHED' && (
                                <button
                                    className="sen-action mt-4 w-full"
                                    onClick={() => handleAction(declaration.id, 'pickup')}
                                    disabled={actionLoading === declaration.id}
                                >
                                    Confirmer le retrait
                                </button>
                            )}
                        </article>
                    );
                })}
            </section>
        </SenDocuShell>
    );
}
