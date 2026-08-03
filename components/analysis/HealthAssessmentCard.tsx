"use client";

import { motion } from "framer-motion";
import type { PlantAnalysisResult } from "@/lib/anthropic";

export function HealthAssessmentCard({ result }: { result: PlantAnalysisResult }) {
  const severe = result.critical_rating === "Severe" || result.critical_rating === "High";

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="specimen-label"
    >
      <p className="text-xs uppercase tracking-wider text-parchment-200/50">Health assessment</p>

      <div className="flex items-center gap-2 mt-2">
        <span className={`stamp ${severe ? "stamp-severe" : ""}`}>
          {result.is_healthy ? "Healthy" : result.critical_rating}
        </span>
        <span className="stamp">{Math.round(result.health_confidence * 100)}% confidence</span>
      </div>

      {!result.is_healthy && result.disease_name && (
        <p className="text-sm mt-3">
          <span className="text-parchment-200/40">Issue: </span>
          {result.disease_name}
        </p>
      )}
      {result.treatment_recommendation && (
        <p className="text-sm text-parchment-200/70 mt-2">
          <span className="text-parchment-200/40">Treatment: </span>
          {result.treatment_recommendation}
        </p>
      )}
      {result.prevention_recommendation && (
        <p className="text-sm text-parchment-200/70 mt-1">
          <span className="text-parchment-200/40">Prevention: </span>
          {result.prevention_recommendation}
        </p>
      )}
    </motion.div>
  );
}
