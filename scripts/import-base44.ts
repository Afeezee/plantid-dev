/**
 * One-off importer that maps a Base44 entity export onto the Neon/Drizzle
 * schema in lib/db. Written against the entity shapes documented in
 * PlantiD.docx (§1 Entity/Data Model); the actual export format hasn't
 * been sighted yet, so the record readers are deliberately small and
 * defensive — run with a small sample first and fix the field mapping
 * before doing a full import.
 *
 * Usage:
 *   ANALYSES=./export/analyses.json \
 *   CONVERSATIONS=./export/conversations.json \
 *   CONTACT_MESSAGES=./export/contact_messages.json \
 *   npx tsx scripts/import-base44.ts [--dry-run]
 *
 * Each JSON file may be an array of records, or an object with a `records`
 * or `data` array (both shapes are common in Base44 exports).
 */

import { readFile } from "node:fs/promises";
import path from "node:path";
import { db } from "@/lib/db";
import {
  analyses,
  conversations,
  contactMessages,
} from "@/lib/db/schema";

type Base44Analysis = {
  id?: string;
  created_by?: string;
  created_date?: string;
  images?: string[];
  analysis_type?: "standard" | "drone";
  status?: "pending" | "processing" | "completed" | "failed";
  result?: unknown;
  plant_common_name?: string | null;
  plant_scientific_name?: string | null;
  is_healthy?: boolean | null;
  disease_name?: string | null;
  critical_rating?: "Low" | "Moderate" | "High" | "Severe" | null;
  is_controlled_plant?: boolean | null;
  identification_confidence?: number | null;
  health_confidence?: number | null;
  controlled_confidence?: number | null;
  feedback?: "positive" | "negative" | null;
  feedback_timestamp?: string | null;
};

type Base44Conversation = {
  id?: string;
  created_by?: string;
  created_date?: string;
  updated_date?: string;
  title?: string;
  messages?: { role: "user" | "assistant"; content: string; timestamp: string }[];
  is_active?: boolean;
};

type Base44ContactMessage = {
  id?: string;
  created_date?: string;
  name?: string;
  email?: string;
  subject?: string;
  message?: string;
  status?: "unread" | "read" | "replied";
};

async function loadJson<T>(envVar: string): Promise<T[] | null> {
  const file = process.env[envVar];
  if (!file) return null;
  const abs = path.resolve(file);
  const raw = await readFile(abs, "utf-8");
  const parsed = JSON.parse(raw);
  const arr: unknown = Array.isArray(parsed)
    ? parsed
    : (parsed?.records ?? parsed?.data ?? parsed?.items);
  if (!Array.isArray(arr)) {
    throw new Error(
      `${envVar}: expected an array (or { records: [...] } / { data: [...] }) in ${abs}`,
    );
  }
  return arr as T[];
}

async function importAnalyses(rows: Base44Analysis[], dryRun: boolean) {
  console.log(`Analyses: ${rows.length} rows`);
  if (dryRun) return;
  for (const r of rows) {
    if (!r.created_by || !r.images?.length) {
      console.warn("Skipping analysis with no created_by or images:", r.id);
      continue;
    }
    await db.insert(analyses).values({
      createdBy: r.created_by,
      images: r.images,
      analysisType: r.analysis_type ?? "standard",
      status: r.status ?? "completed",
      result: (r.result ?? null) as never,
      plantCommonName: r.plant_common_name ?? null,
      plantScientificName: r.plant_scientific_name ?? null,
      isHealthy: r.is_healthy ?? null,
      diseaseName: r.disease_name ?? null,
      criticalRating: r.critical_rating ?? null,
      isControlledPlant: r.is_controlled_plant ?? false,
      identificationConfidence: r.identification_confidence ?? null,
      healthConfidence: r.health_confidence ?? null,
      controlledConfidence: r.controlled_confidence ?? null,
      feedback: r.feedback ?? null,
      feedbackTimestamp: r.feedback_timestamp ? new Date(r.feedback_timestamp) : null,
      createdAt: r.created_date ? new Date(r.created_date) : new Date(),
    });
  }
}

async function importConversations(rows: Base44Conversation[], dryRun: boolean) {
  console.log(`Conversations: ${rows.length} rows`);
  if (dryRun) return;
  for (const r of rows) {
    if (!r.created_by) {
      console.warn("Skipping conversation with no created_by:", r.id);
      continue;
    }
    await db.insert(conversations).values({
      createdBy: r.created_by,
      title: r.title ?? "Imported conversation",
      messages: r.messages ?? [],
      isActive: r.is_active ?? true,
      createdAt: r.created_date ? new Date(r.created_date) : new Date(),
      updatedAt: r.updated_date ? new Date(r.updated_date) : new Date(),
    });
  }
}

async function importContactMessages(rows: Base44ContactMessage[], dryRun: boolean) {
  console.log(`ContactMessages: ${rows.length} rows`);
  if (dryRun) return;
  for (const r of rows) {
    if (!r.name || !r.email || !r.subject || !r.message) {
      console.warn("Skipping incomplete contact message:", r.id);
      continue;
    }
    await db.insert(contactMessages).values({
      name: r.name,
      email: r.email,
      subject: r.subject,
      message: r.message,
      status: r.status ?? "unread",
      createdAt: r.created_date ? new Date(r.created_date) : new Date(),
    });
  }
}

async function main() {
  const dryRun = process.argv.includes("--dry-run");
  console.log(dryRun ? "Dry run — no writes." : "Importing to database…");

  const [a, c, cm] = await Promise.all([
    loadJson<Base44Analysis>("ANALYSES"),
    loadJson<Base44Conversation>("CONVERSATIONS"),
    loadJson<Base44ContactMessage>("CONTACT_MESSAGES"),
  ]);

  if (a) await importAnalyses(a, dryRun);
  if (c) await importConversations(c, dryRun);
  if (cm) await importContactMessages(cm, dryRun);

  console.log("Done.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
