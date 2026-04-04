import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { validateRSVP } from "@/lib/validation";

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

    const validation = validateRSVP(body);

    if (!validation.valid) {
      return NextResponse.json(
        { error: "Validation failed", fields: validation.fields },
        { status: 400 }
      );
    }

    const data = body as Record<string, unknown>;

    const rsvp = {
      name: (data.name as string).trim(),
      attending: data.attending as boolean,
      numberOfAttendees: data.attending ? (data.numberOfAttendees as number) : 0,
      message: data.message ? (data.message as string).trim() : undefined,
      createdAt: new Date(),
    };

    const db = await getDb();
    await db.collection("rsvps").insertOne(rsvp);

    return NextResponse.json(
      { success: true, message: "RSVP submitted successfully" },
      { status: 201 }
    );
  } catch {
    return NextResponse.json(
      { error: "Service temporarily unavailable" },
      { status: 503 }
    );
  }
}
