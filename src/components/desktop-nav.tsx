"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  BookOpen,
  Compass,
  MessageSquareQuote,
  PlayCircle,
  Plus,
  Radio,
  Search,
  Sparkles,
} from "lucide-react";

import { useBookApp } from "@/components/book-app-provider";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Library", icon: BookOpen, tag: "Catalog" },
  { href: "/search", label: "Search Books", icon: Search, tag: "Discover" },
  { href: "/continue", label: "Continue", icon: PlayCircle, tag: "In Progress" },
  { href: "/review", label: "Reviews", icon: MessageSquareQuote, tag: "Reflections" },
  { href: "/analytics", label: "Reading Stats", icon: BarChart3, tag: "Insights" },
];

export function DesktopNav() {
  const pathname = usePathname();
  const { activeSession, activeBook, readingBooks, syncMode } = useBookApp();

  return (
    <header className="sticky top-0 z-40 hidden border-b border-[#ebdcc8]/80 bg-[#fbf8f3]/85 backdrop-blur-xl md:block">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-8">
        {/* Brand Monogram & Crest */}
        <Link href="/" className="group flex items-center gap-3.5">
          <div className="relative flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-[#2a1f18] via-[#1a1410] to-[#120e0b] text-[#dfc385] shadow-[0_4px_16px_rgba(26,20,16,0.24)] ring-1 ring-[#c59b27]/30 transition group-hover:scale-105 group-hover:ring-[#c59b27]/60">
            <Compass className="h-5 w-5 text-[#dfc385] transition-transform duration-500 group-hover:rotate-45" />
            <span className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#c59b27] text-[8px] font-bold text-white shadow-sm">
              ✦
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-serif text-2xl font-bold tracking-tight text-[#1e1713]">
                BookTrail
              </span>
              <span className="rounded-full border border-[#d6a848]/30 bg-[#f7eedc] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[#966b1a]">
                Atelier
              </span>
            </div>
            <p className="text-[11px] font-medium tracking-wide text-[#786454]">
              Personal Library & Reading Chronometer
            </p>
          </div>
        </Link>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-1 rounded-full border border-[#e8dac6] bg-[#f5ecde]/70 p-1.5 shadow-[inset_0_1px_2px_rgba(0,0,0,0.03)]">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            const hasActiveSession = item.href === "/continue" && activeSession;
            const readingCount = item.href === "/continue" ? readingBooks.length : 0;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "relative flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold tracking-wide transition-all",
                  active
                    ? "bg-gradient-to-b from-[#2a1f18] to-[#16110e] text-[#f8edd7] shadow-[0_4px_14px_rgba(26,20,16,0.22)] ring-1 ring-white/10"
                    : "text-[#675446] hover:bg-white/80 hover:text-[#1e1713]",
                )}
              >
                <Icon className={cn("h-4 w-4", active ? "text-[#e2c78a]" : "text-[#8d7563]")} />
                <span>{item.label}</span>
                {hasActiveSession ? (
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-500" />
                  </span>
                ) : readingCount > 0 ? (
                  <span
                    className={cn(
                      "rounded-full px-1.5 py-0.2 text-[10px] font-bold",
                      active ? "bg-[#c59b27]/30 text-[#f6d78d]" : "bg-[#ded0bf] text-[#4d3d32]",
                    )}
                  >
                    {readingCount}
                  </span>
                ) : null}
              </Link>
            );
          })}
        </nav>

        {/* Right Status & Quick Action */}
        <div className="flex items-center gap-3">
          {activeSession && activeBook ? (
            <Link
              href="/read"
              className="group flex items-center gap-2.5 rounded-full border border-amber-600/30 bg-gradient-to-r from-amber-500/10 via-amber-600/15 to-amber-700/10 px-3.5 py-2 text-xs font-medium text-amber-950 transition hover:border-amber-600/50 hover:shadow-md"
            >
              <Radio className="h-3.5 w-3.5 animate-pulse text-amber-600" />
              <span className="font-semibold text-amber-900">Timer Live:</span>
              <span className="max-w-[130px] truncate font-serif italic text-stone-800">
                {activeBook.title}
              </span>
            </Link>
          ) : (
            <div className="flex items-center gap-2 rounded-full border border-[#e4d4bf] bg-white/60 px-3 py-1.5 text-[11px] font-medium text-[#725e4e]">
              <span
                className={cn(
                  "h-2 w-2 rounded-full",
                  syncMode === "supabase" ? "bg-emerald-500" : "bg-amber-500",
                )}
              />
              <span>{syncMode === "supabase" ? "Cloud Synced" : "Local Archive"}</span>
            </div>
          )}

          <Link
            href="/search"
            className="flex items-center gap-1.5 rounded-full bg-gradient-to-r from-[#b58825] via-[#c79930] to-[#ad801e] px-4 py-2 text-xs font-semibold text-white shadow-[0_4px_14px_rgba(181,136,37,0.35)] transition hover:brightness-110 active:scale-95"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add Book</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
