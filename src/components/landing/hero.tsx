import Link from "next/link";
import { ArrowRight, BarChart3, Shield, Zap } from "lucide-react";

export default function Hero() {
  return (
    <div className="w-full bg-bg-primary font-sans">
      {/* Hero Section */}
      <section className="min-h-[85vh] flex flex-col items-center justify-center px-4 py-16 md:py-24">
        <div className="max-w-3xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium mb-6">
            <span className="size-1.5 rounded-full bg-primary animate-pulse" />
            Privacy-first analytics
          </div>

          {/* Headline */}
          <h1 className="text-3xl md:text-5xl font-medium text-foreground tracking-tight leading-tight mb-4">
            Simple analytics for
            <br />
            <span className="text-primary">modern teams</span>
          </h1>

          {/* Subheadline */}
          <p className="text-base text-stone-500 max-w-lg mx-auto mb-8">
            Track what matters. 
            Just clean insights for your websites.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/auth/signin"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-primary text-white text-sm font-medium px-2 py-2 rounded-lg hover:bg-primary/90 transition-all"
            >
              Get started free
              <ArrowRight className="size-4" />
            </Link>
            <Link
              href="/dashboard/analytics"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white text-foreground text-sm font-medium px-6 py-3 rounded-lg hover:bg-stone-50 transition-all"
            >
              Dashboard
            </Link>
          </div>
        </div>
      </section>

 

      {/* Footer */}
      <footer className="px-4 py-8 border-t border-stone-200">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
        
          <div className="flex items-center gap-4">
            <Link href="#" className="hover:text-foreground transition-colors">
              GitHub
            </Link>
            <Link href="#" className="hover:text-foreground transition-colors">
              Twitter
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="p-5 rounded-lg bg-white border border-stone-200 hover:border-stone-300 transition-colors">
      <div className="size-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-4">
        {icon}
      </div>
      <h3 className="font-semibold text-foreground mb-1">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}
