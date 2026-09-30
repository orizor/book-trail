"use client";

import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Star } from "lucide-react";

import { BookCover } from "@/components/book-cover";
import { useBookApp } from "@/components/book-app-provider";
import { PageShell } from "@/components/page-shell";
import { cn, formatHours } from "@/lib/utils";

function ReviewPageInner() {
  const searchParams = useSearchParams();
  const focusedBookId = searchParams.get("book");
  const { finishedBooks, updateReview } = useBookApp();
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [ratings, setRatings] = useState<Record<string, number>>({});

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

  return (
    <PageShell
      eyebrow="Reviews"
      title="Review Page"
      description="Finished books live here with your rating, notes, and time spent. Tap a finished badge in the library to jump straight here."
    >
      <section className="space-y-3">
        {orderedBooks.map((book) => (
          <article
            key={book.id}
            className={cn(
              "rounded-[1.75rem] bg-white p-4 shadow-sm ring-1",
              focusedBookId === book.id ? "ring-amber-300" : "ring-stone-100",
            )}
          >
            <div className="flex gap-4">
              <BookCover
                title={book.title}
                coverUrl={book.coverUrl}
                priority={focusedBookId === book.id}
              />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800">
                    Finished
                  </span>
                  {book.finishedAt ? (
                    <span className="rounded-full bg-[#f8f3ea] px-3 py-1 text-xs text-stone-600">
                      {new Date(book.finishedAt).toLocaleDateString()}
                    </span>
                  ) : null}
                </div>
                <h2 className="mt-3 text-base font-semibold text-stone-900">
                  {book.title}
                </h2>
                <p className="mt-1 text-sm text-stone-500">{book.author}</p>
                <p className="mt-3 text-sm text-stone-500">
                  Total reading time: {formatHours(book.totalSeconds)}
                </p>
              </div>
            </div>

            <div className="mt-4 flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() =>
                    setRatings((current) => ({
                      ...current,
                      [book.id]: value,
                    }))
                  }
                  aria-label={`Rate ${value} out of 5`}
                  className="rounded-full bg-[#f8f3ea] p-2"
                >
                  <Star
                    className={
                      value <= (ratings[book.id] ?? book.personalRating ?? 0)
                        ? "h-4 w-4 fill-amber-400 text-amber-400"
                        : "h-4 w-4 text-stone-300"
                    }
                  />
                </button>
              ))}
            </div>

            <textarea
              value={drafts[book.id] ?? book.thoughts}
              onChange={(event) =>
                setDrafts((current) => ({
                  ...current,
                  [book.id]: event.target.value,
                }))
              }
              placeholder="Write your review, reflections, and favorite takeaways here"
              className="mt-4 min-h-28 w-full rounded-2xl border border-stone-200 bg-[#f8f3ea] px-4 py-3 text-sm outline-none focus:border-amber-400"
            />
            <button
              type="button"
              onClick={() =>
                void updateReview(
                  book.id,
                  drafts[book.id] ?? book.thoughts,
                  ratings[book.id] ?? book.personalRating ?? 4,
                )
              }
              className="mt-4 inline-flex rounded-full bg-stone-900 px-4 py-3 text-sm font-semibold text-white"
            >
              Save review
            </button>
          </article>
        ))}

        {!orderedBooks.length ? (
          <section className="rounded-[1.75rem] bg-white p-5 text-sm text-stone-500 shadow-sm ring-1 ring-stone-100">
            Finish a book and it will appear here for review.
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
          eyebrow="Reviews"
          title="Review Page"
          description="Loading your finished books..."
        >
          <section className="rounded-[1.75rem] bg-white p-5 text-sm text-stone-500 shadow-sm ring-1 ring-stone-100">
            Loading your finished books...
          </section>
        </PageShell>
      }
    >
      <ReviewPageInner />
    </Suspense>
  );
}
