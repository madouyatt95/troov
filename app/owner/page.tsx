'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { SenDocuShell } from '@/components/SenDocuShell';

interface Report {
    id: string;
    docType: 'CNI' | 'PASSPORT';
    status: 'SEARCHING' | 'MATCHED' | 'RECOVERED' | 'CANCELLED';
    createdAt: string;
    matchCount?: number;
    matchId?: string | null;
}

const statusConfig = {
    SEARCHING: { label: 'Recherche active', color: 'text-[#f6c945]', bg: 'bg-[#f6c945]/12', icon: '⌕' },
    MATCHED: { label: 'Correspondance détectée', color: 'text-[#34f58b]', bg: 'bg-[#34f58b]/12', icon: '!' },
    RECOVERED: { label: 'Document récupéré', color: 'text-[#53a9ff]', bg: 'bg-[#53a9ff]/12', icon: '✓' },
    CANCELLED: { label: 'Annulée', color: 'text-[#8ba0b8]', bg: 'bg-white/8', icon: '×' },
};

const docTypeLabels = {
    CNI: 'Carte nationale d’identité',
    PASSPORT: 'Passeport',
};

export default function OwnerDashboard() {
    const [reports, setReports] = useState<Report[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetch('/api/reports')
            .then((response) => {
                if (response.status === 401) {
                    window.location.href = '/login';
                    return null;
                }
                if (!response.ok) throw new Error('Erreur lors du chargement');
                return response.json();
            })
            .then((data) => {
                if (data) setReports(data.reports || []);
            })
            .catch(() => setError('Impossible de charger vos recherches'))
            .finally(() => setIsLoading(false));
    }, []);

    const activeReports = reports.filter((report) => report.status === 'SEARCHING').length;
    const matchedReports = reports.filter((report) => report.status === 'MATCHED').length;

    return (
        <SenDocuShell>
            <header className="flex items-center justify-between px-5 pt-[calc(env(safe-area-inset-top)+18px)]">
                <Link href="/" className="grid h-9 w-9 place-items-center rounded-xl text-white">‹</Link>
                <h1 className="text-xl font-black tracking-[-0.04em] text-white">Mes recherches</h1>
                <Link href="/owner/report" className="grid h-9 w-9 place-items-center rounded-xl text-[#34f58b]">＋</Link>
            </header>

            <section className="grid grid-cols-2 gap-3 px-5 pt-6">
                <div className="sen-card-mini p-4">
                    <p className="text-2xl font-black text-white">{activeReports}</p>
                    <p className="mt-1 text-xs text-[#8094ad]">Recherches actives</p>
                </div>
                <div className="sen-card-mini p-4">
                    <p className="text-2xl font-black text-[#34f58b]">{matchedReports}</p>
                    <p className="mt-1 text-xs text-[#8094ad]">Correspondances</p>
                </div>
            </section>

            <section className="space-y-3 px-5 pt-5">
                {isLoading && <div className="sen-card p-5 text-[#9aacbf]">Chargement...</div>}

                {error && (
                    <div className="rounded-[18px] border border-[#ff6b6b]/30 bg-[#ff6b6b]/10 p-4 text-sm text-[#ff8585]">
                        {error}
                    </div>
                )}

                {!isLoading && !error && reports.length === 0 && (
                    <div className="sen-card p-5">
                        <h2 className="text-2xl font-black tracking-[-0.05em] text-white">Aucune recherche</h2>
                        <p className="mt-3 text-sm leading-5 text-[#9aacbf]">
                            Déclare une perte pour que SenDocu commence à surveiller les signalements trouvés.
                        </p>
                        <Link href="/owner/report" className="sen-action mt-5 w-full">
                            Déclarer une perte
                        </Link>
                    </div>
                )}

                {reports.map((report) => {
                    const status = statusConfig[report.status];
                    const content = (
                        <div className={`sen-card-mini block border ${report.status === 'MATCHED' ? 'border-[#34f58b]/40' : 'border-white/10'} p-4`}>
                            <div className="flex items-center gap-4">
                                <div className={`grid h-12 w-12 place-items-center rounded-2xl ${status.bg} ${status.color} text-xl font-black`}>
                                    {status.icon}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="font-black text-white">{docTypeLabels[report.docType]}</p>
                                    <p className={`mt-1 text-sm font-semibold ${status.color}`}>{status.label}</p>
                                    <p className="mt-1 text-xs text-[#62758d]">
                                        Créée le {new Date(report.createdAt).toLocaleDateString('fr-FR')}
                                    </p>
                                </div>
                                <span className="text-[#62758d]">›</span>
                            </div>
                        </div>
                    );

                    if (report.status === 'MATCHED' && report.matchId) {
                        return <Link key={report.id} href={`/owner/match/${report.matchId}`}>{content}</Link>;
                    }

                    return <div key={report.id}>{content}</div>;
                })}
            </section>
        </SenDocuShell>
    );
}
