import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { analyses } from "@/lib/db/schema";
import { analyzePlantImages } from "@/lib/anthropic";
import { checkRateLimit } from "@/lib/rate-limit";
import { eq } from "drizzle-orm";

// Mirrors the old 2-step Upload flow: 1) create a `pending` record,
// 2) call the vision LLM and update the record with the result.
// Images are expected to already be uploaded to blob storage; this route
// receives their URLs plus the raw bytes needed for the vision call.
export async function POST(req: NextRequest) {
  const userId = await requireUser();
  const body = await req.json();
  const { imageUrls, images, analysisType } = body as {
    imageUrls: string[];
    images: { base64: string; mediaType: "image/jpeg" | "image/png" | "image/webp" }[];
    analysisType?: "standard" | "drone";
  };

  if (!imageUrls?.length || !images?.length) {
    return NextResponse.json({ error: "At least one image is required" }, { status: 400 });
  }

  const rate = await checkRateLimit(userId, "analyze");
  if (!rate.ok) {
    return NextResponse.json(
      { error: "Rate limit exceeded", retryAfterSeconds: rate.retryAfterSeconds },
      {
        status: 429,
        headers: {
          "Retry-After": String(rate.retryAfterSeconds),
          "X-RateLimit-Reset": rate.resetAt.toISOString(),
        },
      },
    );
  }

  const [record] = await db
    .insert(analyses)
    .values({
      createdBy: userId,
      images: imageUrls,
      analysisType: analysisType ?? "standard",
      status: "pending",
    })
    .returning();

  try {
    const result = await analyzePlantImages(images, analysisType);

    const [updated] = await db
      .update(analyses)
      .set({
        status: "completed",
        result,
        plantCommonName: result.plant_common_name,
        plantScientificName: result.plant_scientific_name,
        isHealthy: result.is_healthy,
        diseaseName: result.disease_name ?? null,
        criticalRating: result.critical_rating,
        isControlledPlant: result.is_controlled_plant,
        identificationConfidence: result.identification_confidence,
        healthConfidence: result.health_confidence,
        controlledConfidence: result.controlled_confidence,
      })
      .where(eq(analyses.id, record.id))
      .returning();

    return NextResponse.json(updated);
  } catch (err) {
    await db.update(analyses).set({ status: "failed" }).where(eq(analyses.id, record.id));
    console.error("Plant analysis failed:", err);
    return NextResponse.json({ error: "Analysis failed" }, { status: 502 });
  }
}
