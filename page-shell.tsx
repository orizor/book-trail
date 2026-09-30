 "use client";

import type { ReactNode } from "react";

import { useBookApp } from "@/components/book-app-provider";

export function PageShell({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
}) {
  const { errorMessage, loading, syncMode } = useBookApp();

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-md flex-col px-4 pb-32 pt-5">
      <header className="rounded-[2rem] bg-gradient-to-br from-stone-900 to-amber-800 px-5 py-6 text-white shadow-xl">
        <p className="text-xs font-medium uppercase tracking-[0.22em] text-amber-200">
          {eyebrow}
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight">{title}</h1>
        <p className="mt-3 text-sm leading-6 text-stone-200">{description}</p>
      </header>
      {loading ? (
        <div className="mt-4 rounded-2xl bg-white px-4 py-3 text-sm text-stone-600 shadow-sm ring-1 ring-stone-100">
          Connecting to Supabase...
        </div>
      ) : null}
      {errorMessage ? (
        <div className="mt-4 rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700 shadow-sm ring-1 ring-rose-100">
          {errorMessage}
        </div>
      ) : null}
      {!loading && !errorMessage && syncMode === "supabase" ? (
        <div className="mt-4 rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700 shadow-sm ring-1 ring-emerald-100">
          Cloud sync is active.
        </div>
      ) : null}
      <div className="mt-5 flex flex-1 flex-col gap-4">{children}</div>
    </div>
  );
}
