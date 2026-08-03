"use client";

import { useQuery } from "@tanstack/react-query";

type Stats = {
  analyses: {
    totalAnalyses: number;
    completed: number;
    failed: number;
    controlledFlags: number;
    severeCases: number;
  };
  contactMessages: { unread: number; total: number };
  recentControlled: {
    id: string;
    plantCommonName: string | null;
    plantScientificName: string | null;
    createdAt: string;
  }[];
};

const CARD_LABELS: { key: keyof Stats["analyses"]; label: string }[] = [
  { key: "totalAnalyses", label: "Total analyses" },
  { key: "completed", label: "Completed" },
  { key: "failed", label: "Failed" },
  { key: "controlledFlags", label: "Controlled-species flags" },
  { key: "severeCases", label: "Severe health cases" },
];

export default function AdminDashboardPage() {
  const { data, isLoading, error } = useQuery<Stats>({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const res = await fetch("/api/admin/stats");
      if (!res.ok) throw new Error("Forbidden");
      return res.json();
    },
  });

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-10 text-rust-400">
        You don&apos;t have access to the admin dashboard.
      </div>
    );
  }
  if (isLoading || !data) {
    return <div className="max-w-4xl mx-auto px-6 py-10 text-parchment-200/50">Loading dashboard…</div>;
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <h1 className="text-2xl mb-1">Admin Dashboard</h1>
      <p className="text-parchment-200/60 text-sm mb-8">
        Aggregated usage across all users — restricted to the admin role.
      </p>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-10">
        {CARD_LABELS.map(({ key, label }) => (
          <div key={key} className="border border-ink-700 rounded-label p-5">
            <p className="text-3xl font-display">{data.analyses[key]}</p>
            <p className="text-xs text-parchment-200/50 mt-1">{label}</p>
          </div>
        ))}
        <div className="border border-ink-700 rounded-label p-5">
          <p className="text-3xl font-display">{data.contactMessages.unread}</p>
          <p className="text-xs text-parchment-200/50 mt-1">
            Unread contact messages ({data.contactMessages.total} total)
          </p>
        </div>
      </div>

      <h2 className="text-lg mb-4">Recent controlled-species flags</h2>
      {data.recentControlled.length === 0 ? (
        <p className="text-parchment-200/50 text-sm">None flagged yet.</p>
      ) : (
        <div className="flex flex-col gap-2">
          {data.recentControlled.map((row) => (
            <div
              key={row.id}
              className="flex items-center justify-between border border-rust-500/40 rounded-label px-4 py-3"
            >
              <div>
                <p className="italic font-display">{row.plantScientificName}</p>
                <p className="text-sm text-parchment-200/60">{row.plantCommonName}</p>
              </div>
              <p className="text-xs text-parchment-200/40">
                {new Date(row.createdAt).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
