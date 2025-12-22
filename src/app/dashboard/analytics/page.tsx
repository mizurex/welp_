import Link from "next/link";
import prisma from "@/lib/prisma";
import { auth, signOut } from "../../../../auth";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { Menu, Share, Edit, ChevronLeft, ChevronRight } from "lucide-react";
import { MobileMenuButton } from "@/components/mobile-menu-button";
import { DefaultBarChart } from "@/components/ui/default-bar-chart";

function generateProjectId(): string {
  const randomPart = Math.random().toString(36).slice(2);
  const timePart = Date.now().toString(36);
  return "prj_" + randomPart + timePart;
}

async function signOutAction() {
  "use server";
  await signOut({ redirect: true, redirectTo: "/" });
}

async function createProject(formData: FormData) {
  "use server";

  const session = await auth();

  if (!session || !session.user || !session.user.email) {
    return;
  }

  const email = session.user.email as string;

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    return;
  }

  const nameValue = formData.get("name");
  const domainValue = formData.get("domain");

  const name = typeof nameValue === "string" ? nameValue.trim() : "";
  const domain = typeof domainValue === "string" ? domainValue.trim() : "";

  if (!name || !domain) {
    return;
  }

  const projectId = generateProjectId();

  await prisma.project.create({
    data: {
      name,
      domain,
      publicId: projectId,
      ownerId: user.id,
      analytics: {
        create: {
          totalPageVisits: 0,
          totalVisits: 0,
        },
      },
    },
  });

  revalidatePath("/dashboard/analytics");
}

export default async function DashboardPage() {
  const session = await auth();

  if (!session || !session.user || !session.user.email) {
    redirect("/api/auth/signin");
  }

  const email = session.user.email as string;

  const user = await prisma.user.findUnique({
    where: { email },
    include: {
      projects: {
        include: { analytics: true },
        orderBy: { id: "desc" },
      },
    },
  });

  // Calculate totals across ALL projects for the summary
  const totalVisits = user?.projects.reduce(
    (sum, p) => sum + (p.analytics?.totalVisits ?? 0),
    0
  ) ?? 0;
  const totalPageviews = user?.projects.reduce(
    (sum, p) => sum + (p.analytics?.totalPageVisits ?? 0),
    0
  ) ?? 0;

  // Use the weighted average for bounce rate and duration across projects
  const avgBounceRate = user && user.projects.length > 0
    ? user.projects.reduce((sum, p) => sum + (p.analytics?.bounceRate ?? 0), 0) / user.projects.length
    : 0;

  const avgDurationSeconds = user && user.projects.length > 0
    ? user.projects.reduce((sum, p) => sum + (p.analytics?.avgDuration ?? 0), 0) / user.projects.length
    : 0;

  const formatDuration = (seconds: number) => {
    if (seconds < 60) return `${Math.round(seconds)}s`;
    const mins = Math.floor(seconds / 60);
    const secs = Math.round(seconds % 60);
    return `${mins}m ${secs}s`;
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      {/* Top Bar */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-zinc-800">
        <div className="flex items-center gap-3">
          <MobileMenuButton />
          <div className="flex items-center gap-2">
            <span className="text-amber-500">☀</span>
            <h1 className="text-xl font-semibold">All Projects</h1>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-zinc-700 text-sm text-zinc-300 hover:bg-zinc-800 transition-colors">
            <Share className="w-4 h-4" />
            Share
          </button>
          <button className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-zinc-700 text-sm text-zinc-300 hover:bg-zinc-800 transition-colors">
            <Edit className="w-4 h-4" />
            Edit
          </button>
        </div>
      </header>

      <main className="p-6 space-y-6">
        {/* Filter Bar */}


        {/* Create project */}
        <section className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-zinc-100 mb-4">
            Create new project
          </h2>
          <form action={createProject} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1.5">
                  Project name
                </label>
                <input
                  type="text"
                  name="name"
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none"
                  placeholder="My website"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1.5">
                  Domain
                </label>
                <input
                  type="text"
                  name="domain"
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none"
                  placeholder="example.com"
                  required
                />
              </div>
            </div>
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-black bg-amber-500 rounded-lg hover:bg-amber-400 transition-colors"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Add project
            </button>
          </form>
        </section>

        {/* Projects list */}
        <section>
          <h2 className="text-lg font-semibold text-zinc-100 mb-4">
            Your projects
          </h2>

          {!user || user.projects.length === 0 ? (
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 text-center">
              <div className="w-12 h-12 bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-6 h-6 text-zinc-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </div>
              <p className="text-sm text-zinc-400">
                You don&apos;t have any projects yet.
              </p>
              <p className="text-sm text-zinc-500 mt-1">
                Create one above to start tracking analytics.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {user.projects.map((project) => (
                <Link
                  key={project.id}
                  href={`/dashboard/analytics/${project.publicId}`}
                  className="group bg-zinc-900 border border-zinc-800 rounded-xl p-5 hover:border-amber-500/50 transition-all"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-zinc-100 group-hover:text-amber-500 transition-colors">
                        {project.name}
                      </h3>
                      <p className="text-sm text-zinc-500">{project.domain}</p>
                    </div>
                    <svg
                      className="w-5 h-5 text-zinc-600 group-hover:text-amber-500 transition-colors"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </div>

                  {project.analytics && (
                    <div className="flex items-center gap-6 pt-3 border-t border-zinc-800">
                      <div>
                        <p className="text-xs text-zinc-500">Visits</p>
                        <p className="text-lg font-semibold text-zinc-100">
                          {project.analytics.totalVisits.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-zinc-500">Pageviews</p>
                        <p className="text-lg font-semibold text-zinc-100">
                          {project.analytics.totalPageVisits.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="mt-3 pt-3 border-t border-zinc-800">
                    <p className="text-xs font-mono text-zinc-600">
                      {project.publicId}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

function StatCard({
  label,
  value,
  change,
  up,
}: {
  label: string;
  value: string;
  change: string;
  up: boolean;
}) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
      <p className="text-sm text-zinc-400 mb-1">{label}</p>
      <p className="text-2xl font-bold text-zinc-100">{value}</p>
      <p className={`text-sm mt-1 ${up ? "text-green-500" : "text-red-500"}`}>
        {up ? "↑" : "↓"} {change}
      </p>
    </div>
  );
}
