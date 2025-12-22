"use client";

import { dashboardNavigation } from "@/lib/navigation";
import { cn } from "@/lib/utils";
import { useMobile } from "@/hooks/useMobile";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  User,
  Globe,
  Link2,
  Clock,
  LayoutGrid,
  Moon,
  ChevronDown,
} from "lucide-react";

interface SidebarProps {
  className?: string;
  projectName?: string;
}

export function Sidebar({ className, projectName = "All Projects" }: SidebarProps) {
  const { isMobile, isMobileMenuOpen, closeMobileMenu } = useMobile();
  const pathname = usePathname();

  return (
    <>
      {/* Backdrop for mobile */}
      {isMobile && isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30"
          onClick={closeMobileMenu}
        />
      )}

      {/* Sidebar container */}
      <div
        className={cn(
          "fixed top-0 left-0 bottom-0 z-40 flex",
          "transform transition-transform duration-200",
          isMobile && !isMobileMenuOpen && "-translate-x-full",
          "md:translate-x-0",
          className
        )}
      >
        {/* Icon Rail (thin left bar) */}
        <div className="w-12 bg-[#efeffa] flex flex-col items-center py-4 border-r border-stone-200">
          {/* Logo */}
          <Link
            href="/"
            className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center mb-6"
          >
            <span className="text-black font-bold text-sm">W</span>
          </Link>

          {/* Top icons */}
          <div className="flex flex-col items-center gap-1">
            <IconButton icon={User} href="/dashboard/account" tooltip="Account" />

            <IconButton icon={Globe} href="https://welp.dev" tooltip="Docs" external />
            <IconButton icon={Moon} href="#" tooltip="Toggle theme" />
          </div>

          {/* Bottom icons */}
          <div className="mt-auto flex flex-col items-center gap-1">

          </div>
        </div>

        {/* Main Navigation Sidebar */}
        <div className="w-52 bg-[#efeffa] flex flex-col overflow-hidden">
          {/* Project Selector */}
          <div className="p-3 border-b border-stone-200">
            <button className="w-full flex items-center justify-between px-3 py-2 rounded-md bg-stone-200 hover:bg-zinc-700 transition-colors text-sm text-zinc-100">
              <span className="truncate">{projectName}</span>
              <ChevronDown className="w-4 h-4 text-zinc-400 flex-shrink-0" />
            </button>
          </div>

          {/* Navigation Sections */}
          <nav className="flex-1 overflow-y-auto p-3 space-y-6">
            {dashboardNavigation.map((section) => (
              <div key={section.title}>
                <h3 className="px-3 mb-2 text-xs font-semibold text-black uppercase tracking-wider">
                  {section.title}
                </h3>
                <div className="space-y-0.5">
                  {section.items.map((item) => {
                    const isActive = pathname === item.href;
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={closeMobileMenu}
                        className={cn(
                          "flex items-center gap-3 px-3 py-2 font-sans font-medium rounded-md text-sm transition-colors",
                          isActive
                            ? "bg-zinc-800 text-zinc-100"
                            : "text-black hover:text-zinc-800 hover:bg-zinc-800/50"
                        )}
                      >
                        {Icon && <Icon className="w-4 h-4 flex-shrink-0" />}
                        <span>{item.title}</span>
                        {item.isNew && (
                          <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded bg-amber-500 text-black font-medium">
                            NEW
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>
        </div>
      </div>
    </>
  );
}

// Icon button for the rail
function IconButton({
  icon: Icon,
  href,
  tooltip,
  active,
  external,
}: {
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  tooltip: string;
  active?: boolean;
  external?: boolean;
}) {
  const Component = external ? "a" : Link;
  const extraProps = external ? { target: "_blank", rel: "noopener noreferrer" } : {};

  return (
    <Component
      href={href}
      title={tooltip}
      className={cn(
        "w-9 h-9 rounded-lg flex items-center justify-center transition-colors",
        active
          ? "bg-zinc-800 text-zinc-100"
          : "text-zinc-500 hover:text-zinc-100 hover:bg-zinc-800"
      )}
      {...extraProps}
    >
      <Icon className="w-5 h-5" />
    </Component>
  );
}
