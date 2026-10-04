"use client";

import Link from "next/link";
import {
  ArrowRight,
  BookCheck,
  BookOpenText,
  Clock3,
  Compass,
  FileText,
  PlayCircle,
  Radio,
  Sparkles,
} from "lucide-react";

import { BookCover } from "@/components/book-cover";
import { useBookApp } from "@/components/book-app-provider";
import { PageShell } from "@/components/page-shell";
import { buildFolderPath, cn, formatHours } from "@/lib/utils";

export default function ContinuePage() {
  const { activeBook, activeSession, readingBooks, folders } = useBookApp();

  return (
    <PageShell
      eyebrow="Active Trajectory"
      title="Continue Reading"
      description="Your volumes currently in hand. Pick up exactly where your thoughts left off, whether via physical page or digital manuscript."
    >
      {/* Live Timer Hero Spotlight */}
      {activeBook && activeSession ? (
        <section className="relative overflow-hidden rounded-[2.5rem] border border-[#c59b27]/40 bg-gradient-to-br from-[#241a13] via-[#1a130f] to-[#110c09] p-6 sm:p-8 md:p-10 text-white shadow-[0_20px_50px_rgba(20,15,10,0.4)]">
          {/* Ambient Lighting Orbs */}
          <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-[#c59b27]/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-16 left-1/4 h-56 w-56 rounded-full bg-amber-600/15 blur-3xl" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="flex flex-col sm:flex-row sm:items-center gap-6">
              <BookCover
                title={activeBook.title}
                coverUrl={activeBook.coverUrl}
                author={activeBook.author}
                size="lg"
                priority
              />

              <div className="max-w-xl">
                <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-500/20 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-[#fde4a0]">
                  <Radio className="h-3.5 w-3.5 animate-pulse text-amber-400" />
                  <span>Reading Session Underway</span>
                </div>

                <h2 className="mt-3 font-serif text-2xl sm:text-3xl font-bold leading-tight text-[#fdfaf5]">
                  {activeBook.title}
                </h2>
                <p className="mt-1 text-sm font-medium text-[#cbb8a6]">
                  {activeBook.author}
                </p>

                <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-[#d1c0b0]">
                  <span className="rounded-md bg-white/10 px-2.5 py-1">
                    Format: {activeSession.format === "pdf" ? "Digital PDF" : "Physical Copy"}
                  </span>
                  <span>•</span>
                  <span>Shelf: {buildFolderPath(activeBook.folderId, folders)}</span>
                  <span>•</span>
                  <span>Total logged: {formatHours(activeBook.totalSeconds)}</span>
                </div>
              </div>
            </div>

            <div className="flex shrink-0 flex-col gap-3">
              <Link
                href="/read"
                className="flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#c59b27] via-[#deb554] to-[#c59b27] px-6 py-4 text-xs font-bold uppercase tracking-wider text-[#1c140d] shadow-[0_4px_20px_rgba(222,181,84,0.4)] transition hover:brightness-110 active:scale-95"
              >
                <PlayCircle className="h-4 w-4" />
                <span>Open Reading Chronometer</span>
              </Link>
            </div>
          </div>
        </section>
      ) : (
        /* Calm Standby State */
        <section className="relative overflow-hidden rounded-[2rem] border border-[#e8dac6] bg-gradient-to-r from-white via-[#fdfcf9] to-[#fbf7ee] p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-100/70 text-amber-900">
                <Clock3 className="h-5 w-5" />
              </div>
              <div>
                <h2 className="font-serif text-base font-bold text-[#1c1815]">
                  No Live Chronometer Active
                </h2>
                <p className="text-xs text-[#8c7766]">
                  Select one of your in-hand volumes below to initiate a focused reading session.
                </p>
              </div>
            </div>

            {readingBooks.length > 0 ? (
              <Link
                href={`/read?book=${readingBooks[0].id}`}
                className="flex items-center justify-center gap-2 rounded-full bg-[#1f1712] px-5 py-2.5 text-xs font-semibold text-[#f8eedc] shadow-sm hover:bg-[#120d0a] active:scale-95"
              >
                <PlayCircle className="h-3.5 w-3.5 text-[#deb554]" />
                <span>Quick Start First Book</span>
              </Link>
            ) : null}
          </div>
        </section>
      )}

      {/* Reading Shelf Grid */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-[#c59b27]" />
            <h2 className="font-serif text-xl font-bold text-[#1c1815]">
              Volumes In Hand ({readingBooks.length})
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {readingBooks.map((book) => (
            <article
              key={book.id}
              className="group flex flex-col justify-between overflow-hidden rounded-[2rem] border border-[#e8dac6] bg-gradient-to-b from-white via-[#fdfcf9] to-[#faf6ef] p-6 shadow-[0_4px_24px_rgba(40,25,10,0.04)] transition-all duration-300 hover:-translate-y-1 hover:border-[#c59b27]/60 hover:shadow-lg"
            >
              <div>
                <div className="flex gap-4">
                  <BookCover
                    title={book.title}
                    coverUrl={book.coverUrl}
                    author={book.author}
                    size="md"
                  />
                  <div className="min-w-0 flex-1">
                    <span className="rounded-full border border-amber-300/60 bg-amber-100/70 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-900">
                      In Hand
                    </span>
                    <h3 className="mt-2 line-clamp-2 font-serif text-base font-bold text-[#1c1815] transition group-hover:text-[#966b1a]">
                      {book.title}
                    </h3>
                    <p className="mt-0.5 line-clamp-1 text-xs font-medium text-[#7d6857]">
                      {book.author}
                    </p>
                    <p className="mt-2 text-xs text-[#8c7766]">
                      Shelf: {buildFolderPath(book.folderId, folders)}
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between rounded-xl bg-[#f5ece0]/60 px-3.5 py-2 text-xs text-[#6e5847]">
                  <span>Total Time Logged:</span>
                  <span className="font-bold text-[#1c1815]">
                    {formatHours(book.totalSeconds)}
                  </span>
                </div>
              </div>

              <div className="mt-5 flex gap-2 border-t border-[#ede2d2] pt-4">
                <Link
                  href={`/read?book=${book.id}`}
                  className="flex flex-1 items-center justify-center gap-2 rounded-full bg-[#1f1712] px-4 py-2.5 text-xs font-semibold text-[#f8eedc] shadow-sm transition hover:bg-[#120d0a] active:scale-95"
                >
                  <ArrowRight className="h-3.5 w-3.5 text-[#deb554]" />
                  <span>Resume Reading</span>
                </Link>

                <Link
                  href={`/review?book=${book.id}`}
                  className="flex items-center justify-center rounded-full border border-[#e4d6c4] bg-white p-2.5 text-stone-700 hover:bg-[#f5ece0]"
                  title="Finish and Review"
                >
                  <BookCheck className="h-4 w-4" />
                </Link>
              </div>
            </article>
          ))}
        </div>

        {/* Empty In-Progress Shelf */}
        {!readingBooks.length ? (
          <section className="flex flex-col items-center justify-center rounded-[2.5rem] border border-dashed border-[#e4d6c4] bg-[#fdfbf7] p-12 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100/70 text-amber-900">
              <BookOpenText className="h-7 w-7" />
            </div>
            <h3 className="mt-4 font-serif text-lg font-bold text-[#1c1815]">
              No Volumes Marked In Hand
            </h3>
            <p className="mt-1.5 max-w-sm text-xs leading-relaxed text-[#8c7766]">
              Browse your library or add new works to start reading. Once you launch a session or mark a book as reading, it will appear here.
            </p>
            <div className="mt-5 flex gap-3">
              <Link
                href="/"
                className="inline-flex items-center gap-2 rounded-full bg-[#1f1712] px-5 py-2.5 text-xs font-semibold text-[#f8eedc] shadow-sm hover:bg-[#120d0a]"
              >
                <span>Browse Library</span>
              </Link>
              <Link
                href="/search"
                className="inline-flex items-center gap-2 rounded-full border border-[#e4d6c4] bg-white px-5 py-2.5 text-xs font-semibold text-[#6d5747] hover:bg-[#f5ece0]"
              >
                <span>Discover New Books</span>
              </Link>
            </div>
          </section>
        ) : null}
      </section>
    </PageShell>
  );
}
