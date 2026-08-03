import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { analyses } from "@/lib/db/schema";
import { eq, desc, and } from "drizzle-orm";
import { z } from "zod";

// GET /api/history — user's own analyses, newest first (was created_date desc in Base44)
export async function GET() {
  const userId = await requireUser();
  const rows = await db
    .select()
    .from(analyses)
    .where(eq(analyses.createdBy, userId))
    .orderBy(desc(analyses.createdAt));
  return NextResponse.json(rows);
}

// DELETE /api/history?id=... — matches the optimistic-delete UX from History.jsx
export async function DELETE(req: NextRequest) {
  const userId = await requireUser();
  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });

  await db.delete(analyses).where(and(eq(analyses.id, id), eq(analyses.createdBy, userId)));
  return NextResponse.json({ ok: true });
}

// PATCH /api/history?id=... — user rates the accuracy of an analysis. Writes
// both `feedback` and `feedback_timestamp` onto the row, matching the Base44
// "Feedback Submission" workflow that updated the Analysis entity directly.
const feedbackSchema = z.object({
  feedback: z.enum(["positive", "negative"]).nullable(),
});

export async function PATCH(req: NextRequest) {
  const userId = await requireUser();
  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });

  const parsed = feedbackSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const [row] = await db
    .update(analyses)
    .set({
      feedback: parsed.data.feedback,
      feedbackTimestamp: parsed.data.feedback ? new Date() : null,
    })
    .where(and(eq(analyses.id, id), eq(analyses.createdBy, userId)))
    .returning();

  if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(row);
}
