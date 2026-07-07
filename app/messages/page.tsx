'use client';

import Link from 'next/link';
import { SenDocuShell } from '@/components/SenDocuShell';

export default function MessagesPage() {
    return (
        <SenDocuShell>
            <header className="flex items-center justify-between px-5 pt-[calc(env(safe-area-inset-top)+18px)]">
                <Link href="/" className="grid h-9 w-9 place-items-center rounded-xl text-white">‹</Link>
                <h1 className="text-xl font-black tracking-[-0.04em] text-white">Messages</h1>
                <span className="w-9" />
            </header>

            <section className="px-5 pt-6">
                <div className="sen-card p-5">
                    <div className="grid h-14 w-14 place-items-center rounded-2xl bg-[#53a9ff]/12 text-2xl">🔔</div>
                    <h2 className="mt-5 text-2xl font-black tracking-[-0.05em] text-white">Aucune notification réelle</h2>
                    <p className="mt-3 text-sm leading-5 text-[#9aacbf]">
                        Les messages apparaîtront ici quand une déclaration sera validée, rapprochée ou disponible au retrait.
                    </p>
                    <div className="mt-5 grid grid-cols-2 gap-3">
                        <Link href="/owner" className="rounded-[16px] border border-white/10 bg-white/[0.045] p-4 text-center text-sm font-black text-white">
                            Mes recherches
                        </Link>
                        <Link href="/status" className="rounded-[16px] border border-[#53a9ff]/30 bg-[#53a9ff]/10 p-4 text-center text-sm font-black text-[#53a9ff]">
                            Suivre un code
                        </Link>
                    </div>
                </div>
            </section>
        </SenDocuShell>
    );
}
