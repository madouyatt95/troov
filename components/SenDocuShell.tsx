import { ReactNode } from 'react';
import { BottomNav } from '@/components/BottomNav';

export function SenDocuShell({ children, withNav = true }: { children: ReactNode; withNav?: boolean }) {
    return (
        <main className={`sen-app mx-auto min-h-screen w-full max-w-md overflow-hidden ${withNav ? 'pb-28' : ''}`}>
            <div className="sen-orb sen-orb-green" />
            <div className="sen-orb sen-orb-blue" />
            <div className="relative z-10">{children}</div>
            {withNav && <BottomNav />}
        </main>
    );
}
