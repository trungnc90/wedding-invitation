import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getDb } from "@/lib/mongodb";
import { verifyAuth } from "@/lib/auth";
import { deleteFromGoogleDrive } from "@/lib/gdrive";

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = verifyAuth(request);
  if (!auth) {
    return NextResponse.json(
      { error: "Authentication required" },
      { status: 401 }
    );
  }

  try {
    const { id } = params;

    let objectId: ObjectId;
    try {
      objectId = new ObjectId(id);
    } catch {
      return NextResponse.json(
        { error: "Invalid photo ID" },
        { status: 400 }
      );
    }

    const db = await getDb();
    const wedding = await db.collection("wedding").findOne({});

    if (!wedding) {
      return NextResponse.json(
        { error: "Not found" },
        { status: 404 }
      );
    }

    const gallery = (wedding.gallery || []) as Array<{
      _id: ObjectId;
      url: string;
      thumbnailUrl: string;
      driveFileId?: string;
      order: number;
    }>;

    const photo = gallery.find(
      (p) => p._id.toString() === objectId.toString()
    );

    if (!photo) {
      return NextResponse.json(
        { error: "Photo not found" },
        { status: 404 }
      );
    }

    // Remove from gallery array in MongoDB
    await db.collection("wedding").updateOne(
      {},
      {
        $pull: { gallery: { _id: objectId } } as any,
        $set: { updatedAt: new Date() },
      }
    );

    // Optionally delete from Google Drive (best-effort, don't fail if this errors)
    if (photo.driveFileId) {
      try {
        await deleteFromGoogleDrive(photo.driveFileId);
      } catch {
        // Log but don't fail the request if Drive deletion fails
      }
    }

    return NextResponse.json({
      success: true,
      deletedId: id,
    });
  } catch {
    return NextResponse.json(
      { error: "Service temporarily unavailable" },
      { status: 503 }
    );
  }
}
