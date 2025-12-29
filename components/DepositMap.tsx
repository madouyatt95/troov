'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

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

// Dynamically import map to avoid SSR issues with Leaflet
const MapContainer = dynamic(
    () => import('react-leaflet').then((mod) => mod.MapContainer),
    { ssr: false }
);
const TileLayer = dynamic(
    () => import('react-leaflet').then((mod) => mod.TileLayer),
    { ssr: false }
);
const Marker = dynamic(
    () => import('react-leaflet').then((mod) => mod.Marker),
    { ssr: false }
);
const Popup = dynamic(
    () => import('react-leaflet').then((mod) => mod.Popup),
    { ssr: false }
);

export function DepositMap({ onSelect, selectedId }: DepositMapProps) {
    const [points, setPoints] = useState<DepositPoint[]>([]);
    const [loading, setLoading] = useState(true);
    const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
    const [mapReady, setMapReady] = useState(false);

    // Senegal center coordinates
    const senegalCenter: [number, number] = [14.6937, -17.4441];

    useEffect(() => {
        // Fetch deposit points from API
        fetch('/api/deposit-points')
            .then((res) => res.json())
            .then((data) => {
                if (data.depositPoints) {
                    setPoints(data.depositPoints);
                }
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    useEffect(() => {
        // Get user location
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setUserLocation([position.coords.latitude, position.coords.longitude]);
                },
                () => {
                    // Silently fail if location not available
                }
            );
        }
    }, []);

    useEffect(() => {
        // Import Leaflet CSS - use require to avoid TypeScript module error
        if (typeof window !== 'undefined') {
            require('leaflet/dist/leaflet.css');
        }
        setMapReady(true);
    }, []);

    if (!mapReady || loading) {
        return (
            <div className="w-full h-[300px] bg-[#1a1a2e] rounded-xl flex items-center justify-center">
                <div className="flex items-center gap-2 text-[#a0a0b9]">
                    <div className="w-5 h-5 border-2 border-[#4361ee] border-t-transparent rounded-full animate-spin" />
                    <span>Chargement de la carte...</span>
                </div>
            </div>
        );
    }

    // Show a simple fallback if no points are loaded (API error case)
    if (points.length === 0) {
        return (
            <div className="w-full h-[200px] bg-[#1a1a2e] rounded-xl flex flex-col items-center justify-center border border-[#3a3a50]">
                <span className="text-4xl mb-2">🗺️</span>
                <p className="text-[#a0a0b9] text-sm">Aucun point de dépôt disponible</p>
                <p className="text-[#6b6b80] text-xs mt-1">Veuillez réessayer plus tard</p>
            </div>
        );
    }

    return (
        <div className="w-full rounded-xl overflow-hidden border border-[#3a3a50]">
            {/* Map Header */}
            <div className="bg-[#1a1a2e] p-3 flex items-center justify-between">
                <span className="text-sm font-medium">📍 Points de dépôt ({points.length})</span>
                {userLocation && (
                    <span className="text-xs text-[#4cc9f0]">📍 Position détectée</span>
                )}
            </div>

            {/* Map Container */}
            <div className="h-[300px]">
                <MapContainer
                    center={userLocation || senegalCenter}
                    zoom={userLocation ? 13 : 7}
                    style={{ height: '100%', width: '100%' }}
                    scrollWheelZoom={true}
                >
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />

                    {points.map((point) => (
                        <Marker
                            key={point.id}
                            position={[point.lat, point.lng]}
                            eventHandlers={{
                                click: () => onSelect(point),
                            }}
                        >
                            <Popup>
                                <div className="text-sm">
                                    <strong className="block mb-1">{point.name}</strong>
                                    <span className="text-gray-600 text-xs">{point.address}</span>
                                    {point.distance && (
                                        <span className="block text-blue-600 text-xs mt-1">
                                            {point.distance} km
                                        </span>
                                    )}
                                    <button
                                        onClick={() => onSelect(point)}
                                        className="mt-2 w-full bg-blue-500 text-white text-xs py-1 px-2 rounded"
                                    >
                                        Sélectionner
                                    </button>
                                </div>
                            </Popup>
                        </Marker>
                    ))}
                </MapContainer>
            </div>

            {/* Selected Point Display */}
            {selectedId && (
                <div className="bg-[#4361ee]/10 border-t border-[#4361ee] p-3">
                    <div className="flex items-center gap-2">
                        <span className="text-[#4cc9f0]">✓</span>
                        <span className="text-sm font-medium">
                            {points.find((p) => p.id === selectedId)?.name}
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
}
