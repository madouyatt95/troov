'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { SenDocuShell } from '@/components/SenDocuShell';

type Message = {
    id: string;
    type: 'REPORT_CREATED' | 'MATCH_DETECTED';
    title: string;
    body: string;
    createdAt: string;
    href: string;
};

function formatDate(date: string) {
    return new Date(date).toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
    });
}

export default function MessagesPage() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isUnauthenticated, setIsUnauthenticated] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        fetch('/api/messages')
            .then((response) => {
                if (response.status === 401) {
                    setIsUnauthenticated(true);
                    return null;
                }
                if (!response.ok) throw new Error('Messages indisponibles');
                return response.json();
            })
            .then((data) => {
                if (data) setMessages(data.messages || []);
            })
            .catch(() => setError('Impossible de charger les messages'))
            .finally(() => setIsLoading(false));
    }, []);

    return (
        <SenDocuShell>
            <header className="flex items-center justify-between px-5 pt-[calc(env(safe-area-inset-top)+18px)]">
                <Link href="/" className="grid h-9 w-9 place-items-center rounded-xl text-white">‹</Link>
                <h1 className="text-xl font-black tracking-[-0.04em] text-white">Messages</h1>
                <span className="w-9" />
            </header>

            <section className="space-y-3 px-5 pt-6">
                {isLoading && (
                    <div className="sen-card p-5 text-[#9aacbf]">Chargement des messages...</div>
                )}

                {isUnauthenticated && (
                    <div className="sen-card p-5">
                        <h2 className="text-2xl font-black tracking-[-0.05em] text-white">Connexion requise</h2>
                        <p className="mt-3 text-sm leading-5 text-[#9aacbf]">
                            Connecte-toi pour voir tes notifications de recherche et de correspondance.
                        </p>
                        <Link href="/login" className="sen-action mt-5 w-full">Se connecter</Link>
                    </div>
                )}

                {error && !isUnauthenticated && (
                    <div className="rounded-[18px] border border-[#ff6b6b]/30 bg-[#ff6b6b]/10 p-4 text-sm text-[#ff8585]">
                        {error}
                    </div>
                )}

                {!isLoading && !isUnauthenticated && !error && messages.length === 0 && (
                    <div className="sen-card p-5">
                        <div className="grid h-14 w-14 place-items-center rounded-2xl bg-[#53a9ff]/12 text-2xl">🔔</div>
                        <h2 className="mt-5 text-2xl font-black tracking-[-0.05em] text-white">Aucune notification</h2>
                        <p className="mt-3 text-sm leading-5 text-[#9aacbf]">
                            Les messages apparaîtront ici quand une recherche sera créée ou qu’une correspondance sera détectée.
                        </p>
                    </div>
                )}

                {messages.map((message) => (
                    <Link key={message.id} href={message.href} className="sen-card-mini block p-4">
                        <div className="flex gap-4">
                            <div className={`grid h-12 w-12 shrink-0 place-items-center rounded-full text-lg font-black text-[#04111d] ${message.type === 'MATCH_DETECTED' ? 'bg-[#f6c945]' : 'bg-[#34f58b]'}`}>
                                {message.type === 'MATCH_DETECTED' ? '!' : '✓'}
                            </div>
                            <div>
                                <h2 className="font-black tracking-[-0.02em] text-white">{message.title}</h2>
                                <p className="mt-1 text-sm leading-5 text-[#9aacbf]">{message.body}</p>
                                <p className="mt-3 text-xs font-semibold text-[#62758d]">{formatDate(message.createdAt)}</p>
                            </div>
                        </div>
                    </Link>
                ))}
            </section>
        </SenDocuShell>
    );
}
