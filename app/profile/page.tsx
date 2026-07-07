'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { SenDocuShell } from '@/components/SenDocuShell';
import { SenIcon } from '@/components/SenIcon';

type Profile = {
    id: string;
    points: number;
    level: number;
    badges: string[];
    trustScore: number;
    declarationsCount: number;
    createdAt: string;
    role: string;
};

const menu = [
    ['Mes déclarations', 'doc', '/owner'],
    ['Déclarer une perte', 'plus', '/owner/report'],
    ['Signaler un document trouvé', 'shield', '/finder'],
    ['Points de dépôt et retrait', 'pin', '/map'],
    ['Suivre un code', 'hash', '/status'],
] as const;

export default function ProfilePage() {
    const [profile, setProfile] = useState<Profile | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isUnauthenticated, setIsUnauthenticated] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        fetch('/api/profile')
            .then((response) => {
                if (response.status === 401) {
                    setIsUnauthenticated(true);
                    return null;
                }
                if (!response.ok) throw new Error('Profil indisponible');
                return response.json();
            })
            .then((data) => {
                if (data) setProfile(data);
            })
            .catch(() => setError('Impossible de charger le profil'))
            .finally(() => setIsLoading(false));
    }, []);

    return (
        <SenDocuShell>
            <header className="flex items-center justify-between px-5 pt-[calc(env(safe-area-inset-top)+18px)]">
                <Link href="/" className="grid h-9 w-9 place-items-center rounded-xl text-white">‹</Link>
                <h1 className="text-xl font-black tracking-[-0.04em] text-white">Profil</h1>
                <span className="w-9" />
            </header>

            <section className="px-5 pt-6">
                <div className="sen-card p-5 text-center">
                    <div className="mx-auto grid h-24 w-24 place-items-center rounded-full border-[5px] border-[#24e943] bg-gradient-to-br from-[#163d35] to-[#0f2134] text-3xl shadow-[0_0_44px_rgba(52,245,139,0.20)]">
                        {profile ? `N${profile.level}` : '👤'}
                    </div>

                    {isLoading && (
                        <>
                            <h2 className="mt-4 text-2xl font-black tracking-[-0.04em] text-white">Chargement...</h2>
                            <p className="mt-1 text-[#9aacbf]">Lecture du profil réel</p>
                        </>
                    )}

                    {isUnauthenticated && (
                        <>
                            <h2 className="mt-4 text-2xl font-black tracking-[-0.04em] text-white">Non connecté</h2>
                            <p className="mt-1 text-[#9aacbf]">Connecte-toi pour voir ton vrai profil SenDocu.</p>
                            <Link href="/login" className="sen-action mt-5 w-full">
                                Se connecter
                            </Link>
                        </>
                    )}

                    {error && !isUnauthenticated && (
                        <>
                            <h2 className="mt-4 text-2xl font-black tracking-[-0.04em] text-white">Profil indisponible</h2>
                            <p className="mt-1 text-[#ff8585]">{error}</p>
                        </>
                    )}

                    {profile && (
                        <>
                            <h2 className="mt-4 text-2xl font-black tracking-[-0.04em] text-white">Compte SenDocu</h2>
                            <p className="mt-1 text-[#9aacbf]">Rôle : {profile.role}</p>
                            <div className="mx-auto mt-4 inline-flex items-center gap-2 rounded-full bg-[#24e943]/14 px-4 py-2 text-sm font-black text-[#24e943]">
                                <span>✓</span> Session vérifiée
                            </div>
                        </>
                    )}
                </div>
            </section>

            {profile && (
                <section className="grid grid-cols-3 gap-3 px-5 pt-5">
                    {[
                        [profile.points, 'Points'],
                        [profile.declarationsCount, 'Signalements'],
                        [profile.trustScore, 'Confiance'],
                    ].map(([value, label]) => (
                        <div key={label} className="rounded-[18px] border border-white/10 bg-white/[0.045] p-3 text-center">
                            <p className="text-xl font-black text-white">{value}</p>
                            <p className="mt-1 text-[10px] text-[#8094ad]">{label}</p>
                        </div>
                    ))}
                </section>
            )}

            <section className="space-y-3 px-5 pt-5">
                {menu.map(([label, icon, href]) => (
                    <Link key={label} href={href} className="flex w-full items-center gap-4 rounded-[14px] border border-white/10 bg-white/[0.045] p-4 text-left">
                        <span className="grid h-9 w-9 place-items-center rounded-xl bg-white/8 text-[#34f58b]">
                            <SenIcon name={icon} className="h-5 w-5" />
                        </span>
                        <span className="flex-1 font-bold text-white">{label}</span>
                        <span className="text-[#62758d]">›</span>
                    </Link>
                ))}
            </section>

            {profile && (
                <section className="px-5 pt-5">
                    <Link href="/login" className="block w-full rounded-[22px] border border-[#ff6b6b]/20 bg-[#ff6b6b]/10 py-4 text-center font-black text-[#ff8585]">
                        Changer de compte
                    </Link>
                </section>
            )}
        </SenDocuShell>
    );
}
