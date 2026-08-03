"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useMutation } from "@tanstack/react-query";
import { Plane } from "lucide-react";
import { ImageUploader, type UploadedImage } from "@/components/ImageUploader";
import { HealthAssessmentCard } from "@/components/analysis/HealthAssessmentCard";
import { ControlledPlantCard } from "@/components/analysis/ControlledPlantCard";
import type { PlantAnalysisResult } from "@/lib/anthropic";

type AnalysisResponse = { id: string; result: PlantAnalysisResult };

const MAX_DRONE_IMAGES = 24;

export default function DroneModePage() {
  const [images, setImages] = useState<UploadedImage[]>([]);

  const analyze = useMutation({
    mutationFn: async (): Promise<AnalysisResponse> => {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageUrls: images.map((i) => i.url),
          images: images.map((i) => ({ base64: i.base64, mediaType: i.mediaType })),
          analysisType: "drone",
        }),
      });
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
      <div className="flex items-center gap-2 mb-1">
        <Plane size={22} className="text-moss-400" />
        <h1 className="text-2xl">Drone Mode</h1>
      </div>
      <p className="text-parchment-200/60 text-sm mb-8">
        Upload a batch of aerial or walk-through photos of a plot — PlantiD
        returns a plot-level health assessment for the dominant crop rather
        than a single-specimen identification.
      </p>

      {!analyze.data && (
        <>
          <ImageUploader
            onChange={setImages}
            maxFiles={MAX_DRONE_IMAGES}
            ctaLabel="Tap to add plot photos"
          />
          <p className="text-xs text-parchment-200/40 mt-2">
            Up to {MAX_DRONE_IMAGES} images per plot survey.
          </p>
          <button
            disabled={images.length === 0 || analyze.isPending}
            onClick={() => analyze.mutate()}
            className="mt-6 w-full btn-primary w-full py-3"
          >
            {analyze.isPending ? "Surveying plot…" : "Assess plot"}
          </button>
          {analyze.isError && (
            <p className="text-rust-400 text-sm mt-3">
              Plot assessment failed — please try again.
            </p>
          )}
        </>
      )}

      {analyze.data && (
        <div className="flex flex-col gap-4">
          <PlotSummaryCard result={analyze.data.result} imageCount={images.length} />
          <HealthAssessmentCard result={analyze.data.result} />
          <ControlledPlantCard result={analyze.data.result} />
          <button
            onClick={reset}
            className="mt-2 text-sm text-parchment-200/60 hover:text-parchment-100 underline underline-offset-4"
          >
            Survey another plot
          </button>
        </div>
      )}
    </div>
  );
}

function PlotSummaryCard({
  result,
  imageCount,
}: {
  result: PlantAnalysisResult;
  imageCount: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="specimen-label"
    >
      <p className="text-xs uppercase tracking-wider text-parchment-200/50">
        Plot-level assessment · {imageCount} image{imageCount === 1 ? "" : "s"}
      </p>
      <p className="font-display text-2xl italic mt-2">
        {result.plant_scientific_name}
      </p>
      <p className="text-sm text-parchment-200/70">
        Dominant cover: {result.plant_common_name}
        {result.family ? ` · ${result.family}` : ""}
      </p>
      {result.habitat && (
        <p className="text-sm text-parchment-200/60 mt-3">
          <span className="text-parchment-200/40">Site notes: </span>
          {result.habitat}
        </p>
      )}
      <span className="stamp mt-4 inline-flex">
        {Math.round(result.identification_confidence * 100)}% coverage confidence
      </span>
    </motion.div>
  );
}
