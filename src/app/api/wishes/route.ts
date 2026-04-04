import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { validateWish } from "@/lib/validation";

export async function POST(request: NextRequest) {
  try {
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Validation failed", fields: { _form: "Invalid JSON" } },
        { status: 400 }
      );
    }

    const validation = validateWish(body);

    if (!validation.valid) {
      return NextResponse.json(
        { error: "Validation failed", fields: validation.fields },
        { status: 400 }
      );
    }

    const data = body as Record<string, unknown>;

    const wish = {
      name: (data.name as string).trim(),
      message: (data.message as string).trim(),
      approved: true,
      createdAt: new Date(),
    };

    const db = await getDb();
    await db.collection("wishes").insertOne(wish);

    return NextResponse.json(
      { success: true, message: "Wish submitted successfully" },
      { status: 201 }
    );
  } catch {
    return NextResponse.json(
      { error: "Service temporarily unavailable" },
      { status: 503 }
    );
  }
}

export async function GET() {
  try {
    const db = await getDb();
    const wishes = await db
      .collection("wishes")
      .find({ approved: true })
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json(wishes);
  } catch {
    return NextResponse.json(
      { error: "Service temporarily unavailable" },
      { status: 503 }
    );
  }
}
