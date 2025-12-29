'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardTitle, CardDescription } from '@/components/ui/card';

type Step = 'docType' | 'info' | 'deposit' | 'confirm' | 'success';

interface DepositPoint {
    id: string;
    name: string;
    type: string;
    address: string;
    phone?: string;
    distance?: number;
}

export default function FinderPage() {
    const router = useRouter();
    const [step, setStep] = useState<Step>('docType');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    // Form data
    const [docType, setDocType] = useState<'CNI' | 'PASSPORT' | null>(null);
    const [lastFourDigits, setLastFourDigits] = useState('');
    const [namePrefix, setNamePrefix] = useState('');
    const [regionFound, setRegionFound] = useState('');
    const [selectedDepositPoint, setSelectedDepositPoint] = useState<DepositPoint | null>(null);
    const [depositPoints, setDepositPoints] = useState<DepositPoint[]>([]);
    const [trackingCode, setTrackingCode] = useState('');

    const regions = [
        'DAKAR', 'THIES', 'SAINT_LOUIS', 'DIOURBEL', 'FATICK', 'KAOLACK',
        'KOLDA', 'LOUGA', 'MATAM', 'SEDHIOU', 'TAMBACOUNDA', 'ZIGUINCHOR',
        'KAFFRINE', 'KEDOUGOU'
    ];

    // Load deposit points when region changes
    useEffect(() => {
        if (regionFound) {
            loadDepositPoints();
        }
    }, [regionFound]);

    const loadDepositPoints = async () => {
        try {
            const response = await fetch(`/api/deposit-points?region=${regionFound}`);
            const data = await response.json();
            setDepositPoints(data.depositPoints || []);
        } catch {
            console.error('Failed to load deposit points');
        }
    };

    const handleSubmit = async () => {
        setError('');
        setIsLoading(true);

        try {
            const response = await fetch('/api/declarations', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    docType,
                    lastFourDigits,
                    namePrefix: namePrefix.toUpperCase(),
                    regionFound,
                    depositPointId: selectedDepositPoint?.id
                })
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.message || 'Erreur lors de la déclaration');
                return;
            }

            setTrackingCode(data.declaration.trackingCode);
            setStep('success');
        } catch {
            setError('Connexion impossible. Vérifiez votre connexion internet.');
        } finally {
            setIsLoading(false);
        }
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(trackingCode);
    };

    const renderStep = () => {
        switch (step) {
            case 'docType':
                return (
                    <div className="animate-fade-in">
                        <h2 className="text-xl font-bold mb-6">Quel document avez-vous trouvé ?</h2>
                        <div className="space-y-3">
                            <Card
                                variant={docType === 'CNI' ? 'highlight' : 'interactive'}
                                className="cursor-pointer"
                                onClick={() => { setDocType('CNI'); setStep('info'); }}
                            >
                                <CardContent className="flex items-center gap-4">
                                    <span className="text-3xl">🪪</span>
                                    <div>
                                        <CardTitle className="text-lg">Carte Nationale d&apos;Identité</CardTitle>
                                        <CardDescription>(CNI)</CardDescription>
                                    </div>
                                </CardContent>
                            </Card>
                            <Card
                                variant={docType === 'PASSPORT' ? 'highlight' : 'interactive'}
                                className="cursor-pointer"
                                onClick={() => { setDocType('PASSPORT'); setStep('info'); }}
                            >
                                <CardContent className="flex items-center gap-4">
                                    <span className="text-3xl">📕</span>
                                    <div>
                                        <CardTitle className="text-lg">Passeport</CardTitle>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                        <p className="mt-6 text-sm text-[#6b6b80] flex items-start gap-2">
                            <span className="text-[#4cc9f0]">ℹ️</span>
                            Ces informations permettent de retrouver le propriétaire de manière sécurisée.
                        </p>
                    </div>
                );

            case 'info':
                return (
                    <div className="animate-fade-in">
                        <h2 className="text-xl font-bold mb-2">Informations du document</h2>
                        <p className="text-sm text-[#a0a0b9] mb-6">(seules ces données sont requises)</p>
                        <div className="space-y-5">
                            <Input
                                label="4 derniers chiffres du numéro"
                                type="text"
                                maxLength={4}
                                value={lastFourDigits}
                                onChange={e => setLastFourDigits(e.target.value.replace(/\D/g, ''))}
                                placeholder="1234"
                            />
                            <Input
                                label="3 premières lettres du nom"
                                type="text"
                                maxLength={3}
                                value={namePrefix}
                                onChange={e => setNamePrefix(e.target.value.replace(/[^A-Za-z]/g, '').toUpperCase())}
                                placeholder="DIO"
                            />
                            <div>
                                <label className="block text-sm font-medium text-[#a0a0b9] mb-2">
                                    Où avez-vous trouvé ce document ?
                                </label>
                                <select
                                    value={regionFound}
                                    onChange={e => setRegionFound(e.target.value)}
                                    className="w-full h-12 px-4 rounded-xl bg-[#25253d] border-2 border-transparent text-white focus:outline-none focus:border-[#4361ee]"
                                >
                                    <option value="">Sélectionner une région</option>
                                    {regions.map(r => (
                                        <option key={r} value={r}>{r.replace('_', ' ')}</option>
                                    ))}
                                </select>
                            </div>
                            <p className="text-xs text-[#6b6b80] flex items-start gap-2 bg-[#25253d] p-3 rounded-xl">
                                <span className="text-[#4ade80]">🔒</span>
                                Ces données sont chiffrées et ne seront jamais affichées
                            </p>
                        </div>
                        <Button
                            className="w-full mt-6"
                            disabled={!lastFourDigits || lastFourDigits.length !== 4 || !namePrefix || namePrefix.length !== 3 || !regionFound}
                            onClick={() => setStep('deposit')}
                        >
                            Continuer →
                        </Button>
                    </div>
                );

            case 'deposit':
                return (
                    <div className="animate-fade-in">
                        <h2 className="text-xl font-bold mb-6">Choisir un point de dépôt</h2>

                        {depositPoints.length === 0 ? (
                            <p className="text-center text-[#a0a0b9] py-8">Aucun point de dépôt trouvé dans cette région</p>
                        ) : (
                            <div className="space-y-3 max-h-[50vh] overflow-y-auto">
                                {depositPoints.map(point => (
                                    <Card
                                        key={point.id}
                                        variant={selectedDepositPoint?.id === point.id ? 'highlight' : 'interactive'}
                                        className="cursor-pointer"
                                        onClick={() => setSelectedDepositPoint(point)}
                                    >
                                        <CardContent className="flex items-center gap-3">
                                            <span className="text-2xl">{point.type === 'ADMIN' ? '🏛️' : '🟠'}</span>
                                            <div className="flex-1">
                                                <CardTitle className="text-base">{point.name}</CardTitle>
                                                <CardDescription className="text-xs">{point.address}</CardDescription>
                                            </div>
                                            {point.distance && (
                                                <span className="text-sm text-[#4cc9f0]">{point.distance}km</span>
                                            )}
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}

                        <Button
                            className="w-full mt-6"
                            disabled={!selectedDepositPoint}
                            onClick={() => setStep('confirm')}
                        >
                            Continuer →
                        </Button>
                    </div>
                );

            case 'confirm':
                return (
                    <div className="animate-fade-in">
                        <h2 className="text-xl font-bold mb-6">Récapitulatif</h2>
                        <Card className="mb-4">
                            <CardContent className="space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-[#a0a0b9]">Document</span>
                                    <span>{docType === 'CNI' ? 'CNI' : 'Passeport'}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-[#a0a0b9]">Région</span>
                                    <span>{regionFound.replace('_', ' ')}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-[#a0a0b9]">Dépôt</span>
                                    <span className="text-right">{selectedDepositPoint?.name}</span>
                                </div>
                            </CardContent>
                        </Card>

                        <div className="bg-[#fbbf24]/10 border border-[#fbbf24]/30 rounded-xl p-4 mb-6">
                            <p className="text-sm text-[#fbbf24] flex items-start gap-2">
                                <span>⚠️</span>
                                Déposez le document dans les 48h au point choisi. Passé ce délai, la déclaration sera annulée.
                            </p>
                        </div>

                        {error && (
                            <Card className="bg-[#f87171]/10 border border-[#f87171]/30 mb-4">
                                <CardContent className="p-3 text-sm text-[#f87171]">{error}</CardContent>
                            </Card>
                        )}

                        <Button className="w-full" isLoading={isLoading} onClick={handleSubmit}>
                            ✓ Confirmer la déclaration
                        </Button>
                    </div>
                );

            case 'success':
                return (
                    <div className="animate-fade-in text-center">
                        <div className="text-6xl mb-4">✅</div>
                        <h2 className="text-2xl font-bold mb-2">Déclaration enregistrée !</h2>

                        <div className="my-6">
                            <p className="text-sm text-[#a0a0b9] mb-2">Votre code de suivi :</p>
                            <div className="bg-[#25253d] rounded-xl p-4 flex items-center justify-between">
                                <code className="text-xl font-mono text-[#4cc9f0]">{trackingCode}</code>
                                <Button variant="ghost" size="sm" onClick={copyToClipboard}>
                                    📋 Copier
                                </Button>
                            </div>
                        </div>

                        <Card className="text-left mb-6">
                            <CardContent>
                                <p className="text-sm text-[#a0a0b9] mb-2">📍 Prochaine étape :</p>
                                <p className="font-medium">Déposez le document à :</p>
                                <p className="text-[#4cc9f0]">{selectedDepositPoint?.name}</p>
                                <p className="text-sm text-[#a0a0b9]">{selectedDepositPoint?.address}</p>
                                {selectedDepositPoint?.phone && (
                                    <p className="text-sm text-[#a0a0b9]">📞 {selectedDepositPoint.phone}</p>
                                )}
                            </CardContent>
                        </Card>

                        <p className="text-[#4ade80] text-lg mb-6">Merci pour votre bonne action 🙏</p>

                        <Button variant="outline" className="w-full" onClick={() => router.push('/')}>
                            Retour à l&apos;accueil
                        </Button>
                    </div>
                );
        }
    };

    const stepNumber = ['docType', 'info', 'deposit', 'confirm'].indexOf(step) + 1;

    return (
        <main className="flex-1 flex flex-col">
            {/* Header */}
            <header className="flex items-center p-4 safe-area-top">
                <button
                    onClick={() => {
                        if (step === 'docType') router.push('/');
                        else if (step === 'info') setStep('docType');
                        else if (step === 'deposit') setStep('info');
                        else if (step === 'confirm') setStep('deposit');
                    }}
                    className="text-[#a0a0b9] hover:text-white transition-colors"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                </button>
                <h1 className="flex-1 text-center font-semibold">Déclaration</h1>
                {step !== 'success' && (
                    <span className="text-sm text-[#a0a0b9]">{stepNumber}/4</span>
                )}
                {step === 'success' && <div className="w-6"></div>}
            </header>

            {/* Content */}
            <div className="flex-1 flex flex-col px-6 py-4 pb-8 overflow-y-auto">
                {renderStep()}
            </div>
        </main>
    );
}
