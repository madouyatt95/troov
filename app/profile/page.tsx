import Link from 'next/link';
import { SenDocuShell } from '@/components/SenDocuShell';

const menu = [
    ['Mes déclarations', '📄'],
    ['Documents retrouvés', '✅'],
    ['Points de retrait favoris', '📍'],
    ['Langue de l’application', '🌍', 'Français'],
    ['Confidentialité et sécurité', '🛡️'],
    ['Paramètres', '⚙️'],
    ['Aide et support', '💬'],
];

export default function ProfilePage() {
    return (
        <SenDocuShell>
            <header className="flex items-center justify-between px-5 pt-[calc(env(safe-area-inset-top)+18px)]">
                <Link href="/" className="grid h-9 w-9 place-items-center rounded-xl text-white">‹</Link>
                <h1 className="text-xl font-black tracking-[-0.04em] text-white">Profil</h1>
                <button className="grid h-9 w-9 place-items-center rounded-xl text-white">✎</button>
            </header>

            <section className="px-5 pt-6">
                <div className="sen-card p-5 text-center">
                    <div className="mx-auto grid h-24 w-24 place-items-center rounded-full border-[5px] border-[#24e943] bg-gradient-to-br from-[#f7c37d] to-[#8b4a25] text-4xl shadow-[0_0_44px_rgba(52,245,139,0.20)]">
                        👨🏾
                    </div>
                    <h2 className="mt-4 text-2xl font-black tracking-[-0.04em] text-white">Mamadou Diallo</h2>
                    <p className="mt-1 text-[#9aacbf]">+221 77 123 45 67</p>
                    <div className="mx-auto mt-4 inline-flex items-center gap-2 rounded-full bg-[#24e943]/14 px-4 py-2 text-sm font-black text-[#24e943]">
                        <span>✓</span> Téléphone vérifié
                    </div>
                </div>
            </section>

            <section className="space-y-3 px-5 pt-5">
                {menu.map(([label, icon, meta]) => (
                    <button key={label} className="flex w-full items-center gap-4 rounded-[14px] border border-white/10 bg-white/[0.045] p-4 text-left">
                        <span className="grid h-9 w-9 place-items-center rounded-xl bg-white/8 text-lg">{icon}</span>
                        <span className="flex-1 font-bold text-white">{label}</span>
                        {meta && <span className="text-sm font-semibold text-[#34f58b]">{meta}</span>}
                        <span className="text-[#62758d]">›</span>
                    </button>
                ))}
            </section>

            <section className="px-5 pt-5">
                <button className="w-full rounded-[22px] border border-[#ff6b6b]/20 bg-[#ff6b6b]/10 py-4 font-black text-[#ff8585]">
                    Se déconnecter
                </button>
            </section>
        </SenDocuShell>
    );
}
