'use client';

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

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

interface LeafletMapProps {
    points: DepositPoint[];
    onSelect: (point: DepositPoint) => void;
    selectedId?: string;
}

// Fix for default marker icons in Leaflet with Webpack/Next.js
const defaultIcon = L.icon({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

L.Marker.prototype.options.icon = defaultIcon;

export function LeafletMap({ points, onSelect, selectedId }: LeafletMapProps) {
    const [userLocation, setUserLocation] = useState<[number, number] | null>(null);

    // Senegal center coordinates (Dakar)
    const senegalCenter: [number, number] = [14.6937, -17.4441];

    useEffect(() => {
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

    const selectedPoint = points.find(p => p.id === selectedId);

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
                                <div className="text-sm min-w-[150px]">
                                    <strong className="block mb-1">{point.name}</strong>
                                    <span className="text-gray-600 text-xs block">{point.address}</span>
                                    {point.distance && (
                                        <span className="block text-blue-600 text-xs mt-1">
                                            📍 {point.distance} km
                                        </span>
                                    )}
                                    <button
                                        onClick={() => onSelect(point)}
                                        className="mt-2 w-full bg-blue-500 text-white text-xs py-1 px-2 rounded hover:bg-blue-600"
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
            {selectedPoint && (
                <div className="bg-[#4361ee]/10 border-t border-[#4361ee] p-3">
                    <div className="flex items-center gap-2">
                        <span className="text-[#4cc9f0]">✓</span>
                        <span className="text-sm font-medium">{selectedPoint.name}</span>
                    </div>
                </div>
            )}
        </div>
    );
}
