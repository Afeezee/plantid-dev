import Link from "next/link";
import { currentUser } from "@clerk/nextjs/server";
import { UserButton } from "@clerk/nextjs";
import { db } from "@/lib/db";
import { analyses, conversations } from "@/lib/db/schema";
import { requireUser } from "@/lib/auth";
import { eq, sql } from "drizzle-orm";

export const metadata = { title: "Settings — PlantiD" };

export default async function SettingsPage() {
  const userId = await requireUser();
  const user = await currentUser();

  const [analysesCount] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(analyses)
    .where(eq(analyses.createdBy, userId));

  const [conversationsCount] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(conversations)
    .where(eq(conversations.createdBy, userId));

  const primaryEmail = user?.primaryEmailAddress?.emailAddress;
  const role =
    (user?.publicMetadata as { role?: string } | undefined)?.role ?? "user";

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <h1 className="text-2xl mb-2">Settings</h1>
      <p className="text-parchment-200/60 text-sm mb-8">
        Manage your account, review your usage, and get to the pages that
        live outside the main app.
      </p>

      <section className="specimen-label">
        <p className="text-xs uppercase tracking-wider text-parchment-200/50">
          Account
        </p>
        <div className="flex items-center gap-4 mt-4">
          <UserButton />
          <div className="min-w-0">
            <p className="font-display text-lg truncate">
              {user?.fullName ?? primaryEmail ?? "Signed-in user"}
            </p>
            {primaryEmail && (
              <p className="text-sm text-parchment-200/60 truncate">
                {primaryEmail}
              </p>
            )}
            <span className="stamp mt-2 inline-flex">Role: {role}</span>
          </div>
        </div>
        <p className="text-xs text-parchment-200/50 mt-4">
          Password, email and connected accounts are managed through the user
          menu above.
        </p>
      </section>

      <section className="grid sm:grid-cols-2 gap-4 mt-6">
        <StatTile label="Analyses run" value={analysesCount?.count ?? 0} />
        <StatTile
          label="Assistant conversations"
          value={conversationsCount?.count ?? 0}
        />
      </section>

      <section className="specimen-label mt-6">
        <p className="text-xs uppercase tracking-wider text-parchment-200/50">
          Data &amp; privacy
        </p>
        <p className="text-sm text-parchment-200/70 mt-2">
          Photos and analyses are stored to your private History. Delete any
          analysis from that page to remove its record and photos.
        </p>
        <Link
          href="/history"
          className="mt-3 inline-block text-sm text-ochre-400 hover:text-ochre-300 underline underline-offset-4"
        >
          Go to History →
        </Link>
      </section>

      <section className="specimen-label mt-6">
        <p className="text-xs uppercase tracking-wider text-parchment-200/50">
          More
        </p>
        <ul className="mt-3 flex flex-col gap-2 text-sm">
          <li>
            <Link href="/about" className="text-parchment-200/80 hover:text-parchment-100">
              About PlantiD
            </Link>
          </li>
          <li>
            <Link href="/faqs" className="text-parchment-200/80 hover:text-parchment-100">
              FAQs
            </Link>
          </li>
          <li>
            <Link href="/contact" className="text-parchment-200/80 hover:text-parchment-100">
              Contact support
            </Link>
          </li>
          <li>
            <Link
              href="/feedback"
              className="text-parchment-200/80 hover:text-parchment-100"
            >
              Rate past analyses
            </Link>
          </li>
        </ul>
      </section>
    </div>
  );
}

function StatTile({ label, value }: { label: string; value: number }) {
  return (
    <div className="border border-ink-700 rounded-label p-5">
      <p className="text-xs uppercase tracking-wider text-parchment-200/50">
        {label}
      </p>
      <p className="font-display text-3xl mt-2">{value}</p>
    </div>
  );
}
