"use client";

import { Check, Search, Upload } from "lucide-react";
import { useState } from "react";

import { BookCover } from "@/components/book-cover";
import { useBookApp } from "@/components/book-app-provider";
import { PageShell } from "@/components/page-shell";
import type { SearchBookResult } from "@/lib/types";
import { buildFolderPath } from "@/lib/utils";

export default function SearchPage() {
  const { addBook, folders } = useBookApp();
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<SearchBookResult[]>([]);
  const [selected, setSelected] = useState<SearchBookResult | null>(null);
  const [folderId, setFolderId] = useState("");
  const [hasPhysical, setHasPhysical] = useState(false);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [notice, setNotice] = useState("");

  async function searchBooks(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!query.trim()) {
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `/api/books/search?q=${encodeURIComponent(query.trim())}`,
      );
      const data = (await response.json()) as { books: SearchBookResult[] };
      setResults(data.books);
    } finally {
      setLoading(false);
    }
  }

  async function saveBook() {
    if (!selected) {
      return;
    }

    await addBook({
      book: selected,
      folderId,
      hasPhysical,
      pdfFile,
    });

    setNotice(`${selected.title} has been added to your list.`);
    setSelected(null);
    setFolderId("");
    setHasPhysical(false);
    setPdfFile(null);
  }

  return (
    <PageShell
      eyebrow="Discover"
      title="Search Books"
      description="Search published books and add them straight to your list. Formats are optional here, so you can collect books first and decide how to read later."
    >
      <section className="rounded-[1.75rem] bg-white p-4 shadow-sm ring-1 ring-stone-100">
        <form className="flex gap-2" onSubmit={searchBooks}>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search title or author"
            className="min-w-0 flex-1 rounded-2xl border border-stone-200 bg-[#f8f3ea] px-4 py-3 text-sm outline-none focus:border-amber-400"
          />
          <button
            type="submit"
            className="inline-flex items-center justify-center rounded-2xl bg-stone-900 px-4 text-white"
          >
            <Search className="h-4 w-4" />
          </button>
        </form>

        {notice ? (
          <div className="mt-4 flex items-center gap-2 rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            <Check className="h-4 w-4" />
            {notice}
          </div>
        ) : null}
      </section>

      {selected ? (
        <section className="rounded-[1.75rem] bg-white p-4 shadow-sm ring-1 ring-stone-100">
          <div className="flex gap-4">
            <BookCover title={selected.title} coverUrl={selected.coverUrl} priority />
            <div className="min-w-0">
              <h2 className="text-lg font-semibold text-stone-900">{selected.title}</h2>
              <p className="mt-1 text-sm text-stone-500">{selected.author}</p>
              <p className="mt-3 text-sm leading-6 text-stone-500">
                {selected.synopsis}
              </p>
            </div>
          </div>

          <div className="mt-4 space-y-3">
            <select
              value={folderId}
              onChange={(event) => setFolderId(event.target.value)}
              className="w-full rounded-2xl border border-stone-200 bg-[#f8f3ea] px-4 py-3 text-sm outline-none focus:border-amber-400"
            >
              <option value="">Add without folder</option>
              {folders.map((folder) => (
                <option key={folder.id} value={folder.id}>
                  {buildFolderPath(folder.id, folders)}
                </option>
              ))}
            </select>

            <label className="flex items-center gap-3 rounded-2xl bg-[#f8f3ea] px-4 py-3 text-sm text-stone-700">
              <input
                type="checkbox"
                checked={hasPhysical}
                onChange={(event) => setHasPhysical(event.target.checked)}
                className="h-4 w-4"
              />
              I have a physical copy
            </label>

            <label className="flex items-center gap-3 rounded-2xl bg-[#f8f3ea] px-4 py-3 text-sm text-stone-700">
              <Upload className="h-4 w-4 text-stone-500" />
              <input
                type="file"
                accept="application/pdf"
                onChange={(event) => setPdfFile(event.target.files?.[0] ?? null)}
                className="w-full text-sm file:mr-3 file:rounded-full file:border-0 file:bg-stone-900 file:px-3 file:py-2 file:text-white"
              />
            </label>

            <p className="text-xs leading-5 text-stone-500">
              You can add the book even with no PDF and no physical copy selected. You
              just will not be able to start reading until you choose one later.
            </p>

            <button
              type="button"
              onClick={saveBook}
              className="inline-flex w-full items-center justify-center rounded-full bg-amber-700 px-4 py-3 text-sm font-semibold text-white"
            >
              Add to my books
            </button>
          </div>
        </section>
      ) : null}

      <section className="space-y-3">
        {loading ? (
          <div className="rounded-[1.75rem] bg-white p-5 text-sm text-stone-500 shadow-sm ring-1 ring-stone-100">
            Searching...
          </div>
        ) : null}

        {results.map((book) => (
          <button
            key={book.id}
            type="button"
            onClick={() => setSelected(book)}
            className="w-full rounded-[1.75rem] bg-white p-4 text-left shadow-sm ring-1 ring-stone-100"
          >
            <div className="flex gap-4">
              <BookCover title={book.title} coverUrl={book.coverUrl} />
              <div className="min-w-0 flex-1">
                <h2 className="text-base font-semibold text-stone-900">{book.title}</h2>
                <p className="mt-1 text-sm text-stone-500">{book.author}</p>
                <p className="mt-3 line-clamp-3 text-sm leading-6 text-stone-500">
                  {book.synopsis}
                </p>
              </div>
            </div>
          </button>
        ))}
      </section>
    </PageShell>
  );
}
