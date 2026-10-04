"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  BookCheck,
  BookOpen,
  Check,
  ChevronRight,
  Clock,
  FileText,
  PauseCircle,
  PlayCircle,
  Sparkles,
  StopCircle,
  Upload,
} from "lucide-react";
import { Suspense, useEffect, useMemo, useState } from "react";

import { BookCover } from "@/components/book-cover";
import { useBookApp } from "@/components/book-app-provider";
import { PageShell } from "@/components/page-shell";
import { cn, formatClockDuration, formatHours, getBookById } from "@/lib/utils";

function HauteHorlogerieChronometer({ elapsedSeconds }: { elapsedSeconds: number }) {
  const secondRotation = (elapsedSeconds % 60) * 6;
  const minuteRotation = ((elapsedSeconds / 60) % 60) * 6;
  const hourRotation = ((elapsedSeconds / 3600) % 12) * 30;
  const progressRotation = ((elapsedSeconds % 3600) / 3600) * 360;

  const [hours, minutes, seconds] = formatClockDuration(elapsedSeconds).split(":");

  return (
    <div className="relative mx-auto flex h-80 w-80 sm:h-96 sm:w-96 items-center justify-center rounded-full bg-gradient-to-br from-[#1c1511] via-[#15100d] to-[#0d0907] p-5 shadow-[0_30px_90px_rgba(20,15,10,0.5),inset_0_2px_4px_rgba(255,255,255,0.15)] ring-1 ring-[#c59b27]/40">
      {/* Outer Golden Bezel Track */}
      <div
        className="absolute inset-2.5 rounded-full transition-all duration-1000"
        style={{
          background: `conic-gradient(#dfc385 ${progressRotation}deg, rgba(223, 195, 133, 0.08) ${progressRotation}deg)`,
        }}
      />

      {/* Sunburst Metallic Inner Dial */}
      <div className="absolute inset-5 rounded-full bg-gradient-to-br from-[#251c16] via-[#1a1410] to-[#120e0b] shadow-[inset_0_10px_30px_rgba(0,0,0,0.6)]" />
      <div className="absolute inset-8 rounded-full bg-[radial-gradient(circle_at_35%_25%,_rgba(223,195,133,0.15),_transparent_65%)]" />

      {/* Horological Hour Marks & Numerals */}
      <div className="absolute inset-0">
        {[...Array(60)].map((_, i) => {
          const isHour = i % 5 === 0;
          return (
            <span
              key={i}
              className={cn(
                "absolute left-1/2 top-4 -translate-x-1/2 rounded-full",
                isHour ? "h-3.5 w-1 bg-[#dfc385] shadow-[0_0_6px_rgba(223,195,133,0.4)]" : "h-1.5 w-0.5 bg-white/20",
              )}
              style={{ transform: `translateX(-50%) rotate(${i * 6}deg)`, transformOrigin: "50% 160px" }}
            />
          );
        })}
      </div>

      {/* Roman Numerals at Cardinal Points */}
      <div className="absolute inset-0 pointer-events-none">
        <span className="absolute left-1/2 top-7 -translate-x-1/2 font-serif text-[11px] font-bold tracking-widest text-[#dfc385]">
          XII
        </span>
        <span className="absolute right-7 top-1/2 -translate-y-1/2 font-serif text-[11px] font-bold tracking-widest text-[#dfc385]">
          III
        </span>
        <span className="absolute left-1/2 bottom-7 -translate-x-1/2 font-serif text-[11px] font-bold tracking-widest text-[#dfc385]">
          VI
        </span>
        <span className="absolute left-7 top-1/2 -translate-y-1/2 font-serif text-[11px] font-bold tracking-widest text-[#dfc385]">
          IX
        </span>
      </div>

      {/* Dial Hands */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Hour Hand */}
        <span
          className="absolute left-1/2 top-1/2 h-16 w-1.5 -translate-x-1/2 -translate-y-full origin-bottom rounded-full bg-[#c59b27] shadow-[0_0_8px_rgba(197,155,39,0.5)]"
          style={{ transform: `translateX(-50%) rotate(${hourRotation}deg)` }}
        />
        {/* Minute Hand */}
        <span
          className="absolute left-1/2 top-1/2 h-24 w-1 -translate-x-1/2 -translate-y-full origin-bottom rounded-full bg-gradient-to-t from-[#f6ecd5] to-white shadow-[0_0_10px_rgba(255,255,255,0.7)]"
          style={{ transform: `translateX(-50%) rotate(${minuteRotation}deg)` }}
        />
        {/* Second Hand */}
        <span
          className="absolute left-1/2 top-1/2 h-28 w-0.5 -translate-x-1/2 -translate-y-full origin-bottom rounded-full bg-[#deb554] shadow-[0_0_12px_rgba(222,181,84,0.9)]"
          style={{ transform: `translateX(-50%) rotate(${secondRotation}deg)` }}
        />
        {/* Center Cap */}
        <span className="absolute left-1/2 top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br from-[#dfc385] to-[#9c7a2b] shadow-lg ring-2 ring-[#120e0b]" />
      </div>

      {/* Center Digital Readout */}
      <div className="relative z-10 text-center text-white pointer-events-none">
        <span className="rounded-full border border-[#c59b27]/30 bg-[#c59b27]/15 px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.25em] text-[#dfc385]">
          Active Session
        </span>
        <div className="mt-2.5 flex items-baseline justify-center gap-1.5 sm:gap-2">
          <div>
            <p className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-[#fdfcf9]">
              {hours}
            </p>
            <p className="text-[9px] uppercase tracking-wider text-[#a89584]">HRS</p>
          </div>
          <span className="text-xl text-[#dfc385]/70 pb-3">:</span>
          <div>
            <p className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-[#fdfcf9]">
              {minutes}
            </p>
            <p className="text-[9px] uppercase tracking-wider text-[#a89584]">MIN</p>
          </div>
          <span className="text-xl text-[#dfc385]/70 pb-3">:</span>
          <div>
            <p className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-[#fdfcf9]">
              {seconds}
            </p>
            <p className="text-[9px] uppercase tracking-wider text-[#a89584]">SEC</p>
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
  const [tick, setTick] = useState(Date.now());

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
      eyebrow="Horological Focus"
      title="Reading Chronometer"
      description="Immerse in deep, undistracted reading. Time is recorded with precision so your cumulative intellect and hours reflect truthfully."
    >
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:items-start">
        {/* Left Column: Chronometer Dial & Controls (Desktop: 7 columns) */}
        <section className="space-y-6 lg:col-span-7">
          <div className="relative overflow-hidden rounded-[2.5rem] border border-[#e8dac6] bg-gradient-to-b from-white via-[#fcfaf7] to-[#faf6ef] p-6 sm:p-8 md:p-10 shadow-[0_4px_30px_rgba(40,25,10,0.05)] text-center">
            {/* Ambient subtle glow */}
            <div className="pointer-events-none absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-amber-500/10 blur-3xl" />

            {selectedIsActive ? (
              <div>
                <HauteHorlogerieChronometer elapsedSeconds={elapsedSeconds} />

                {/* Live Controls */}
                <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={stopReading}
                    className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-full bg-[#1c1511] px-7 py-3.5 text-xs font-bold uppercase tracking-wider text-[#f8eedc] shadow-lg transition hover:bg-[#100b08] active:scale-95"
                  >
                    <PauseCircle className="h-4 w-4 text-[#deb554]" />
                    <span>Pause & Save Log</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (selectedBook) {
                        void finishBook(selectedBook.id);
                        router.push(`/review?book=${selectedBook.id}`);
                      }
                    }}
                    className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#b58825] to-[#c79930] px-7 py-3.5 text-xs font-bold uppercase tracking-wider text-white shadow-lg transition hover:brightness-110 active:scale-95"
                  >
                    <BookCheck className="h-4 w-4" />
                    <span>Finish Volume</span>
                  </button>
                </div>
              </div>
            ) : (
              <div>
                {/* Standby Dial Preview */}
                <HauteHorlogerieChronometer elapsedSeconds={0} />

                {/* Start Session Buttons */}
                <div className="mt-8 space-y-4">
                  {selectedBook ? (
                    bookHasReadableFormat(selectedBook) ? (
                      <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                        {selectedBook.hasPhysical ? (
                          <button
                            type="button"
                            disabled={Boolean(activeSession && !selectedIsActive)}
                            onClick={() => void startReading(selectedBook.id, "physical")}
                            className="flex w-full sm:w-auto items-center justify-center gap-2.5 rounded-full bg-[#1c1511] px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-[#f8eedc] shadow-md transition hover:bg-[#0e0a08] active:scale-95 disabled:opacity-40"
                          >
                            <BookOpen className="h-4 w-4 text-[#deb554]" />
                            <span>Start Physical Session</span>
                          </button>
                        ) : null}

                        {selectedBook.pdfLabel || selectedBook.pdfUrl ? (
                          <button
                            type="button"
                            disabled={Boolean(activeSession && !selectedIsActive)}
                            onClick={() => void startReading(selectedBook.id, "pdf")}
                            className="flex w-full sm:w-auto items-center justify-center gap-2.5 rounded-full bg-gradient-to-r from-[#b58825] to-[#c79930] px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-white shadow-md transition hover:brightness-110 active:scale-95 disabled:opacity-40"
                          >
                            <PlayCircle className="h-4 w-4" />
                            <span>Start Digital PDF Session</span>
                          </button>
                        ) : null}
                      </div>
                    ) : (
                      <div className="mx-auto max-w-md rounded-2xl border border-amber-200 bg-amber-50/80 p-4 text-xs font-medium text-amber-900">
                        Please indicate that you have a physical copy or attach a PDF manuscript on the right panel before initiating the timer.
                      </div>
                    )
                  ) : null}

                  {activeSession && !selectedIsActive ? (
                    <div className="mx-auto max-w-md rounded-2xl border border-rose-200 bg-rose-50/90 p-4 text-xs text-rose-800">
                      A reading session is currently active for another book. Please pause that session before starting this volume.
                    </div>
                  ) : null}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Right Column: Selected Book Slipcase & Quick Switcher (Desktop: 5 columns) */}
        <section className="space-y-6 lg:col-span-5">
          {selectedBook ? (
            <div className="rounded-[2.5rem] border border-[#e8dac6] bg-white p-6 sm:p-7 shadow-[0_4px_24px_rgba(40,25,10,0.04)]">
              <div className="flex gap-5">
                <BookCover
                  title={selectedBook.title}
                  coverUrl={selectedBook.coverUrl}
                  author={selectedBook.author}
                  size="lg"
                  priority={Boolean(selectedIsActive)}
                />
                <div className="min-w-0 flex-1">
                  <span className="rounded-full border border-[#c59b27]/40 bg-[#c59b27]/15 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#9c7a2b]">
                    {selectedIsActive ? "Currently Reading" : "Selected Volume"}
                  </span>
                  <h2 className="mt-2 font-serif text-xl font-bold leading-tight text-[#1c1815]">
                    {selectedBook.title}
                  </h2>
                  <p className="mt-1 text-xs font-medium text-[#7d6857]">
                    {selectedBook.author}
                  </p>
                  <p className="mt-3 text-xs text-[#8c7766]">
                    Total Time Logged:{" "}
                    <span className="font-bold text-[#1c1815]">
                      {formatHours(selectedBook.totalSeconds)}
                    </span>
                  </p>
                </div>
              </div>

              {/* Format Configuration Workbench */}
              <div className="mt-6 space-y-3 border-t border-[#ede2d2] pt-5">
                <p className="text-[11px] font-bold uppercase tracking-wider text-[#8b7563]">
                  Reading Modality Configuration
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => void setBookPhysical(selectedBook.id, !selectedBook.hasPhysical)}
                    className={cn(
                      "flex items-center justify-between rounded-xl border p-3 text-xs font-semibold transition",
                      selectedBook.hasPhysical
                        ? "border-emerald-300 bg-emerald-50 text-emerald-900"
                        : "border-[#e4d6c4] bg-[#fbf8f3] text-[#6d5747] hover:bg-white",
                    )}
                  >
                    <span>Physical Copy</span>
                    {selectedBook.hasPhysical ? (
                      <Check className="h-4 w-4 text-emerald-700" />
                    ) : (
                      <span className="text-[10px] text-[#9e8b7c]">Mark ready</span>
                    )}
                  </button>

                  <label className="flex cursor-pointer items-center justify-between rounded-xl border border-[#e4d6c4] bg-[#fbf8f3] p-3 text-xs font-semibold text-[#6d5747] transition hover:bg-white">
                    <div className="flex items-center gap-1.5 truncate">
                      <Upload className="h-3.5 w-3.5 shrink-0 text-[#c59b27]" />
                      <span className="truncate">
                        {selectedBook.pdfLabel ? selectedBook.pdfLabel : "Add PDF"}
                      </span>
                    </div>
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
              </div>

              {/* Synopsis preview if available */}
              {selectedBook.synopsis ? (
                <div className="mt-5 rounded-2xl bg-[#f8f3ea]/70 p-3.5 text-xs leading-relaxed text-[#675446]">
                  <p className="line-clamp-3">{selectedBook.synopsis}</p>
                </div>
              ) : null}
            </div>
          ) : null}

          {/* Quick Book Switcher Shelf */}
          <div className="rounded-[2.5rem] border border-[#e8dac6] bg-white p-6 shadow-[0_4px_24px_rgba(40,25,10,0.04)]">
            <div className="flex items-center justify-between">
              <h3 className="font-serif text-base font-bold text-[#1c1815]">
                Switch Volume
              </h3>
              <Link href="/" className="text-xs font-semibold text-[#966b1a] hover:underline">
                View all in library
              </Link>
            </div>

            <div className="mt-4 space-y-2 max-h-72 overflow-y-auto pr-1">
              {books
                .filter((b) => b.status !== "finished")
                .map((book) => {
                  const isSelected = selectedBook?.id === book.id;

                  return (
                    <Link
                      key={book.id}
                      href={`/read?book=${book.id}`}
                      className={cn(
                        "flex items-center justify-between rounded-xl p-2.5 transition",
                        isSelected
                          ? "bg-[#1f1712] text-white shadow-sm"
                          : "bg-[#fbf8f3] text-[#1c1815] hover:bg-[#f5ece0]",
                      )}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <BookCover
                          title={book.title}
                          coverUrl={book.coverUrl}
                          author={book.author}
                          size="sm"
                        />
                        <div className="min-w-0">
                          <p className="truncate text-xs font-bold">{book.title}</p>
                          <p
                            className={cn(
                              "truncate text-[11px]",
                              isSelected ? "text-[#cbb8a6]" : "text-[#7d6857]",
                            )}
                          >
                            {book.author}
                          </p>
                        </div>
                      </div>

                      <ChevronRight
                        className={cn(
                          "h-4 w-4 shrink-0",
                          isSelected ? "text-[#deb554]" : "text-[#9e8b7c]",
                        )}
                      />
                    </Link>
                  );
                })}
            </div>
          </div>
        </section>
      </div>
    </PageShell>
  );
}

export default function ReadPage() {
  return (
    <Suspense
      fallback={
        <PageShell
          eyebrow="Horological Focus"
          title="Reading Chronometer"
          description="Preparing your reading session..."
        >
          <div className="flex items-center justify-center p-16">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#c59b27] border-t-transparent" />
          </div>
        </PageShell>
      }
    >
      <ReadPageInner />
    </Suspense>
  );
}
