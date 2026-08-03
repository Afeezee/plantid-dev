import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { promises as fs } from "node:fs";
import path from "node:path";

// Replaces Base44's `UploadFile` Core Integration. Client-side validation
// (type/size) happens in ImageUploader.tsx; this route persists the blob
// and returns its public URL.
//
// Dev fallback: when BLOB_READ_WRITE_TOKEN is not set (e.g. before you've
// created a Vercel Blob store), we write to public/uploads/ so the local
// dev flow works end-to-end. Production must have the token.
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
      const blob = await put(objectKey, file, { access: "public" });
      return NextResponse.json({ url: blob.url });
    }

    // Local dev — save to public/uploads/<objectKey>
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
