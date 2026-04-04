import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { verifyAuth } from "@/lib/auth";

export async function PUT(request: NextRequest) {
  const auth = verifyAuth(request);
  if (!auth) {
    return NextResponse.json(
      { error: "Authentication required" },
      { status: 401 }
    );
  }

  try {
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 }
      );
    }

    const data = body as Record<string, unknown>;
    const updateFields: Record<string, unknown> = {};

    if (data.couple !== undefined) {
      updateFields.couple = data.couple;
    }
    if (data.events !== undefined) {
      updateFields.events = data.events;
    }
    if (data.heroPhoto !== undefined) {
      updateFields.heroPhoto = data.heroPhoto;
    }
    if (data.weddingDate !== undefined) {
      updateFields.weddingDate = data.weddingDate;
    }
    if (data.translations !== undefined) {
      updateFields.translations = data.translations;
    }

    updateFields.updatedAt = new Date();

    const db = await getDb();
    const result = await db.collection("wedding").updateOne(
      {},
      { $set: updateFields },
      { upsert: true }
    );

    const updated = await db.collection("wedding").findOne({});

    return NextResponse.json({
      success: true,
      modifiedCount: result.modifiedCount,
      upsertedId: result.upsertedId,
      wedding: updated,
    });
  } catch {
    return NextResponse.json(
      { error: "Service temporarily unavailable" },
      { status: 503 }
    );
  }
}
