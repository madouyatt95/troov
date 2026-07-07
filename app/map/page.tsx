import Link from 'next/link';
import { SenDocuShell } from '@/components/SenDocuShell';

const filters = ['Tous', 'Commissariat', 'Mairie', 'Partenaire', 'Point SenDocu'];
const cities = [
    { name: 'Dakar', x: '20%', y: '30%', color: '#34f58b' },
    { name: 'Pikine', x: '42%', y: '42%', color: '#53a9ff' },
    { name: 'Guédiawaye', x: '56%', y: '32%', color: '#f6c945' },
    { name: 'Rufisque', x: '70%', y: '52%', color: '#34f58b' },
    { name: 'Thiès', x: '46%', y: '68%', color: '#b57cff' },
];

export default function MapPage() {
    return (
        <SenDocuShell>
            <header className="flex items-center justify-between px-5 pt-[calc(env(safe-area-inset-top)+18px)]">
                <Link href="/" className="grid h-9 w-9 place-items-center rounded-xl text-white">‹</Link>
                <h1 className="text-xl font-black tracking-[-0.04em] text-white">Carte</h1>
                <button className="grid h-9 w-9 place-items-center rounded-xl text-white">⌕</button>
            </header>

            <section className="no-scrollbar flex gap-2 overflow-x-auto px-5 pt-6">
                {filters.map((filter, index) => (
                    <button
                        key={filter}
                        className={`shrink-0 rounded-full px-4 py-2 text-sm font-bold ${index === 0 ? 'bg-[#34f58b] text-[#04111d]' : 'border border-white/10 bg-white/[0.05] text-[#9aacbf]'}`}
                    >
                        {filter}
                    </button>
                ))}
            </section>

            <section className="px-5 pt-4">
                <div className="sen-card relative h-[390px] overflow-hidden p-0">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_42%_38%,rgba(83,169,255,0.28),transparent_25%),linear-gradient(145deg,#0b2138,#06111f)]" />
                    <div className="absolute inset-0 opacity-35 [background-image:linear-gradient(rgba(83,169,255,.12)_1px,transparent_1px),linear-gradient(90deg,rgba(83,169,255,.12)_1px,transparent_1px)] [background-size:28px_28px]" />
                    <div className="absolute left-[18%] top-[14%] h-[250px] w-[210px] rotate-[-18deg] rounded-[48%_52%_50%_44%] border border-[#53a9ff]/35 bg-[#102845]/70 shadow-[0_0_70px_rgba(83,169,255,0.18)]" />
                    <div className="absolute left-[36%] top-[32%] h-[180px] w-[145px] rotate-[16deg] rounded-[52%_44%_58%_46%] border border-[#34f58b]/25 bg-[#0f3b35]/35" />
                    <div className="absolute inset-x-8 top-5 flex items-center justify-between rounded-2xl border border-white/10 bg-[#07111f]/70 p-3 backdrop-blur-xl">
                        <div>
                            <p className="text-xs font-semibold text-[#8094ad]">Points proches</p>
                            <p className="text-lg font-black text-white">98 partenaires actifs</p>
                        </div>
                        <span className="rounded-full bg-[#34f58b]/15 px-3 py-1 text-xs font-bold text-[#34f58b]">Live</span>
                    </div>
                    {cities.map((city) => (
                        <div key={city.name} className="absolute" style={{ left: city.x, top: city.y }}>
                            <div className="relative">
                                <span className="absolute -inset-3 rounded-full opacity-30 blur-md" style={{ background: city.color }} />
                                <span className="relative block h-5 w-5 rounded-full border-2 border-white" style={{ background: city.color }} />
                                <span className="absolute left-6 top-[-2px] whitespace-nowrap rounded-full bg-[#07111f]/80 px-2 py-1 text-[10px] font-bold text-white">{city.name}</span>
                            </div>
                        </div>
                    ))}
                    <div className="absolute inset-x-4 bottom-4 rounded-[18px] border border-white/10 bg-[#07111f]/90 p-4 shadow-2xl backdrop-blur-2xl">
                        <div className="flex items-start justify-between gap-3">
                            <div>
                                <p className="text-lg font-black text-white">Commissariat de Pikine</p>
                                <p className="mt-1 text-sm text-[#9aacbf]">1,2 km • Ouvert jusqu’à 18h00</p>
                                <p className="mt-2 text-sm font-semibold text-[#53a9ff]">Dépôt et retrait disponibles</p>
                            </div>
                            <a href="tel:+221338000000" className="grid h-10 w-10 place-items-center rounded-xl bg-white/10 text-xl text-[#24e943]">☎</a>
                        </div>
                        <Link href="https://maps.google.com/?q=Commissariat%20de%20Pikine" className="sen-action mt-4 w-full">
                            Itinéraire
                        </Link>
                    </div>
                </div>
            </section>
        </SenDocuShell>
    );
}
