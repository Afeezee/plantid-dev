import Link from "next/link";
import { SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";
import {
  Leaf,
  ShieldAlert,
  Plane,
  MessageCircle,
  Sparkles,
  Camera,
  ScanSearch,
  FileDown,
  type LucideIcon,
} from "lucide-react";
import { PlantidLogo } from "@/components/PlantidLogo";
import { LandingHeroSpecimen } from "@/components/landing/LandingHeroSpecimen";
import { RevealOnScroll } from "@/components/landing/RevealOnScroll";

const FEATURES = [
  {
    icon: Leaf,
    tint: "moss",
    title: "Species identification",
    body: "Common and scientific name, family, habitat and traditional uses — from one clear photo.",
  },
  {
    icon: ScanSearch,
    tint: "rust",
    title: "Disease detection",
    body: "Pest damage, nutrient deficiency and stress, rated Low → Severe with treatment steps.",
  },
  {
    icon: ShieldAlert,
    tint: "ochre",
    title: "Controlled-species check",
    body: "Automatic flag when a plant is a regulated species — a compliance layer, not a guess.",
  },
  {
    icon: Plane,
    tint: "moss",
    title: "Drone Mode",
    body: "Batch aerial imagery for whole-plot monitoring on working farms.",
  },
  {
    icon: MessageCircle,
    tint: "ochre",
    title: "AI plant assistant",
    body: "Ask follow-up questions and get grounded, practical care advice — not chatbot filler.",
  },
  {
    icon: FileDown,
    tint: "rust",
    title: "Export field reports",
    body: "Download a PDF of any identification for records, clients or the extension officer.",
  },
] as const;

const STEPS = [
  {
    icon: Camera,
    title: "Snap or upload",
    body: "One or many photos — leaves, stems, flowers, or a whole plot from above.",
  },
  {
    icon: Sparkles,
    title: "AI examines the specimen",
    body: "A vision model trained on species and pathology fills in a structured field report.",
  },
  {
    icon: FileDown,
    title: "Act on the result",
    body: "Treatment plan, prevention, and a saveable PDF — ready in seconds.",
  },
];

const STATS = [
  { value: "< 8s", label: "Median time from upload to full field report" },
  { value: "4-tier", label: "Severity rating: Low → Moderate → High → Severe" },
  { value: "100%", label: "Analyses stay private in your own History" },
];

export default function LandingPage() {
  return (
    <main className="relative">
      {/* Hero */}
      <section className="relative max-w-6xl mx-auto px-6 pt-16 md:pt-24 pb-16">
        <div className="grid md:grid-cols-2 gap-10 md:gap-14 items-center">
          <div className="animate-fade-up">
            <span className="stamp stamp-moss mb-6">
              <Leaf size={12} />
              Field diagnostics, instantly
            </span>
            <h1 className="text-4xl md:text-6xl leading-[1.05] tracking-tight">
              A plant pathologist{" "}
              <span className="text-moss-500 dark:text-moss-400">in every pocket.</span>
            </h1>
            <p className="mt-6 text-parchment-100/75 max-w-xl text-lg">
              PlantiD identifies species, diagnoses disease, and flags regulated
              plants from a single photo — built for farmers, gardeners and
              botanists who can&apos;t wait for a lab result.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <SignedOut>
                <SignInButton mode="modal">
                  <button className="btn-primary">
                    <Sparkles size={16} />
                    Start identifying
                  </button>
                </SignInButton>
              </SignedOut>
              <SignedIn>
                <Link href="/upload" className="btn-primary">
                  <Sparkles size={16} />
                  Go to Upload
                </Link>
              </SignedIn>
              <Link href="#how-it-works" className="btn-ghost">
                How it works
              </Link>
            </div>

            <div className="mt-10 flex items-center gap-6 text-xs uppercase tracking-wider text-parchment-100/50">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-moss-500 animate-pulse" />
                Live vision model
              </div>
              <div className="hidden sm:block">Private by default</div>
              <div className="hidden md:block">No credit card</div>
            </div>
          </div>

          <LandingHeroSpecimen />
        </div>
      </section>

      {/* Stats band */}
      <section className="border-y border-ink-700 bg-ink-900/40">
        <div className="max-w-6xl mx-auto px-6 py-8 grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-4">
          {STATS.map((s) => (
            <div key={s.label} className="text-center sm:text-left">
              <p className="font-display text-3xl md:text-4xl text-moss-500 dark:text-moss-400">
                {s.value}
              </p>
              <p className="text-sm text-parchment-100/60 mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="max-w-6xl mx-auto px-6 py-20">
        <div className="max-w-2xl mb-12">
          <span className="stamp mb-4">What it does</span>
          <h2 className="text-3xl md:text-4xl leading-tight">
            One frictionless tool, three field-tested checks.
          </h2>
          <p className="mt-4 text-parchment-100/70">
            Every result blends species identification, health assessment and
            compliance flags — so a smallholder farmer, a home gardener and a
            field regulator all get the same professional-grade read.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map((f, i) => (
            <RevealOnScroll key={f.title} delay={i * 60}>
              <FeatureCard icon={f.icon} tint={f.tint} title={f.title} body={f.body} />
            </RevealOnScroll>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="border-t border-ink-700 bg-ink-900/30">
        <div className="max-w-6xl mx-auto px-6 py-20">
          <span className="stamp stamp-moss mb-4">How it works</span>
          <h2 className="text-3xl md:text-4xl leading-tight mb-12">
            From photo to field report in three steps.
          </h2>

          <ol className="grid md:grid-cols-3 gap-6 relative">
            {/* connecting vine */}
            <div className="hidden md:block absolute top-8 left-[16.67%] right-[16.67%] h-px bg-gradient-to-r from-moss-500/0 via-moss-500/60 to-moss-500/0" />
            {STEPS.map((step, i) => (
              <RevealOnScroll key={step.title} delay={i * 100}>
                <li className="specimen-label relative">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="h-11 w-11 rounded-full bg-moss-500/15 border border-moss-500/50 flex items-center justify-center text-moss-500 dark:text-moss-400">
                      <step.icon size={18} />
                    </span>
                    <span className="text-xs uppercase tracking-wider text-parchment-100/50">
                      Step {i + 1}
                    </span>
                  </div>
                  <p className="font-display text-xl">{step.title}</p>
                  <p className="text-sm text-parchment-100/70 mt-2 leading-relaxed">
                    {step.body}
                  </p>
                </li>
              </RevealOnScroll>
            ))}
          </ol>
        </div>
      </section>

      {/* Field-journal note / quote */}
      <section className="max-w-4xl mx-auto px-6 py-20">
        <RevealOnScroll>
          <div className="specimen-label">
            <p className="text-xs uppercase tracking-wider text-parchment-100/50">
              Why we built it
            </p>
            <p className="font-display text-2xl md:text-3xl leading-snug mt-3">
              &ldquo;Food security, biodiversity and sustainable agriculture all hinge on
              catching plant health issues early. A single undetected disease
              can devastate a whole crop.&rdquo;
            </p>
            <div className="mt-4 flex items-center gap-3 text-sm text-parchment-100/60">
              <PlantidLogo className="h-5 w-5" />
              <span>PlantiD — field notes, 2026</span>
            </div>
          </div>
        </RevealOnScroll>
      </section>

      {/* CTA band */}
      <section className="border-t border-ink-700 bg-ink-900/50">
        <div className="max-w-4xl mx-auto px-6 py-16 text-center">
          <h2 className="text-3xl md:text-4xl leading-tight">
            Try it on a plant you can see right now.
          </h2>
          <p className="mt-3 text-parchment-100/70 max-w-xl mx-auto">
            Free during the beta — no credit card, no install. Just a photo.
          </p>
          <div className="mt-8 flex items-center justify-center gap-3">
            <SignedOut>
              <SignInButton mode="modal">
                <button className="btn-primary">
                  <Sparkles size={16} />
                  Get started
                </button>
              </SignInButton>
            </SignedOut>
            <SignedIn>
              <Link href="/upload" className="btn-primary">
                <Sparkles size={16} />
                Open Upload
              </Link>
            </SignedIn>
            <Link href="/faqs" className="btn-ghost">
              Read the FAQs
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

function FeatureCard({
  icon: Icon,
  tint,
  title,
  body,
}: {
  icon: LucideIcon;
  tint: "moss" | "ochre" | "rust";
  title: string;
  body: string;
}) {
  const tintClass = {
    moss: "text-moss-500 dark:text-moss-400 border-moss-500/50 bg-moss-500/10",
    ochre: "text-ochre-500 dark:text-ochre-400 border-ochre-500/50 bg-ochre-500/10",
    rust: "text-rust-500 dark:text-rust-400 border-rust-500/50 bg-rust-500/10",
  }[tint];
  return (
    <div className="group border border-ink-700 rounded-label p-5 hover:border-ochre-500/50 transition-colors bg-ink-900/40">
      <div
        className={`inline-flex items-center justify-center h-11 w-11 rounded-label border ${tintClass}`}
      >
        <Icon size={18} />
      </div>
      <h3 className="text-lg mt-4 font-display">{title}</h3>
      <p className="text-sm text-parchment-100/70 mt-1.5">{body}</p>
    </div>
  );
}
