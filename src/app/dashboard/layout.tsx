import { MobileProvider } from "@/hooks/useMobile";
import { Sidebar } from "@/components/sidebar";
import prisma from "@/lib/prisma";
import { auth } from "../../../auth";
import { redirect } from "next/navigation";

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

  const user = await prisma.user.findUnique({
    where: { email },
    include: {
      projects: {
        orderBy: { id: "desc" },
      },
    },
  });

  return (
    <MobileProvider>
      <div className="min-h-screen bg-bg-primary">
        <Sidebar projects={user?.projects.map((project) => ({ name: project.name, publicId: project.publicId }))} />
        <div className="md:ml-57">
          <main className="min-h-screen">{children}</main>
        </div>
      </div>
    </MobileProvider>
  );
}
