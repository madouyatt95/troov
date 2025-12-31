'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';

type DocType = 'CNI' | 'PASSPORT';

export default function ReportLossPage() {
    const router = useRouter();
    const [docType, setDocType] = useState<DocType>('CNI');
    const [fullNumber, setFullNumber] = useState('');
    const [fullName, setFullName] = useState('');
    const [dob, setDob] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const response = await fetch('/api/reports', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ docType, fullNumber, fullName, dob }),
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.message || 'Erreur lors du signalement');
                return;
            }

            // Redirect to dashboard with success
            router.push('/owner?success=report');
        } catch {
            setError('Connexion impossible');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <main className="flex-1 flex flex-col min-h-screen">
            {/* Header */}
            <header className="flex items-center p-4 safe-area-top border-b border-[#2a2a45]">
                <Link href="/owner" className="text-[#a0a0b9] hover:text-white transition-colors">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                </Link>
                <h1 className="flex-1 text-center font-semibold">Signaler une perte</h1>
                <div className="w-6"></div>
            </header>

            {/* Form */}
            <form onSubmit={handleSubmit} className="flex-1 p-4 space-y-6">
                {/* Info banner */}
                <Card className="bg-[#4361ee]/10 border-[#4361ee]/30">
                    <CardContent className="p-4 flex items-start gap-3">
                        <span className="text-xl">🔒</span>
                        <p className="text-sm text-[#a0a0b9]">
                            Ces informations sont cryptées et servent uniquement à retrouver votre document.
                        </p>
                    </CardContent>
                </Card>

                {/* Document type */}
                <div>
                    <label className="block text-sm font-medium text-[#a0a0b9] mb-3">
                        Type de document
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                        {(['CNI', 'PASSPORT'] as DocType[]).map((type) => (
                            <button
                                key={type}
                                type="button"
                                onClick={() => setDocType(type)}
                                className={`p-4 rounded-xl border transition-all ${docType === type
                                        ? 'bg-[#4361ee]/20 border-[#4361ee] text-white'
                                        : 'bg-[#1a1a2e] border-[#2a2a45] text-[#a0a0b9]'
                                    }`}
                            >
                                <span className="text-2xl block mb-1">
                                    {type === 'CNI' ? '🪪' : '📘'}
                                </span>
                                <span className="text-sm font-medium">
                                    {type === 'CNI' ? 'Carte d\'identité' : 'Passeport'}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Document number */}
                <div>
                    <label className="block text-sm font-medium text-[#a0a0b9] mb-2">
                        Numéro du document
                    </label>
                    <Input
                        type="text"
                        value={fullNumber}
                        onChange={(e) => setFullNumber(e.target.value.toUpperCase())}
                        placeholder={docType === 'CNI' ? '1234567890123' : 'A12345678'}
                        required
                    />
                </div>

                {/* Full name */}
                <div>
                    <label className="block text-sm font-medium text-[#a0a0b9] mb-2">
                        Nom complet (comme sur le document)
                    </label>
                    <Input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value.toUpperCase())}
                        placeholder="NOM PRÉNOM"
                        required
                    />
                </div>

                {/* Date of birth */}
                <div>
                    <label className="block text-sm font-medium text-[#a0a0b9] mb-2">
                        Date de naissance
                    </label>
                    <Input
                        type="date"
                        value={dob}
                        onChange={(e) => setDob(e.target.value)}
                        required
                    />
                </div>

                {/* Error */}
                {error && (
                    <Card className="bg-[#f87171]/10 border-[#f87171]/30">
                        <CardContent className="p-3 text-sm text-[#f87171] flex items-center gap-2">
                            <span>⚠️</span>
                            {error}
                        </CardContent>
                    </Card>
                )}

                {/* Submit */}
                <Button type="submit" className="w-full" isLoading={isLoading}>
                    Signaler la perte
                </Button>

                {/* Privacy note */}
                <p className="text-xs text-center text-[#6b6b90]">
                    En signalant, vous acceptez nos conditions d'utilisation et politique de confidentialité.
                </p>
            </form>
        </main>
    );
}
