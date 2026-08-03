"use client";

import { useRef, useState } from "react";
import { Upload, X, ImagePlus } from "lucide-react";

const DEFAULT_MAX_FILES = 6;
const MAX_SIZE_MB = 10;
const ACCEPTED = ["image/jpeg", "image/png", "image/webp"];

export type UploadedImage = { url: string; base64: string; mediaType: string; previewUrl: string };

export function ImageUploader({
  onChange,
  maxFiles = DEFAULT_MAX_FILES,
  ctaLabel,
}: {
  onChange: (images: UploadedImage[]) => void;
  maxFiles?: number;
  ctaLabel?: string;
}) {
  const MAX_FILES = maxFiles;
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFiles(files: FileList | null) {
    if (!files?.length) return;
    setError(null);

    const incoming = Array.from(files);
    if (images.length + incoming.length > MAX_FILES) {
      setError(`Up to ${MAX_FILES} photos per analysis.`);
      return;
    }

    for (const file of incoming) {
      if (!ACCEPTED.includes(file.type)) {
        setError("Only JPEG, PNG or WebP photos are supported.");
        return;
      }
      if (file.size > MAX_SIZE_MB * 1024 * 1024) {
        setError(`Each photo must be under ${MAX_SIZE_MB}MB.`);
        return;
      }
    }

    setUploading(true);
    try {
      const uploaded: UploadedImage[] = [];
      for (const file of incoming) {
        const form = new FormData();
        form.append("file", file);
        const res = await fetch("/api/upload", { method: "POST", body: form });
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body?.error || `Upload failed (${res.status})`);
        }
        const { url } = await res.json();
        const base64 = await fileToBase64(file);
        uploaded.push({ url, base64, mediaType: file.type, previewUrl: URL.createObjectURL(file) });
      }
      const next = [...images, ...uploaded];
      setImages(next);
      onChange(next);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Upload failed";
      setError(`Couldn't upload: ${msg}`);
    } finally {
      setUploading(false);
    }
  }

  function removeAt(index: number) {
    const next = images.filter((_, i) => i !== index);
    setImages(next);
    onChange(next);
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="w-full border-2 border-dashed border-ink-700 hover:border-moss-500/60 rounded-label p-10 flex flex-col items-center gap-3 text-parchment-200/70 transition-colors h-11 min-h-32"
      >
        <Upload size={28} />
        <span>{uploading ? "Uploading…" : ctaLabel ?? "Tap to add plant photos"}</span>
        <span className="text-xs text-parchment-200/40">JPEG, PNG or WebP · up to {MAX_SIZE_MB}MB each</span>
      </button>
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED.join(",")}
        multiple
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />

      {error && <p className="text-rust-400 text-sm mt-2">{error}</p>}

      {images.length > 0 && (
        <div className="grid grid-cols-3 gap-3 mt-4">
          {images.map((img, i) => (
            <div key={img.url} className="relative aspect-square rounded-label overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img.previewUrl} alt="" className="object-cover w-full h-full" />
              <button
                type="button"
                onClick={() => removeAt(i)}
                aria-label="Remove photo"
                className="absolute top-1 right-1 bg-ink-950/80 rounded-full p-1 h-11 w-11 flex items-center justify-center"
              >
                <X size={14} />
              </button>
            </div>
          ))}
          {images.length < MAX_FILES && (
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="aspect-square rounded-label border border-ink-700 flex items-center justify-center text-parchment-200/40"
            >
              <ImagePlus size={20} />
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve((reader.result as string).split(",")[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
