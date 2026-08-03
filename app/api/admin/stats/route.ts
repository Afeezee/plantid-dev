import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { analyses, contactMessages } from "@/lib/db/schema";
import { sql } from "drizzle-orm";

export async function GET() {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const [totals] = await db
    .select({
      totalAnalyses: sql<number>`count(*)`,
      completed: sql<number>`count(*) filter (where ${analyses.status} = 'completed')`,
      failed: sql<number>`count(*) filter (where ${analyses.status} = 'failed')`,
      controlledFlags: sql<number>`count(*) filter (where ${analyses.isControlledPlant} = true)`,
      severeCases: sql<number>`count(*) filter (where ${analyses.criticalRating} = 'Severe')`,
    })
    .from(analyses);

  const [contact] = await db
    .select({
      unread: sql<number>`count(*) filter (where ${contactMessages.status} = 'unread')`,
      total: sql<number>`count(*)`,
    })
    .from(contactMessages);

  const recentControlled = await db
    .select({
      id: analyses.id,
      plantCommonName: analyses.plantCommonName,
      plantScientificName: analyses.plantScientificName,
      createdAt: analyses.createdAt,
    })
    .from(analyses)
    .where(sql`${analyses.isControlledPlant} = true`)
    .orderBy(sql`${analyses.createdAt} desc`)
    .limit(10);

  return NextResponse.json({ analyses: totals, contactMessages: contact, recentControlled });
}
