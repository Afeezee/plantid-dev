"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ThumbsUp, ThumbsDown } from "lucide-react";

type AnalysisRow = {
  id: string;
  plantCommonName: string | null;
  plantScientificName: string | null;
  criticalRating: string | null;
  isHealthy: boolean | null;
  status: string;
  createdAt: string;
  feedback: "positive" | "negative" | null;
  feedbackTimestamp: string | null;
};

export default function FeedbackPage() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery<AnalysisRow[]>({
    queryKey: ["history"],
    queryFn: () => fetch("/api/history").then((r) => r.json()),
  });

  const rate = useMutation({
    mutationFn: async ({
      id,
      feedback,
    }: {
      id: string;
      feedback: "positive" | "negative" | null;
    }) => {
      const res = await fetch(`/api/history?id=${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ feedback }),
      });
      if (!res.ok) throw new Error("Failed to save feedback");
      return res.json();
    },
    onMutate: async ({ id, feedback }) => {
      await queryClient.cancelQueries({ queryKey: ["history"] });
      const previous = queryClient.getQueryData<AnalysisRow[]>(["history"]);
      queryClient.setQueryData<AnalysisRow[]>(["history"], (rows) =>
        rows?.map((r) =>
          r.id === id
            ? {
                ...r,
                feedback,
                feedbackTimestamp: feedback ? new Date().toISOString() : null,
              }
            : r,
        ),
      );
      return { previous };
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.previous) queryClient.setQueryData(["history"], ctx.previous);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["history"] }),
  });

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-10 text-parchment-200/50">
        Loading your analyses…
      </div>
    );
  }

  const rows = (data ?? []).filter((r) => r.status === "completed");

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <h1 className="text-2xl mb-2">Feedback</h1>
      <p className="text-parchment-200/60 text-sm mb-8">
        Rate the accuracy of each analysis. Your feedback is stored against
        the record and used to tune identification and health prompts.
      </p>

      {rows.length === 0 && (
        <p className="text-parchment-200/50">
          No completed analyses to rate yet. Run one from the Upload page and
          come back here.
        </p>
      )}

      <div className="flex flex-col gap-3">
        {rows.map((row) => (
          <div
            key={row.id}
            className="border border-ink-700 rounded-label p-4 flex items-center justify-between gap-4"
          >
            <div className="min-w-0">
              <p className="font-display italic truncate">
                {row.plantScientificName ?? "Unknown species"}
              </p>
              <p className="text-sm text-parchment-200/60 truncate">
                {row.plantCommonName ?? "—"} ·{" "}
                {new Date(row.createdAt).toLocaleDateString()}
              </p>
              {row.feedbackTimestamp && (
                <p className="text-xs text-parchment-200/40 mt-1">
                  Rated {new Date(row.feedbackTimestamp).toLocaleDateString()}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <RateButton
                active={row.feedback === "positive"}
                onClick={() =>
                  rate.mutate({
                    id: row.id,
                    feedback: row.feedback === "positive" ? null : "positive",
                  })
                }
                variant="positive"
              />
              <RateButton
                active={row.feedback === "negative"}
                onClick={() =>
                  rate.mutate({
                    id: row.id,
                    feedback: row.feedback === "negative" ? null : "negative",
                  })
                }
                variant="negative"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function RateButton({
  active,
  onClick,
  variant,
}: {
  active: boolean;
  onClick: () => void;
  variant: "positive" | "negative";
}) {
  const Icon = variant === "positive" ? ThumbsUp : ThumbsDown;
  const activeClass =
    variant === "positive"
      ? "border-moss-500 text-moss-400 bg-moss-600/10"
      : "border-rust-500 text-rust-400 bg-rust-600/10";
  return (
    <button
      onClick={onClick}
      aria-label={variant === "positive" ? "Mark accurate" : "Mark inaccurate"}
      className={`h-11 w-11 rounded-label border flex items-center justify-center transition-colors ${
        active
          ? activeClass
          : "border-ink-700 text-parchment-200/50 hover:text-parchment-100"
      }`}
    >
      <Icon size={18} />
    </button>
  );
}
