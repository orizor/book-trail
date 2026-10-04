"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  BookOpen,
  MessageSquareQuote,
  PlayCircle,
  Search,
} from "lucide-react";

import { useBookApp } from "@/components/book-app-provider";
import { cn } from "@/lib/utils";

const items = [
  { href: "/", label: "Library", icon: BookOpen },
  { href: "/search", label: "Search", icon: Search },
  { href: "/continue", label: "Continue", icon: PlayCircle },
  { href: "/review", label: "Reviews", icon: MessageSquareQuote },
  { href: "/analytics", label: "Stats", icon: BarChart3 },
];

export function MobileNav() {
  const pathname = usePathname();
  const { activeSession, readingBooks } = useBookApp();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 md:hidden border-t border-[#ebd8c0]/40 bg-[#1c1511]/92 px-2 pb-[calc(env(safe-area-inset-bottom)+0.6rem)] pt-2 backdrop-blur-2xl shadow-[0_-8px_25px_rgba(0,0,0,0.3)]">
      <div className="mx-auto grid max-w-md grid-cols-5 gap-1">
        {items.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;
          const hasActiveSession = item.href === "/continue" && activeSession;
          const readingCount = item.href === "/continue" ? readingBooks.length : 0;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "relative flex flex-col items-center justify-center gap-1 rounded-2xl py-1.5 px-1 text-[10px] font-medium transition-all active:scale-95",
                active
                  ? "bg-gradient-to-b from-[#3a2c22] to-[#251b15] text-[#f6ecd5] shadow-[0_2px_10px_rgba(0,0,0,0.3)] ring-1 ring-[#c59b27]/40"
                  : "text-[#a3907f] hover:text-[#f0e4cf]",
              )}
            >
              <div className="relative">
                <Icon
                  className={cn(
                    "h-4 w-4 transition-transform",
                    active ? "scale-110 text-[#deb554]" : "text-[#9e8b7c]",
                  )}
                />
                {hasActiveSession ? (
                  <span className="absolute -top-1 -right-1 flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-500" />
                  </span>
                ) : null}
              </div>
              <span className={cn(active ? "font-semibold text-[#f8f1df]" : "font-normal")}>
                {item.label}
              </span>
              {active ? (
                <div className="h-0.5 w-3 rounded-full bg-[#deb554]" />
              ) : null}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
