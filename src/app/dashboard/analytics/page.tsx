import Link from "next/link";
import { query, queryOne } from "@/lib/db";
import { auth } from "../../../../auth";
import { redirect } from "next/navigation";
import Block from "@/components/blocks";
import { EyeIcon } from "@/components/icons/eye";
import { CreateProjectSheet } from "@/components/analytics/create-project-sheet";
import { LayoutGrid, ExternalLink, Trash2, Search } from "lucide-react";
import { deleteProject } from "@/lib/actions";
import { FormSubmitButton } from "@/components/form-submit-button";
import type { User, Project, Analytics } from "@/types/models";

type ProjectWithAnalytics = Project & { analytics: Analytics | null };

type DashboardPageProps = {
  searchParams?: Promise<{
    q?: string;
  }>;
};

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
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
  let projects: ProjectWithAnalytics[] = [];

  if (user) {
    projects = await query<ProjectWithAnalytics>(
      `SELECT 
         p.*,
         json_build_object(
           'id', a."id",
           'projectId', a."projectId",
           'totalPageVisits', COALESCE(a."totalPageVisits", 0),
           'totalVisits', COALESCE(a."totalVisits", 0)
         ) as analytics
       FROM "Project" p
       LEFT JOIN "Analytics" a ON a."projectId" = p."id"
       WHERE p."ownerId" = $1
       ORDER BY p."id" DESC`,
      [user.id]
    );
  }

  const resolvedSearchParams = await searchParams;
  const searchQuery =
    typeof resolvedSearchParams?.q === "string" ? resolvedSearchParams.q.trim() : "";

  const filteredProjects =
    searchQuery.length > 0
      ? projects.filter((p) => {
          const q = searchQuery.toLowerCase();
          return (
            p.name.toLowerCase().includes(q) ||
            p.domain.toLowerCase().includes(q)
          );
        })
      : projects;

  // Calculate totals across ALL projects for the summary
  const totalPageviews = projects.reduce(
    (sum, p) => sum + (p.analytics?.totalPageVisits ?? 0),
    0
  );

  return (
    <div className="min-h-screen bg-zinc-50 py-6 md:py-8">
      <div className="max-w-5xl mx-auto px-4 md:px-6 space-y-6 md:space-y-8">
        {/* Header Section */}
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-xl md:text-2xl font-semibold text-zinc-900 tracking-tight">
              Overview
            </h1>
            <p className="text-sm text-zinc-500 mt-1 hidden md:block">Manage and monitor all your projects</p>
          </div>
          <CreateProjectSheet />
        </div>
        {projects.length > 0 && (
        <section className="grid grid-cols-2 md:grid-cols-4 gap-3 font-sans">
          <Block
            title="Combined Views"
            value={totalPageviews}
            icon={<EyeIcon className="text-muted-foreground" />}
          />
        </section>
        )}
        {/* Projects list */}
        <section className="space-y-3 md:space-y-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <h2 className="text-xs md:text-sm font-semibold text-zinc-900 uppercase tracking-wider flex items-center gap-2">
              <LayoutGrid className="w-4 h-4" />
              Your projects
            </h2>
            {projects.length > 0 && (
              <form method="GET" className="w-full md:w-64 relative">
                <input
                  type="text"
                  name="q"
                  defaultValue={searchQuery}
                  placeholder="Search projects..."
                  className="w-full pl-9 pr-3 py-2 rounded-md border border-stone-200 bg-white text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
                <Search className="w-4 h-4 text-zinc-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </form>
            )}
          </div>

          {!user || projects.length === 0 ? (
            <div className="bg-white border border-stone-200 rounded-lg p-8 md:p-12 text-center shadow-sm">
              <div className="w-12 h-12 bg-zinc-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <LayoutGrid className="w-6 h-6 text-zinc-400" />
              </div>
              <p className="text-sm font-medium text-zinc-900">
                No projects yet
              </p>
              <p className="text-sm text-zinc-500 mt-1 mb-6">
                Create your first project to start tracking.
              </p>
             
            </div>
          ) : (
            <div className="space-y-3 md:space-y-0 md:bg-white md:border md:border-stone-200 md:rounded-lg md:overflow-hidden md:shadow-sm">
              <div className="hidden md:grid grid-cols-[2fr_2fr_60px] items-center px-4 py-3 bg-stone-50 border-b border-stone-200 text-[10px] font-bold text-zinc-500 uppercase">
                <span>Project</span>
                <span>Domain</span>
                <span></span>
              </div>

              {filteredProjects.length === 0 ? (
                <div className="px-4 py-6 text-sm text-zinc-500 text-center">
                  No projects match your search.
                </div>
              ) : (
                filteredProjects.map((project) => (
                  <div
                    key={project.id}
                    className="bg-white border border-stone-200 rounded-lg p-4 md:border-0 md:border-b md:border-stone-100 md:last:border-0 md:rounded-none md:px-4 md:py-3 hover:bg-stone-50/50 transition-all"
                  >
                    <div className="md:hidden flex items-center justify-between gap-3">
                      <Link
                        href={`/dashboard/analytics/${project.publicId}`}
                        className="flex-1 min-w-0"
                      >
                        <span className="font-semibold text-zinc-900 block truncate">
                          {project.name}
                        </span>
                        <span className="text-xs text-zinc-500 truncate block mt-0.5">
                          {project.domain}
                        </span>
                      </Link>
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/dashboard/analytics/${project.publicId}`}
                          className="p-2 text-zinc-400 hover:text-primary hover:bg-stone-100 rounded-md transition-all"
                        >
                          <ExternalLink size={16} />
                        </Link>
                        <form action={deleteProject.bind(null, project.publicId)}>
                          <FormSubmitButton
                            loadingText=""
                            className="p-2 text-zinc-400 cursor-pointer hover:text-red-500 hover:bg-red-50 rounded-md transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                          >
                            <Trash2 size={16} />
                          </FormSubmitButton>
                        </form>
                      </div>
                    </div>

                    {/* Desktop Layout */}
                    <div className="hidden md:grid grid-cols-[2fr_2fr_60px] items-center">
                      <Link
                        href={`/dashboard/analytics/${project.publicId}`}
                        className="flex items-center gap-2 group/link min-w-0"
                      >
                        <span className="font-medium text-zinc-900 group-hover/link:text-primary transition-colors truncate">
                          {project.name}
                        </span>
                        <ExternalLink className="w-3 h-3 text-zinc-300 opacity-0 group-hover/link:opacity-100 transition-opacity flex-shrink-0" />
                      </Link>

                      <span className="text-sm text-zinc-500 truncate">
                        {project.domain}
                      </span>

                      <div className="flex justify-end">
                        <form action={deleteProject.bind(null, project.publicId)}>
                          <FormSubmitButton
                            loadingText=""
                            className="p-1.5 text-zinc-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                          >
                            <Trash2 size={14} />
                          </FormSubmitButton>
                        </form>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
