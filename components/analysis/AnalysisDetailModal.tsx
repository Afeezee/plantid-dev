"use client";

import { useEffect } from "react";
import { X } from "lucide-react";
import { AnalysisResultView } from "./AnalysisResultView";
import type { PlantAnalysisResult } from "@/lib/anthropic";

export type AnalysisDetail = {
  id: string;
  createdAt: string;
  result: PlantAnalysisResult | null;
  images?: string[] | null;
  status: string;
};

export function AnalysisDetailModal({
  analysis,
  onClose,
}: {
  analysis: AnalysisDetail | null;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!analysis) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [analysis, onClose]);

  if (!analysis) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-start md:items-center justify-center bg-ink-950/80 backdrop-blur-sm p-0 md:p-6 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl bg-ink-900 border border-ink-700 rounded-label md:my-6 min-h-screen md:min-h-0"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 flex items-center justify-between px-5 py-3 border-b border-ink-700 bg-ink-900/95 backdrop-blur">
          <p className="font-display text-lg">Analysis detail</p>
          <button
            onClick={onClose}
            aria-label="Close"
            className="h-11 w-11 flex items-center justify-center text-parchment-200/60 hover:text-parchment-100"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-5">
          {analysis.result ? (
            <AnalysisResultView
              result={analysis.result}
              createdAt={analysis.createdAt}
              imageUrls={analysis.images ?? undefined}
            />
          ) : (
            <p className="text-parchment-200/60 text-sm py-8 text-center">
              This analysis is {analysis.status} — no result to show yet.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
