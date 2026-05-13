import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getDb } from "@/lib/mongodb";
import { verifyAuth } from "@/lib/auth";
import { uploadToGoogleDrive } from "@/lib/gdrive";

const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export async function POST(request: NextRequest) {
  const auth = verifyAuth(request);
  if (!auth) {
    return NextResponse.json(
      { error: "Authentication required" },
      { status: 401 }
    );
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Allowed: JPEG, PNG, WebP, GIF" },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "File too large. Maximum size is 10MB" },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const { fileId, url, thumbnailUrl } = await uploadToGoogleDrive(
      buffer,
      file.name,
      file.type
    );

    const galleryEntry = {
      _id: new ObjectId(),
      url,
      thumbnailUrl,
      driveFileId: fileId,
      order: Date.now(),
    };

    const db = await getDb();
    await db.collection("wedding").updateOne(
      {},
      {
        $push: { gallery: galleryEntry } as any,
        $set: { updatedAt: new Date() },
      },
      { upsert: true }
    );

    return NextResponse.json({
      success: true,
      photo: galleryEntry,
    });
  } catch (error) {
    console.error("[gallery/upload] error:", error instanceof Error ? error.message : error);
    if (
      error instanceof Error &&
      error.message.includes("Google Drive")
    ) {
      return NextResponse.json(
        { error: `File upload failed: ${error.message}` },
        { status: 502 }
      );
    }
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Service temporarily unavailable" },
      { status: 503 }
    );
  }
}
