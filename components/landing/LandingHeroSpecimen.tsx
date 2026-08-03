"use client";

import { useEffect, useState } from "react";
import { Leaf, ShieldCheck } from "lucide-react";

// Animated specimen "card" that cycles through three demo results, so the
// hero shows the actual product output rather than a stock plant photo.
const SPECIMENS = [
  {
    scientific: "Ocimum basilicum",
    common: "Sweet basil",
    family: "Lamiaceae",
    health: "Healthy",
    healthTone: "moss" as const,
    confidence: 98,
    controlled: false,
  },
  {
    scientific: "Solanum lycopersicum",
    common: "Tomato",
    family: "Solanaceae",
    health: "Early blight · Moderate",
    healthTone: "ochre" as const,
    confidence: 92,
    controlled: false,
  },
  {
    scientific: "Cannabis sativa",
    common: "Cannabis",
    family: "Cannabaceae",
    health: "Healthy",
    healthTone: "moss" as const,
    confidence: 96,
    controlled: true,
  },
];

export function LandingHeroSpecimen() {
  const [i, setI] = useState(0);
  const [phase, setPhase] = useState<"in" | "out">("in");

  useEffect(() => {
    const t = setInterval(() => {
      setPhase("out");
      setTimeout(() => {
        setI((n) => (n + 1) % SPECIMENS.length);
        setPhase("in");
      }, 350);
    }, 4200);
    return () => clearInterval(t);
  }, []);

  const s = SPECIMENS[i];
  const toneClass =
    s.healthTone === "moss"
      ? "stamp-moss"
      : s.healthTone === "ochre"
        ? ""
        : "stamp-severe";

  return (
    <div className="relative">
      {/* soft moss glow */}
      <div className="absolute inset-0 -z-10 blur-3xl opacity-40 bg-moss-500/20 rounded-full" />

      {/* specimen card */}
      <div
        className={`specimen-label max-w-md mx-auto md:ml-auto md:mr-0 transition-all duration-500 ${
          phase === "in" ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
        } animate-drift`}
      >
        <p className="text-xs uppercase tracking-wider text-parchment-100/50">
          Specimen · Analysed just now
        </p>
        <div className="mt-2 flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="font-display text-2xl italic truncate">{s.scientific}</p>
            <p className="text-sm text-parchment-100/70 truncate">
              {s.common} · {s.family}
            </p>
          </div>
          <Leaf className="text-moss-500 dark:text-moss-400 shrink-0" size={22} />
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <span className={`stamp ${toneClass}`}>{s.health}</span>
          <span className="stamp">{s.confidence}% confidence</span>
          {s.controlled && (
            <span className="stamp stamp-severe">
              <ShieldCheck size={12} />
              Controlled species
            </span>
          )}
        </div>

        {/* confidence bar */}
        <div className="mt-5">
          <div className="h-1.5 rounded-full bg-ink-700 overflow-hidden">
            <div
              className="h-full bg-moss-500 transition-all duration-700"
              style={{ width: `${s.confidence}%` }}
            />
          </div>
          <p className="text-[10px] uppercase tracking-wider text-parchment-100/40 mt-2">
            Live vision model · Anthropic Claude
          </p>
        </div>

        {/* tiny "aged paper" pin */}
        <span className="absolute -top-2 -right-2 h-4 w-4 rounded-full bg-ochre-500 border-2 border-ink-950 shadow" />
      </div>

      {/* stacked underlay cards for depth */}
      <div className="absolute inset-0 -z-10 translate-x-3 translate-y-3 rounded-label border border-ochre-500/20 bg-ink-900/40 max-w-md mx-auto md:ml-auto md:mr-0 h-full" />
      <div className="absolute inset-0 -z-20 translate-x-6 translate-y-6 rounded-label border border-moss-500/20 bg-ink-900/20 max-w-md mx-auto md:ml-auto md:mr-0 h-full" />
    </div>
  );
}
