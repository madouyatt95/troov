'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Locale = 'fr' | 'wo' | 'en';

interface LanguageState {
    locale: Locale;
    setLocale: (locale: Locale) => void;
}

export const useLanguageStore = create<LanguageState>()(
    persist(
        (set) => ({
            locale: 'fr',
            setLocale: (locale) => set({ locale }),
        }),
        {
            name: 'sendocu-language',
        }
    )
);
