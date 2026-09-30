"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import { BookOpen, PauseCircle, PlayCircle, Upload } from "lucide-react";
import { Suspense, useEffect, useMemo, useState } from "react";

import { BookCover } from "@/components/book-cover";
import { useBookApp } from "@/components/book-app-provider";
import { PageShell } from "@/components/page-shell";
import { cn, formatClockDuration, getBookById } from "@/lib/utils";

function ReadingClock({ elapsedSeconds }: { elapsedSeconds: number }) {
  const secondRotation = (elapsedSeconds % 60) * 6;
  const minuteRotation = ((elapsedSeconds / 60) % 60) * 6;
  const progressRotation = ((elapsedSeconds % 3600) / 3600) * 360;
  const [hours, minutes, seconds] = formatClockDuration(elapsedSeconds).split(":");

  return (
    <div className="relative mx-auto flex h-72 w-72 items-center justify-center rounded-full bg-[#1b1511] p-4 shadow-[0_30px_80px_rgba(28,25,23,0.28)]">
      <div
        className="absolute inset-3 rounded-full"
        style={{
          background: `conic-gradient(#f59e0b ${progressRotation}deg, rgba(255,255,255,0.08) ${progressRotation}deg)`,
        }}
      />
      <div className="absolute inset-8 rounded-full bg-[#2d211b]" />
      <div className="absolute inset-12 rounded-full bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.16),_rgba(255,255,255,0.03)_34%,_transparent_70%)]" />

      <div className="absolute inset-0">
        {[...Array(12)].map((_, index) => (
          <span
            key={index}
            className="absolute left-1/2 top-3 h-4 w-0.5 -translate-x-1/2 rounded-full bg-white/30"
            style={{ transform: `translateX(-50%) rotate(${index * 30}deg)` }}
          />
        ))}
      </div>

      <div className="absolute inset-0">
        <span
          className="absolute left-1/2 top-1/2 h-20 w-1 -translate-x-1/2 -translate-y-full origin-bottom rounded-full bg-amber-300 shadow-[0_0_12px_rgba(252,211,77,0.8)]"
          style={{ transform: `translateX(-50%) rotate(${minuteRotation}deg)` }}
        />
        <span
          className="absolute left-1/2 top-1/2 h-24 w-0.5 -translate-x-1/2 -translate-y-full origin-bottom rounded-full bg-white"
          style={{ transform: `translateX(-50%) rotate(${secondRotation}deg)` }}
        />
        <span className="absolute left-1/2 top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white shadow-lg" />
      </div>

      <div className="relative z-10 text-center text-white">
        <p className="text-xs uppercase tracking-[0.22em] text-amber-200">Reading now</p>
        <div className="mt-4 flex items-end justify-center gap-3">
          <div>
            <p className="text-4xl font-semibold">{hours}</p>
            <p className="mt-1 text-[10px] uppercase tracking-[0.2em] text-stone-300">
              hours
            </p>
          </div>
          <span className="pb-5 text-2xl text-stone-300">:</span>
          <div>
            <p className="text-4xl font-semibold">{minutes}</p>
            <p className="mt-1 text-[10px] uppercase tracking-[0.2em] text-stone-300">
              mins
            </p>
          </div>
          <span className="pb-5 text-2xl text-stone-300">:</span>
          <div>
            <p className="text-4xl font-semibold">{seconds}</p>
            <p className="mt-1 text-[10px] uppercase tracking-[0.2em] text-stone-300">
              secs
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function ReadPageInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const {
    books,
    activeBook,
    activeSession,
    startReading,
    stopReading,
    finishBook,
    attachPdf,
    setBookPhysical,
    bookHasReadableFormat,
  } = useBookApp();
  const [tick, setTick] = useState(0);

  const requestedBookId = searchParams.get("book");
  const selectedBook = useMemo(() => {
    return getBookById(books, requestedBookId) ?? activeBook ?? books[0] ?? null;
  }, [activeBook, books, requestedBookId]);

  useEffect(() => {
    if (!activeSession) {
      return;
    }

    const interval = window.setInterval(() => setTick(Date.now()), 1000);
    return () => window.clearInterval(interval);
  }, [activeSession]);

  const elapsedSeconds = activeSession
    ? Math.max(
        0,
        Math.floor((tick - new Date(activeSession.startedAt).getTime()) / 1000),
      )
    : 0;
  const selectedIsActive = activeSession && selectedBook?.id === activeSession.bookId;

  return (
    <PageShell
      eyebrow="Focus"
      title="Reading Timer"
      description="Start a focused reading session on its own page. The clock stays front and center so the experience feels calm and intentional on mobile."
    >
      {selectedBook ? (
        <section className="rounded-[1.75rem] bg-white p-5 shadow-sm ring-1 ring-stone-100">
          <div className="flex gap-4">
            <BookCover
              title={selectedBook.title}
              coverUrl={selectedBook.coverUrl}
              priority={Boolean(selectedIsActive)}
            />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-stone-400">
                Selected book
              </p>
              <h2 className="mt-2 text-xl font-semibold text-stone-900">
                {selectedBook.title}
              </h2>
              <p className="mt-1 text-sm text-stone-500">{selectedBook.author}</p>
            </div>
          </div>

          {activeSession && !selectedIsActive ? (
            <div className="mt-4 rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-800">
              A timer is already running for another book. Stop that session before
              starting a new one.
            </div>
          ) : null}

          {selectedIsActive ? (
            <div className="mt-6 space-y-5">
              <ReadingClock elapsedSeconds={elapsedSeconds} />
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={stopReading}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-stone-900 px-4 py-3 text-sm font-semibold text-white"
                >
                  <PauseCircle className="h-4 w-4" />
                  Stop timer
                </button>
                <button
                  type="button"
                  onClick={() => {
                    finishBook(selectedBook.id);
                    router.push(`/review?book=${selectedBook.id}`);
                  }}
                  className="rounded-full bg-amber-700 px-4 py-3 text-sm font-semibold text-white"
                >
                  Finish book
                </button>
              </div>
            </div>
          ) : (
            <div className="mt-6 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setBookPhysical(selectedBook.id, !selectedBook.hasPhysical)}
                  className={cn(
                    "rounded-2xl px-4 py-3 text-sm font-medium",
                    selectedBook.hasPhysical
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-[#f8f3ea] text-stone-700",
                  )}
                >
                  {selectedBook.hasPhysical ? "Physical copy ready" : "Use physical copy"}
                </button>
                <label className="flex cursor-pointer items-center justify-center gap-2 rounded-2xl bg-[#f8f3ea] px-4 py-3 text-sm font-medium text-stone-700">
                  <Upload className="h-4 w-4" />
                  <span>{selectedBook.pdfLabel ? "Replace PDF" : "Add PDF"}</span>
                  <input
                    type="file"
                    accept="application/pdf"
                    onChange={(event) => {
                      const file = event.target.files?.[0];

                      if (file) {
                        void attachPdf(selectedBook.id, file);
                      }
                    }}
                    className="hidden"
                  />
                </label>
              </div>

              {bookHasReadableFormat(selectedBook) ? (
                <div className="grid grid-cols-2 gap-3">
                  {selectedBook.hasPhysical ? (
                    <button
                      type="button"
                      disabled={Boolean(activeSession && !selectedIsActive)}
                      onClick={() => void startReading(selectedBook.id, "physical")}
                      className="inline-flex items-center justify-center gap-2 rounded-full bg-stone-900 px-4 py-3 text-sm font-semibold text-white disabled:opacity-40"
                    >
                      <BookOpen className="h-4 w-4" />
                      Start physical
                    </button>
                  ) : null}
                  {selectedBook.pdfLabel || selectedBook.pdfUrl ? (
                    <button
                      type="button"
                      disabled={Boolean(activeSession && !selectedIsActive)}
                      onClick={() => void startReading(selectedBook.id, "pdf")}
                      className="inline-flex items-center justify-center gap-2 rounded-full bg-amber-700 px-4 py-3 text-sm font-semibold text-white disabled:opacity-40"
                    >
                      <PlayCircle className="h-4 w-4" />
                      Start PDF
                    </button>
                  ) : null}
                </div>
              ) : (
                <div className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">
                  Choose a reading format first. Add a PDF or mark that you have the
                  physical book, then the start buttons will appear.
                </div>
              )}
            </div>
          )}
        </section>
      ) : (
        <section className="rounded-[1.75rem] bg-white p-5 text-sm text-stone-500 shadow-sm ring-1 ring-stone-100">
          Add a book first, then come here to start your timer.
        </section>
      )}

      <section className="rounded-[1.75rem] bg-white p-4 shadow-sm ring-1 ring-stone-100">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-stone-900">Choose another book</h2>
          <Link href="/" className="text-sm font-medium text-amber-800">
            Back to library
          </Link>
        </div>
        <div className="mt-4 space-y-3">
          {books
            .filter((book) => book.status !== "finished")
            .map((book) => (
              <Link
                key={book.id}
                href={`/read?book=${book.id}`}
                className={cn(
                  "flex items-center gap-3 rounded-2xl px-3 py-3",
                  selectedBook?.id === book.id ? "bg-stone-900 text-white" : "bg-[#f8f3ea]",
                )}
              >
                <BookCover title={book.title} coverUrl={book.coverUrl} />
                <div className="min-w-0">
                  <p className="text-sm font-semibold">{book.title}</p>
                  <p
                    className={cn(
                      "mt-1 text-xs",
                      selectedBook?.id === book.id ? "text-stone-300" : "text-stone-500",
                    )}
                  >
                    {book.author}
                  </p>
                </div>
              </Link>
            ))}
        </div>
      </section>
    </PageShell>
  );
}

export default function ReadPage() {
  return (
    <Suspense
      fallback={
        <PageShell
          eyebrow="Focus"
          title="Reading Timer"
          description="Loading your reading session..."
        >
          <section className="rounded-[1.75rem] bg-white p-5 text-sm text-stone-500 shadow-sm ring-1 ring-stone-100">
            Loading your reading setup...
          </section>
        </PageShell>
      }
    >
      <ReadPageInner />
    </Suspense>
  );
}
