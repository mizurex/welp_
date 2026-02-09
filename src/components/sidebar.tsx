"use client";

import { dashboardNavigation } from "@/lib/navigation";
import { cn } from "@/lib/utils";
import { useMobile } from "@/hooks/useMobile";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from 'motion/react'
import {
  Globe,
  Moon,
  ChevronDown,
  Folder,
  Menu,
  X,
  ChevronRight,
} from "lucide-react";
import { useState } from "react";
import { Plus } from "lucide-react";

import { useParams, useRouter } from "next/navigation";

interface SidebarProps {
  className?: string;
  projects?: { name: string; publicId: string }[];
  user: { name: string; email: string };
}

export function Sidebar({ className, projects = [] , user={name: "B", email: ""}}: SidebarProps) {
  const { isMobile, isMobileMenuOpen, closeMobileMenu, toggleMobileMenu } = useMobile();
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
      {/* Mobile Header - Only shows on mobile */}
      {isMobile && (
        <div className={cn("fixed top-0 left-0 right-0 z-50 bg-bg-primary shadow-sm px-4 py-1 flex items-center justify-between md:hidden", isMobileMenuOpen && "bg-transparent")}>
          <div className="flex items-center gap-3">
            <button
              onClick={toggleMobileMenu}
              className="p-2 rounded-lg hover:bg-stone-100 transition-colors"
              aria-label="Open menu"
            >
              <Menu className="size-5 text-foreground" />
            </button>
         
          </div>
        </div>
      )}
      {isMobile && isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30"
          onClick={closeMobileMenu}
        />
      )}
      <div
        className={cn(
          "fixed top-0 left-0 bottom-0 z-60 flex font-sans",
          "transform transition-transform duration-200",
          isMobile && !isMobileMenuOpen && "-translate-x-full",
          "md:translate-x-0",
          className
        )}
      >
        <div className="w-55 bg-bg-primary flex flex-col overflow-hidden">

          {isMobile && (
            <div className="flex items-center justify-between p-4 border-b border-stone-200">
              <span className="font-semibold text-sm text-foreground">Menu</span>
              <button
                onClick={closeMobileMenu}
                className="p-1.5 rounded-lg hover:bg-stone-100 transition-colors"
                aria-label="Close menu"
              >
                <X className="size-5 text-foreground" />
              </button>
            </div>
          )}

          <div className="p-4 border-b border-stone-200 relative">

            <button
              onClick={projects.length > 0 ? handleDropdown : undefined}
              disabled={projects.length === 0}
              className={cn(
                "w-full flex justify-between border border-stone-200 bg-muted px-[8px] py-[4px] rounded-[6px] text-foreground transition-all group",
                projects.length > 0 
                  ? "cursor-pointer hover:shadow-sm" 
                  : " opacity-60"
              )}
            >
              <div className="flex items-center gap-3">
                <div>
                  <Folder className="size-4 text-muted-foreground" />
                </div>
                <div className="flex flex-col">
               

                  {
                    projects.length > 0 ?(
                      <>
                           <span className="font-bold text-foreground/80 text-xs font-sans ">
                      My Projects
                    </span>
                      <span className="truncate font-medium text-xs py-[2px] font-sans text-foreground/80 w-fit">
                        {activeProject?.name}
                      </span>
                      
                      </>
                 
                    )
                    : (
                      <span className="truncate font-medium text-xs py-[2px] font-sans text-foreground/80 w-fit">
                        No projects
                      </span>
                    )
                  }
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

            <AnimatePresence>
              {isDropdownOpen && projects.length > 0 && (
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

                
                </motion.div>
              )}
            </AnimatePresence>
          </div>

      

          <nav className="flex-1 overflow-y-auto p-3 space-y-6">
            {dashboardNavigation.map((section, index) => (
              <div key={section.title || index}>
                <h3 className="px-3 mb-2 text-xs font-semibold text-black uppercase tracking-wider">
                  {section.title}
                </h3>
                <div className="space-y-0.5">
                  {section.items.map((item) => {
                    if (item.title === "Settings" && projects.length === 0) return null;
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
                        {Icon && <Icon className="w-4 h-4 flex-shrink-0 text-muted-foreground" />}
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

          <div className="mt-auto border-t border-stone-200">
            {/* User Profile */}
            <div className="p-2 border-t border-stone-200">
              <div
              
                onClick={closeMobileMenu}
                className="flex items-center gap-3 px-3 py-2 hover:bg-muted rounded-[6px] transition-colors group"
              >
               
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{user.email}</p>
                
                </div>
                <ChevronRight className="size-4 text-foreground/30 group-hover:text-foreground/50 transition-colors" />
              </div>
            </div>
          </div>
        </div>

 
        <div className="w-1.5 bg-gradient-to-b from-stone-200 via-stone-100 to-stone-200" />
      </div>
    </>
  );
}

