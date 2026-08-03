"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Upload, History, MessageCircle } from "lucide-react";

const TABS = [
  { href: "/upload", label: "Upload", icon: Upload },
  { href: "/history", label: "History", icon: History },
  { href: "/assistant", label: "Assistant", icon: MessageCircle },
];

export function BottomTabBar() {
  const pathname = usePathname();

  const scrollTop = () => window.scrollTo({ top: 0 });

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 flex border-t border-ink-700 bg-ink-950/95 backdrop-blur-sm"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      {TABS.map(({ href, label, icon: Icon }) => {
        const active = pathname?.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            onClick={scrollTop}
            className={`flex-1 flex flex-col items-center justify-center gap-0.5 h-14 min-w-11 text-xs ${
              active ? "text-moss-400" : "text-parchment-200/60"
            }`}
          >
            <Icon size={20} />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
