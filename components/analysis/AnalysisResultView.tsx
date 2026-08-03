"use client";

import { useRef, useState } from "react";
import { Download } from "lucide-react";
import { PlantIdentificationCard } from "./PlantIdentificationCard";
import { HealthAssessmentCard } from "./HealthAssessmentCard";
import { ControlledPlantCard } from "./ControlledPlantCard";
import type { PlantAnalysisResult } from "@/lib/anthropic";

// Single source of truth for how a completed analysis renders — reused on
// the Upload result view, the History detail modal, and the PDF export.

export function AnalysisResultView({
  result,
  createdAt,
  imageUrls,
  actions,
}: {
  result: PlantAnalysisResult;
  createdAt?: string;
  imageUrls?: string[];
  actions?: React.ReactNode;
}) {
  const printRef = useRef<HTMLDivElement>(null);
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  const filenameStem =
    (result.plant_common_name || result.plant_scientific_name || "plantid-report")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "plantid-report";

  async function onExport() {
    setExporting(true);
    setExportError(null);
    try {
      const [{ default: jsPDF }, html2canvasMod] = await Promise.all([
        import("jspdf"),
        import("html2canvas"),
      ]);
      const html2canvas = html2canvasMod.default;
      const node = printRef.current;
      if (!node) throw new Error("Nothing to export");

      const canvas = await html2canvas(node, {
        backgroundColor: "#0D1712",
        scale: 2,
        useCORS: true,
      });
      const imgData = canvas.toDataURL("image/png");

      const pdf = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 32;
      const usableWidth = pageWidth - margin * 2;
      const imgHeight = (canvas.height * usableWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = margin;
      pdf.addImage(imgData, "PNG", margin, position, usableWidth, imgHeight);
      heightLeft -= pageHeight - margin * 2;
      while (heightLeft > 0) {
        pdf.addPage();
        position = margin - (imgHeight - heightLeft);
        pdf.addImage(imgData, "PNG", margin, position, usableWidth, imgHeight);
        heightLeft -= pageHeight - margin * 2;
      }
      pdf.save(`${filenameStem}.pdf`);
    } catch (err) {
      console.error("Export failed", err);
      setExportError("Couldn't export that report — please try again.");
    } finally {
      setExporting(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <button
            onClick={onExport}
            disabled={exporting}
            className="inline-flex items-center gap-2 border border-ochre-500/60 text-ochre-400 hover:bg-ochre-500/10 px-3 py-2 rounded-label text-sm disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Download size={14} />
            {exporting ? "Exporting…" : "Export report (PDF)"}
          </button>
          {exportError && (
            <span className="text-rust-400 text-xs">{exportError}</span>
          )}
        </div>
        {actions}
      </div>

      <div ref={printRef} className="flex flex-col gap-4 p-2">
        <div className="text-xs text-parchment-200/40 flex items-center justify-between">
          <span className="font-display italic">PlantiD field report</span>
          {createdAt && <span>{new Date(createdAt).toLocaleString()}</span>}
        </div>

        <PlantIdentificationCard result={result} />
        <HealthAssessmentCard result={result} />
        <ControlledPlantCard result={result} />

        {imageUrls && imageUrls.length > 0 && (
          <div className="specimen-label">
            <p className="text-xs uppercase tracking-wider text-parchment-200/50 mb-3">
              Source photos
            </p>
            <div className="grid grid-cols-3 gap-2">
              {imageUrls.map((url) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={url}
                  src={url}
                  alt=""
                  crossOrigin="anonymous"
                  className="aspect-square object-cover rounded-label"
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
