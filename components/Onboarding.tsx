'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';

interface OnboardingProps {
    onComplete: () => void;
}

const SLIDES = [
    {
        icon: '🎯',
        title: 'Bienvenue sur SenDocu',
        description: 'La plateforme qui relie les personnes qui trouvent des documents à celles qui les ont perdus.',
        highlight: 'Simple, sécurisé, gratuit.',
    },
    {
        icon: '🔒',
        title: 'Vos données sont protégées',
        description: 'Nous utilisons un cryptage avancé. Votre numéro et vos informations personnelles ne sont jamais partagés.',
        highlight: 'Matching anonyme.',
    },
    {
        icon: '📋',
        title: 'Trouvé un document ?',
        description: 'Déclarez-le en quelques clics. Indiquez juste les premiers caractères et déposez-le dans un point relais.',
        highlight: 'Aucune donnée sensible stockée.',
    },
    {
        icon: '🔍',
        title: 'Perdu votre document ?',
        description: 'Signalez la perte avec vos informations. Si un match est trouvé, vous serez notifié instantanément.',
        highlight: 'Notification en temps réel.',
    },
    {
        icon: '🏅',
        title: 'Gagnez des récompenses',
        description: 'Chaque bonne action vous fait gagner des points et débloquer des badges. Devenez un héros local !',
        highlight: 'Système de gamification.',
    },
];

export function Onboarding({ onComplete }: OnboardingProps) {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [isVisible, setIsVisible] = useState(true);

    const handleNext = () => {
        if (currentSlide < SLIDES.length - 1) {
            setCurrentSlide(currentSlide + 1);
        } else {
            handleComplete();
        }
    };

    const handleSkip = () => {
        handleComplete();
    };

    const handleComplete = async () => {
        setIsVisible(false);
        // Save to backend that user has seen onboarding
        try {
            await fetch('/api/profile/onboarding', { method: 'POST' });
        } catch {
            // Ignore errors
        }
        setTimeout(onComplete, 300);
    };

    if (!isVisible) return null;

    const slide = SLIDES[currentSlide];

    return (
        <div className="fixed inset-0 bg-[#0a0a14] z-50 flex flex-col animate-fade-in">
            {/* Header with skip */}
            <header className="flex items-center justify-between p-4 safe-area-top">
                <div className="w-16" />
                <div className="flex gap-1.5">
                    {SLIDES.map((_, i) => (
                        <div
                            key={i}
                            className={`h-1.5 rounded-full transition-all ${i === currentSlide
                                    ? 'w-6 bg-[#4361ee]'
                                    : i < currentSlide
                                        ? 'w-1.5 bg-[#4361ee]/50'
                                        : 'w-1.5 bg-[#3a3a60]'
                                }`}
                        />
                    ))}
                </div>
                <button
                    onClick={handleSkip}
                    className="text-sm text-[#6b6b90] hover:text-white transition-colors w-16 text-right"
                >
                    Passer
                </button>
            </header>

            {/* Content */}
            <div className="flex-1 flex flex-col items-center justify-center px-8 pb-8">
                {/* Animated icon */}
                <div className="w-32 h-32 mb-8 bg-gradient-to-br from-[#4361ee]/20 to-[#a855f7]/20 rounded-3xl flex items-center justify-center border border-[#4361ee]/30 animate-pulse-glow">
                    <span className="text-6xl">{slide.icon}</span>
                </div>

                {/* Title */}
                <h1 className="text-2xl font-bold text-center mb-4 animate-fade-in">
                    {slide.title}
                </h1>

                {/* Description */}
                <p className="text-center text-[#a0a0b9] mb-4 max-w-xs animate-fade-in">
                    {slide.description}
                </p>

                {/* Highlight */}
                <div className="px-4 py-2 bg-[#4361ee]/10 border border-[#4361ee]/30 rounded-full animate-fade-in">
                    <span className="text-sm text-[#4cc9f0] font-medium">
                        {slide.highlight}
                    </span>
                </div>
            </div>

            {/* Bottom actions */}
            <div className="p-6 safe-area-bottom">
                <Button onClick={handleNext} className="w-full">
                    {currentSlide < SLIDES.length - 1 ? (
                        <>Suivant →</>
                    ) : (
                        <>Commencer 🚀</>
                    )}
                </Button>
            </div>
        </div>
    );
}

/**
 * Hook to check if user needs onboarding
 */
export function useOnboarding() {
    const [showOnboarding, setShowOnboarding] = useState(false);
    const [isChecking, setIsChecking] = useState(true);

    useEffect(() => {
        const checkOnboarding = async () => {
            // First check localStorage for quick response
            const localSeen = localStorage.getItem('sendocu_onboarding_seen');
            if (localSeen === 'true') {
                setIsChecking(false);
                return;
            }

            // Then check with backend
            try {
                const response = await fetch('/api/profile');
                if (response.ok) {
                    const data = await response.json();
                    if (!data.hasSeenOnboarding) {
                        setShowOnboarding(true);
                    }
                }
            } catch {
                // If not logged in, don't show onboarding
            } finally {
                setIsChecking(false);
            }
        };

        checkOnboarding();
    }, []);

    const completeOnboarding = () => {
        localStorage.setItem('sendocu_onboarding_seen', 'true');
        setShowOnboarding(false);
    };

    return { showOnboarding, isChecking, completeOnboarding };
}
