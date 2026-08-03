"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import { PlantidLogo } from "@/components/PlantidLogo";
import { ThemeToggle } from "@/components/ThemeToggle";
import {
  Upload,
  History,
  MessageCircle,
  Plane,
  MessageSquare,
  ShieldCheck,
  Settings,
  Info,
  HelpCircle,
  Mail,
} from "lucide-react";

const NAV = [
  { href: "/upload", label: "Upload & Analyse", icon: Upload },
  { href: "/history", label: "History", icon: History },
  { href: "/assistant", label: "AI Assistant", icon: MessageCircle },
  { href: "/drone-mode", label: "Drone Mode", icon: Plane },
  { href: "/feedback", label: "Feedback", icon: MessageSquare },
  { href: "/settings", label: "Settings", icon: Settings },
];

const SECONDARY_NAV = [
  { href: "/about", label: "About Us", icon: Info },
  { href: "/faqs", label: "FAQs", icon: HelpCircle },
  { href: "/contact", label: "Contact", icon: Mail },
];

export function DesktopSidebar({ isAdmin }: { isAdmin: boolean }) {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex flex-col w-60 shrink-0 border-r border-ink-700 h-screen sticky top-0 p-4">
      <Link href="/" className="px-2 py-3 inline-flex">
        <PlantidLogo className="h-7 w-7" withWordmark />
      </Link>
      <nav className="flex-1 flex flex-col gap-1 mt-4">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = pathname?.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2 rounded-label text-sm transition-colors ${
                active
                  ? "bg-moss-600/20 text-moss-400"
                  : "text-parchment-200/70 hover:bg-ink-800 hover:text-parchment-100"
              }`}
            >
              <Icon size={18} />
              {label}
            </Link>
          );
        })}
        {isAdmin && (
          <Link
            href="/admin"
            className={`flex items-center gap-3 px-3 py-2 rounded-label text-sm mt-2 border-t border-ink-700 pt-3 ${
              pathname?.startsWith("/admin")
                ? "text-ochre-400"
                : "text-parchment-200/70 hover:text-ochre-400"
            }`}
          >
            <ShieldCheck size={18} />
            Admin Dashboard
          </Link>
        )}

        <div className="mt-4 pt-3 border-t border-ink-700 flex flex-col gap-1">
          {SECONDARY_NAV.map(({ href, label, icon: Icon }) => {
            const active = pathname?.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 px-3 py-2 rounded-label text-sm transition-colors ${
                  active
                    ? "text-parchment-100"
                    : "text-parchment-200/60 hover:text-parchment-100"
                }`}
              >
                <Icon size={16} />
                {label}
              </Link>
            );
          })}
        </div>
      </nav>
      <div className="flex items-center justify-between px-2 py-3 border-t border-ink-700">
        <div className="flex items-center gap-2">
          <UserButton />
          <span className="text-xs text-parchment-200/50">Account</span>
        </div>
        <ThemeToggle compact />
      </div>
    </aside>
  );
}
