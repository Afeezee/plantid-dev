"use client";

import { motion } from "framer-motion";
import { AlertTriangle } from "lucide-react";
import type { PlantAnalysisResult } from "@/lib/anthropic";

export function ControlledPlantCard({ result }: { result: PlantAnalysisResult }) {
  if (!result.is_controlled_plant) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="specimen-label border-rust-500/60"
    >
      <div className="flex items-center gap-2 text-rust-400">
        <AlertTriangle size={18} />
        <p className="text-xs uppercase tracking-wider">Regulated species flagged</p>
      </div>
      <p className="text-sm text-parchment-200/70 mt-2">
        {result.controlled_plant_note ??
          "This plant may be a regulated or controlled species in your jurisdiction."}
      </p>
      <span className="stamp stamp-severe mt-3 inline-flex">
        {Math.round(result.controlled_confidence * 100)}% confidence
      </span>
    </motion.div>
  );
}
