'use client';

import { useEffect, useState } from 'react';

interface DepositPoint {
    id: string;
    name: string;
    address: string;
    lat: number;
    lng: number;
    region: string;
    type?: string;
    phone?: string;
    hours?: string;
    distance?: number;
}

interface DepositMapProps {
    onSelect: (point: DepositPoint) => void;
    selectedId?: string;
}

export function DepositMap({ onSelect, selectedId }: DepositMapProps) {
    const [points, setPoints] = useState<DepositPoint[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [MapComponent, setMapComponent] = useState<React.ComponentType<{
        points: DepositPoint[];
        onSelect: (point: DepositPoint) => void;
        selectedId?: string;
    }> | null>(null);

    // Fetch deposit points from API
    useEffect(() => {
        fetch('/api/deposit-points')
            .then((res) => res.json())
            .then((data) => {
                if (data.depositPoints) {
                    setPoints(data.depositPoints);
                }
                setLoading(false);
            })
            .catch(() => {
                setError(true);
                setLoading(false);
            });
    }, []);

    // Dynamically import Leaflet only on client-side
    useEffect(() => {
        // This ONLY runs on the client
        import('./LeafletMap')
            .then((mod) => setMapComponent(() => mod.LeafletMap))
            .catch(() => setError(true));
    }, []);

    if (loading) {
        return (
            <div className="w-full h-[300px] bg-[#1a1a2e] rounded-xl flex items-center justify-center">
                <div className="flex items-center gap-2 text-[#a0a0b9]">
                    <div className="w-5 h-5 border-2 border-[#4361ee] border-t-transparent rounded-full animate-spin" />
                    <span>Chargement de la carte...</span>
                </div>
            </div>
        );
    }

    if (error || points.length === 0) {
        return (
            <div className="w-full h-[200px] bg-[#1a1a2e] rounded-xl flex flex-col items-center justify-center border border-[#3a3a50]">
                <span className="text-4xl mb-2">🗺️</span>
                <p className="text-[#a0a0b9] text-sm">Aucun point de dépôt disponible</p>
                <p className="text-[#6b6b80] text-xs mt-1">Veuillez réessayer plus tard</p>
            </div>
        );
    }

    // If map component is not yet loaded, show loading
    if (!MapComponent) {
        return (
            <div className="w-full h-[300px] bg-[#1a1a2e] rounded-xl flex items-center justify-center">
                <div className="flex items-center gap-2 text-[#a0a0b9]">
                    <div className="w-5 h-5 border-2 border-[#4361ee] border-t-transparent rounded-full animate-spin" />
                    <span>Préparation de la carte...</span>
                </div>
            </div>
        );
    }

    return (
        <MapComponent
            points={points}
            onSelect={onSelect}
            selectedId={selectedId}
        />
    );
}
