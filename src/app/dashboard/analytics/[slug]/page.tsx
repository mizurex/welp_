import Link from "next/link";
import { query, queryOne } from "@/lib/db";
import { auth, signOut } from "../../../../../auth";
import { notFound, redirect } from "next/navigation";
import { DefaultBarChart } from "@/components/ui/default-bar-chart";
import Block from "@/components/blocks";
import { GaugeIcon } from "@/components/icons/clock";
import { EyeIcon } from "@/components/icons/eye";
import { ChartSplineIcon } from "@/components/icons/chart.icon";
import { ActivityIcon } from "@/components/icons/chart_line";
import { GradientBarMultipleChart } from "@/components/ui/gradient-bar-multiple-chart";
import TrackingScript from "@/components/analytics/tracking-script";
import { Slash, Globe } from "lucide-react";
import type { User, Project, Analytics } from "@/types/models";

type PageParams = Promise<{ slug: string }>;

async function signOutAction() {
  "use server";
  await signOut({ redirect: true, redirectTo: "/" });
}

export default async function ProjectAnalyticsPage({
  params,
}: {
  params: PageParams;
}) {
  const { slug } = await params;
  const projectPublicId = slug;

  const session = await auth();

  if (!session || !session.user || !session.user.email) {
    redirect("/");
  }

  const email = session.user.email as string;

  // Get user
  const user = await queryOne<User>(
    `SELECT * FROM "User" WHERE "email" = $1`,
    [email]
  );

  if (!user) {
    redirect("/");
  }

  // Get project with analytics
  const project = await queryOne<Project>(
    `SELECT * FROM "Project" WHERE "publicId" = $1`,
    [projectPublicId]
  );

  if (!project || project.ownerId !== user.id) {
    notFound();
  }

  const analytics = await queryOne<Analytics>(
    `SELECT * FROM "Analytics" WHERE "projectId" = $1`,
    [project.id]
  );

  if (!analytics) {
    notFound();
  }

  // Fetch daily visitors (sessions) for the last 30 days
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  
  const visitorsByDayRaw = await query<{ date: Date; count: number }>(
    `SELECT date_trunc('day', "createdAt") as "date", COUNT(*)::int as "count"
     FROM "Session"
     WHERE "projectId" = $1 AND "createdAt" >= $2
     GROUP BY 1
     ORDER BY 1`,
    [project.id, thirtyDaysAgo]
  );

  // Fetch daily views (pageviews) for the last 30 days
  const viewsByDayRaw = await query<{ date: Date; count: number }>(
    `SELECT date_trunc('day', "timestamp") as "date", COUNT(*)::int as "count"
     FROM "PageView"
     WHERE "projectId" = $1 AND "timestamp" >= $2
     GROUP BY 1
     ORDER BY 1`,
    [project.id, thirtyDaysAgo]
  );

  // Helper to normalize dates to YYYY-MM-DD
  const normalizeDate = (d: Date) => d.toISOString().split('T')[0];

  const dailyStats = new Map<string, { visitors: number; views: number }>();

  // Initialize last 7 days with zeros so chart isn't empty
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    dailyStats.set(normalizeDate(d), { visitors: 0, views: 0 });
  }

  visitorsByDayRaw.forEach(item => {
    const date = normalizeDate(item.date);
    if (dailyStats.has(date)) {
      dailyStats.get(date)!.visitors += item.count;
    } else {
      dailyStats.set(date, { visitors: item.count, views: 0 });
    }
  });

  viewsByDayRaw.forEach(item => {
    const date = normalizeDate(item.date);
    if (dailyStats.has(date)) {
      dailyStats.get(date)!.views += item.count;
    } else {
      dailyStats.set(date, { visitors: 0, views: item.count });
    }
  });

  const trafficData = Array.from(dailyStats.entries())
    .map(([date, stats]) => ({
      label: new Date(date).toLocaleDateString(undefined, { weekday: 'short' }),
      visitors: stats.visitors,
      views: stats.views,
    }))
    .slice(-7); // Just show last 7 days for better visibility

  // Fetch top pages
  const topPages = await query<{ path: string; count: number }>(
    `SELECT "path", COUNT(*)::int as "count"
     FROM "PageView"
     WHERE "projectId" = $1
     GROUP BY "path"
     ORDER BY "count" DESC
     LIMIT 5`,
    [project.id]
  );

  // Fetch top browsers
  const topBrowsers = await query<{ browser: string | null; count: number }>(
    `SELECT "browser", COUNT(*)::int as "count"
     FROM "PageView"
     WHERE "projectId" = $1
     GROUP BY "browser"
     ORDER BY "count" DESC
     LIMIT 5`,
    [project.id]
  );

  // Generate tracking script snippet
  const trackingEndpoint =
    process.env.NEXT_PUBLIC_URL || "https://your-domain.com";
  const scriptSnippet = `<script src="${trackingEndpoint}/tracker.js" data-project-id="${project.publicId}"></script>`;

  return (
    <div className="min-h-screen bg-zinc-50">


      <main className="max-w-5xl mx-auto px-6 py-8 space-y-8">
        {/* Back link and title */}
        <div className="flex items-start justify-between gap-4">
          <div>

            <h1 className="text-2xl font-semibold text-zinc-900">
              {project.name}
            </h1>
            <p className="text-sm text-zinc-500 mt-1">{project.domain}</p>
          </div>


        </div>

        {/* Stats cards */}
        <section className="grid grid-cols-1 md:grid-cols-4 gap-3 font-sans ">


          <Block
            title="Total visits"
            value={analytics.totalVisits}
            icon={<GaugeIcon className="text-muted-foreground" />}

          />

          <Block
            title="Pageviews"
            value={analytics.totalPageVisits}
            icon={<EyeIcon className="text-muted-foreground" />}
          />

          <Block
            title="Bounce rate"
            value={analytics.bounceRate}
            icon={<ChartSplineIcon className="text-muted-foreground" />}
          />

          <Block
            title="Avg duration"
            value={analytics.avgDuration}
            icon={<ActivityIcon className="text-muted-foreground" />}
          />
        </section>

        {/* Chart */}


        {/* Real-time breakdowns */}
        <div className="grid grid-cols-1 md:grid-cols-[minmax(280px,300px)_1fr] gap-3.5 font-sans">
          {/* Top Pages */}
          <div className="min-h-[420px] w-full bg-gray-100 rounded-[6px] flex flex-col border border-stone-200">
            <div className="flex items-center justify-between py-[2px] px-[2px] border-b border-stone-200">
              <h2 className="text-sm font-semibold text-foreground/80  px-2">
                Top Pages
              </h2>
              <span className="p-1 bg-white shadow-md rounded-[4.5px]">
                <Slash className="size-3 text-muted-foreground" />
              </span>
            </div>


            <div className="flex-1 bg-bg-primary  overflow-y-auto w-full mx-auto rounded-[8px] rounded-t-none p-4">
              <div className="flex items-center justify-end gap-2 pb-4 font-semibold font-sans text-xs">
                <div className="bg-stone-200 rounded-[4px] px-2 py-1">
                  <span>Hits</span>
                </div>
              </div>
              <div className="space-y-4">
                {topPages.map((page, i) => (
                  <div
                    key={i}
                    className="relative flex items-center justify-between text-sm font-sans group py-1 px-2 transition-colors hover:bg-stone-50"
                  >
                    {/* Corner accents on hover */}
                    <span className="pointer-events-none absolute left-0 top-0 h-2 w-2 border-l border-t border-transparent group-hover:border-black transition-all" />
                    <span className="pointer-events-none absolute right-0 top-0 h-2 w-2 border-r border-t border-transparent group-hover:border-black transition-all" />
                    <span className="pointer-events-none absolute left-0 bottom-0 h-2 w-2 border-l border-b border-transparent group-hover:border-black transition-all" />
                    <span className="pointer-events-none absolute right-0 bottom-0 h-2 w-2 border-r border-b border-transparent group-hover:border-black transition-all" />

                    <span className="text-foreground truncate max-w-[75%]">
                      {page.path}
                    </span>
                    <span className="text-foreground font-mono font-medium">
                      {page.count}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>


          {/* Device / Browser */}
          <div className="  w-full">
            <GradientBarMultipleChart
              data={trafficData}
              title="Recent Traffic"
              description="Daily visitors vs pageviews"
            />
          </div>

        </div>

        <div className="grid grid-cols-1 md:grid-cols-[minmax(280px,300px)_1fr] gap-3.5 font-sans">
          {/* Top Browsers */}
          <div className="min-h-[420px] w-full bg-gray-100 rounded-[6px] flex flex-col border border-stone-200">
            <div className="flex items-center justify-between py-[2px] px-[2px] border-b border-stone-200">
              <h2 className="text-sm font-semibold text-foreground/80  px-2">
                Top Browsers
              </h2>
              <span className="p-1 bg-white shadow-md rounded-[4.5px]">
                <Globe className="size-3.5 text-muted-foreground" />
              </span>
            </div>


            <div className="flex-1 bg-bg-primary  overflow-y-auto w-full mx-auto rounded-[8px] rounded-t-none p-4">
              <div className="flex items-center justify-end gap-2 pb-4 font-semibold font-sans text-xs">
                <div className="bg-stone-200 rounded-[4px] px-2 py-1">
                  <span>Usage</span>
                </div>
              </div>
              <div className="space-y-4">
                {topBrowsers.map((b, i) => (
                  <div
                    key={i}
                    className="relative flex items-center justify-between text-sm font-sans group py-1 px-2 transition-colors hover:bg-stone-50"
                  >
                    <span className="pointer-events-none absolute left-0 top-0 h-2 w-2 border-l border-t border-transparent group-hover:border-black transition-all" />
                    <span className="pointer-events-none absolute right-0 top-0 h-2 w-2 border-r border-t border-transparent group-hover:border-black transition-all" />
                    <span className="pointer-events-none absolute left-0 bottom-0 h-2 w-2 border-l border-b border-transparent group-hover:border-black transition-all" />
                    <span className="pointer-events-none absolute right-0 bottom-0 h-2 w-2 border-r border-b border-transparent group-hover:border-black transition-all" />

                    <span className="text-foreground truncate capitalize">
                      {b.browser || 'Unknown'}
                    </span>
                    <span className="text-foreground font-mono font-medium">
                      {b.count}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Add more breakdown cards here if needed */}
        </div>
       
     
      </main>
    </div>
  );
}
