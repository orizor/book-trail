"use client";

import Link from "next/link";
import { ArrowRight, BookOpenText, Clock3, PlayCircle } from "lucide-react";

import { BookCover } from "@/components/book-cover";
import { useBookApp } from "@/components/book-app-provider";
import { PageShell } from "@/components/page-shell";
import { buildFolderPath, formatHours } from "@/lib/utils";

export default function ContinuePage() {
  const { activeBook, activeSession, readingBooks, folders } = useBookApp();

  return (
    <PageShell
      eyebrow="Resume"
      title="Continue Reading"
      description="Everything that is in progress lives here, so you can jump back into the right book fast on your phone."
    >
      {activeBook && activeSession ? (
        <section className="rounded-[1.9rem] bg-stone-900 p-5 text-white shadow-xl">
          <p className="text-xs font-medium uppercase tracking-[0.22em] text-amber-200">
            Active timer
          </p>
          <div className="mt-4 flex gap-4">
            <BookCover title={activeBook.title} coverUrl={activeBook.coverUrl} priority />
            <div className="min-w-0">
              <h2 className="text-xl font-semibold">{activeBook.title}</h2>
              <p className="mt-1 text-sm text-stone-300">{activeBook.author}</p>
              <p className="mt-3 text-sm text-stone-300">
                Reading with {activeSession.format === "pdf" ? "PDF" : "physical copy"}
              </p>
            </div>
          </div>
          <Link
            href="/read"
            className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-white px-4 py-3 text-sm font-semibold text-stone-900"
          >
            <PlayCircle className="h-4 w-4" />
            Open timer
          </Link>
        </section>
      ) : (
        <section className="rounded-[1.75rem] bg-white p-5 shadow-sm ring-1 ring-stone-100">
          <div className="flex items-center gap-3">
            <Clock3 className="h-5 w-5 text-amber-700" />
            <div>
              <h2 className="text-base font-semibold text-stone-900">No live timer</h2>
              <p className="mt-1 text-sm text-stone-500">
                Pick one of your in-progress books below and start a new session.
              </p>
            </div>
          </div>
        </section>
      )}

      <section className="space-y-3">
        {readingBooks.map((book) => (
          <article
            key={book.id}
            className="rounded-[1.75rem] bg-white p-4 shadow-sm ring-1 ring-stone-100"
          >
            <div className="flex gap-4">
              <BookCover title={book.title} coverUrl={book.coverUrl} />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-amber-100 px-2.5 py-1 text-[11px] font-medium text-amber-800">
                    In progress
                  </span>
                </div>
                <h2 className="mt-3 text-base font-semibold text-stone-900">
                  {book.title}
                </h2>
                <p className="mt-1 text-sm text-stone-500">{book.author}</p>
                <p className="mt-3 text-sm text-stone-500">
                  {buildFolderPath(book.folderId, folders)} • {formatHours(book.totalSeconds)}
                </p>
              </div>
            </div>
            <Link
              href={`/read?book=${book.id}`}
              className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full bg-stone-900 px-4 py-3 text-sm font-semibold text-white"
            >
              <ArrowRight className="h-4 w-4" />
              Continue with this book
            </Link>
          </article>
        ))}

        {!readingBooks.length ? (
          <section className="rounded-[1.75rem] bg-white p-5 shadow-sm ring-1 ring-stone-100">
            <div className="flex items-center gap-3">
              <BookOpenText className="h-5 w-5 text-stone-400" />
              <div>
                <h2 className="text-base font-semibold text-stone-900">
                  Nothing marked as in progress yet
                </h2>
                <p className="mt-1 text-sm text-stone-500">
                  Add books from the search page, choose a reading format, and your
                  continue shelf will appear here.
                </p>
              </div>
            </div>
          </section>
        ) : null}
      </section>
    </PageShell>
  );
}
