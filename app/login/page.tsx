'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { OtpInput } from '@/components/ui/otp-input';
import { Card, CardContent } from '@/components/ui/card';

type Step = 'phone' | 'otp';

export default function LoginPage() {
    const router = useRouter();
    const [step, setStep] = useState<Step>('phone');
    const [phone, setPhone] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [countdown, setCountdown] = useState(0);

    const handlePhoneSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const response = await fetch('/api/auth/otp/request', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone: `+221${phone}`, language: 'fr' }),
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.message || 'Erreur lors de l\'envoi du code');
                return;
            }

            setStep('otp');
            setCountdown(data.expiresIn || 300);

            // Start countdown
            const timer = setInterval(() => {
                setCountdown((prev) => {
                    if (prev <= 1) {
                        clearInterval(timer);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        } catch {
            setError('Connexion impossible. Vérifiez votre connexion internet.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleOtpComplete = async (otp: string) => {
        setError('');
        setIsLoading(true);

        try {
            const response = await fetch('/api/auth/otp/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone: `+221${phone}`, otp }),
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.message || 'Code incorrect');
                return;
            }

            // Redirect to owner dashboard
            router.push('/owner');
        } catch {
            setError('Connexion impossible. Vérifiez votre connexion internet.');
        } finally {
            setIsLoading(false);
        }
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <main className="flex-1 flex flex-col">
            {/* Header */}
            <header className="flex items-center p-4 safe-area-top">
                <Link href="/" className="text-[#a0a0b9] hover:text-white transition-colors">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                </Link>
                <h1 className="flex-1 text-center font-semibold">
                    {step === 'phone' ? 'Connexion' : 'Vérification'}
                </h1>
                <div className="w-6"></div>
            </header>

            {/* Content */}
            <div className="flex-1 flex flex-col justify-center px-6 pb-8">
                {step === 'phone' ? (
                    <form onSubmit={handlePhoneSubmit} className="w-full max-w-md mx-auto animate-fade-in">
                        <div className="text-center mb-8">
                            <h2 className="text-2xl font-bold mb-2">Créer votre compte Troov</h2>
                            <p className="text-[#a0a0b9]">Ou connectez-vous si vous en avez déjà un</p>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-[#a0a0b9] mb-2">
                                    Votre numéro de téléphone
                                </label>
                                <div className="flex gap-2">
                                    <div className="flex items-center gap-2 bg-[#25253d] rounded-xl px-4 h-12">
                                        <span className="text-lg">🇸🇳</span>
                                        <span className="text-[#a0a0b9]">+221</span>
                                    </div>
                                    <Input
                                        type="tel"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 9))}
                                        placeholder="77 123 45 67"
                                        className="flex-1"
                                        required
                                    />
                                </div>
                                <p className="mt-2 text-xs text-[#6b6b80] flex items-start gap-1">
                                    <span className="text-[#4cc9f0]">ℹ️</span>
                                    Ce numéro doit être celui utilisé pour obtenir votre CNI.
                                </p>
                            </div>

                            {error && (
                                <Card className="bg-[#f87171]/10 border border-[#f87171]/30">
                                    <CardContent className="p-3 text-sm text-[#f87171] flex items-center gap-2">
                                        <span>⚠️</span>
                                        {error}
                                    </CardContent>
                                </Card>
                            )}

                            <Button type="submit" className="w-full" isLoading={isLoading}>
                                Recevoir le code SMS →
                            </Button>
                        </div>

                        {/* Security note */}
                        <div className="mt-8 text-center">
                            <p className="text-xs text-[#6b6b80] flex items-center justify-center gap-1">
                                <span className="text-[#4ade80]">🔒</span>
                                Votre numéro n&apos;est jamais partagé ni affiché.
                            </p>
                        </div>
                    </form>
                ) : (
                    <div className="w-full max-w-md mx-auto animate-fade-in">
                        <div className="text-center mb-8">
                            <h2 className="text-2xl font-bold mb-2">Code de vérification</h2>
                            <p className="text-[#a0a0b9]">
                                Entrez le code reçu par SMS au
                                <br />
                                <span className="font-medium text-white">+221 {phone.slice(0, 2)} *** ** {phone.slice(-2)}</span>
                            </p>
                        </div>

                        <div className="space-y-6">
                            <OtpInput
                                onComplete={handleOtpComplete}
                                disabled={isLoading}
                                error={!!error}
                            />

                            {countdown > 0 && (
                                <p className="text-center text-sm text-[#a0a0b9]">
                                    ⏱️ Code valide pendant <span className="text-white font-medium">{formatTime(countdown)}</span>
                                </p>
                            )}

                            {error && (
                                <Card className="bg-[#f87171]/10 border border-[#f87171]/30">
                                    <CardContent className="p-3 text-sm text-[#f87171] flex items-center gap-2">
                                        <span>⚠️</span>
                                        {error}
                                    </CardContent>
                                </Card>
                            )}

                            <div className="text-center">
                                <button
                                    type="button"
                                    onClick={() => setStep('phone')}
                                    className="text-sm text-[#4361ee] hover:underline"
                                >
                                    Pas reçu ? Renvoyer le code
                                </button>
                            </div>
                        </div>

                        {/* Security note */}
                        <div className="mt-8 text-center">
                            <p className="text-xs text-[#6b6b80] flex items-center justify-center gap-1">
                                <span className="text-[#4ade80]">🔒</span>
                                Ne partagez jamais ce code. Troov ne vous le demandera jamais par téléphone.
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </main>
    );
}
