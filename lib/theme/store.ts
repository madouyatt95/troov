import { create } from 'zustand';

type Theme = 'dark' | 'light';

interface ThemeState {
    theme: Theme;
    setTheme: (theme: Theme) => void;
    toggleTheme: () => void;
}

export const useThemeStore = create<ThemeState>((set, get) => ({
    theme: 'dark',
    setTheme: (theme) => {
        set({ theme });
        if (typeof window !== 'undefined') {
            localStorage.setItem('troov_theme', theme);
            document.documentElement.setAttribute('data-theme', theme);
        }
    },
    toggleTheme: () => {
        const newTheme = get().theme === 'dark' ? 'light' : 'dark';
        get().setTheme(newTheme);
    },
}));

// Initialize theme from localStorage or system preference
export function initializeTheme() {
    if (typeof window === 'undefined') return;

    const stored = localStorage.getItem('troov_theme') as Theme | null;
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const theme = stored || (systemPrefersDark ? 'dark' : 'light');

    useThemeStore.getState().setTheme(theme);
}
