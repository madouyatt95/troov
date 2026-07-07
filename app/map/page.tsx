'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { SenDocuShell } from '@/components/SenDocuShell';

type DepositPoint = {
    id: string;
    name: string;
    type: string;
    address: string;
    phone?: string;
    hours?: string;
    region: string;
    lat: number;
    lng: number;
    distance?: number;
    isOpen?: boolean | null;
    serviceLabel?: string;
};

const filters = ['Tous', 'ADMIN', 'CITY_HALL', 'POLICE', 'PARTNER'];
const LiveMap = dynamic(() => import('@/components/LeafletMap').then((mod) => mod.LeafletMap), {
    ssr: false,
    loading: () => (
        <div className="flex h-full w-full items-center justify-center bg-[#07111f]">
            <div className="rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-3 text-sm font-bold text-[#9aacbf]">
                Préparation de la carte...
            </div>
        </div>
    ),
});

export default function MapPage() {
    const [points, setPoints] = useState<DepositPoint[]>([]);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [filter, setFilter] = useState('Tous');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [userPosition, setUserPosition] = useState<{ lat: number; lng: number } | null>(null);

    useEffect(() => {
        const loadPoints = (coords?: { lat: number; lng: number }) => {
            const query = coords
                ? `/api/deposit-points?limit=50&lat=${coords.lat}&lng=${coords.lng}`
                : '/api/deposit-points?limit=50';

            fetch(query)
                .then((response) => {
                    if (!response.ok) throw new Error('Impossible de charger les points');
                    return response.json();
                })
                .then((data) => {
                    const loadedPoints = data.depositPoints || [];
                    setPoints(loadedPoints);
                    setSelectedId(loadedPoints[0]?.id || null);
                })
                .catch(() => setError('Impossible de charger les points de dépôt'))
                .finally(() => setIsLoading(false));
        };

        if ('geolocation' in navigator) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const coords = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude,
                    };
                    setUserPosition(coords);
                    loadPoints(coords);
                },
                () => loadPoints(),
                { enableHighAccuracy: false, timeout: 5000, maximumAge: 600000 }
            );
            return;
        }

        loadPoints();
    }, []);

    const filteredPoints = useMemo(() => {
        if (filter === 'Tous') return points;
        if (filter === 'PARTNER') return points.filter((point) => ['PARTNER', 'OPERATOR_SHOP'].includes(point.type));
        return points.filter((point) => point.type === filter);
    }, [filter, points]);

    const selectedPoint = filteredPoints.find((point) => point.id === selectedId) || filteredPoints[0] || null;

    return (
        <SenDocuShell>
            <header className="flex items-center justify-between px-5 pt-[calc(env(safe-area-inset-top)+18px)]">
                <Link href="/" className="grid h-9 w-9 place-items-center rounded-xl text-white">‹</Link>
                <h1 className="text-xl font-black tracking-[-0.04em] text-white">Carte</h1>
                <span className="w-9" />
            </header>

            <section className="no-scrollbar flex gap-2 overflow-x-auto px-5 pt-6">
                {filters.map((item) => (
                    <button
                        key={item}
                        onClick={() => setFilter(item)}
                        className={`shrink-0 rounded-full px-4 py-2 text-sm font-bold ${filter === item ? 'bg-[#34f58b] text-[#04111d]' : 'border border-white/10 bg-white/[0.05] text-[#9aacbf]'}`}
                    >
                        {item === 'Tous' ? 'Tous' : item === 'ADMIN' ? 'Administration' : item === 'CITY_HALL' ? 'Mairie' : item === 'POLICE' ? 'Commissariat' : 'Partenaire'}
                    </button>
                ))}
            </section>

            <section className="px-5 pt-4">
                <div className="sen-card relative h-[520px] overflow-hidden p-0">
                    {isLoading ? (
                        <div className="flex h-full items-center justify-center bg-[radial-gradient(circle_at_50%_30%,rgba(83,169,255,0.18),transparent_35%),#07111f]">
                            <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-3 text-sm font-bold text-[#9aacbf]">
                                <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#34f58b] border-t-transparent" />
                                Chargement des points...
                            </div>
                        </div>
                    ) : (
                        <LiveMap
                            points={filteredPoints}
                            selectedId={selectedPoint?.id}
                            onSelect={(point) => setSelectedId(point.id)}
                            className="h-full"
                        />
                    )}

                    <div className="pointer-events-none absolute inset-x-5 top-5 flex items-center justify-between rounded-2xl border border-white/10 bg-[#07111f]/78 p-3 shadow-2xl backdrop-blur-xl">
                        <div>
                            <p className="text-xs font-semibold text-[#8094ad]">{userPosition ? 'Triés par distance' : 'Points chargés depuis l’API'}</p>
                            <p className="text-lg font-black text-white">{filteredPoints.length} point(s)</p>
                        </div>
                        <span className="rounded-full bg-[#34f58b]/15 px-3 py-1 text-xs font-bold text-[#34f58b]">{isLoading ? 'Load' : 'Live'}</span>
                    </div>

                    {error && (
                        <div className="absolute inset-x-6 top-28 rounded-2xl border border-[#ff6b6b]/30 bg-[#07111f]/90 p-4 text-sm text-[#ff8585] shadow-2xl backdrop-blur-xl">
                            {error}
                        </div>
                    )}

                    {!isLoading && filteredPoints.length === 0 && !error && (
                        <div className="absolute inset-x-6 top-28 rounded-2xl border border-[#f6c945]/30 bg-[#07111f]/90 p-4 text-sm text-[#f6d878] shadow-2xl backdrop-blur-xl">
                            Aucun point actif trouvé. Lance le seed ou ajoute des points de dépôt en base.
                        </div>
                    )}

                    {selectedPoint && (
                        <div className="absolute inset-x-4 bottom-4 rounded-[18px] border border-white/10 bg-[#07111f]/90 p-4 shadow-2xl backdrop-blur-2xl">
                            <div className="flex items-start justify-between gap-3">
                                <div>
                                    <p className="text-lg font-black text-white">{selectedPoint.name}</p>
                                    <p className="mt-1 text-sm text-[#9aacbf]">{selectedPoint.address}</p>
                                    <p className="mt-2 text-sm font-semibold text-[#53a9ff]">
                                        {selectedPoint.distance !== undefined && `${selectedPoint.distance} km • `}
                                        {selectedPoint.serviceLabel || 'Point SenDocu'}
                                    </p>
                                    <p className={`mt-1 text-xs font-black ${selectedPoint.isOpen ? 'text-[#34f58b]' : 'text-[#f6c945]'}`}>
                                        {selectedPoint.isOpen === null ? 'Horaires à confirmer' : selectedPoint.isOpen ? 'Ouvert maintenant' : 'Fermé actuellement'} · {selectedPoint.hours || 'Horaires non renseignés'}
                                    </p>
                                </div>
                                {selectedPoint.phone && (
                                    <a href={`tel:${selectedPoint.phone}`} className="grid h-10 w-10 place-items-center rounded-xl bg-white/10 text-xl text-[#24e943]">☎</a>
                                )}
                            </div>
                            <Link href={`https://maps.google.com/?q=${selectedPoint.lat},${selectedPoint.lng}`} className="sen-action mt-4 w-full">
                                Itinéraire
                            </Link>
                        </div>
                    )}
                </div>
            </section>
        </SenDocuShell>
    );
}
