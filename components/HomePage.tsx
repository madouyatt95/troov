'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { SenDocuLogo } from '@/components/SenDocuLogo';
import { SenDocuShell } from '@/components/SenDocuShell';

const timeline = ['Déclaré', 'Reçu', 'Vérifié', 'Retrouvé', 'Retrait'];

type Stats = {
    documentsRecovered: number;
    activeSearches: number;
    pendingDeclarations: number;
    matchRate: number;
};

export default function HomePage() {
    const [stats, setStats] = useState<Stats | null>(null);
    const [statsError, setStatsError] = useState(false);

    useEffect(() => {
        let mounted = true;

        fetch('/api/stats')
            .then((response) => {
                if (!response.ok) throw new Error('Stats unavailable');
                return response.json();
            })
            .then((data) => {
                if (mounted) setStats(data);
            })
            .catch(() => {
                if (mounted) setStatsError(true);
            });

        return () => {
            mounted = false;
        };
    }, []);

    const statCards = [
        [stats ? stats.pendingDeclarations.toLocaleString('fr-FR') : '—', 'Documents signalés'],
        [stats ? stats.activeSearches.toLocaleString('fr-FR') : '—', 'Recherches actives'],
        [stats ? `${stats.matchRate}%` : '—', 'Taux de match'],
    ];

    return (
        <SenDocuShell>
            <header className="flex items-center justify-between px-5 pt-[calc(env(safe-area-inset-top)+18px)]">
                <button className="grid h-9 w-9 place-items-center rounded-xl text-2xl text-[#a8b5c8]">≡</button>
                <SenDocuLogo />
                <Link href="/messages" className="relative grid h-9 w-9 place-items-center rounded-xl text-xl">
                    🔔
                    {stats && stats.pendingDeclarations > 0 && (
                        <span className="absolute right-1.5 top-1 h-4 min-w-4 rounded-full bg-[#f3c316] px-1 text-center text-[9px] font-black leading-4 text-[#07111f]">
                            {Math.min(stats.pendingDeclarations, 9)}
                        </span>
                    )}
                </Link>
            </header>

            <section className="px-5 pt-4">
                <h1 className="text-[26px] font-black leading-none tracking-[-0.05em] text-white">Bonjour 👋</h1>
                <p className="mt-1 text-base text-[#a8b5c8]">Que veux-tu faire aujourd’hui ?</p>
            </section>

            <section className="px-5 pt-4">
                <Link href="/owner/report" className="sen-card block overflow-hidden border-[#6c6bff]/35 p-5">
                    <div className="flex items-start justify-between gap-5">
                        <div className="max-w-[12rem]">
                            <h2 className="text-[22px] font-black leading-[1.03] tracking-[-0.04em] text-white">J’ai perdu un document</h2>
                            <p className="mt-4 text-xs leading-4 text-[#b7c3d2]">
                                Crée une vraie recherche liée à ton compte et reçois une alerte en cas de correspondance.
                            </p>
                        </div>
                        <div className="relative mt-2 h-28 w-24 shrink-0">
                            <div className="absolute inset-x-1 top-3 h-24 rotate-6 rounded-[22px] border border-[#53a9ff]/40 bg-gradient-to-br from-[#18385a] to-[#0d1b30] shadow-[0_20px_60px_rgba(21,128,255,0.22)]" />
                            <div className="absolute left-0 top-0 h-24 w-20 -rotate-6 rounded-[22px] border border-white/15 bg-gradient-to-br from-white/18 to-white/5 p-3 backdrop-blur-xl">
                                <div className="h-7 w-7 rounded-full bg-[#53a9ff]/60" />
                                <div className="mt-4 h-1.5 w-12 rounded bg-white/40" />
                                <div className="mt-2 h-1.5 w-9 rounded bg-white/25" />
                            </div>
                            <div className="absolute bottom-1 right-0 grid h-9 w-9 place-items-center rounded-full bg-[#34f58b] text-lg shadow-[0_0_26px_rgba(52,245,139,0.55)]">🛡️</div>
                        </div>
                    </div>
                    <div className="mt-4 inline-flex h-10 w-40 items-center justify-center rounded-xl bg-[#24e943] text-[12px] font-black text-[#04111d] shadow-[0_12px_35px_rgba(52,245,139,0.28)]">
                        Déclarer une perte
                    </div>
                </Link>
            </section>

            <section className="grid grid-cols-2 gap-3 px-5 pt-4">
                <Link href="/finder" className="sen-card-mini min-h-[120px] border-[#24e943]/35 p-4">
                    <h3 className="text-[17px] font-black leading-5 text-white">J’ai trouvé un document</h3>
                    <p className="mt-3 text-xs leading-4 text-[#58e276]">Créer un vrai signalement sans compte</p>
                    <div className="mt-3 text-right text-2xl text-[#24e943]">➤</div>
                </Link>
                <Link href="/status" className="sen-card-mini min-h-[120px] p-4">
                    <h3 className="text-[17px] font-black leading-5 text-white">Scanner / vérifier un document</h3>
                    <p className="mt-3 text-xs leading-4 text-[#b7c3d2]">Suivre un code de dépôt réel</p>
                    <div className="mt-3 text-right text-2xl text-[#15a8ff]">⌘</div>
                </Link>
            </section>

            <section className="px-5 pt-6">
                <div className="mb-3 flex items-center justify-between">
                    <h2 className="text-lg font-black tracking-[-0.03em] text-white">Activité réelle</h2>
                    <Link href="/owner" className="text-xs font-semibold text-[#b7c3d2]">Voir mes recherches ›</Link>
                </div>
                <div className="sen-card p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-base font-black text-white">
                                {stats ? `${stats.activeSearches} recherche(s) active(s)` : 'Chargement des données'}
                            </p>
                            <p className="mt-1 text-xs text-[#8094ad]">
                                {statsError ? 'Base de données ou variables Vercel à vérifier' : 'Données lues depuis l’API /api/stats'}
                            </p>
                        </div>
                        <span className="rounded-lg bg-[#d6b80f]/18 px-2 py-1 text-xs font-black text-[#f3c316]">
                            Live
                        </span>
                    </div>
                    <div className="mt-5 grid grid-cols-5 gap-1">
                        {timeline.map((step, index) => (
                            <div key={step} className="text-center">
                                <div className={`mx-auto h-2 rounded-full ${index < 2 ? 'bg-[#34f58b]' : 'bg-white/10'}`} />
                                <p className={`mt-2 text-[10px] font-semibold ${index < 2 ? 'text-[#34f58b]' : 'text-[#61728a]'}`}>{step}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="grid grid-cols-3 gap-3 px-5 pt-4">
                {statCards.map(([value, label]) => (
                    <div key={label} className="rounded-[22px] border border-white/10 bg-white/[0.045] p-3 text-center">
                        <p className="text-lg font-black text-white">{value}</p>
                        <p className="mt-1 text-[10px] leading-3 text-[#8094ad]">{label}</p>
                    </div>
                ))}
            </section>
        </SenDocuShell>
    );
}
