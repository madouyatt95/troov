'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
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

function markerPosition(point: DepositPoint) {
    const minLat = 12.0;
    const maxLat = 16.8;
    const minLng = -17.7;
    const maxLng = -11.2;
    const x = Math.min(86, Math.max(12, ((point.lng - minLng) / (maxLng - minLng)) * 74 + 12));
    const y = Math.min(82, Math.max(18, (1 - (point.lat - minLat) / (maxLat - minLat)) * 64 + 18));
    return { left: `${x}%`, top: `${y}%` };
}

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
                <div className="sen-card relative h-[430px] overflow-hidden p-0">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_42%_38%,rgba(83,169,255,0.28),transparent_25%),linear-gradient(145deg,#0b2138,#06111f)]" />
                    <div className="absolute inset-0 opacity-35 [background-image:linear-gradient(rgba(83,169,255,.12)_1px,transparent_1px),linear-gradient(90deg,rgba(83,169,255,.12)_1px,transparent_1px)] [background-size:28px_28px]" />
                    <div className="absolute left-[18%] top-[14%] h-[250px] w-[210px] rotate-[-18deg] rounded-[48%_52%_50%_44%] border border-[#53a9ff]/35 bg-[#102845]/70 shadow-[0_0_70px_rgba(83,169,255,0.18)]" />
                    <div className="absolute left-[36%] top-[32%] h-[180px] w-[145px] rotate-[16deg] rounded-[52%_44%_58%_46%] border border-[#34f58b]/25 bg-[#0f3b35]/35" />
                    <div className="absolute inset-x-8 top-5 flex items-center justify-between rounded-2xl border border-white/10 bg-[#07111f]/70 p-3 backdrop-blur-xl">
                        <div>
                            <p className="text-xs font-semibold text-[#8094ad]">{userPosition ? 'Triés par distance' : 'Points chargés depuis l’API'}</p>
                            <p className="text-lg font-black text-white">{filteredPoints.length} point(s)</p>
                        </div>
                        <span className="rounded-full bg-[#34f58b]/15 px-3 py-1 text-xs font-bold text-[#34f58b]">{isLoading ? 'Load' : 'Live'}</span>
                    </div>

                    {error && (
                        <div className="absolute inset-x-6 top-28 rounded-2xl border border-[#ff6b6b]/30 bg-[#ff6b6b]/10 p-4 text-sm text-[#ff8585]">
                            {error}
                        </div>
                    )}

                    {!isLoading && filteredPoints.length === 0 && !error && (
                        <div className="absolute inset-x-6 top-28 rounded-2xl border border-[#f6c945]/30 bg-[#f6c945]/10 p-4 text-sm text-[#f6d878]">
                            Aucun point actif trouvé. Lance le seed ou ajoute des points de dépôt en base.
                        </div>
                    )}

                    {filteredPoints.map((point, index) => (
                        <button
                            key={point.id}
                            onClick={() => setSelectedId(point.id)}
                            className="absolute"
                            style={markerPosition(point)}
                            aria-label={point.name}
                        >
                            <span className={`absolute -inset-4 rounded-full blur-md ${selectedPoint?.id === point.id ? 'bg-[#34f58b]/35' : 'bg-[#53a9ff]/20'}`} />
                            <span className={`relative block h-5 w-5 rounded-full border-2 border-white ${selectedPoint?.id === point.id ? 'bg-[#34f58b]' : index % 3 === 0 ? 'bg-[#f6c945]' : 'bg-[#53a9ff]'}`} />
                        </button>
                    ))}

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
