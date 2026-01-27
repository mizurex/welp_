import { MobileProvider } from "@/hooks/useMobile";
import { Sidebar } from "@/components/sidebar";
import { query } from "@/lib/db";
import { auth } from "../../../auth";
import { redirect } from "next/navigation";
import type { User, Project } from "@/types/models";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session || !session.user || !session.user.email) {
    redirect("/api/auth/signin");
  }

  const email = session.user.email as string;

  // Get user with their projects
  const users = await query<User>(
    `SELECT * FROM "User" WHERE "email" = $1`,
    [email]
  );
  const user = users[0];

  const details = {
    name: user?.name,
    email: user?.email,
  }

  const projects = user
    ? await query<Project>(
        `SELECT * FROM "Project" WHERE "ownerId" = $1 ORDER BY "id" DESC`,
        [user.id]
      )
    : [];

  return (
    <MobileProvider>
      <div className="min-h-screen bg-bg-primary">
        <Sidebar projects={projects.map((project) => ({ name: project.name, publicId: project.publicId }))} user={details} />
        <div className="md:ml-57 pt-14 md:pt-0">
          <main className="min-h-screen">{children}</main>
        </div>
      </div>
    </MobileProvider>
  );
}
