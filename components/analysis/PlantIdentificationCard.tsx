"use client";

import { motion } from "framer-motion";
import type { PlantAnalysisResult } from "@/lib/anthropic";

export function PlantIdentificationCard({ result }: { result: PlantAnalysisResult }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="specimen-label"
    >
      <p className="text-xs uppercase tracking-wider text-parchment-200/50">Identification</p>
      <p className="font-display text-2xl italic mt-2">{result.plant_scientific_name}</p>
      <p className="text-sm text-parchment-200/70">
        {result.plant_common_name}
        {result.family ? ` · ${result.family}` : ""}
      </p>
      {result.habitat && (
        <p className="text-sm text-parchment-200/60 mt-3">
          <span className="text-parchment-200/40">Habitat: </span>
          {result.habitat}
        </p>
      )}
      {result.uses && (
        <p className="text-sm text-parchment-200/60 mt-1">
          <span className="text-parchment-200/40">Uses: </span>
          {result.uses}
        </p>
      )}
      <span className="stamp mt-4 inline-flex">
        {Math.round(result.identification_confidence * 100)}% confidence
      </span>
    </motion.div>
  );
}
