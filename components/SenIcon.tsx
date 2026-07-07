type IconName =
    | 'home'
    | 'plus'
    | 'map'
    | 'message'
    | 'user'
    | 'doc'
    | 'search'
    | 'shield'
    | 'check'
    | 'pin'
    | 'hash';

export function SenIcon({ name, className = 'h-5 w-5' }: { name: IconName; className?: string }) {
    const common = {
        className,
        fill: 'none',
        stroke: 'currentColor',
        strokeWidth: 2,
        strokeLinecap: 'round' as const,
        strokeLinejoin: 'round' as const,
        viewBox: '0 0 24 24',
    };

    switch (name) {
        case 'home':
            return <svg {...common}><path d="M3 11.5 12 4l9 7.5" /><path d="M5.5 10.5V20h13v-9.5" /><path d="M9.5 20v-5h5v5" /></svg>;
        case 'plus':
            return <svg {...common}><path d="M12 5v14" /><path d="M5 12h14" /></svg>;
        case 'map':
            return <svg {...common}><path d="M9 18 3 20V6l6-2 6 2 6-2v14l-6 2-6-2Z" /><path d="M9 4v14" /><path d="M15 6v14" /></svg>;
        case 'message':
            return <svg {...common}><path d="M5 6h14v10H8l-3 3V6Z" /></svg>;
        case 'user':
            return <svg {...common}><path d="M20 21a8 8 0 0 0-16 0" /><circle cx="12" cy="8" r="4" /></svg>;
        case 'doc':
            return <svg {...common}><path d="M7 3h7l4 4v14H7V3Z" /><path d="M14 3v5h5" /><path d="M9 13h6" /><path d="M9 17h4" /></svg>;
        case 'search':
            return <svg {...common}><circle cx="11" cy="11" r="6" /><path d="m16 16 4 4" /></svg>;
        case 'shield':
            return <svg {...common}><path d="M12 3 5 6v5c0 4.5 2.8 8.3 7 10 4.2-1.7 7-5.5 7-10V6l-7-3Z" /><path d="m9.5 12 1.8 1.8 3.7-4" /></svg>;
        case 'check':
            return <svg {...common}><path d="m5 12 4 4L19 6" /></svg>;
        case 'pin':
            return <svg {...common}><path d="M12 21s7-5.1 7-11a7 7 0 1 0-14 0c0 5.9 7 11 7 11Z" /><circle cx="12" cy="10" r="2.5" /></svg>;
        case 'hash':
            return <svg {...common}><path d="M10 3 8 21" /><path d="M16 3l-2 18" /><path d="M4 9h17" /><path d="M3 15h17" /></svg>;
    }
}
