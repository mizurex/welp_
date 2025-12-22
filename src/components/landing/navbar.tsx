"use client";

import Link from "next/link";
import { Menu } from "lucide-react";
import { useState } from "react";

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-40 flex items-center justify-between px-6 py-3 bg-bg-primary border-b border-stone-200 h-16">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-white text-sm font-semibold">W</span>
            </div>
            <span className="text-sm font-medium text-stone-900">Welp</span>
          </Link>
        </div>

        <nav className="hidden md:flex items-center gap-6 text-sm">
          <Link
            href="/dashboard/analytics"
            className="text-stone-600 hover:text-stone-900 transition-colors"
          >
            Dashboard
          </Link>
          <Link
            href="/#features"
            className="text-stone-500 hover:text-stone-900 transition-colors"
          >
            Features
          </Link>
          <Link
            href="/api/auth/signin"
            className="text-stone-500 hover:text-stone-900 transition-colors"
          >
            Sign in
          </Link>
        </nav>

        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden inline-flex items-center justify-center w-9 h-9 rounded-lg border border-stone-200 bg-white text-stone-700 hover:bg-stone-100 transition-colors"
          aria-label="Toggle menu"
        >
          <Menu className="w-5 h-5" />
        </button>
      </header>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 top-16 z-30 bg-bg-primary border-t border-stone-200">
          <nav className="flex flex-col p-4 space-y-2">
            <Link
              href="/dashboard/analytics"
              className="px-4 py-2 text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Dashboard
            </Link>
            <Link
              href="/#features"
              className="px-4 py-2 text-stone-500 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Features
            </Link>
            <Link
              href="/api/auth/signin"
              className="px-4 py-2 text-stone-500 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Sign in
            </Link>
          </nav>
        </div>
      )}
    </>
  );
}
