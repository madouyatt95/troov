export function SenDocuLogo({ compact = false }: { compact?: boolean }) {
    return (
        <div className="flex items-center gap-2">
            <div className="relative h-10 w-10 rounded-2xl border border-[#34f58b]/30 bg-gradient-to-br from-[#14263a] via-[#0b1728] to-[#07111f] shadow-[0_0_30px_rgba(52,245,139,0.18)]">
                <div className="absolute left-2 top-2 h-6 w-5 rounded-md border border-white/25 bg-white/10" />
                <div className="absolute left-[18px] top-[16px] h-3 w-3 rounded-full border-2 border-[#34f58b]" />
                <div className="absolute left-[27px] top-[25px] h-2 w-[2px] rotate-[-45deg] rounded-full bg-[#34f58b]" />
                <div className="absolute right-1.5 top-1.5 grid h-4 w-4 place-items-center rounded-full bg-[#34f58b] text-[9px] font-black text-[#05111d]">✓</div>
            </div>
            {!compact && (
                <div className="leading-none">
                    <p className="text-[21px] font-black tracking-[-0.04em] text-white">SenDocu</p>
                    <p className="text-[10px] font-medium tracking-[0.18em] text-[#7f91ad]">SÉNÉGAL</p>
                </div>
            )}
        </div>
    );
}
