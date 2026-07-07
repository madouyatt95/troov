'use client';

import { useEffect, useState } from 'react';
import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet';
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
    isOpen?: boolean | null;
    serviceLabel?: string;
}

interface LeafletMapProps {
    points: DepositPoint[];
    onSelect: (point: DepositPoint) => void;
    selectedId?: string | null;
    className?: string;
}

const senegalCenter: [number, number] = [14.4974, -14.4524];

function createMarkerIcon(isSelected: boolean, pointType?: string) {
    const color = isSelected ? '#34f58b' : pointType === 'POLICE' ? '#53a9ff' : pointType === 'CITY_HALL' ? '#f6c945' : '#24e943';

    return L.divIcon({
        className: '',
        html: `
            <span style="
                position: relative;
                display: block;
                width: ${isSelected ? 24 : 19}px;
                height: ${isSelected ? 24 : 19}px;
                border-radius: 999px;
                background: ${color};
                border: 3px solid white;
                box-shadow: 0 0 0 8px ${color}26, 0 18px 35px rgba(0,0,0,.45);
            "></span>
        `,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
        popupAnchor: [0, -13],
    });
}

function MapFocus({ selectedPoint, userLocation }: { selectedPoint?: DepositPoint; userLocation: [number, number] | null }) {
    const map = useMap();

    useEffect(() => {
        if (selectedPoint) {
            map.flyTo([selectedPoint.lat, selectedPoint.lng], Math.max(map.getZoom(), 12), { duration: 0.6 });
            return;
        }

        if (userLocation) {
            map.flyTo(userLocation, 12, { duration: 0.6 });
        }
    }, [map, selectedPoint, userLocation]);

    return null;
}

export function LeafletMap({ points, onSelect, selectedId, className = '' }: LeafletMapProps) {
    const [userLocation, setUserLocation] = useState<[number, number] | null>(null);

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
        <div className={`relative h-full w-full overflow-hidden ${className}`}>
            <div className="h-full w-full [&_.leaflet-container]:bg-[#07111f] [&_.leaflet-control-attribution]:rounded-tl-xl [&_.leaflet-control-attribution]:bg-[#07111f]/75 [&_.leaflet-control-attribution]:text-[10px] [&_.leaflet-control-attribution]:text-[#9aacbf] [&_.leaflet-control-zoom-in]:border-0 [&_.leaflet-control-zoom-in]:bg-[#07111f] [&_.leaflet-control-zoom-in]:text-white [&_.leaflet-control-zoom-out]:border-0 [&_.leaflet-control-zoom-out]:bg-[#07111f] [&_.leaflet-control-zoom-out]:text-white [&_.leaflet-popup-content-wrapper]:rounded-2xl [&_.leaflet-popup-content-wrapper]:bg-[#07111f] [&_.leaflet-popup-content-wrapper]:text-white [&_.leaflet-popup-tip]:bg-[#07111f]">
                <MapContainer
                    center={selectedPoint ? [selectedPoint.lat, selectedPoint.lng] : userLocation || senegalCenter}
                    zoom={selectedPoint ? 12 : userLocation ? 12 : 7}
                    style={{ height: '100%', width: '100%' }}
                    scrollWheelZoom={true}
                >
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <MapFocus selectedPoint={selectedPoint} userLocation={userLocation} />

                    {points.map((point) => (
                        <Marker
                            key={point.id}
                            position={[point.lat, point.lng]}
                            icon={createMarkerIcon(point.id === selectedId, point.type)}
                            eventHandlers={{
                                click: () => onSelect(point),
                            }}
                        >
                            <Popup>
                                <div className="min-w-[180px] text-sm">
                                    <strong className="mb-1 block text-white">{point.name}</strong>
                                    <span className="block text-xs text-[#9aacbf]">{point.address}</span>
                                    {point.distance && (
                                        <span className="mt-2 block text-xs font-bold text-[#53a9ff]">
                                            {point.distance} km
                                        </span>
                                    )}
                                    <span className={`mt-1 block text-xs font-black ${point.isOpen ? 'text-[#34f58b]' : 'text-[#f6c945]'}`}>
                                        {point.isOpen === null ? 'Horaires à confirmer' : point.isOpen ? 'Ouvert maintenant' : 'Fermé actuellement'}
                                    </span>
                                    <button
                                        onClick={() => onSelect(point)}
                                        className="mt-3 w-full rounded-xl bg-[#34f58b] px-3 py-2 text-xs font-black text-[#04111d]"
                                    >
                                        Voir ce point
                                    </button>
                                </div>
                            </Popup>
                        </Marker>
                    ))}
                </MapContainer>
            </div>

            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(4,17,29,.55),transparent_28%,transparent_62%,rgba(4,17,29,.72))]" />
        </div>
    );
}
