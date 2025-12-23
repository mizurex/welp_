import { MobileProvider } from "@/hooks/useMobile";


export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <MobileProvider>
      <div className="min-h-screen">

        <main className="min-h-screen">{children}</main>

      </div>
    </MobileProvider>
  );
}
