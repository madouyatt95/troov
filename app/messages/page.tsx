import Link from 'next/link';
import { SenDocuShell } from '@/components/SenDocuShell';

const notifications = [
    ['Votre déclaration a été validée', 'Votre déclaration de CNI a été prise en compte.', '#34f58b', '✓'],
    ['Un document similaire a été signalé', 'Un document correspondant à votre déclaration a été trouvé à Guédiawaye.', '#f6c945', '!'],
    ['Point de retrait disponible', 'Votre document est disponible au Commissariat de Pikine.', '#53a9ff', '⌖'],
    ['Merci pour votre honnêteté', 'Votre signalement aide à sécuriser notre communauté.', '#b57cff', '✦'],
];

export default function MessagesPage() {
    return (
        <SenDocuShell>
            <header className="flex items-center justify-between px-5 pt-[calc(env(safe-area-inset-top)+18px)]">
                <Link href="/" className="grid h-9 w-9 place-items-center rounded-xl text-white">‹</Link>
                <h1 className="text-xl font-black tracking-[-0.04em] text-white">Messages</h1>
                <button className="grid h-9 w-9 place-items-center rounded-xl text-white">⋯</button>
            </header>

            <section className="mx-5 mt-5 grid grid-cols-2 rounded-[14px] border border-[#24e943]/25 bg-white/[0.035] p-1">
                <button className="rounded-[11px] bg-[#24e943]/12 py-3 text-sm font-black text-[#24e943]">Notifications</button>
                <button className="rounded-[11px] py-3 text-sm font-bold text-[#8ba0b8]">Messages sécurisés</button>
            </section>

            <section className="space-y-3 px-5 pt-5">
                {notifications.map(([title, body, color, icon]) => (
                    <article key={title} className="sen-card-mini p-4 shadow-[0_18px_35px_rgba(0,0,0,0.18)]">
                        <div className="flex gap-4">
                            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full text-lg font-black text-[#04111d]" style={{ backgroundColor: color }}>
                                {icon}
                            </div>
                            <div>
                                <h2 className="font-black tracking-[-0.02em] text-white">{title}</h2>
                                <p className="mt-1 text-sm leading-5 text-[#9aacbf]">{body}</p>
                                <p className="mt-3 text-xs font-semibold text-[#62758d]">Il y a 12 min</p>
                            </div>
                        </div>
                    </article>
                ))}
            </section>
        </SenDocuShell>
    );
}
