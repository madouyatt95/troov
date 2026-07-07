'use client';

import { useState } from 'react';
import Link from 'next/link';
import { SenDocuShell } from '@/components/SenDocuShell';

export default function FinderPage() {
    const [photoName, setPhotoName] = useState('');
    const [submitted, setSubmitted] = useState(false);

    return (
        <SenDocuShell withNav={false}>
            <header className="flex items-center justify-between px-5 pt-[calc(env(safe-area-inset-top)+18px)]">
                <Link href="/" className="grid h-9 w-9 place-items-center rounded-xl text-white">‹</Link>
                <h1 className="text-lg font-black tracking-[-0.03em] text-white">J’ai trouvé un document</h1>
                <span className="w-11" />
            </header>

            <section className="px-5 pt-7 text-center">
                <div className="sen-card relative mx-auto h-64 overflow-hidden p-5">
                    <div className="absolute inset-5 rounded-[30px] border-2 border-dashed border-[#34f58b]/45" />
                    <div className="absolute left-1/2 top-1/2 h-28 w-44 -translate-x-1/2 -translate-y-1/2 rotate-[-7deg] rounded-[24px] border border-white/15 bg-gradient-to-br from-[#dfe9f4]/20 to-[#53a9ff]/10 p-4 shadow-[0_26px_55px_rgba(0,0,0,0.35)]">
                        <div className="h-10 w-10 rounded-full bg-[#53a9ff]/50" />
                        <div className="mt-4 h-2 w-28 rounded bg-white/45" />
                        <div className="mt-2 h-2 w-20 rounded bg-white/25" />
                    </div>
                    <div className="absolute bottom-7 left-1/2 -translate-x-1/2 rounded-full bg-[#07111f]/80 px-4 py-2 text-xs font-black text-[#34f58b] backdrop-blur-xl">
                        Zone de scan sécurisée
                    </div>
                </div>

                <h2 className="mt-7 text-3xl font-black tracking-[-0.06em] text-white">Bravo !</h2>
                <p className="mx-auto mt-3 max-w-xs text-base leading-6 text-[#9aacbf]">
                    Vous pouvez aider quelqu’un à récupérer son document.
                </p>

                <label className="sen-action mt-7 w-full cursor-pointer">
                    Photographier le document
                    <input
                        type="file"
                        accept="image/*,.pdf"
                        capture="environment"
                        className="hidden"
                        onChange={(e) => setPhotoName(e.target.files?.[0]?.name || '')}
                    />
                </label>
                <p className="mt-3 text-xs font-semibold text-[#8094ad]">Les données sensibles seront floutées automatiquement.</p>

                {photoName && (
                    <div className="sen-card-mini mt-5 p-4 text-left">
                        <p className="text-sm font-black text-white">Analyse prête</p>
                        <p className="mt-1 text-xs text-[#9aacbf]">{photoName}</p>
                        <div className="mt-4 grid grid-cols-2 gap-2 text-xs font-bold">
                            {['Type détecté', 'Nom lu', 'Données floutées', 'Recherche lancée'].map((item) => (
                                <span key={item} className="rounded-full bg-[#34f58b]/12 px-3 py-2 text-[#34f58b]">✓ {item}</span>
                            ))}
                        </div>
                        <button className="sen-action mt-4 w-full" onClick={() => setSubmitted(true)}>
                            Signaler sans compte
                        </button>
                    </div>
                )}

                {submitted && (
                    <div className="mt-5 rounded-[24px] border border-[#34f58b]/35 bg-[#34f58b]/10 p-4 text-left">
                        <p className="font-black text-[#34f58b]">Signalement enregistré</p>
                        <p className="mt-1 text-sm text-[#9aacbf]">
                            Une correspondance potentielle sera vérifiée par SenDocu. Déposez le document dans un point sécurisé.
                        </p>
                        <Link href="/map" className="mt-4 inline-flex font-black text-[#53a9ff]">Voir les points SenDocu →</Link>
                    </div>
                )}

                <div className="mt-6 rounded-[24px] border border-[#f6c945]/25 bg-[#f6c945]/10 p-4 text-left">
                    <p className="text-sm leading-5 text-[#f6d878]">
                        Ne remettez jamais le document directement à un inconnu. SenDocu s’occupe de le remettre au propriétaire légitime.
                    </p>
                </div>
            </section>
        </SenDocuShell>
    );
}
