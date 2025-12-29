import { InputHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    hint?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ className, label, error, hint, id, ...props }, ref) => {
        const inputId = id || label?.toLowerCase().replace(/\s/g, '-');

        return (
            <div className="w-full">
                {label && (
                    <label htmlFor={inputId} className="block text-sm font-medium text-[#a0a0b9] mb-2">
                        {label}
                    </label>
                )}
                <input
                    ref={ref}
                    id={inputId}
                    className={cn(
                        'w-full h-12 px-4 rounded-xl bg-[#25253d] border-2 border-transparent text-white placeholder-[#6b6b80] transition-all duration-200',
                        'focus:outline-none focus:border-[#4361ee] focus:ring-2 focus:ring-[#4361ee]/20',
                        'disabled:opacity-50 disabled:cursor-not-allowed',
                        error && 'border-[#f87171] focus:border-[#f87171] focus:ring-[#f87171]/20',
                        className
                    )}
                    {...props}
                />
                {hint && !error && (
                    <p className="mt-2 text-xs text-[#6b6b80] flex items-start gap-1">
                        <span className="text-[#4cc9f0]">ℹ️</span>
                        {hint}
                    </p>
                )}
                {error && (
                    <p className="mt-2 text-xs text-[#f87171] flex items-start gap-1">
                        <span>⚠️</span>
                        {error}
                    </p>
                )}
            </div>
        );
    }
);

Input.displayName = 'Input';

export { Input };
