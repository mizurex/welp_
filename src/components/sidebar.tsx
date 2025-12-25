"use client";

import { dashboardNavigation } from "@/lib/navigation";
import { cn } from "@/lib/utils";
import { useMobile } from "@/hooks/useMobile";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from 'motion/react'
import {
  User,
  Globe,
  Link2,
  Clock,
  LayoutGrid,
  Moon,
  ChevronDown,
  Folder,
} from "lucide-react";
import { useState } from "react";

import { createProject } from "@/lib/actions";
import { Plus, Settings, ChevronRight } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useParams, useRouter } from "next/navigation";
import { FolderCogIcon } from "./icons/folder";

interface SidebarProps {
  className?: string;
  projects?: { name: string; publicId: string }[];
}

export function Sidebar({ className, projects = [] }: SidebarProps) {
  const { isMobile, isMobileMenuOpen, closeMobileMenu } = useMobile();
  const pathname = usePathname();
  const params = useParams();
  const router = useRouter();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const slug = params.slug as string;
  const activeProject = projects.find((p) => p.publicId === slug) || projects[0];

  const handleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  return (
    <>
      {/* Backdrop for mbile */}
      {isMobile && isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30"
          onClick={closeMobileMenu}
        />
      )}

      {/* Sidebar container */}
      <div
        className={cn(
          "fixed top-0 left-0 bottom-0 z-40 flex font-sans",
          "transform transition-transform duration-200",
          isMobile && !isMobileMenuOpen && "-translate-x-full",
          "md:translate-x-0",
          className
        )}
      >
        {/* Icon Rail (thin left bar) */}


        {/* Main Navigation Sidebar */}
        <div className="w-55 bg-bg-primary flex flex-col overflow-hidden">

          {/* Project Selector */}
          <div className="p-4 border-b border-stone-200 relative">

            <button
              onClick={handleDropdown}
              className="w-full cursor-pointer flex  justify-between border border-stone-200 hover:shadow-sm bg-muted  px-[8px] py-[4px] rounded-[6px] text-foreground  transition-all group"
            >
              <div className="flex items-center gap-3">
                <div>
                  <Folder className="size-4" />
                </div>
                <div className="flex flex-col">
                  <span className="font-bold text-foreground/80 text-xs font-sans ">
                    My Projects
                  </span>
                  <span className="truncate font-medium text-xs py-[2px] font-sans text-foreground/80 w-fit">
                    {activeProject?.name || "Select Project"}
                  </span>
                </div>
              </div>

              <div className='flex items-center'>
                <ChevronDown
                  className={cn(
                    "w-3.5 h-3.5 text-zinc-400 flex-shrink-0  transition-transform",
                    isDropdownOpen && "rotate-180"
                  )}
                />
              </div>

            </button>

            {/* Dropdown Content */}
            <AnimatePresence>
              {isDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -4, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -4, scale: 0.95 }}
                  transition={{ duration: 0.15, ease: "easeOut" }}
                  className="absolute left-3 right-3 top-full mt-1 py-1 bg-white border border-stone-200 rounded-[8px] overflow-hidden z-50 origin-top"
                >
                  <div className="max-h-[200px] overflow-y-auto">
                    {projects.map((p) => (
                      <button
                        key={p.publicId}
                        onClick={() => {
                          setIsDropdownOpen(false);
                          router.push(`/dashboard/analytics/${p.publicId}`);
                        }}
                        className={cn(
                          "w-full flex items-center justify-between px-3 py-1.5 text-xs transition-colors text-left",
                          activeProject?.publicId === p.publicId
                            ? "bg-stone-100 text-stone-900 font-semibold"
                            : "text-stone-600 hover:bg-stone-50 hover:text-stone-900"
                        )}
                      >
                        <span className="truncate">{p.name}</span>
                        {activeProject?.publicId === p.publicId && (
                          <div className="size-1.5 rounded-full bg-primary" />
                        )}
                      </button>
                    ))}
                  </div>

                  <div className="border-t border-stone-100 mt-1 pt-1 pb-1">
                    <button
                      onClick={() => {
                        setIsDropdownOpen(false);
                        setIsSheetOpen(true);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-primary hover:bg-stone-50 transition-colors font-medium"
                    >
                      <Plus className="size-3" />
                      Add new project
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Add Project Sheet Integration */}
          <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
            <SheetContent side="right" className="p-6">
              <SheetHeader>
                <SheetTitle>Create new project</SheetTitle>
                <SheetDescription>
                  Add a new project to start tracking its analytics.
                </SheetDescription>
              </SheetHeader>
              <form
                action={createProject}
                className="mt-6 space-y-4"
              >
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-zinc-900">
                    Project name
                  </label>
                  <input
                    type="text"
                    name="name"
                    className="w-full bg-white border border-stone-200 rounded-lg px-3 py-2 text-sm text-zinc-900 focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                    placeholder="My website"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-zinc-900">
                    Domain
                  </label>
                  <input
                    type="text"
                    name="domain"
                    className="w-full bg-white border border-stone-200 rounded-lg px-3 py-2 text-sm text-zinc-900 focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                    placeholder="example.com"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary/90 transition-colors mt-4"
                >
                  Create Project
                </button>
              </form>
            </SheetContent>
          </Sheet>

          {/* Navigation Sections */}
          <nav className="flex-1 overflow-y-auto p-3 space-y-6">
            {dashboardNavigation.map((section, index) => (
              <div key={section.title || index}>
                <h3 className="px-3 mb-2 text-xs font-semibold text-black uppercase tracking-wider">
                  {section.title}
                </h3>
                <div className="space-y-0.5">
                  {section.items.map((item) => {
                    const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
                    const Icon = item.icon;
                    return (
                      <Link
                        key={`${section.title}-${item.title}`}
                        href={item.title === "Settings" ? `${item.href}${activeProject?.publicId || ""}` : item.href}
                        onClick={closeMobileMenu}
                        className={cn(
                          "flex items-center gap-3 px-3 py-3 font-sans text-sm font-medium rounded-[6px]  transition-colors",
                          isActive
                            ? "bg-muted text-foreground"
                            : "text-foreground"
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
        <div className="w-7 bg-[#efeffa] flex flex-col items-center py-4 border-x border-stone-300">



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
    <motion.a
      href={href}
      title={tooltip}
      className={cn(
        "size-6 space-y-[4px] rounded-[8px] flex items-center justify-center transition-colors",
        active
          ? "bg-primary text-white"
          : "p-1  rounded-[4.5px] hover:bg-white "
      )}

      whileTap={{ scale: 0.9 }}
      {...extraProps}
    >
      <Icon className="size-3" />
    </motion.a>
  );
}
