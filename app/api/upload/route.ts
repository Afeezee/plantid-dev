import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { promises as fs } from "node:fs";
import path from "node:path";

// Replaces Base44's `UploadFile` Core Integration. Client-side validation
// (type/size) happens in ImageUploader.tsx; this route persists the blob
// and returns its public URL.
//
// Storage strategy:
//  - Prod (or anywhere BLOB_READ_WRITE_TOKEN is set): Vercel Blob.
//  - Local dev with no token: write to public/uploads/ so the flow works.
// The disk fallback is explicitly refused on Vercel's serverless runtime
// because /var/task is read-only — writing there fails with ENOENT.
export async function POST(req: NextRequest) {
  const userId = await requireUser();
  const form = await req.formData();
  const file = form.get("file") as File | null;
  if (!file) return NextResponse.json({ error: "file is required" }, { status: 400 });

  const safeName = file.name.replace(/[^A-Za-z0-9._-]/g, "_");
  const objectKey = `analyses/${userId}/${crypto.randomUUID()}-${safeName}`;

  try {
    if (process.env.BLOB_READ_WRITE_TOKEN) {
      const { put } = await import("@vercel/blob");
      const blob = await put(objectKey, file, {
        access: "public",
        token: process.env.BLOB_READ_WRITE_TOKEN,
      });
      return NextResponse.json({ url: blob.url });
    }

    // No Blob token — hard fail on any serverless / prod runtime, since disk
    // writes there are ephemeral at best and fatal at worst (/var/task ENOENT).
    const isServerless = !!process.env.VERCEL || process.env.NODE_ENV === "production";
    if (isServerless) {
      return NextResponse.json(
        {
          error:
            "Blob storage is not configured. Set BLOB_READ_WRITE_TOKEN in the project's environment variables (Vercel → Storage → connect a Blob store to auto-provision it) and redeploy.",
        },
        { status: 500 },
      );
    }

    // Local dev only — save to public/uploads/
    const localDir = path.join(process.cwd(), "public", "uploads", path.dirname(objectKey));
    await fs.mkdir(localDir, { recursive: true });
    const buffer = Buffer.from(await file.arrayBuffer());
    const localPath = path.join(process.cwd(), "public", "uploads", objectKey);
    await fs.writeFile(localPath, buffer);
    return NextResponse.json({ url: `/uploads/${objectKey}` });
  } catch (err) {
    console.error("Upload failed:", err);
    const message = err instanceof Error ? err.message : "Upload failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
