'use client';

import { useTranslation, Locale } from '@/lib/i18n';

export function LanguageSwitcher() {
    const { locale, setLocale } = useTranslation();

    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setLocale(e.target.value as Locale);
    };

    return (
        <select
            className="bg-transparent text-[#a0a0b9] text-sm border border-[#3a3a50] rounded-lg px-2 py-1 cursor-pointer hover:border-[#4361ee] transition-colors"
            value={locale}
            onChange={handleChange}
        >
            <option value="fr">🇫🇷 FR</option>
            <option value="wo">🇸🇳 Wolof</option>
            <option value="en">🇬🇧 EN</option>
        </select>
    );
}
