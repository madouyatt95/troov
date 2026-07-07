'use client';

import { useEffect, useRef, useState } from 'react';

type SecureFilePickerProps = {
    label?: string;
    helper?: string;
    onFileChange?: (file: File | null) => void;
};

const MAX_SIZE_MB = 8;
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];

function formatSize(bytes: number) {
    if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} Ko`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
}

export function SecureFilePicker({
    label = 'Ajouter une pièce — image ou PDF',
    helper = 'Les fichiers sont vérifiés localement avant envoi. Le stockage sécurisé sera activé côté production.',
    onFileChange,
}: SecureFilePickerProps) {
    const [file, setFile] = useState<File | null>(null);
    const [error, setError] = useState('');
    const [previewUrl, setPreviewUrl] = useState('');
    const previewUrlRef = useRef('');

    useEffect(() => {
        return () => {
            if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
        };
    }, []);

    const clearPreview = () => {
        if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
        previewUrlRef.current = '';
        setPreviewUrl('');
    };

    const updateFile = (nextFile: File | null) => {
        setError('');

        if (!nextFile) {
            clearPreview();
            setFile(null);
            onFileChange?.(null);
            return;
        }

        if (!ACCEPTED_TYPES.includes(nextFile.type)) {
            clearPreview();
            setError('Format non accepté. Utilisez JPG, PNG, WebP ou PDF.');
            setFile(null);
            onFileChange?.(null);
            return;
        }

        if (nextFile.size > MAX_SIZE_MB * 1024 * 1024) {
            clearPreview();
            setError(`Fichier trop lourd. Maximum ${MAX_SIZE_MB} Mo.`);
            setFile(null);
            onFileChange?.(null);
            return;
        }

        clearPreview();
        if (nextFile.type.startsWith('image/')) {
            const nextPreviewUrl = URL.createObjectURL(nextFile);
            previewUrlRef.current = nextPreviewUrl;
            setPreviewUrl(nextPreviewUrl);
        }
        setFile(nextFile);
        onFileChange?.(nextFile);
    };

    return (
        <div className="rounded-[24px] border border-white/10 bg-white/[0.045] p-4">
            <p className="font-black text-white">{label}</p>
            <p className="mt-1 text-xs leading-5 text-[#8094ad]">{helper}</p>

            <label className="mt-3 flex cursor-pointer items-center justify-center rounded-2xl border border-dashed border-[#53a9ff]/45 bg-[#53a9ff]/8 px-4 py-4 text-sm font-black text-[#53a9ff]">
                Choisir un fichier sécurisé
                <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,application/pdf"
                    capture="environment"
                    className="hidden"
                    onChange={(event) => updateFile(event.target.files?.[0] || null)}
                />
            </label>

            {error && <p className="mt-3 rounded-2xl border border-[#ff6b6b]/30 bg-[#ff6b6b]/10 p-3 text-xs text-[#ff8585]">{error}</p>}

            {file && (
                <div className="mt-3 rounded-2xl border border-[#34f58b]/25 bg-[#34f58b]/10 p-3">
                    <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0">
                            <p className="truncate text-sm font-black text-white">{file.name}</p>
                            <p className="mt-1 text-xs text-[#9aacbf]">{formatSize(file.size)} · {file.type === 'application/pdf' ? 'PDF' : 'Image'}</p>
                        </div>
                        <button
                            type="button"
                            onClick={() => updateFile(null)}
                            className="shrink-0 rounded-xl border border-white/10 px-3 py-2 text-xs font-black text-[#ff8585]"
                        >
                            Retirer
                        </button>
                    </div>

                    {previewUrl && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                            src={previewUrl}
                            alt="Aperçu de la pièce"
                            className="mt-3 h-36 w-full rounded-2xl object-cover"
                        />
                    )}
                </div>
            )}
        </div>
    );
}
