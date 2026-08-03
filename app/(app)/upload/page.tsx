"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { ImageUploader, type UploadedImage } from "@/components/ImageUploader";
import { AnalysisResultView } from "@/components/analysis/AnalysisResultView";
import type { PlantAnalysisResult } from "@/lib/anthropic";

type AnalysisResponse = {
  id: string;
  createdAt: string;
  images: string[];
  result: PlantAnalysisResult;
};

export default function UploadPage() {
  const [images, setImages] = useState<UploadedImage[]>([]);

  const analyze = useMutation({
    mutationFn: async (): Promise<AnalysisResponse> => {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageUrls: images.map((i) => i.url),
          images: images.map((i) => ({ base64: i.base64, mediaType: i.mediaType })),
          analysisType: "standard",
        }),
      });
      if (res.status === 429) {
        const { retryAfterSeconds } = await res.json().catch(() => ({}));
        throw new Error(
          `Rate limit hit — try again in ${Math.ceil((retryAfterSeconds ?? 60) / 60)} min.`,
        );
      }
      if (!res.ok) throw new Error("Analysis failed");
      return res.json();
    },
  });

  const reset = () => {
    setImages([]);
    analyze.reset();
  };

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <h1 className="text-2xl mb-1">Upload &amp; Analyse</h1>
      <p className="text-parchment-200/60 text-sm mb-8">
        Add one or more photos of a plant to identify it and check its health.
      </p>

      {!analyze.data && (
        <>
          <ImageUploader onChange={setImages} />
          <button
            disabled={images.length === 0 || analyze.isPending}
            onClick={() => analyze.mutate()}
            className="mt-6 w-full btn-primary w-full py-3"
          >
            {analyze.isPending ? "Analysing…" : "Analyse plant"}
          </button>
          {analyze.isError && (
            <p className="text-rust-400 text-sm mt-3">
              {analyze.error instanceof Error
                ? analyze.error.message
                : "Something went wrong analysing that photo — please try again."}
            </p>
          )}
        </>
      )}

      {analyze.data && (
        <AnalysisResultView
          result={analyze.data.result}
          createdAt={analyze.data.createdAt}
          imageUrls={analyze.data.images}
          actions={
            <button
              onClick={reset}
              className="text-sm text-parchment-200/60 hover:text-parchment-100 underline underline-offset-4"
            >
              Analyse another plant
            </button>
          }
        />
      )}
    </div>
  );
}
