"use client";

import { Menu } from "lucide-react";
import { useMobile } from "@/hooks/useMobile";

export function MobileMenuButton() {
  const { toggleMobileMenu } = useMobile();

  return (
    <button
      type="button"
      onClick={toggleMobileMenu}
      className="md:hidden p-2 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
      aria-label="Toggle sidebar"
    >
      <Menu className="w-5 h-5" />
    </button>
  );
}

