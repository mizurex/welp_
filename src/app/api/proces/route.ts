import { NextRequest, NextResponse } from "next/server";
import { query, queryOne } from "@/lib/db/db";
import type { Project, Session } from "@/types/models";

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

    const { session_id, event, project_id, path, referrer, user_agent } = body;

    if (!session_id || !project_id) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // 1. Get Project
    const project = await queryOne<Project & { analyticsId: number }>(
      `SELECT p.*, a."id" as "analyticsId"
       FROM "Project" p
       LEFT JOIN "Analytics" a ON a."projectId" = p."id"
       WHERE p."publicId" = $1`,
      [project_id]
    );

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const { browser, os, device } = parseUA(user_agent || req.headers.get("user-agent") || "");
    const country = req.headers.get("x-vercel-ip-country") || "Unknown";
    const now = new Date();

    // 2. Handle Session (upsert to avoid race conditions)
    // First, try to get existing session
    let existingSession = await queryOne<Session>(
      `SELECT * FROM "Session" WHERE "projectId" = $1 AND "sessionId" = $2`,
      [project.id, session_id]
    );

    let isNewSession = false;
    let session: Session;

    if (!existingSession) {
      // Create new session (use ON CONFLICT to handle race condition)
      session = (await queryOne<Session>(
        `INSERT INTO "Session" ("projectId", "sessionId", "lastSeen", "duration", "isBounce", "browser", "os", "device", "country", "createdAt")
         VALUES ($1, $2, $3, 0, true, $4, $5, $6, $7, $3)
         ON CONFLICT ("projectId", "sessionId") DO UPDATE SET "lastSeen" = $3
         RETURNING *`,
        [project.id, session_id, now, browser, os, device, country]
      ))!;
      isNewSession = true;
    } else {
      const diffSinceLastSeen = now.getTime() - existingSession.lastSeen.getTime();
      const totalDuration = Math.floor((now.getTime() - existingSession.createdAt.getTime()) / 1000);

      if (diffSinceLastSeen > SESSION_TIMEOUT) {
        // Reset session (timed out)
        session = (await queryOne<Session>(
          `UPDATE "Session"
           SET "lastSeen" = $2, "createdAt" = $2, "duration" = 0, "isBounce" = true
           WHERE "id" = $1
           RETURNING *`,
          [existingSession.id, now]
        ))!;
        isNewSession = true;
      } else {
        // Update session
        session = (await queryOne<Session>(
          `UPDATE "Session"
           SET "lastSeen" = $2, "duration" = $3
           WHERE "id" = $1
           RETURNING *`,
          [existingSession.id, now, totalDuration]
        ))!;
      }
    }

    // 3. Record PageView if it's a pageview event
    if (event === "pageview") {
      await query(
        `INSERT INTO "PageView" ("projectId", "sessionId", "path", "referrer", "browser", "os", "device", "country", "timestamp")
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [project.id, session_id, path || "/", referrer || null, browser, os, device, country, now]
      );

      // Update session bounce status
      const countResult = await queryOne<{ count: number }>(
        `SELECT COUNT(*)::int as "count" FROM "PageView" WHERE "projectId" = $1 AND "sessionId" = $2`,
        [project.id, session_id]
      );
      const pageViewCount = countResult?.count ?? 0;

      if (pageViewCount > 1 && session?.isBounce) {
        await query(
          `UPDATE "Session" SET "isBounce" = false WHERE "id" = $1`,
          [session!.id]
        );
      }
    }

    // 4. Update Analytics Summary
    if (event === "pageview" || isNewSession) {
      const statsResult = await queryOne<{ totalVisits: number; totalBounces: number; totalDuration: number }>(
        `SELECT 
           COUNT(*)::int as "totalVisits",
           SUM(CASE WHEN "isBounce" THEN 1 ELSE 0 END)::int as "totalBounces",
           SUM("duration")::int as "totalDuration"
         FROM "Session"
         WHERE "projectId" = $1`,
        [project.id]
      );

      const totalVisits = statsResult?.totalVisits ?? 0;
      const totalBounces = statsResult?.totalBounces ?? 0;
      const totalDuration = statsResult?.totalDuration ?? 0;
      const bounceRate = totalVisits > 0 ? (totalBounces / totalVisits) * 100 : 0;
      const avgDuration = totalVisits > 0 ? totalDuration / totalVisits : 0;

      if (event === "pageview") {
        await query(
          `UPDATE "Analytics"
           SET "totalPageVisits" = "totalPageVisits" + 1,
               "totalVisits" = $2,
               "bounceRate" = $3,
               "avgDuration" = $4
           WHERE "projectId" = $1`,
          [project.id, totalVisits, bounceRate, avgDuration]
        );
      } else {
        await query(
          `UPDATE "Analytics"
           SET "totalVisits" = $2,
               "bounceRate" = $3,
               "avgDuration" = $4
           WHERE "projectId" = $1`,
          [project.id, totalVisits, bounceRate, avgDuration]
        );
      }
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Error in /api/track:", error);
    return NextResponse.json({ error: "internal error" }, { status: 500 });
  }
}
