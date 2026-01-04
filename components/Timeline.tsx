'use client';

interface TimelineStep {
    id: string;
    label: string;
    icon: string;
    status: 'completed' | 'current' | 'pending';
    date?: string;
}

interface TimelineProps {
    steps: TimelineStep[];
    orientation?: 'horizontal' | 'vertical';
}

export function Timeline({ steps, orientation = 'horizontal' }: TimelineProps) {
    if (orientation === 'vertical') {
        return (
            <div className="flex flex-col gap-1">
                {steps.map((step, index) => (
                    <div key={step.id} className="flex items-start gap-3">
                        {/* Icon and line */}
                        <div className="flex flex-col items-center">
                            <div
                                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${step.status === 'completed'
                                        ? 'bg-[#4ade80]/20 border border-[#4ade80]/50'
                                        : step.status === 'current'
                                            ? 'bg-[#4361ee]/20 border border-[#4361ee] animate-pulse'
                                            : 'bg-[#2a2a45] border border-[#3a3a60]'
                                    }`}
                            >
                                <span className={`text-lg ${step.status === 'pending' ? 'opacity-40' : ''}`}>
                                    {step.status === 'completed' ? '✓' : step.icon}
                                </span>
                            </div>
                            {index < steps.length - 1 && (
                                <div
                                    className={`w-0.5 h-8 ${step.status === 'completed' ? 'bg-[#4ade80]/50' : 'bg-[#3a3a60]'
                                        }`}
                                />
                            )}
                        </div>
                        {/* Content */}
                        <div className="flex-1 pt-2">
                            <p
                                className={`text-sm font-medium ${step.status === 'completed'
                                        ? 'text-[#4ade80]'
                                        : step.status === 'current'
                                            ? 'text-white'
                                            : 'text-[#6b6b90]'
                                    }`}
                            >
                                {step.label}
                            </p>
                            {step.date && (
                                <p className="text-xs text-[#6b6b90] mt-0.5">{step.date}</p>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    // Horizontal orientation
    return (
        <div className="flex items-center justify-between gap-1">
            {steps.map((step, index) => (
                <div key={step.id} className="flex-1 flex items-center">
                    {/* Step circle */}
                    <div className="flex flex-col items-center">
                        <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm transition-all ${step.status === 'completed'
                                    ? 'bg-[#4ade80]/20 border border-[#4ade80]/50'
                                    : step.status === 'current'
                                        ? 'bg-[#4361ee]/20 border-2 border-[#4361ee] animate-pulse'
                                        : 'bg-[#2a2a45] border border-[#3a3a60]'
                                }`}
                        >
                            <span className={step.status === 'pending' ? 'opacity-40' : ''}>
                                {step.status === 'completed' ? '✓' : step.icon}
                            </span>
                        </div>
                        <p
                            className={`text-[10px] mt-1 text-center max-w-[60px] leading-tight ${step.status === 'completed'
                                    ? 'text-[#4ade80]'
                                    : step.status === 'current'
                                        ? 'text-white'
                                        : 'text-[#6b6b90]'
                                }`}
                        >
                            {step.label}
                        </p>
                    </div>
                    {/* Connector line */}
                    {index < steps.length - 1 && (
                        <div
                            className={`flex-1 h-0.5 mx-1 ${step.status === 'completed' ? 'bg-[#4ade80]/50' : 'bg-[#3a3a60]'
                                }`}
                        />
                    )}
                </div>
            ))}
        </div>
    );
}

interface StatusTimelineProps {
    status: 'SEARCHING' | 'MATCHED' | 'RECOVERED' | 'CANCELLED';
    dates?: {
        created?: string;
        matched?: string;
        recovered?: string;
    };
}

export function StatusTimeline({ status, dates }: StatusTimelineProps) {
    const getStepStatus = (stepIndex: number): 'completed' | 'current' | 'pending' => {
        const statusOrder = ['SEARCHING', 'MATCHED', 'RECOVERED'];
        const currentIndex = statusOrder.indexOf(status);

        if (status === 'CANCELLED') {
            return stepIndex === 0 ? 'completed' : 'pending';
        }

        if (stepIndex < currentIndex) return 'completed';
        if (stepIndex === currentIndex) return 'current';
        return 'pending';
    };

    const steps: TimelineStep[] = [
        {
            id: 'created',
            label: 'Signalé',
            icon: '📝',
            status: getStepStatus(0),
            date: dates?.created,
        },
        {
            id: 'searching',
            label: 'Recherche',
            icon: '🔍',
            status: status === 'SEARCHING' ? 'current' : getStepStatus(0),
        },
        {
            id: 'matched',
            label: 'Trouvé',
            icon: '✨',
            status: getStepStatus(1),
            date: dates?.matched,
        },
        {
            id: 'pickup',
            label: 'Retrait',
            icon: '📍',
            status: status === 'MATCHED' ? 'current' : getStepStatus(2),
        },
        {
            id: 'recovered',
            label: 'Récupéré',
            icon: '✅',
            status: getStepStatus(2),
            date: dates?.recovered,
        },
    ];

    return <Timeline steps={steps} orientation="horizontal" />;
}
