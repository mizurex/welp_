import { CanvasGridBackground } from "@/components/landing/grid";
import prisma from "@/lib/prisma";

export default async function DashboardPage() {
  const [total, recent] = await Promise.all([
    prisma.pageView.count(),
    prisma.pageView.findMany({
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
  ]);

  return (
    <main className="min-h-screen px-6 py-8 max-w-3xl mx-auto">
    <CanvasGridBackground/>
    <div className="relative z-10">
      <h1 className="text-3xl font-bold mb-4 text-center">Analytics</h1>
    </div>
    </main>
  );
}


