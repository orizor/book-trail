"use client";

import type { ReactNode } from "react";
import { AlertCircle, CheckCircle2, Loader2, Sparkles } from "lucide-react";

import { useBookApp } from "@/components/book-app-provider";

export function PageShell({
  eyebrow,
  title,
  description,
  actions,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  const { errorMessage, loading, syncMode } = useBookApp();

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 sm:px-6 lg:px-8 pb-32 pt-3 md:pt-6">
      {/* Editorial Luxury Header */}
      <header className="relative overflow-hidden rounded-[2rem] md:rounded-[2.5rem] border border-[#c59b27]/25 bg-gradient-to-br from-[#1c1612] via-[#261e18] to-[#120e0b] p-6 sm:p-8 md:p-10 text-white shadow-[0_20px_50px_-10px_rgba(26,20,16,0.35)]">
        {/* Subtle Ambient Glow Elements */}
        <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-gradient-to-br from-[#c59b27]/25 to-transparent blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 left-1/3 h-64 w-64 rounded-full bg-gradient-to-tr from-amber-700/15 to-transparent blur-3xl" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-[#c59b27]/40 bg-[#c59b27]/15 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#f5eed0]">
              <Sparkles className="h-3 w-3 text-[#dfc385]" />
              <span>{eyebrow}</span>
            </div>
            <h1 className="mt-3.5 font-serif text-3xl font-bold tracking-tight text-[#fdfcf9] sm:text-4xl md:text-5xl">
              {title}
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-[#d4c3b0] sm:text-base">
              {description}
            </p>
          </div>

          {actions ? (
            <div className="flex shrink-0 items-center gap-3">
              {actions}
            </div>
          ) : null}
        </div>
      </header>

      {/* Cloud & Connection Status */}
      {loading ? (
        <div className="mt-4 flex items-center gap-2.5 rounded-2xl border border-amber-200/60 bg-amber-50/80 px-4 py-3 text-xs md:text-sm font-medium text-amber-900 shadow-sm backdrop-blur">
          <Loader2 className="h-4 w-4 animate-spin text-amber-700" />
          <span>Connecting to Supabase cloud sync...</span>
        </div>
      ) : null}

      {errorMessage ? (
        <div className="mt-4 flex items-center gap-2.5 rounded-2xl border border-rose-200/80 bg-rose-50/90 px-4 py-3 text-xs md:text-sm font-medium text-rose-800 shadow-sm backdrop-blur">
          <AlertCircle className="h-4 w-4 text-rose-600" />
          <span>{errorMessage}</span>
        </div>
      ) : null}

      {!loading && !errorMessage && syncMode === "supabase" ? (
        <div className="mt-4 flex items-center gap-2 rounded-2xl border border-emerald-200/80 bg-emerald-50/90 px-4 py-2.5 text-xs font-medium text-emerald-800 shadow-sm backdrop-blur">
          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
          <span>Cloud sync is active across your devices.</span>
        </div>
      ) : null}

      {/* Main Content Area */}
      <div className="mt-6 md:mt-8 flex flex-1 flex-col gap-6">{children}</div>
    </div>
  );
}
