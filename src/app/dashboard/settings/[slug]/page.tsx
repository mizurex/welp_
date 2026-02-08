import { auth } from "../../../../../auth";
import { query, queryOne } from "@/lib/db";
import { notFound, redirect } from "next/navigation";
import { updateProject, updateProjectDomain, deleteProject } from "@/lib/actions";
import TrackingScript from "@/components/analytics/tracking-script";
import { FormSubmitButton } from "@/components/form-submit-button";
import type { User, Project } from "@/types/models";
import Link from "next/link";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function ProjectSettingsPage({ params }: PageProps) {
  const { slug } = await params;
  const projectPublicId = slug;

  if (!projectPublicId?.trim()) {
    redirect("/dashboard/analytics");
  }

  const session = await auth();

  if (!session || !session.user || !session.user.email) {
    redirect("/");
  }

  const email = session.user.email as string;

  const project = await queryOne<Project & { userEmail: string }>(
    `SELECT p.*, u."email" as "userEmail"
     FROM "Project" p
     JOIN "User" u ON p."ownerId" = u."id"
     WHERE p."publicId" = $1 AND u."email" = $2`,
    [projectPublicId, email]
  );

  if (!project) {
    notFound();
  }

  const trackingEndpoint = process.env.NEXT_PUBLIC_APP_URL || "https://www.trywelp.live";

  return (
    <div className="min-h-screen bg-zinc-50 font-sans">
      <main className="max-w-3xl mx-auto px-4 md:px-6 py-6 md:py-10">
        
        {/* Header */}
        <div className="mb-6 md:mb-10">
          <div className="flex items-center gap-2 text-xs md:text-sm text-muted-foreground mb-2 overflow-x-auto">
            <Link href="/dashboard/analytics" className="hover:text-foreground transition-colors whitespace-nowrap">
              Projects
            </Link>
            <span>/</span>
            <Link href={`/dashboard/analytics/${project.publicId}`} className="hover:text-foreground transition-colors truncate max-w-[100px] md:max-w-none">
              {project.name}
            </Link>
            <span>/</span>
            <span className="text-foreground whitespace-nowrap">Settings</span>
          </div>
          <h1 className="text-xl md:text-2xl font-semibold text-foreground">Settings</h1>
        </div>

        <div className="space-y-6">
          
          {/* General Settings Card */}
          <section className="bg-white border border-stone-200 rounded-[6px] overflow-hidden">
            <div className="px-4 md:px-6 py-3 border-b border-stone-100">
              <h2 className="text-sm font-semibold text-foreground">General</h2>
            </div>
            
            <div className="divide-y divide-stone-100">
              {/* Project Name */}
              <form action={updateProject.bind(null, project.publicId)} className="px-4 md:px-6 py-4">
                <label htmlFor="name" className="text-sm font-medium text-foreground block mb-2">
                  Project Name
                </label>
                <div className="flex items-center gap-2">
                  <input
                    id="name"
                    name="name"
                    defaultValue={project.name}
                    className="flex-1 px-3 py-2 text-sm border border-stone-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  />
                  <FormSubmitButton>Save</FormSubmitButton>
                </div>
              </form>

              {/* Domain */}
              <form action={updateProjectDomain.bind(null, project.publicId)} className="px-4 md:px-6 py-4">
                <label htmlFor="domain" className="text-sm font-medium text-foreground block mb-2">
                  Domain
                </label>
                <div className="flex items-center gap-2">
                <code className="block w-full px-3 py-2 text-sm font-mono bg-stone-50 border border-stone-200 rounded-md text-muted-foreground select-all overflow-x-auto">
                  {project.domain}
                </code>
               
                </div>
              </form>

                <div className="px-4 md:px-6 py-4">
                <label className="text-sm font-medium text-foreground block mb-2">
                  Project ID
                </label>
                <code className="block w-full px-3 py-2 text-sm font-mono bg-stone-50 border border-stone-200 rounded-md text-muted-foreground select-all overflow-x-auto">
                  {project.publicId}
                </code>
              </div>
            </div>
          </section>
          <section>
            <TrackingScript projectPublicId={project.publicId} baseUrl={trackingEndpoint} />
          </section>

            <section className="bg-white  rounded-[6px] overflow-hidden">
            <div className="px-4 md:px-6 py-4">
              <p className="text-sm font-medium text-foreground mb-1">
                Delete project
              </p>
              <p className="text-xs text-muted-foreground mb-4">
                This cannot be undone.
              </p>
              <form action={deleteProject.bind(null, project.publicId)}>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-red-400 rounded-md hover:bg-red-700 transition-colors"
                >
                  <FormSubmitButton loadingText="Deleting...">Delete</FormSubmitButton>
                </button>
              </form>
            </div>
          </section>

        </div>
      </main>
    </div>
  );
}
