"use client";

import { useMemo, useState } from "react";
import { BarChart3, ChevronLeft, ChevronRight } from "lucide-react";

import { useBookApp } from "@/components/book-app-provider";
import { PageShell } from "@/components/page-shell";
import { formatDuration, formatHours, formatTimeRange } from "@/lib/utils";

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

  return (
    <PageShell
      eyebrow="Insights"
      title="Stats"
      description="Track reading time by month, browse exact session times, and move between months to review your reading rhythm."
    >
      <section className="grid grid-cols-2 gap-3">
        <article className="rounded-[1.75rem] bg-white p-4 shadow-sm ring-1 ring-stone-100">
          <p className="text-xs font-medium text-stone-500">Hours read</p>
          <p className="mt-2 text-3xl font-semibold text-stone-900">
            {formatHours(totalSeconds)}
          </p>
        </article>
        <article className="rounded-[1.75rem] bg-white p-4 shadow-sm ring-1 ring-stone-100">
          <p className="text-xs font-medium text-stone-500">Sessions</p>
          <p className="mt-2 text-3xl font-semibold text-stone-900">{sessions.length}</p>
        </article>
      </section>

      <section className="rounded-[1.75rem] bg-white p-4 shadow-sm ring-1 ring-stone-100">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-amber-700" />
            <h2 className="text-sm font-semibold text-stone-900">Monthly logs</h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setMonthOffset((value) => value - 1)}
              className="rounded-full bg-[#f8f3ea] p-2 text-stone-700"
              aria-label="Previous month"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setMonthOffset((value) => Math.min(0, value + 1))}
              className="rounded-full bg-[#f8f3ea] p-2 text-stone-700 disabled:opacity-40"
              aria-label="Next month"
              disabled={monthOffset === 0}
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
        <div className="mt-4 rounded-2xl bg-[#f8f3ea] px-4 py-3">
          <p className="text-sm font-semibold text-stone-900">
            {visibleMonth.toLocaleDateString([], {
              month: "long",
              year: "numeric",
            })}
          </p>
          <p className="mt-1 text-sm text-stone-500">
            {monthlySessions.length} logs • {formatHours(monthlySeconds)}
          </p>
        </div>

        <div className="mt-4 space-y-3">
          {monthlySessions.map((session) => {
            const book = books.find((item) => item.id === session.bookId);

            return (
              <article
                key={session.id}
                className="rounded-2xl bg-[#f8f3ea] px-4 py-3"
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-stone-900">
                      {book?.title ?? "Unknown book"}
                    </p>
                    <p className="mt-1 text-xs text-stone-500">
                      {formatTimeRange(session.startedAt, session.endedAt)}
                    </p>
                    <p className="mt-1 text-xs text-stone-500">
                      {session.format === "pdf" ? "PDF" : "Physical"}
                    </p>
                  </div>
                  <span className="rounded-full bg-white px-3 py-1 text-xs text-stone-600">
                    {formatDuration(session.durationSeconds)}
                  </span>
                </div>
              </article>
            );
          })}

          {!monthlySessions.length ? (
            <article className="rounded-2xl bg-[#f8f3ea] px-4 py-5 text-sm text-stone-500">
              No reading logs in this month yet.
            </article>
          ) : null}
        </div>
      </section>
    </PageShell>
  );
}
