'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { SenIcon } from '@/components/SenIcon';

const tabs = [
    { href: '/', label: 'Accueil', icon: 'home' },
    { href: '/owner/report', label: 'Déclarer', icon: 'plus' },
    { href: '/map', label: 'Carte', icon: 'map' },
    { href: '/messages', label: 'Messages', icon: 'message' },
    { href: '/profile', label: 'Profil', icon: 'user' },
] as const;

export function BottomNav() {
    const pathname = usePathname();

    return (
        <nav className="fixed inset-x-0 bottom-0 z-40 mx-auto max-w-md border-t border-white/10 bg-[#07111f]/90 px-3 pb-[calc(env(safe-area-inset-bottom)+10px)] pt-2 shadow-[0_-20px_50px_rgba(0,0,0,0.35)] backdrop-blur-2xl">
            <div className="grid grid-cols-5 gap-1">
                {tabs.map((tab) => {
                    const active = tab.href === '/' ? pathname === '/' : pathname.startsWith(tab.href);
                    return (
                        <Link
                            key={tab.href}
                            href={tab.href}
                            className={`flex flex-col items-center justify-center gap-1 rounded-2xl py-2 text-[11px] transition ${active
                                ? 'bg-[#34f58b] text-[#05111d] shadow-[0_0_24px_rgba(52,245,139,0.35)]'
                                : 'text-[#7f91ad] hover:bg-white/5 hover:text-white'
                                }`}
                        >
                            <SenIcon name={tab.icon} className="h-5 w-5" />
                            <span className="font-semibold">{tab.label}</span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
