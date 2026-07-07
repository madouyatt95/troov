'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { SenDocuShell } from '@/components/SenDocuShell';

type DocType = 'CNI' | 'PASSPORT';

type LocationOption = {
    id: string;
    name: string;
};

const docTypes = [
    ['CNI', 'Carte nationale d’identité', '🪪'],
    ['PASSPORT', 'Passeport', '📘'],
    ['DRIVER', 'Permis de conduire', '🚗'],
    ['BANK', 'Carte bancaire', '💳'],
    ['STUDENT', 'Carte étudiante', '🎓'],
    ['OTHER', 'Autre document', '📎'],
] as const;

export default function ReportLossPage() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [docType, setDocType] = useState<DocType>('CNI');
    const [lastDigits, setLastDigits] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [dateOfBirth, setDateOfBirth] = useState('');
    const [place, setPlace] = useState('');
    const [regions, setRegions] = useState<LocationOption[]>([]);
    const [departments, setDepartments] = useState<LocationOption[]>([]);
    const [communes, setCommunes] = useState<LocationOption[]>([]);
    const [selectedRegion, setSelectedRegion] = useState('DAKAR');
    const [selectedDepartment, setSelectedDepartment] = useState('');
    const [selectedCommune, setSelectedCommune] = useState('');
    const [lostDate, setLostDate] = useState('');
    const [phone, setPhone] = useState('');
    const [accepted, setAccepted] = useState(false);
    const [fileName, setFileName] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const fullNumber = useMemo(() => `${docType}-${lastDigits || '0000'}-SND`, [docType, lastDigits]);
    const fullName = useMemo(() => `${lastName} ${firstName}`.trim().toUpperCase(), [lastName, firstName]);
    const locationLabel = useMemo(() => {
        const regionName = regions.find((region) => region.id === selectedRegion)?.name;
        const departmentName = departments.find((department) => department.id === selectedDepartment)?.name;
        const communeName = communes.find((commune) => commune.id === selectedCommune)?.name;

        return [communeName, departmentName, regionName, place].filter(Boolean).join(' • ');
    }, [communes, departments, place, regions, selectedCommune, selectedDepartment, selectedRegion]);

    useEffect(() => {
        fetch('/api/locations/regions')
            .then((response) => {
                if (!response.ok) throw new Error('Régions indisponibles');
                return response.json();
            })
            .then((data) => {
                const nextRegions = data.regions || [];
                setRegions(nextRegions);
                if (nextRegions.length > 0 && !nextRegions.some((region: LocationOption) => region.id === selectedRegion)) {
                    setSelectedRegion(nextRegions[0].id);
                }
            })
            .catch(() => setError('Impossible de charger les régions du Sénégal'));
    }, [selectedRegion]);

    useEffect(() => {
        if (!selectedRegion) return;

        setSelectedDepartment('');
        setSelectedCommune('');
        setCommunes([]);

        fetch(`/api/locations/departments?region=${encodeURIComponent(selectedRegion)}`)
            .then((response) => {
                if (!response.ok) throw new Error('Départements indisponibles');
                return response.json();
            })
            .then((data) => {
                const nextDepartments = data.departments || [];
                setDepartments(nextDepartments);
                setSelectedDepartment(nextDepartments[0]?.id || '');
            })
            .catch(() => setError('Impossible de charger les départements'));
    }, [selectedRegion]);

    useEffect(() => {
        if (!selectedDepartment) return;

        setSelectedCommune('');

        fetch(`/api/locations/communes?region=${encodeURIComponent(selectedRegion)}&department=${encodeURIComponent(selectedDepartment)}`)
            .then((response) => {
                if (!response.ok) throw new Error('Communes indisponibles');
                return response.json();
            })
            .then((data) => {
                const nextCommunes = data.communes || [];
                setCommunes(nextCommunes);
                setSelectedCommune(nextCommunes[0]?.id || '');
            })
            .catch(() => setError('Impossible de charger les communes'));
    }, [selectedDepartment, selectedRegion]);

    const submit = async () => {
        setError('');
        setIsLoading(true);

        try {
            const response = await fetch('/api/reports', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    docType,
                    fullNumber,
                    fullName,
                    dob: dateOfBirth,
                }),
            });

            const data = await response.json();
            if (!response.ok) {
                if (response.status === 401) {
                    router.push('/login');
                    return;
                }
                setError(data.message || 'Erreur lors du signalement');
                return;
            }

            router.push('/owner?success=report');
        } catch {
            setError('Connexion impossible');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <SenDocuShell withNav={false}>
            <header className="flex items-center justify-between px-5 pt-[calc(env(safe-area-inset-top)+18px)]">
                <Link href="/" className="grid h-9 w-9 place-items-center rounded-xl text-white">‹</Link>
                <div className="text-center">
                    <h1 className="text-lg font-black tracking-[-0.03em] text-white">Déclarer une perte</h1>
                    <p className="text-xs font-semibold text-[#8094ad]">Étape {step} sur 3</p>
                </div>
                <span className="w-11" />
            </header>

            <div className="px-5 pt-5">
                <div className="h-2 rounded-full bg-white/10">
                    <div className="h-2 rounded-full bg-[#34f58b] transition-all" style={{ width: `${(step / 3) * 100}%` }} />
                </div>
            </div>

            {step === 1 && (
                <section className="px-5 pt-7">
                    <h2 className="text-2xl font-black tracking-[-0.05em] text-white">Type de document</h2>
                    <p className="mt-2 text-sm text-[#9aacbf]">Choisissez le type de document perdu</p>
                    <div className="mt-5 space-y-3">
                        {docTypes.map(([value, label, icon]) => {
                            const supported = value === 'CNI' || value === 'PASSPORT';
                            const selected = value === docType;
                            return (
                                <button
                                    key={value}
                                    type="button"
                                    onClick={() => supported && setDocType(value)}
                                    className={`flex w-full items-center gap-4 rounded-[24px] border p-4 text-left transition ${selected ? 'border-[#34f58b]/70 bg-[#34f58b]/10' : 'border-white/10 bg-white/[0.045]'} ${supported ? '' : 'opacity-60'}`}
                                >
                                    <span className="grid h-12 w-12 place-items-center rounded-2xl bg-white/8 text-2xl">{icon}</span>
                                    <span className="flex-1">
                                        <span className="block font-black text-white">{label}</span>
                                        {!supported && <span className="mt-1 block text-xs text-[#f6c945]">Interface prête — API à étendre</span>}
                                    </span>
                                    <span className={selected ? 'text-[#34f58b]' : 'text-[#62758d]'}>{selected ? '✓' : '›'}</span>
                                </button>
                            );
                        })}
                    </div>
                    <button className="sen-action mt-6 w-full" onClick={() => setStep(2)}>Continuer</button>
                </section>
            )}

            {step === 2 && (
                <section className="px-5 pt-7">
                    <h2 className="text-2xl font-black tracking-[-0.05em] text-white">Informations</h2>
                    <p className="mt-2 text-sm text-[#9aacbf]">Renseignez les informations connues</p>
                    <div className="mt-5 space-y-4">
                        <input className="sen-input" value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Nom" />
                        <input className="sen-input" value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="Prénom" />
                        <input className="sen-input" type="date" value={dateOfBirth} onChange={(e) => setDateOfBirth(e.target.value)} />
                        <input className="sen-input" value={lastDigits} onChange={(e) => setLastDigits(e.target.value.replace(/\D/g, '').slice(0, 4))} placeholder="4 derniers chiffres du document" />
                        <div className="grid grid-cols-1 gap-3">
                            <select className="sen-select" value={selectedRegion} onChange={(e) => setSelectedRegion(e.target.value)}>
                                {regions.map((region) => (
                                    <option key={region.id} value={region.id}>{region.name}</option>
                                ))}
                            </select>
                            <select className="sen-select" value={selectedDepartment} onChange={(e) => setSelectedDepartment(e.target.value)} disabled={departments.length === 0}>
                                {departments.length === 0 && <option value="">Département</option>}
                                {departments.map((department) => (
                                    <option key={department.id} value={department.id}>{department.name}</option>
                                ))}
                            </select>
                            <select className="sen-select" value={selectedCommune} onChange={(e) => setSelectedCommune(e.target.value)} disabled={communes.length === 0}>
                                {communes.length === 0 && <option value="">Commune / quartier</option>}
                                {communes.map((commune) => (
                                    <option key={commune.id} value={commune.id}>{commune.name}</option>
                                ))}
                            </select>
                        </div>
                        <input className="sen-input" value={place} onChange={(e) => setPlace(e.target.value)} placeholder="Repère ou lieu précis — optionnel" />
                        <input className="sen-input" type="date" value={lostDate} onChange={(e) => setLostDate(e.target.value)} />
                        <input className="sen-input" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Téléphone de contact" />
                    </div>
                    <button
                        className="sen-action mt-6 w-full disabled:opacity-45"
                        disabled={!lastName || !firstName || !dateOfBirth || lastDigits.length < 3 || !phone}
                        onClick={() => setStep(3)}
                    >
                        Continuer
                    </button>
                </section>
            )}

            {step === 3 && (
                <section className="px-5 pt-7">
                    <h2 className="text-2xl font-black tracking-[-0.05em] text-white">Vérification de sécurité</h2>
                    <p className="mt-2 text-sm text-[#9aacbf]">Cette recherche sera créée dans votre compte connecté.</p>

                    <div className="sen-card mt-5 p-4">
                        <p className="text-sm font-bold text-[#8094ad]">Résumé réel envoyé à l’API</p>
                        <div className="mt-3 space-y-2 text-sm text-[#b7c3d2]">
                            <p><span className="text-white">Document :</span> {docType}</p>
                            <p><span className="text-white">Nom :</span> {fullName}</p>
                            <p><span className="text-white">Numéro :</span> se termine par {lastDigits}</p>
                            <p><span className="text-white">Naissance :</span> {dateOfBirth}</p>
                            {locationLabel && <p><span className="text-white">Zone de perte :</span> {locationLabel}</p>}
                        </div>
                    </div>

                    <div className="mt-4 rounded-[24px] border border-white/10 bg-white/[0.045] p-4">
                        <p className="font-black text-white">Pièce justificative — optionnelle</p>
                        <label className="mt-3 flex cursor-pointer items-center justify-center rounded-2xl border border-dashed border-[#53a9ff]/45 bg-[#53a9ff]/8 px-4 py-4 text-sm font-black text-[#53a9ff]">
                            Ajouter une pièce — image ou PDF
                            <input type="file" accept="image/*,.pdf" className="hidden" onChange={(e) => setFileName(e.target.files?.[0]?.name || '')} />
                        </label>
                        {fileName && <p className="mt-2 text-xs text-[#9aacbf]">{fileName}</p>}
                    </div>

                    <label className="mt-5 flex items-start gap-3 text-sm leading-5 text-[#9aacbf]">
                        <input type="checkbox" className="mt-1 h-5 w-5 accent-[#34f58b]" checked={accepted} onChange={(e) => setAccepted(e.target.checked)} />
                        J’accepte que mes données soient utilisées conformément à la politique de confidentialité de SenDocu.
                    </label>

                    {error && <p className="mt-4 rounded-2xl border border-[#ff6b6b]/30 bg-[#ff6b6b]/10 p-3 text-sm text-[#ff8585]">{error}</p>}

                    <button
                        className="sen-action mt-5 w-full disabled:opacity-45"
                        disabled={!accepted || isLoading}
                        onClick={submit}
                    >
                        {isLoading ? 'Création...' : 'Créer la recherche sécurisée'}
                    </button>
                    <p className="mt-3 text-center text-xs font-semibold text-[#34f58b]">Vos données sont chiffrées et protégées</p>
                </section>
            )}
        </SenDocuShell>
    );
}
