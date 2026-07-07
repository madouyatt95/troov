'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { SenDocuShell } from '@/components/SenDocuShell';

type DocType = 'CNI' | 'PASSPORT';

type DepositPoint = {
    id: string;
    name: string;
    address: string;
    region: string;
    phone?: string;
};

export default function FinderPage() {
    const [docType, setDocType] = useState<DocType>('CNI');
    const [lastFourDigits, setLastFourDigits] = useState('');
    const [namePrefix, setNamePrefix] = useState('');
    const [regionFound, setRegionFound] = useState('DAKAR');
    const [depositPointId, setDepositPointId] = useState('');
    const [depositPoints, setDepositPoints] = useState<DepositPoint[]>([]);
    const [photoName, setPhotoName] = useState('');
    const [isLoadingPoints, setIsLoadingPoints] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState<{
        trackingCode: string;
        depositPoint?: { name: string; address: string; phone?: string };
    } | null>(null);

    const regions = ['DAKAR', 'THIES', 'SAINT_LOUIS', 'DIOURBEL', 'KAOLACK', 'ZIGUINCHOR'];

    useEffect(() => {
        setIsLoadingPoints(true);
        setDepositPointId('');

        fetch(`/api/deposit-points?region=${encodeURIComponent(regionFound)}&limit=20`)
            .then((response) => {
                if (!response.ok) throw new Error('Points indisponibles');
                return response.json();
            })
            .then((data) => {
                const points = data.depositPoints || [];
                setDepositPoints(points);
                setDepositPointId(points[0]?.id || '');
            })
            .catch(() => setError('Impossible de charger les points de dépôt pour cette région'))
            .finally(() => setIsLoadingPoints(false));
    }, [regionFound]);

    const selectedPoint = useMemo(
        () => depositPoints.find((point) => point.id === depositPointId),
        [depositPointId, depositPoints]
    );

    const canSubmit = docType && /^\d{4}$/.test(lastFourDigits) && /^[A-Za-z]{3}$/.test(namePrefix) && regionFound && depositPointId;

    const submitDeclaration = async () => {
        setError('');
        setSuccess(null);
        setIsSubmitting(true);

        try {
            const response = await fetch('/api/declarations', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    docType,
                    lastFourDigits,
                    namePrefix: namePrefix.toUpperCase(),
                    regionFound,
                    depositPointId,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.message || 'Déclaration impossible');
                return;
            }

            setSuccess({
                trackingCode: data.declaration.trackingCode,
                depositPoint: data.declaration.depositPoint,
            });
        } catch {
            setError('Connexion impossible. Réessayez.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <SenDocuShell withNav={false}>
            <header className="flex items-center justify-between px-5 pt-[calc(env(safe-area-inset-top)+18px)]">
                <Link href="/" className="grid h-9 w-9 place-items-center rounded-xl text-white">‹</Link>
                <h1 className="text-lg font-black tracking-[-0.03em] text-white">J’ai trouvé un document</h1>
                <span className="w-11" />
            </header>

            <section className="px-5 pt-6">
                <div className="sen-card p-5 text-center">
                    <div className="relative mx-auto h-36 overflow-hidden rounded-[22px] border border-[#53a9ff]/30 bg-[#07111f]">
                        <div className="absolute inset-5 rounded-[18px] border-2 border-dashed border-[#34f58b]/45" />
                        <div className="absolute left-1/2 top-1/2 h-20 w-32 -translate-x-1/2 -translate-y-1/2 rotate-[-7deg] rounded-[18px] border border-white/15 bg-gradient-to-br from-[#dfe9f4]/20 to-[#53a9ff]/10 p-3">
                            <div className="h-7 w-7 rounded-full bg-[#53a9ff]/50" />
                            <div className="mt-3 h-1.5 w-20 rounded bg-white/45" />
                            <div className="mt-2 h-1.5 w-14 rounded bg-white/25" />
                        </div>
                    </div>
                    <h2 className="mt-5 text-2xl font-black tracking-[-0.05em] text-white">Bravo !</h2>
                    <p className="mx-auto mt-2 max-w-xs text-sm leading-5 text-[#9aacbf]">
                        Créez un vrai signalement. Les données complètes ne sont pas nécessaires.
                    </p>
                </div>

                <div className="mt-5 space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                        {(['CNI', 'PASSPORT'] as DocType[]).map((type) => (
                            <button
                                key={type}
                                onClick={() => setDocType(type)}
                                className={`rounded-[16px] border p-4 text-left font-black ${docType === type ? 'border-[#34f58b] bg-[#34f58b]/10 text-white' : 'border-white/10 bg-white/[0.045] text-[#9aacbf]'}`}
                            >
                                {type === 'CNI' ? '🪪 CNI' : '📘 Passeport'}
                            </button>
                        ))}
                    </div>

                    <input
                        className="sen-input"
                        inputMode="numeric"
                        value={lastFourDigits}
                        onChange={(event) => setLastFourDigits(event.target.value.replace(/\D/g, '').slice(0, 4))}
                        placeholder="4 derniers chiffres du document"
                    />
                    <input
                        className="sen-input uppercase"
                        value={namePrefix}
                        onChange={(event) => setNamePrefix(event.target.value.replace(/[^A-Za-z]/g, '').slice(0, 3).toUpperCase())}
                        placeholder="3 premières lettres du nom"
                    />
                    <select className="sen-select" value={regionFound} onChange={(event) => setRegionFound(event.target.value)}>
                        {regions.map((region) => (
                            <option key={region} value={region}>{region.replace('_', ' ')}</option>
                        ))}
                    </select>
                    <select className="sen-select" value={depositPointId} onChange={(event) => setDepositPointId(event.target.value)} disabled={isLoadingPoints || depositPoints.length === 0}>
                        {depositPoints.length === 0 && <option value="">Aucun point disponible</option>}
                        {depositPoints.map((point) => (
                            <option key={point.id} value={point.id}>{point.name}</option>
                        ))}
                    </select>

                    {selectedPoint && (
                        <div className="rounded-[18px] border border-[#53a9ff]/25 bg-[#53a9ff]/10 p-4 text-sm text-[#b7c3d2]">
                            <p className="font-black text-white">{selectedPoint.name}</p>
                            <p className="mt-1">{selectedPoint.address}</p>
                        </div>
                    )}

                    <label className="flex cursor-pointer items-center justify-center rounded-[18px] border border-dashed border-[#53a9ff]/45 bg-[#53a9ff]/8 px-4 py-4 text-sm font-black text-[#53a9ff]">
                        Ajouter une photo — optionnel
                        <input
                            type="file"
                            accept="image/*,.pdf"
                            capture="environment"
                            className="hidden"
                            onChange={(event) => setPhotoName(event.target.files?.[0]?.name || '')}
                        />
                    </label>
                    {photoName && <p className="text-xs text-[#8094ad]">Fichier sélectionné localement : {photoName}</p>}
                </div>

                {error && (
                    <div className="mt-5 rounded-[18px] border border-[#ff6b6b]/30 bg-[#ff6b6b]/10 p-4 text-sm text-[#ff8585]">
                        {error}
                    </div>
                )}

                {success && (
                    <div className="mt-5 rounded-[18px] border border-[#34f58b]/35 bg-[#34f58b]/10 p-4 text-left">
                        <p className="font-black text-[#34f58b]">Signalement enregistré</p>
                        <p className="mt-2 text-sm text-[#9aacbf]">Code de suivi :</p>
                        <p className="mt-1 font-mono text-xl font-black text-white">{success.trackingCode}</p>
                        {success.depositPoint && (
                            <p className="mt-3 text-sm text-[#9aacbf]">
                                Déposez le document à : <span className="font-bold text-white">{success.depositPoint.name}</span>
                            </p>
                        )}
                    </div>
                )}

                <button
                    className="sen-action mt-5 w-full disabled:opacity-45"
                    disabled={!canSubmit || isSubmitting}
                    onClick={submitDeclaration}
                >
                    {isSubmitting ? 'Enregistrement...' : 'Créer le signalement'}
                </button>

                <div className="mt-6 rounded-[18px] border border-[#f6c945]/25 bg-[#f6c945]/10 p-4 text-left">
                    <p className="text-sm leading-5 text-[#f6d878]">
                        Ne remettez jamais le document directement à un inconnu. SenDocu s’occupe de le remettre au propriétaire légitime.
                    </p>
                </div>
            </section>
        </SenDocuShell>
    );
}
