"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, BookOpen, MessageSquareQuote, PlayCircle, Search } from "lucide-react";

import { cn } from "@/lib/utils";

const items = [
  { href: "/", label: "Library", icon: BookOpen },
  { href: "/search", label: "Search", icon: Search },
  { href: "/continue", label: "Continue", icon: PlayCircle },
  { href: "/review", label: "Review", icon: MessageSquareQuote },
  { href: "/analytics", label: "Stats", icon: BarChart3 },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-white/60 bg-[#f8f3ea]/95 px-2 pb-[calc(env(safe-area-inset-bottom)+0.5rem)] pt-2 backdrop-blur-xl">
      <div className="mx-auto grid max-w-md grid-cols-5 gap-1">
        {items.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 rounded-2xl px-2 py-2 text-[11px] font-medium",
                active
                  ? "bg-stone-900 text-white shadow-lg"
                  : "text-stone-500 hover:bg-white",
              )}
            >
              <Icon className="h-4 w-4" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
