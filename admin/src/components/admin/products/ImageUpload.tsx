'use client';

import { useRef } from 'react';
import Image from 'next/image';
import { Upload, X, Loader2 } from 'lucide-react';

export interface IUploadedAsset {
  url: string;
  key: string;
  uploading?: boolean;
}

interface ImageUploadProps {
  label: string;
  multiple?: boolean;
  maxFiles?: number;
  assets: IUploadedAsset[];
  onFiles: (files: File[]) => void;
  onRemove: (index: number) => void;
  error?: string;
}

export default function ImageUpload({
  label, multiple = false, maxFiles = 1,
  assets, onFiles, onRemove, error,
}: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files ?? []);
    onFiles(selected);
    e.target.value = '';
  };

  const canAdd = assets.length < maxFiles;

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-slate-300">{label}</label>

      <div className="flex flex-wrap gap-3">
        {assets.map((asset, i) => (
          <div key={i} className="relative h-24 w-24 overflow-hidden rounded-xl border border-white/10 bg-white/5">
            {asset.uploading ? (
              // Loading spinner while uploading
              <div className="flex h-full w-full items-center justify-center">
                <Loader2 size={20} className="animate-spin text-indigo-400" />
              </div>
            ) : (
              <>
                <Image src={asset.url} alt={`upload-${i}`} fill className="object-cover" sizes="96px" />
                <button
                  type="button"
                  onClick={() => onRemove(i)}
                  className="absolute right-1 top-1 rounded-full bg-black/60 p-0.5 text-white hover:bg-red-500/80 transition-colors"
                >
                  <X size={12} />
                </button>
              </>
            )}
          </div>
        ))}

        {canAdd && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="flex h-24 w-24 flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-white/20 bg-white/5 text-slate-400 hover:border-indigo-500/50 hover:text-indigo-400 transition-colors"
          >
            <Upload size={18} />
            <span className="text-xs">Upload</span>
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/avif"
        multiple={multiple}
        className="hidden"
        onChange={handleChange}
      />

      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}
