import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { path, referrer, userAgent } = await req.json();

    if (!path || typeof path !== "string") {
      return NextResponse.json({ error: "path is required" }, { status: 400 });
    }

    await prisma.pageView.create({
      data: {
        path,
        referrer: typeof referrer === "string" && referrer.length > 0 ? referrer : null,
        userAgent: typeof userAgent === "string" && userAgent.length > 0 ? userAgent : null,
      },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Error in /api/track:", error);
    return NextResponse.json({ error: "internal error" }, { status: 500 });
  }
}


