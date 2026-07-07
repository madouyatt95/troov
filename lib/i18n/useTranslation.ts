'use client';

import { useLanguageStore, Locale } from './store';

// Translation dictionaries
const translations: Record<Locale, Record<string, string>> = {
    fr: {
        // Header
        'app.name': 'SenDocu',

        // Homepage
        'home.welcome': 'Bienvenue sur SenDocu',
        'home.tagline': 'Retrouvez vos documents en toute sécurité',
        'home.found': "J'ai TROUVÉ un document",
        'home.found.sub': 'Déclarer sans inscription',
        'home.lost': "J'ai PERDU mon document",
        'home.lost.sub': "M'inscrire pour être alerté",
        'home.or': 'ou',
        'home.track': 'Suivre ma déclaration',
        'home.secure': 'Vos données sont protégées',
        'home.secure.sub': 'Aucune info visible publiquement',

        // Finder page
        'finder.title': 'Déclarer un document trouvé',
        'finder.step1': 'Quel document avez-vous trouvé ?',
        'finder.step2': 'Numéro du document',
        'finder.step2.sub': 'Ce numéro sera chiffré et jamais affiché publiquement',
        'finder.step3': 'Où poser le document ?',
        'finder.step4': 'Confirmation',
        'finder.docNumber': 'Numéro du document',
        'finder.docNumber.placeholder': 'Ex: 1234567890123',
        'finder.next': 'Continuer',
        'finder.back': 'Retour',
        'finder.submit': 'Soumettre la déclaration',
        'finder.success': 'Document déclaré avec succès !',
        'finder.trackingCode': 'Votre code de suivi',
        'finder.trackingInfo': 'Gardez ce code pour suivre le statut de votre déclaration',

        // Document types
        'doc.cni': 'Carte Nationale d\'Identité',
        'doc.passport': 'Passeport',
        'doc.permis': 'Permis de conduire',
        'doc.carte_grise': 'Carte grise',
        'doc.diplome': 'Diplôme',
        'doc.other': 'Autre document',

        // Status page
        'status.title': 'Suivre ma déclaration',
        'status.placeholder': 'Entrez votre code de suivi',
        'status.search': 'Rechercher',
        'status.pending': 'En attente',
        'status.matched': 'Correspondance trouvée',
        'status.recovered': 'Récupéré',
        'status.notFound': 'Déclaration non trouvée',

        // Login page
        'login.title': 'Connexion',
        'login.phone': 'Numéro de téléphone',
        'login.phone.placeholder': '77 123 45 67',
        'login.sendOtp': 'Recevoir un code',
        'login.otp': 'Code de vérification',
        'login.verify': 'Vérifier',
        'login.sent': 'Un code a été envoyé au',

        // Common
        'common.loading': 'Chargement...',
        'common.error': 'Une erreur est survenue',
        'common.retry': 'Réessayer',
    },

    wo: {
        // Header
        'app.name': 'SenDocu',

        // Homepage
        'home.welcome': 'Dalal jàmm ci SenDocu',
        'home.tagline': 'Jàppale sa kaayit yi ci kaarange',
        'home.found': 'Gis naa ab kaayit',
        'home.found.sub': 'Bind te binduwul',
        'home.lost': 'Réér naa sama kaayit',
        'home.lost.sub': 'Bindu ngir ñu la xam',
        'home.or': 'walla',
        'home.track': 'Toppatoo sama bind',
        'home.secure': 'Sa données yi ñu ko aar',
        'home.secure.sub': 'Dara du feeñ ci biir',

        // Finder page
        'finder.title': 'Bind kaayit bi nga gis',
        'finder.step1': 'Lan ngay kaayit bi nga gis?',
        'finder.step2': 'Nimero kaayit bi',
        'finder.step2.sub': 'Nimero bi dañu koy sutura, du feeñ',
        'finder.step3': 'Fan ngay def kaayit bi?',
        'finder.step4': 'Dëggal',
        'finder.docNumber': 'Nimero kaayit bi',
        'finder.docNumber.placeholder': 'Mis: 1234567890123',
        'finder.next': 'Jëm kanam',
        'finder.back': 'Dellu ginnaaw',
        'finder.submit': 'Yónnee bind bi',
        'finder.success': 'Bind bi jàpp na!',
        'finder.trackingCode': 'Sa code suivi',
        'finder.trackingInfo': 'Bàyyi code bii ngir toppatoo sa bind',

        // Document types
        'doc.cni': 'Karti Identite',
        'doc.passport': 'Paspoor',
        'doc.permis': 'Permi',
        'doc.carte_grise': 'Karti Gris',
        'doc.diplome': 'Diplom',
        'doc.other': 'Beneen kaayit',

        // Status page
        'status.title': 'Toppatoo sama bind',
        'status.placeholder': 'Dugal sa code suivi',
        'status.search': 'Wut',
        'status.pending': 'Di naan',
        'status.matched': 'Gis nañu ko',
        'status.recovered': 'Jàpp nañu ko',
        'status.notFound': 'Gisuwul bind bi',

        // Login page
        'login.title': 'Duggu',
        'login.phone': 'Nimero telefon',
        'login.phone.placeholder': '77 123 45 67',
        'login.sendOtp': 'Jot code',
        'login.otp': 'Code bi',
        'login.verify': 'Dëggal',
        'login.sent': 'Yónnee nañu code ci',

        // Common
        'common.loading': 'Di yëngale...',
        'common.error': 'Am na njuumte',
        'common.retry': 'Jéemaat',
    },

    en: {
        // Header
        'app.name': 'SenDocu',

        // Homepage
        'home.welcome': 'Welcome to SenDocu',
        'home.tagline': 'Recover your documents safely',
        'home.found': 'I FOUND a document',
        'home.found.sub': 'Declare without registration',
        'home.lost': 'I LOST my document',
        'home.lost.sub': 'Register to get notified',
        'home.or': 'or',
        'home.track': 'Track my declaration',
        'home.secure': 'Your data is protected',
        'home.secure.sub': 'No info publicly visible',

        // Finder page
        'finder.title': 'Declare a found document',
        'finder.step1': 'What document did you find?',
        'finder.step2': 'Document number',
        'finder.step2.sub': 'This number will be encrypted and never shown publicly',
        'finder.step3': 'Where to deposit the document?',
        'finder.step4': 'Confirmation',
        'finder.docNumber': 'Document number',
        'finder.docNumber.placeholder': 'E.g: 1234567890123',
        'finder.next': 'Continue',
        'finder.back': 'Back',
        'finder.submit': 'Submit declaration',
        'finder.success': 'Document declared successfully!',
        'finder.trackingCode': 'Your tracking code',
        'finder.trackingInfo': 'Keep this code to track your declaration status',

        // Document types
        'doc.cni': 'National ID Card',
        'doc.passport': 'Passport',
        'doc.permis': 'Driver\'s License',
        'doc.carte_grise': 'Vehicle Registration',
        'doc.diplome': 'Diploma',
        'doc.other': 'Other document',

        // Status page
        'status.title': 'Track my declaration',
        'status.placeholder': 'Enter your tracking code',
        'status.search': 'Search',
        'status.pending': 'Pending',
        'status.matched': 'Match found',
        'status.recovered': 'Recovered',
        'status.notFound': 'Declaration not found',

        // Login page
        'login.title': 'Login',
        'login.phone': 'Phone number',
        'login.phone.placeholder': '77 123 45 67',
        'login.sendOtp': 'Send code',
        'login.otp': 'Verification code',
        'login.verify': 'Verify',
        'login.sent': 'A code was sent to',

        // Common
        'common.loading': 'Loading...',
        'common.error': 'An error occurred',
        'common.retry': 'Retry',
    },
};

export function useTranslation() {
    const { locale, setLocale } = useLanguageStore();

    const t = (key: string): string => {
        return translations[locale]?.[key] || translations.fr[key] || key;
    };

    return { t, locale, setLocale };
}
