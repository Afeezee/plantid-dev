"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Trash2 } from "lucide-react";
import type { PlantAnalysisResult } from "@/lib/anthropic";
import {
  AnalysisDetailModal,
  type AnalysisDetail,
} from "@/components/analysis/AnalysisDetailModal";

type AnalysisRow = {
  id: string;
  plantCommonName: string | null;
  plantScientificName: string | null;
  criticalRating: string | null;
  isHealthy: boolean | null;
  status: string;
  createdAt: string;
  images: string[] | null;
  result: PlantAnalysisResult | null;
};

export default function HistoryPage() {
  const queryClient = useQueryClient();
  const [detail, setDetail] = useState<AnalysisDetail | null>(null);

  const { data, isLoading } = useQuery<AnalysisRow[]>({
    queryKey: ["history"],
    queryFn: () => fetch("/api/history").then((r) => r.json()),
  });

  const remove = useMutation({
    mutationFn: (id: string) => fetch(`/api/history?id=${id}`, { method: "DELETE" }),
    // Optimistic update — mirrors the onMutate/onError rollback pattern
    // from the original History.jsx.
    onMutate: async (id: string) => {
      await queryClient.cancelQueries({ queryKey: ["history"] });
      const previous = queryClient.getQueryData<AnalysisRow[]>(["history"]);
      queryClient.setQueryData<AnalysisRow[]>(["history"], (rows) =>
        rows?.filter((r) => r.id !== id),
      );
      return { previous };
    },
    onError: (_err, _id, context) => {
      if (context?.previous) queryClient.setQueryData(["history"], context.previous);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["history"] }),
  });

  if (isLoading) {
    return <div className="max-w-3xl mx-auto px-6 py-10 text-parchment-200/50">Loading history…</div>;
  }

  if (!data?.length) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-10">
        <h1 className="text-2xl mb-2">History</h1>
        <p className="text-parchment-200/60">No analyses yet — your identified plants will show up here.</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <h1 className="text-2xl mb-6">History</h1>
      <div className="flex flex-col gap-3">
        {data.map((row) => (
          <div
            key={row.id}
            className="flex items-center justify-between border border-ink-700 rounded-label p-4 hover:border-ochre-500/40 transition-colors"
          >
            <button
              type="button"
              onClick={() =>
                setDetail({
                  id: row.id,
                  createdAt: row.createdAt,
                  result: row.result,
                  images: row.images,
                  status: row.status,
                })
              }
              className="flex-1 text-left min-w-0"
            >
              <p className="font-display italic truncate">
                {row.plantScientificName ?? "Pending…"}
              </p>
              <p className="text-sm text-parchment-200/60 truncate">
                {row.plantCommonName} · {new Date(row.createdAt).toLocaleDateString()}
              </p>
            </button>
            <div className="flex items-center gap-3 shrink-0 ml-3">
              <span
                className={`stamp ${row.criticalRating === "Severe" || row.criticalRating === "High" ? "stamp-severe" : ""}`}
              >
                {row.isHealthy ? "Healthy" : row.criticalRating ?? row.status}
              </span>
              <button
                onClick={() => remove.mutate(row.id)}
                aria-label="Delete analysis"
                className="h-11 w-11 flex items-center justify-center text-parchment-200/50 hover:text-rust-400"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>

      <AnalysisDetailModal analysis={detail} onClose={() => setDetail(null)} />
    </div>
  );
}
