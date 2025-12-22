import Hero from "@/components/landing/hero";
import Navbar from "@/components/landing/navbar";

export default function Home() {
  return (
    <div className="min-h-screen bg-bg-primary">
      <Navbar />
      <main className="max-w-7xl mx-auto flex flex-col items-center justify-center">
        <Hero />
      </main>
    </div>
  );
}