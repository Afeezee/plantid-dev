"use client";

import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

const STORAGE_KEY = "plantid-theme";

export function ThemeToggle({ compact = false }: { compact?: boolean }) {
  const [theme, setTheme] = useState<"light" | "dark" | null>(null);

  useEffect(() => {
    const initial = document.documentElement.classList.contains("dark") ? "dark" : "light";
    setTheme(initial);
  }, []);

  const apply = (next: "light" | "dark") => {
    setTheme(next);
    const html = document.documentElement;
    html.classList.toggle("dark", next === "dark");
    html.classList.toggle("light", next === "light");
    html.style.colorScheme = next;
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // ignore
    }
  };

  const toggle = () => apply(theme === "dark" ? "light" : "dark");

  if (!theme) {
    // avoid rendering an inconsistent icon before we know the mounted theme
    return <span className={compact ? "h-8 w-8" : "h-11 w-11"} aria-hidden />;
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
      title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
      className={`${
        compact ? "h-8 w-8" : "h-11 w-11"
      } inline-flex items-center justify-center rounded-label border border-ink-700 hover:border-moss-500/60 text-parchment-100/80 hover:text-parchment-100 transition-colors`}
    >
      {theme === "dark" ? <Sun size={compact ? 14 : 18} /> : <Moon size={compact ? 14 : 18} />}
    </button>
  );
}
