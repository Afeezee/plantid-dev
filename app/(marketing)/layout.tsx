import Link from "next/link";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import { PlantidLogo } from "@/components/PlantidLogo";
import { ThemeToggle } from "@/components/ThemeToggle";

const NAV = [
  { href: "/about", label: "About" },
  { href: "/faqs", label: "FAQs" },
  { href: "/contact", label: "Contact" },
];

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-ink-700 sticky top-0 z-40 bg-ink-950/80 backdrop-blur">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="inline-flex items-center">
            <PlantidLogo className="h-7 w-7" withWordmark />
          </Link>
          <nav className="flex items-center gap-5 md:gap-6 text-sm text-parchment-100/70">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="hidden sm:inline hover:text-parchment-100 transition-colors"
              >
                {item.label}
              </Link>
            ))}
            <ThemeToggle compact />
            <SignedOut>
              <SignInButton mode="modal">
                <button className="text-parchment-100 hover:text-ochre-500">Sign in</button>
              </SignInButton>
            </SignedOut>
            <SignedIn>
              <Link
                href="/upload"
                className="text-moss-500 dark:text-moss-400 hover:opacity-80 font-medium"
              >
                Open app
              </Link>
              <UserButton />
            </SignedIn>
          </nav>
        </div>
      </header>
      <div className="flex-1">{children}</div>
      <footer className="border-t border-ink-700 mt-16">
        <div className="max-w-5xl mx-auto px-6 py-8 flex flex-col md:flex-row md:items-center md:justify-between gap-3 text-sm text-parchment-200/50">
          <p>© {new Date().getFullYear()} PlantiD — field diagnostics for growers.</p>
          <nav className="flex gap-5">
            {NAV.map((item) => (
              <Link key={item.href} href={item.href} className="hover:text-parchment-100">
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </footer>
    </div>
  );
}
