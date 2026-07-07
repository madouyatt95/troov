'use client';

import { useState, useRef, useCallback } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface SelfieCaptureProps {
    onCapture: (imageData: string) => void;
    onCancel: () => void;
}

export function SelfieCapture({ onCapture, onCancel }: SelfieCaptureProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [capturedImage, setCapturedImage] = useState<string | null>(null);

    const startCamera = useCallback(async () => {
        setIsLoading(true);
        setError('');
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'user', width: { ideal: 720 }, height: { ideal: 720 } },
            });
            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream;
                await videoRef.current.play();
            }
            setStream(mediaStream);
        } catch (err) {
            console.error('Camera error:', err);
            setError('Impossible d\'accéder à la caméra. Veuillez autoriser l\'accès.');
        } finally {
            setIsLoading(false);
        }
    }, []);

    const stopCamera = useCallback(() => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
        }
    }, [stream]);

    const capture = useCallback(() => {
        if (!videoRef.current || !canvasRef.current) return;

        const video = videoRef.current;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');

        if (!ctx) return;

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.drawImage(video, 0, 0);

        const imageData = canvas.toDataURL('image/jpeg', 0.8);
        setCapturedImage(imageData);
        stopCamera();
    }, [stopCamera]);

    const retake = useCallback(() => {
        setCapturedImage(null);
        startCamera();
    }, [startCamera]);

    const confirm = useCallback(() => {
        if (capturedImage) {
            onCapture(capturedImage);
        }
    }, [capturedImage, onCapture]);

    const handleCancel = useCallback(() => {
        stopCamera();
        onCancel();
    }, [stopCamera, onCancel]);

    return (
        <div className="fixed inset-0 bg-black/90 z-50 flex flex-col">
            {/* Header */}
            <header className="flex items-center justify-between p-4 safe-area-top">
                <button onClick={handleCancel} className="text-white">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
                <h1 className="font-semibold text-white">📷 Vérification</h1>
                <div className="w-6" />
            </header>

            {/* Camera view */}
            <div className="flex-1 flex items-center justify-center p-4">
                {!stream && !capturedImage && (
                    <Card className="bg-[#1a1a2e] border-[#3a3a60] max-w-sm">
                        <CardContent className="p-6 text-center">
                            <div className="w-20 h-20 mx-auto mb-4 bg-[#4361ee]/20 rounded-full flex items-center justify-center">
                                <span className="text-4xl">📸</span>
                            </div>
                            <h2 className="text-lg font-semibold mb-2">Selfie de vérification</h2>
                            <p className="text-sm text-[#a0a0b9] mb-4">
                                Prenez une photo de vous tenant votre pièce d&apos;identité secondaire (permis, carte scolaire, etc.)
                            </p>
                            {error && (
                                <p className="text-sm text-[#f87171] mb-4">{error}</p>
                            )}
                            <Button onClick={startCamera} isLoading={isLoading}>
                                Activer la caméra
                            </Button>
                        </CardContent>
                    </Card>
                )}

                {stream && !capturedImage && (
                    <div className="relative w-full max-w-md aspect-square">
                        <video
                            ref={videoRef}
                            autoPlay
                            playsInline
                            muted
                            className="w-full h-full object-cover rounded-2xl"
                        />
                        {/* Face guide overlay */}
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <div className="w-48 h-64 border-2 border-dashed border-[#4361ee]/50 rounded-3xl" />
                        </div>
                        <p className="absolute bottom-4 left-0 right-0 text-center text-sm text-white/80">
                            Placez votre visage dans le cadre
                        </p>
                    </div>
                )}

                {capturedImage && (
                    <div className="w-full max-w-md">
                        <Image
                            src={capturedImage}
                            alt="Selfie capturé"
                            width={720}
                            height={720}
                            unoptimized
                            className="w-full aspect-square object-cover rounded-2xl"
                        />
                    </div>
                )}
            </div>

            {/* Actions */}
            <div className="p-4 safe-area-bottom space-y-3">
                {stream && !capturedImage && (
                    <Button onClick={capture} className="w-full">
                        📷 Capturer
                    </Button>
                )}

                {capturedImage && (
                    <>
                        <Button onClick={confirm} className="w-full bg-gradient-to-r from-[#4ade80] to-[#22c55e]">
                            ✓ Confirmer la photo
                        </Button>
                        <Button onClick={retake} variant="outline" className="w-full">
                            🔄 Reprendre
                        </Button>
                    </>
                )}
            </div>

            {/* Hidden canvas for capture */}
            <canvas ref={canvasRef} className="hidden" />
        </div>
    );
}
