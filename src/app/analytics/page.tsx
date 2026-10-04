"use client";

import { useMemo, useState } from "react";
import {
  BarChart3,
  BookOpen,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock,
  Compass,
  FileText,
  Flame,
  PieChart,
  Sparkles,
  TrendingUp,
} from "lucide-react";

import { useBookApp } from "@/components/book-app-provider";
import { PageShell } from "@/components/page-shell";
import { formatDuration, formatHours, formatMonthYear, formatTimeRange } from "@/lib/utils";

export default function AnalyticsPage() {
  const { sessions, books } = useBookApp();
  const [monthOffset, setMonthOffset] = useState(0);

  const totalSeconds = books.reduce((sum, book) => sum + book.totalSeconds, 0);

  const visibleMonth = useMemo(() => {
    const date = new Date();
    date.setMonth(date.getMonth() + monthOffset, 1);
    date.setHours(0, 0, 0, 0);
    return date;
  }, [monthOffset]);

  const monthlySessions = useMemo(() => {
    return [...sessions]
      .filter((session) => {
        const date = new Date(session.startedAt);
        return (
          date.getFullYear() === visibleMonth.getFullYear() &&
          date.getMonth() === visibleMonth.getMonth()
        );
      })
      .sort((a, b) => +new Date(b.startedAt) - +new Date(a.startedAt));
  }, [sessions, visibleMonth]);

  const monthlySeconds = monthlySessions.reduce(
    (sum, session) => sum + session.durationSeconds,
    0,
  );

  // Modality statistics
  const physicalSessions = sessions.filter((s) => s.format === "physical");
  const pdfSessions = sessions.filter((s) => s.format === "pdf");
  const physicalSeconds = physicalSessions.reduce((sum, s) => sum + s.durationSeconds, 0);
  const pdfSeconds = pdfSessions.reduce((sum, s) => sum + s.durationSeconds, 0);

  const avgSessionSeconds = sessions.length
    ? Math.round(totalSeconds / sessions.length)
    : 0;

  // Book breakdown for current month
  const bookBreakdown = useMemo(() => {
    const map = new Map<string, number>();
    for (const session of monthlySessions) {
      map.set(session.bookId, (map.get(session.bookId) ?? 0) + session.durationSeconds);
    }
    return Array.from(map.entries())
      .map(([bookId, secs]) => {
        const book = books.find((b) => b.id === bookId);
        return {
          title: book?.title ?? "Archived Volume",
          author: book?.author ?? "Unknown",
          seconds: secs,
          percentage: monthlySeconds > 0 ? Math.round((secs / monthlySeconds) * 100) : 0,
        };
      })
      .sort((a, b) => b.seconds - a.seconds);
  }, [books, monthlySessions, monthlySeconds]);

  return (
    <PageShell
      eyebrow="Intellectual Ledger"
      title="Reading Insights & Analytics"
      description="Examine your temporal investments, track session consistency, and visualize how your reading momentum unfolds across the months."
    >
      {/* 4-Metric Grid */}
      <section className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:gap-4">
        {/* Metric 1: Total Hours */}
        <div className="relative overflow-hidden rounded-[2rem] border border-[#e8dac6] bg-gradient-to-br from-white via-[#fdfcf9] to-[#faf6ef] p-5 shadow-[0_4px_20px_rgba(40,25,10,0.04)]">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#8b7563]">
              Hours Invested
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-100/70 text-amber-900">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-3 font-serif text-3xl font-bold text-[#1c1815]">
            {formatHours(totalSeconds)}
          </p>
          <p className="mt-1 text-xs text-[#8c7766]">Across all collections</p>
        </div>

        {/* Metric 2: Sessions */}
        <div className="relative overflow-hidden rounded-[2rem] border border-[#e8dac6] bg-gradient-to-br from-white via-[#fdfcf9] to-[#faf6ef] p-5 shadow-[0_4px_20px_rgba(40,25,10,0.04)]">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#8b7563]">
              Focused Sessions
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#ede3d4] text-[#6d5543]">
              <Sparkles className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-3 font-serif text-3xl font-bold text-[#1c1815]">
            {sessions.length}
          </p>
          <p className="mt-1 text-xs text-[#8c7766]">Recorded reading blocks</p>
        </div>

        {/* Metric 3: Average Session */}
        <div className="relative overflow-hidden rounded-[2rem] border border-[#e8dac6] bg-gradient-to-br from-white via-[#fdfcf9] to-[#faf6ef] p-5 shadow-[0_4px_20px_rgba(40,25,10,0.04)]">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#8b7563]">
              Pace per Sitting
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-100/70 text-emerald-900">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-3 font-serif text-3xl font-bold text-[#1c1815]">
            {formatDuration(avgSessionSeconds)}
          </p>
          <p className="mt-1 text-xs text-[#8c7766]">Average duration</p>
        </div>

        {/* Metric 4: Format Split */}
        <div className="relative overflow-hidden rounded-[2rem] border border-[#e8dac6] bg-gradient-to-br from-white via-[#fdfcf9] to-[#faf6ef] p-5 shadow-[0_4px_20px_rgba(40,25,10,0.04)]">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#8b7563]">
              Modality Split
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-stone-100 text-stone-700">
              <PieChart className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-3 font-serif text-2xl font-bold text-[#1c1815]">
            {physicalSessions.length} <span className="text-xs font-normal text-stone-500">phys</span> /{" "}
            {pdfSessions.length} <span className="text-xs font-normal text-stone-500">pdf</span>
          </p>
          <p className="mt-1 text-xs text-[#8c7766]">Print vs Digital</p>
        </div>
      </section>

      {/* Responsive 2-Column Desktop Grid for Monthly Ledger */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:items-start">
        {/* Left Column: Month Selector & Focus Breakdown (Desktop: 5 cols) */}
        <section className="space-y-6 lg:col-span-5">
          {/* Month Selector Box */}
          <div className="rounded-[2.5rem] border border-[#e8dac6] bg-gradient-to-b from-white to-[#fbf8f3] p-6 sm:p-7 shadow-[0_4px_24px_rgba(40,25,10,0.04)]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-[#c59b27]" />
                <h3 className="font-serif text-lg font-bold text-[#1c1815]">
                  Monthly Period
                </h3>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setMonthOffset((v) => v - 1)}
                  className="flex h-8 w-8 items-center justify-center rounded-xl border border-[#e4d6c4] bg-white text-[#6d5747] hover:bg-[#f5ece0]"
                  aria-label="Previous month"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setMonthOffset((v) => Math.min(0, v + 1))}
                  disabled={monthOffset === 0}
                  className="flex h-8 w-8 items-center justify-center rounded-xl border border-[#e4d6c4] bg-white text-[#6d5747] hover:bg-[#f5ece0] disabled:opacity-30"
                  aria-label="Next month"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Current Month Highlight Box */}
            <div className="mt-5 rounded-2xl border border-[#ebdcc8] bg-gradient-to-r from-[#241c16] to-[#140e0b] p-5 text-white shadow-sm">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-[#dfc385]">
                Active Ledger Window
              </p>
              <h2 suppressHydrationWarning className="mt-1 font-serif text-2xl font-bold text-[#fdfcf9]">
                {formatMonthYear(visibleMonth)}
              </h2>
              <div className="mt-3 flex items-center gap-3 text-xs text-[#cbb8a6]">
                <span className="font-bold text-white">
                  {monthlySessions.length} {monthlySessions.length === 1 ? "Session" : "Sessions"}
                </span>
                <span>•</span>
                <span className="font-bold text-[#dfc385]">
                  {formatHours(monthlySeconds)} Recorded
                </span>
              </div>
            </div>

            {/* Book Distribution this Month */}
            <div className="mt-6 border-t border-[#ede2d2] pt-5">
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-[#8b7563]">
                Volume Attention Split
              </h4>

              {bookBreakdown.length > 0 ? (
                <div className="mt-3 space-y-3">
                  {bookBreakdown.map((item, idx) => (
                    <div key={idx} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="truncate font-semibold text-[#1c1815]">
                          {item.title}
                        </span>
                        <span className="font-bold text-[#966b1a]">
                          {formatHours(item.seconds)} ({item.percentage}%)
                        </span>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-[#ede2d2]">
                        <div
                          className="h-full bg-gradient-to-r from-[#c59b27] to-[#deb554]"
                          style={{ width: `${item.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-3 text-xs text-[#9e8b7c]">
                  No sessions recorded in this month.
                </p>
              )}
            </div>
          </div>
        </section>

        {/* Right Column: Reading Timeline Logs (Desktop: 7 cols) */}
        <section className="space-y-4 lg:col-span-7">
          <div className="flex items-center justify-between">
            <h3 className="font-serif text-xl font-bold text-[#1c1815]">
              Session Chronology
            </h3>
            <span suppressHydrationWarning className="text-xs text-[#8c7766]">
              {monthlySessions.length} entries for {formatMonthYear(visibleMonth)}
            </span>
          </div>

          <div className="space-y-3">
            {monthlySessions.map((session) => {
              const book = books.find((item) => item.id === session.bookId);

              return (
                <article
                  key={session.id}
                  className="group flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-[#e8dac6] bg-white p-4 shadow-[0_2px_12px_rgba(40,25,10,0.03)] transition hover:border-[#c59b27]/60 hover:shadow-md"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#f5ece0] text-[#6d5747]">
                      {session.format === "pdf" ? (
                        <FileText className="h-5 w-5 text-[#c59b27]" />
                      ) : (
                        <BookOpen className="h-5 w-5 text-[#886217]" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate font-serif text-base font-bold text-[#1c1815]">
                        {book?.title ?? "Archived Volume"}
                      </p>
                      <p className="text-xs text-[#7d6857] truncate">
                        {book?.author ?? "Unknown Author"}
                      </p>
                      <p className="mt-1 text-[11px] text-[#8c7766]">
                        {formatTimeRange(session.startedAt, session.endedAt)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 self-end sm:self-center shrink-0">
                    <span className="rounded-full border border-[#e4d6c4] bg-[#fbf8f3] px-2.5 py-1 text-[11px] font-medium text-[#6d5747]">
                      {session.format === "pdf" ? "PDF" : "Physical"}
                    </span>
                    <span className="rounded-full bg-[#1f1712] px-3.5 py-1 text-xs font-bold text-[#f8eedc]">
                      {formatDuration(session.durationSeconds)}
                    </span>
                  </div>
                </article>
              );
            })}

            {!monthlySessions.length ? (
              <div className="flex flex-col items-center justify-center rounded-[2.5rem] border border-dashed border-[#e4d6c4] bg-[#fdfbf7] p-12 text-center">
                <Clock className="h-10 w-10 text-[#c59b27]/50" />
                <h4 className="mt-4 font-serif text-lg font-bold text-[#1c1815]">
                  No Sessions in this Month
                </h4>
                <p className="mt-1 max-w-xs text-xs text-[#8c7766]">
                  Navigate using the arrow buttons to past months or start a new reading session on the timer.
                </p>
              </div>
            ) : null}
          </div>
        </section>
      </div>
    </PageShell>
  );
}
