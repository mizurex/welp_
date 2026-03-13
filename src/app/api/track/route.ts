import { redis } from "@/lib/db/redis";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    let body: any = {};
    try {
      body = await request.json();
    } catch {
      body = {};
    }

    const { session_id, event, project_id } = body;

    if (!session_id || !event || !project_id) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const ua = body.user_agent || request.headers.get("user-agent") || "";
    const country = request.headers.get("x-vercel-ip-country") || "Unknown";

    await redis.lpush("track:queue", JSON.stringify({
      ...body,
      user_agent: ua,
      country: country,
      queued_at: Date.now(),
    }));

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Error queuing event:", error);
    return NextResponse.json({ error: "Failed to queue event" }, { status: 500 });
  }
}
