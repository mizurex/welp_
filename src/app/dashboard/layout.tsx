import { MobileProvider } from "@/hooks/useMobile";
import { Sidebar } from "@/components/sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <MobileProvider>
      <div className="min-h-screen bg-zinc-950">
        <Sidebar />
        {/* Main content - offset by sidebar width (48px icon rail + 208px nav = 256px = 64 in tailwind) */}
        <div className="md:ml-64">
          <main className="min-h-screen">{children}</main>
        </div>
      </div>
    </MobileProvider>
  );
}
