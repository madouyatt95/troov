'use client';

import { useState, useRef, KeyboardEvent, ClipboardEvent } from 'react';
import { cn } from '@/lib/utils';

interface OtpInputProps {
    length?: number;
    onComplete: (otp: string) => void;
    disabled?: boolean;
    error?: boolean;
}

export function OtpInput({ length = 6, onComplete, disabled, error }: OtpInputProps) {
    const [values, setValues] = useState<string[]>(Array(length).fill(''));
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    const handleChange = (index: number, value: string) => {
        if (!/^\d*$/.test(value)) return;

        const newValues = [...values];
        newValues[index] = value.slice(-1);
        setValues(newValues);

        if (value && index < length - 1) {
            inputRefs.current[index + 1]?.focus();
        }

        if (newValues.every(v => v) && newValues.join('').length === length) {
            onComplete(newValues.join(''));
        }
    };

    const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Backspace' && !values[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length);

        if (pastedData) {
            const newValues = [...values];
            pastedData.split('').forEach((char, i) => {
                if (i < length) newValues[i] = char;
            });
            setValues(newValues);

            if (newValues.every(v => v)) {
                onComplete(newValues.join(''));
            }
        }
    };

    return (
        <div className="flex gap-2 justify-center">
            {Array.from({ length }).map((_, index) => (
                <input
                    key={index}
                    ref={el => { inputRefs.current[index] = el; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={values[index]}
                    onChange={e => handleChange(index, e.target.value)}
                    onKeyDown={e => handleKeyDown(index, e)}
                    onPaste={handlePaste}
                    disabled={disabled}
                    className={cn(
                        'w-12 h-14 text-center text-2xl font-bold rounded-xl bg-[#25253d] text-white border-2 transition-all duration-200',
                        'focus:outline-none focus:border-[#4361ee] focus:ring-2 focus:ring-[#4361ee]/20',
                        'disabled:opacity-50 disabled:cursor-not-allowed',
                        error ? 'border-[#f87171] animate-shake' : 'border-transparent'
                    )}
                />
            ))}
        </div>
    );
}
