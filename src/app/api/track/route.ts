import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 min

// Simple UA Parser
function parseUA(ua: string) {
  const browser = /chrome|firefox|safari|opr|edg/i.exec(ua)?.[0] || "Unknown";
  const os = /windows|macintosh|linux|android|iphone|ipad/i.exec(ua)?.[0] || "Unknown";
  const device = /mobile|tablet|ipad|iphone|android/i.test(ua) ? "Mobile" : "Desktop";
  return { browser, os, device };
}

export async function POST(req: NextRequest) {
  try {
    let body: any = {};
    try {
      body = await req.json();
    } catch {
      body = {};
    }

    const { domain, session_id, event, project_id, path, referrer, user_agent } = body;

    if (!session_id || !project_id) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // 1. Get Project
    const project = await prisma.project.findUnique({
      where: { publicId: project_id },
      include: { analytics: true }
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const { browser, os, device } = parseUA(user_agent || req.headers.get("user-agent") || "");
    const country = req.headers.get("x-vercel-ip-country") || "Unknown";
    const now = new Date();

    // 2. Handle Session
    let session = await prisma.session.findUnique({
      where: {
        projectId_sessionId: {
          projectId: project.id,
          sessionId: session_id,
        },
      },
    });

    let isNewSession = false;
    if (!session) {
      session = await prisma.session.create({
        data: {
          projectId: project.id,
          sessionId: session_id,
          lastSeen: now,
          browser,
          os,
          device,
          country,
          isBounce: true,
        },
      });
      isNewSession = true;
    } else {
      const diffSinceLastSeen = now.getTime() - session.lastSeen.getTime();
      const totalDuration = Math.floor((now.getTime() - session.createdAt.getTime()) / 1000);

      if (diffSinceLastSeen > SESSION_TIMEOUT) {
        // This is a new session actually, but tracker should have given us a new ID.
        // If not, we reset it.
        session = await prisma.session.update({
          where: { id: session.id },
          data: {
            lastSeen: now,
            createdAt: now,
            duration: 0,
            isBounce: true
          }
        });
        isNewSession = true;
      } else {
        session = await prisma.session.update({
          where: { id: session.id },
          data: {
            lastSeen: now,
            duration: totalDuration
          },
        });
      }
    }

    // 3. Record PageView if it's a pageview event
    if (event === "pageview") {
      await prisma.pageView.create({
        data: {
          projectId: project.id,
          sessionId: session_id,
          path: path || "/",
          referrer: referrer || null,
          browser,
          os,
          device,
          country,
          timestamp: now,
        },
      });

      // Update session bounce status
      const pageViewCount = await prisma.pageView.count({
        where: { sessionId: session_id, projectId: project.id }
      });

      if (pageViewCount > 1 && session.isBounce) {
        await prisma.session.update({
          where: { id: session.id },
          data: { isBounce: false }
        });
      }
    }

    // 4. Update Analytics Summary
    // Note: In a high-traffic app, you'd do this via a background worker or hourly cron.
    // For now, we update it reactively.
    if (event === "pageview" || isNewSession) {
      const allSessions = await prisma.session.findMany({
        where: { projectId: project.id }
      });

      const totalVisits = allSessions.length;
      const totalBounces = allSessions.filter(s => s.isBounce).length;
      const bounceRate = totalVisits > 0 ? (totalBounces / totalVisits) * 100 : 0;

      const totalDuration = allSessions.reduce((acc, s) => acc + s.duration, 0);
      const avgDuration = totalVisits > 0 ? totalDuration / totalVisits : 0;

      await prisma.analytics.update({
        where: { projectId: project.id },
        data: {
          totalPageVisits: { increment: event === "pageview" ? 1 : 0 },
          totalVisits: { set: totalVisits },
          bounceRate: { set: bounceRate },
          avgDuration: { set: avgDuration }
        },
      });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Error in /api/track:", error);
    return NextResponse.json({ error: "internal error" }, { status: 500 });
  }
}
