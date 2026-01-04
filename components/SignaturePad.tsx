'use client';

import { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface SignaturePadProps {
    onSave: (signatureData: string) => void;
    onCancel: () => void;
}

export function SignaturePad({ onSave, onCancel }: SignaturePadProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [hasSignature, setHasSignature] = useState(false);

    const getCoordinates = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
        const canvas = canvasRef.current;
        if (!canvas) return null;

        const rect = canvas.getBoundingClientRect();

        if ('touches' in e) {
            return {
                x: e.touches[0].clientX - rect.left,
                y: e.touches[0].clientY - rect.top,
            };
        }

        return {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
        };
    };

    const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (!canvas || !ctx) return;

        const coords = getCoordinates(e);
        if (!coords) return;

        setIsDrawing(true);
        ctx.beginPath();
        ctx.moveTo(coords.x, coords.y);
    };

    const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
        if (!isDrawing) return;

        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (!canvas || !ctx) return;

        const coords = getCoordinates(e);
        if (!coords) return;

        ctx.lineTo(coords.x, coords.y);
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.stroke();
        setHasSignature(true);
    };

    const stopDrawing = () => {
        setIsDrawing(false);
    };

    const clear = useCallback(() => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (!canvas || !ctx) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        setHasSignature(false);
    }, []);

    const save = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const signatureData = canvas.toDataURL('image/png');
        onSave(signatureData);
    }, [onSave]);

    return (
        <div className="fixed inset-0 bg-black/90 z-50 flex flex-col">
            {/* Header */}
            <header className="flex items-center justify-between p-4 safe-area-top">
                <button onClick={onCancel} className="text-white">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
                <h1 className="font-semibold text-white">✍️ Signature</h1>
                <button onClick={clear} className="text-[#a0a0b9] text-sm">
                    Effacer
                </button>
            </header>

            {/* Instructions */}
            <div className="px-4 py-2">
                <Card className="bg-[#4361ee]/10 border-[#4361ee]/30">
                    <CardContent className="p-3 text-center text-sm text-[#a0a0b9]">
                        Signez dans le cadre ci-dessous pour confirmer la récupération
                    </CardContent>
                </Card>
            </div>

            {/* Signature area */}
            <div className="flex-1 flex items-center justify-center p-4">
                <div className="w-full max-w-md bg-[#1a1a2e] rounded-2xl border-2 border-dashed border-[#3a3a60] p-2">
                    <canvas
                        ref={canvasRef}
                        width={350}
                        height={200}
                        className="w-full touch-none"
                        onMouseDown={startDrawing}
                        onMouseMove={draw}
                        onMouseUp={stopDrawing}
                        onMouseLeave={stopDrawing}
                        onTouchStart={startDrawing}
                        onTouchMove={draw}
                        onTouchEnd={stopDrawing}
                    />
                    {!hasSignature && (
                        <p className="text-center text-sm text-[#6b6b90] mt-2">
                            Dessinez votre signature ici
                        </p>
                    )}
                </div>
            </div>

            {/* Actions */}
            <div className="p-4 safe-area-bottom space-y-3">
                <Button
                    onClick={save}
                    disabled={!hasSignature}
                    className="w-full bg-gradient-to-r from-[#4ade80] to-[#22c55e]"
                >
                    ✓ Valider la signature
                </Button>
            </div>
        </div>
    );
}
