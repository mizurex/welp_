import Link from "next/link";
import { query, queryOne } from "@/lib/db";
import { auth } from "../../../../auth";
import { redirect } from "next/navigation";
import Block from "@/components/blocks";
import { EyeIcon } from "@/components/icons/eye";
import { CreateProjectSheet } from "@/components/analytics/create-project-sheet";
import { LayoutGrid, ExternalLink, Trash2, CheckCircle2 } from "lucide-react";
import { deleteProject } from "@/lib/actions";
import type { User, Project, Analytics } from "@/types/models";

type ProjectWithAnalytics = Project & { analytics: Analytics | null };

export default async function DashboardPage() {
  const session = await auth();

  if (!session || !session.user || !session.user.email) {
    redirect("/api/auth/signin");
  }

  const email = session.user.email as string;

  const user = await queryOne<User>(
    `SELECT * FROM "User" WHERE "email" = $1`,
    [email]
  );

  // Get projects with analytics
  const projects: ProjectWithAnalytics[] = user
    ? await query<ProjectWithAnalytics>(
        `SELECT 
           p.*,
           json_build_object(
             'id', a."id",
             'projectId', a."projectId",
             'totalPageVisits', COALESCE(a."totalPageVisits", 0),
             'totalVisits', COALESCE(a."totalVisits", 0),
             'avgDuration', COALESCE(a."avgDuration", 0),
             'bounceRate', COALESCE(a."bounceRate", 0)
           ) as analytics
         FROM "Project" p
         LEFT JOIN "Analytics" a ON a."projectId" = p."id"
         WHERE p."ownerId" = $1
         ORDER BY p."id" DESC`,
        [user.id]
      )
    : [];

  // Calculate totals across ALL projects for the summary
  const totalPageviews = projects.reduce(
    (sum, p) => sum + (p.analytics?.totalPageVisits ?? 0),
    0
  );

  return (
    <div className="min-h-screen bg-zinc-50 py-8">
      <div className="max-w-5xl mx-auto px-6 space-y-8">
        {/* Header Section */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-zinc-900 tracking-tight">
              Overview
            </h1>
            <p className="text-sm text-zinc-500 mt-1">Manage and monitor all your projects</p>
          </div>
          <div className="flex items-center gap-3">
            <CreateProjectSheet />
          </div>
        </div>

        {/* Stats cards */}
        <section className="grid grid-cols-1 md:grid-cols-4 gap-3 font-sans">


          <Block
            title="Combined Views"
            value={totalPageviews}
            icon={<EyeIcon className="text-muted-foreground" />}
          />


        </section>

        {/* Projects list */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-zinc-900 uppercase tracking-wider flex items-center gap-2">
              <LayoutGrid className="w-4 h-4" />
              Your projects
            </h2>
          </div>

          {!user || projects.length === 0 ? (
            <div className="bg-white border border-stone-200 rounded-[8px] p-12 text-center shadow-sm">
              <div className="w-12 h-12 bg-zinc-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <LayoutGrid className="w-6 h-6 text-zinc-400" />
              </div>
              <p className="text-sm font-medium text-zinc-900">
                No projects yet
              </p>
              <p className="text-sm text-zinc-500 mt-1 mb-6">
                Create your first project to start tracking analytics.
              </p>
              <CreateProjectSheet />
            </div>
          ) : (
            <div className="flex flex-col bg-white border border-stone-200 rounded-[8px] overflow-hidden shadow-sm">
              <div className="grid grid-cols-[1.5fr_1fr_1fr_80px] items-center px-6 py-3 bg-stone-50 border-b border-stone-200 text-[10px] font-bold text-zinc-500 uppercase">
                <span className="text-left">Alias</span>
                <span className="text-left">Domain</span>
                <span>Status</span>
                <span className="text-right px-2">Action</span>
              </div>
              <div className="flex flex-col">
                {projects.map((project) => (
                  <div
                    key={project.id}
                    className="grid grid-cols-[1.5fr_1fr_1fr_80px] items-center px-6 py-4 border-b border-stone-100 last:border-0 hover:bg-stone-50/50 transition-all group relative"
                  >
                    {/* Corner accents on hover (matching top pages style) */}
                    <span className="pointer-events-none absolute left-0 top-0 h-2 w-2 border-l border-t border-transparent group-hover:border-primary/40 transition-all" />
                    <span className="pointer-events-none absolute right-0 top-0 h-2 w-2 border-r border-t border-transparent group-hover:border-primary/40 transition-all" />
                    <span className="pointer-events-none absolute left-0 bottom-0 h-2 w-2 border-l border-b border-transparent group-hover:border-primary/40 transition-all" />
                    <span className="pointer-events-none absolute right-0 bottom-0 h-2 w-2 border-r border-b border-transparent group-hover:border-primary/40 transition-all" />

                    <Link
                      href={`/dashboard/analytics/${project.publicId}`}
                      className="flex items-center gap-2 group/link"
                    >
                      <span className="font-semibold text-zinc-900 group-hover/link:text-primary transition-colors truncate">
                        {project.name}
                      </span>
                      <ExternalLink className="w-3 h-3 text-zinc-300 opacity-0 group-hover/link:opacity-100 transition-opacity" />
                    </Link>

                    <div className="flex items-center">
                      <span className="text-sm text-zinc-500 font-medium truncate">
                        {project.domain}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-100">
                        <CheckCircle2 className="size-3 text-emerald-500" />
                        <span className="text-[10px] font-bold text-emerald-600 uppercase whitespace-nowrap">In Sync</span>
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <form action={deleteProject.bind(null, project.publicId)}>
                        <button
                          type="submit"
                          className="p-2 text-zinc-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-all group/del"
                        >
                          <Trash2 size={16} className="transition-transform group-hover/del:scale-110" />
                        </button>
                      </form>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
