import { ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
    size?: 'sm' | 'md' | 'lg';
    isLoading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = 'primary', size = 'md', isLoading, disabled, children, ...props }, ref) => {
        const baseStyles = 'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#1a1a2e] disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]';

        const variants = {
            primary: 'bg-[#4361ee] text-white hover:bg-[#3651d4] focus:ring-[#4361ee] shadow-lg shadow-[#4361ee]/25',
            secondary: 'bg-[#4cc9f0] text-[#1a1a2e] hover:bg-[#3bb8df] focus:ring-[#4cc9f0]',
            outline: 'border-2 border-[#4361ee] text-[#4361ee] hover:bg-[#4361ee]/10 focus:ring-[#4361ee]',
            ghost: 'text-[#a0a0b9] hover:text-white hover:bg-white/5 focus:ring-white/20',
            danger: 'bg-[#f87171] text-white hover:bg-[#ef4444] focus:ring-[#f87171]',
        };

        const sizes = {
            sm: 'h-9 px-4 text-sm',
            md: 'h-12 px-6 text-base min-w-[48px]',
            lg: 'h-14 px-8 text-lg',
        };

        return (
            <button
                ref={ref}
                className={cn(baseStyles, variants[variant], sizes[size], className)}
                disabled={disabled || isLoading}
                {...props}
            >
                {isLoading ? (
                    <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Chargement...
                    </>
                ) : children}
            </button>
        );
    }
);

Button.displayName = 'Button';

export { Button };
