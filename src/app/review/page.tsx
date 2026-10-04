"use client";

import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  BookCheck,
  Calendar,
  Check,
  Clock,
  MessageSquareQuote,
  Quote,
  Sparkles,
  Star,
} from "lucide-react";

import { BookCover } from "@/components/book-cover";
import { useBookApp } from "@/components/book-app-provider";
import { PageShell } from "@/components/page-shell";
import { cn, formatDate, formatHours } from "@/lib/utils";

const starDescriptions = ["Flawed", "Fair", "Notable", "Distinguished", "Masterpiece"];

function ReviewPageInner() {
  const searchParams = useSearchParams();
  const focusedBookId = searchParams.get("book");
  const { finishedBooks, updateReview } = useBookApp();
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [ratings, setRatings] = useState<Record<string, number>>({});
  const [savedNotices, setSavedNotices] = useState<Record<string, boolean>>({});

  const orderedBooks = useMemo(
    () =>
      [...finishedBooks].sort((a, b) => {
        if (focusedBookId === a.id) {
          return -1;
        }
        if (focusedBookId === b.id) {
          return 1;
        }
        return (
          +new Date(b.finishedAt ?? b.createdAt) -
          +new Date(a.finishedAt ?? a.createdAt)
        );
      }),
    [finishedBooks, focusedBookId],
  );

  async function handleSaveReview(bookId: string, thoughts: string, rating: number) {
    await updateReview(bookId, thoughts, rating);
    setSavedNotices((prev) => ({ ...prev, [bookId]: true }));
    setTimeout(() => {
      setSavedNotices((prev) => ({ ...prev, [bookId]: false }));
    }, 3000);
  }

  return (
    <PageShell
      eyebrow="The Critical Folio"
      title="Literary Reviews & Reflections"
      description="Preserve your reflections, critical evaluations, and philosophical insights for every completed volume in your personal archive."
    >
      <section className="space-y-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {orderedBooks.map((book) => {
            const currentRating = ratings[book.id] ?? book.personalRating ?? 0;
            const currentThoughts = drafts[book.id] ?? book.thoughts;
            const isSaved = savedNotices[book.id];

            return (
              <article
                key={book.id}
                className={cn(
                  "relative flex flex-col justify-between overflow-hidden rounded-[2.5rem] border bg-gradient-to-b from-white via-[#fdfcf9] to-[#faf6ef] p-6 sm:p-7 shadow-[0_4px_24px_rgba(40,25,10,0.04)] transition-all duration-300",
                  focusedBookId === book.id
                    ? "border-[#c59b27] ring-2 ring-[#c59b27]/30 shadow-lg"
                    : "border-[#e8dac6] hover:border-[#c59b27]/60",
                )}
              >
                <div>
                  {/* Top Badges */}
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-300/60 bg-emerald-100/70 px-3 py-1 text-xs font-semibold text-emerald-900">
                      <BookCheck className="h-3.5 w-3.5 text-emerald-700" />
                      <span>Volume Completed</span>
                    </span>

                    {book.finishedAt ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-[#f4ece0] px-3 py-1 text-xs font-medium text-[#7d6857]">
                        <Calendar className="h-3 w-3" />
                        <span suppressHydrationWarning>{formatDate(book.finishedAt)}</span>
                      </span>
                    ) : null}
                  </div>

                  {/* Book Info */}
                  <div className="mt-5 flex gap-4">
                    <BookCover
                      title={book.title}
                      coverUrl={book.coverUrl}
                      author={book.author}
                      size="lg"
                      priority={focusedBookId === book.id}
                    />

                    <div className="min-w-0 flex-1">
                      <h2 className="font-serif text-xl font-bold leading-tight text-[#1c1815]">
                        {book.title}
                      </h2>
                      <p className="mt-1 text-xs font-medium text-[#7d6857]">
                        {book.author}
                      </p>

                      <div className="mt-3 flex items-center gap-1.5 text-xs text-[#8c7766]">
                        <Clock className="h-3.5 w-3.5 text-[#deb554]" />
                        <span>Time invested: </span>
                        <span className="font-bold text-[#1c1815]">
                          {formatHours(book.totalSeconds)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Rating Selector */}
                  <div className="mt-6 border-t border-[#ede2d2] pt-4">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-[#8b7563]">
                        Personal Evaluation
                      </span>
                      {currentRating > 0 ? (
                        <span className="text-xs font-semibold text-[#966b1a]">
                          {starDescriptions[currentRating - 1]} ({currentRating}/5)
                        </span>
                      ) : (
                        <span className="text-xs text-[#9e8b7c]">Unrated</span>
                      )}
                    </div>

                    <div className="mt-2.5 flex items-center gap-1.5">
                      {[1, 2, 3, 4, 5].map((val) => (
                        <button
                          key={val}
                          type="button"
                          onClick={() =>
                            setRatings((prev) => ({
                              ...prev,
                              [book.id]: val,
                            }))
                          }
                          aria-label={`Rate ${val} stars`}
                          className="group relative flex h-10 w-10 items-center justify-center rounded-xl bg-[#f8f2e7] transition hover:scale-110 hover:bg-amber-100/70"
                        >
                          <Star
                            className={cn(
                              "h-5 w-5 transition-colors",
                              val <= currentRating
                                ? "fill-[#deb554] text-[#deb554]"
                                : "text-[#d1c0b0] group-hover:text-[#deb554]",
                            )}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Thoughts / Journal Textarea */}
                  <div className="mt-5">
                    <label className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[#8b7563]">
                      <Quote className="h-3 w-3 text-[#c59b27]" />
                      <span>Reflections & Critical Takeaways</span>
                    </label>

                    <textarea
                      value={currentThoughts}
                      onChange={(e) =>
                        setDrafts((prev) => ({
                          ...prev,
                          [book.id]: e.target.value,
                        }))
                      }
                      rows={4}
                      placeholder="Record memorable passages, character nuances, counter-arguments, and synthesis of ideas..."
                      className="mt-2 w-full rounded-2xl border border-[#e4d6c4] bg-[#fbf8f3] p-4 font-serif text-sm leading-relaxed text-[#1c1815] placeholder:font-sans placeholder:text-xs placeholder:text-[#9e8b7c] focus:border-[#c59b27] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#c59b27]"
                    />
                  </div>
                </div>

                {/* Save Review Button */}
                <div className="mt-6 flex items-center justify-between border-t border-[#ede2d2] pt-4">
                  {isSaved ? (
                    <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-800">
                      <Check className="h-4 w-4" />
                      <span>Review Inscribed</span>
                    </span>
                  ) : (
                    <span className="text-[11px] text-[#8c7766]">
                      Saved to your local/cloud journal
                    </span>
                  )}

                  <button
                    type="button"
                    onClick={() =>
                      void handleSaveReview(
                        book.id,
                        currentThoughts,
                        currentRating || 5,
                      )
                    }
                    className="flex items-center gap-2 rounded-full bg-gradient-to-r from-[#241c16] to-[#120e0b] px-5 py-2.5 text-xs font-semibold text-[#f8eedc] shadow-md transition hover:scale-[1.02] active:scale-95"
                  >
                    <Sparkles className="h-3.5 w-3.5 text-[#deb554]" />
                    <span>Save Inscription</span>
                  </button>
                </div>
              </article>
            );
          })}
        </div>

        {/* Empty State */}
        {!orderedBooks.length ? (
          <section className="flex flex-col items-center justify-center rounded-[2.5rem] border border-dashed border-[#e4d6c4] bg-[#fdfbf7] p-12 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100/70 text-amber-900">
              <MessageSquareQuote className="h-7 w-7" />
            </div>
            <h3 className="mt-4 font-serif text-xl font-bold text-[#1c1815]">
              No Volumes Completed Yet
            </h3>
            <p className="mt-2 max-w-md text-xs leading-relaxed text-[#8c7766]">
              "A reader lives a thousand lives before he dies. The man who never reads lives only one." Once you finish your first book from the chronometer or library, your critical reviews will be archived here.
            </p>
            <div className="mt-6 flex gap-3">
              <Link
                href="/continue"
                className="inline-flex items-center gap-2 rounded-full bg-[#1f1712] px-5 py-2.5 text-xs font-semibold text-[#f8eedc] shadow-sm hover:bg-[#120d0a]"
              >
                <span>Continue Reading</span>
              </Link>
              <Link
                href="/"
                className="inline-flex items-center gap-2 rounded-full border border-[#e4d6c4] bg-white px-5 py-2.5 text-xs font-semibold text-[#6d5747] hover:bg-[#f5ece0]"
              >
                <span>Explore Library</span>
              </Link>
            </div>
          </section>
        ) : null}
      </section>
    </PageShell>
  );
}

export default function ReviewPage() {
  return (
    <Suspense
      fallback={
        <PageShell
          eyebrow="The Critical Folio"
          title="Literary Reviews & Reflections"
          description="Loading your finished volumes..."
        >
          <div className="flex items-center justify-center p-16">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#c59b27] border-t-transparent" />
          </div>
        </PageShell>
      }
    >
      <ReviewPageInner />
    </Suspense>
  );
}
