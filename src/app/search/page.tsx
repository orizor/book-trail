"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  BookOpen,
  Check,
  CheckCircle2,
  FileUp,
  Folder as FolderIcon,
  Loader2,
  Plus,
  Search,
  Sparkles,
  Star,
  X,
} from "lucide-react";

import { BookCover } from "@/components/book-cover";
import { useBookApp } from "@/components/book-app-provider";
import { PageShell } from "@/components/page-shell";
import type { SearchBookResult } from "@/lib/types";
import { buildFolderPath, cn } from "@/lib/utils";

const curatedPrompts = [
  "Meditations",
  "The Odyssey",
  "Fyodor Dostoevsky",
  "Marcus Aurelius",
  "Pride and Prejudice",
  "Atomic Habits",
];

export default function SearchPage() {
  const router = useRouter();
  const { addBook, folders } = useBookApp();
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<SearchBookResult[]>([]);
  const [selected, setSelected] = useState<SearchBookResult | null>(null);
  const [folderId, setFolderId] = useState("");
  const [hasPhysical, setHasPhysical] = useState(true);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [addedBookTitle, setAddedBookTitle] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  async function executeSearch(searchTerm: string) {
    if (!searchTerm.trim()) {
      return;
    }

    setLoading(true);
    setHasSearched(true);
    setErrorMessage(null);

    try {
      const response = await fetch(
        `/api/books/search?q=${encodeURIComponent(searchTerm.trim())}`,
      );
      const data = (await response.json()) as { books: SearchBookResult[] };
      setResults(data.books ?? []);
    } catch (err) {
      setErrorMessage("Could not load search results. Please check your internet connection.");
      setResults([]);
    } finally {
      setLoading(false);
    }
  }

  async function handleSearchSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await executeSearch(query);
  }

  // Quick 1-tap add directly from card
  async function handleQuickAdd(book: SearchBookResult) {
    setIsAdding(true);
    setErrorMessage(null);
    try {
      await addBook({
        book,
        hasPhysical: true,
      });
      setAddedBookTitle(book.title);
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Failed to add book. Please try again.");
    } finally {
      setIsAdding(false);
    }
  }

  // Modal configure and add
  async function handleSaveSelected() {
    if (!selected) {
      return;
    }

    setIsAdding(true);
    setErrorMessage(null);

    try {
      await addBook({
        book: selected,
        folderId: folderId || undefined,
        hasPhysical,
        pdfFile,
      });

      setAddedBookTitle(selected.title);
      setSelected(null);
      setFolderId("");
      setHasPhysical(true);
      setPdfFile(null);
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Failed to save book. Please try again.");
    } finally {
      setIsAdding(false);
    }
  }

  return (
    <PageShell
      eyebrow="Discover"
      title="Search Books"
      description="Find any published book to add to your library. Read via physical copy or attached PDF."
    >
      {/* Search Input Bar */}
      <section className="rounded-2xl sm:rounded-3xl border border-[#e8dac6] bg-white p-4 sm:p-6 shadow-sm">
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9e8b7c]" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search title, author, or topic..."
              className="w-full rounded-xl border border-[#e4d6c4] bg-[#fbf8f3] py-3 pl-10 pr-9 text-sm text-[#1c1815] placeholder:text-[#9e8b7c] focus:border-[#c59b27] focus:bg-white focus:outline-none"
            />
            {query ? (
              <button
                type="button"
                onClick={() => setQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-[#9e8b7c] hover:bg-[#ede2d2]"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            ) : null}
          </div>

          <button
            type="submit"
            disabled={loading || !query.trim()}
            className="flex items-center justify-center gap-1.5 rounded-xl bg-[#1f1712] px-5 py-3 text-xs sm:text-sm font-semibold text-[#f8eedc] shadow-sm hover:bg-[#120d0a] active:scale-95 disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin text-[#deb554]" />
            ) : (
              <>
                <Search className="h-4 w-4 text-[#deb554]" />
                <span className="hidden sm:inline">Search</span>
              </>
            )}
          </button>
        </form>

        {/* Suggestion Chips */}
        <div className="mt-3 flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] font-medium text-[#8c7766]">Try:</span>
          {curatedPrompts.map((prompt) => (
            <button
              key={prompt}
              type="button"
              onClick={() => {
                setQuery(prompt);
                void executeSearch(prompt);
              }}
              className="rounded-full bg-[#f5ece0]/80 px-2.5 py-0.5 text-xs text-[#6e5847] hover:bg-[#ede0cf]"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Error notification if search failed */}
        {errorMessage ? (
          <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800">
            {errorMessage}
          </div>
        ) : null}
      </section>

      {/* Success Banner when Book Added */}
      {addedBookTitle ? (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-emerald-300 bg-emerald-50/90 p-4 text-emerald-950 shadow-sm animate-in fade-in">
          <div className="flex items-center gap-2.5 min-w-0">
            <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-700" />
            <p className="text-sm font-medium truncate">
              <span className="font-bold">"{addedBookTitle}"</span> has been added to your library!
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setAddedBookTitle(null)}
              className="rounded-lg px-3 py-1.5 text-xs font-medium text-emerald-800 hover:bg-emerald-100"
            >
              Add more
            </button>
            <Link
              href="/"
              className="flex items-center gap-1 rounded-lg bg-emerald-800 px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-emerald-900"
            >
              <span>View in Library</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      ) : null}

      {/* Search Results List */}
      {hasSearched ? (
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-lg font-bold text-[#1c1815]">
              Search Results
            </h2>
            <span className="text-xs text-[#8c7766]">
              {results.length} found
            </span>
          </div>

          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
            {results.map((book) => (
              <article
                key={book.id}
                className="group flex flex-col justify-between rounded-2xl border border-[#e8dac6] bg-white p-4 shadow-sm transition hover:border-[#c59b27]/60 hover:shadow-md"
              >
                <div>
                  <div className="flex gap-3.5">
                    <BookCover
                      title={book.title}
                      coverUrl={book.coverUrl}
                      author={book.author}
                      size="sm"
                    />
                    <div className="min-w-0 flex-1">
                      <h3 className="line-clamp-2 font-serif text-sm font-bold text-[#1c1815]">
                        {book.title}
                      </h3>
                      <p className="mt-0.5 line-clamp-1 text-xs text-[#7d6857]">
                        {book.author}
                      </p>
                      {book.communityRating ? (
                        <div className="mt-1.5 flex items-center gap-1 text-[11px] text-[#8c7766]">
                          <Star className="h-3 w-3 fill-[#deb554] text-[#deb554]" />
                          <span>{book.communityRating}</span>
                        </div>
                      ) : null}
                    </div>
                  </div>

                  {book.synopsis ? (
                    <p className="mt-3 line-clamp-2 text-xs text-[#6d5747]">
                      {book.synopsis}
                    </p>
                  ) : null}
                </div>

                <div className="mt-4 flex items-center gap-2 border-t border-[#ede2d2] pt-3">
                  <button
                    type="button"
                    disabled={isAdding}
                    onClick={() => void handleQuickAdd(book)}
                    className="flex-1 rounded-xl bg-[#1f1712] py-2 text-center text-xs font-semibold text-[#f8eedc] shadow-sm hover:bg-[#120d0a] active:scale-95 disabled:opacity-50"
                  >
                    + Quick Add
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSelected(book);
                      setFolderId("");
                      setHasPhysical(true);
                      setPdfFile(null);
                    }}
                    className="rounded-xl border border-[#e4d6c4] bg-[#fbf8f3] px-3 py-2 text-xs font-semibold text-[#6d5747] hover:bg-white"
                  >
                    Options
                  </button>
                </div>
              </article>
            ))}
          </div>

          {!results.length && !loading ? (
            <div className="rounded-2xl border border-dashed border-[#e4d6c4] bg-white p-8 text-center text-xs text-[#8c7766]">
              No volumes found matching "{query}". Try a different title or author.
            </div>
          ) : null}
        </section>
      ) : null}

      {/* Floating Options Modal Dialog (Centered & on Top of Screen) */}
      {selected ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-[#c59b27]/40 bg-white p-6 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-start justify-between border-b border-[#ede2d2] pb-3">
              <div>
                <h3 className="font-serif text-lg font-bold text-[#1c1815]">
                  Add to Library
                </h3>
                <p className="text-xs text-[#8c7766]">Configure shelf and reading format</p>
              </div>
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="rounded-full p-1 text-[#9e8b7c] hover:bg-[#ede2d2]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Book Info Summary */}
            <div className="mt-4 flex gap-3.5">
              <BookCover
                title={selected.title}
                coverUrl={selected.coverUrl}
                author={selected.author}
                size="sm"
              />
              <div className="min-w-0 flex-1">
                <h4 className="font-serif text-base font-bold leading-tight text-[#1c1815] line-clamp-2">
                  {selected.title}
                </h4>
                <p className="mt-0.5 text-xs text-[#7d6857]">{selected.author}</p>
              </div>
            </div>

            {/* Form Fields */}
            <div className="mt-5 space-y-3.5">
              {/* Folder Selector */}
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-[#8b7563]">
                  Destination Shelf
                </label>
                <select
                  value={folderId}
                  onChange={(e) => setFolderId(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-[#e4d6c4] bg-[#fbf8f3] p-2.5 text-xs text-[#1c1815] focus:border-[#c59b27] focus:bg-white focus:outline-none"
                >
                  <option value="">Main Library (Root)</option>
                  {folders.map((f) => (
                    <option key={f.id} value={f.id}>
                      {buildFolderPath(f.id, folders)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Physical Checkbox */}
              <label className="flex cursor-pointer items-center gap-2.5 rounded-xl border border-[#e4d6c4] bg-[#fbf8f3] p-3 text-xs font-semibold text-[#1c1815] hover:bg-white">
                <input
                  type="checkbox"
                  checked={hasPhysical}
                  onChange={(e) => setHasPhysical(e.target.checked)}
                  className="h-4 w-4 rounded accent-[#c59b27]"
                />
                <span>I have a physical copy</span>
              </label>

              {/* Optional PDF Upload */}
              <div className="rounded-xl border border-[#e4d6c4] bg-[#fbf8f3] p-3">
                <p className="text-[11px] font-bold text-[#1c1815]">Attach PDF (Optional)</p>
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={(e) => setPdfFile(e.target.files?.[0] ?? null)}
                  className="mt-2 w-full text-xs text-[#6d5747] file:mr-2 file:rounded-lg file:border-0 file:bg-[#1f1712] file:px-2.5 file:py-1 file:text-xs file:font-semibold file:text-[#f8eedc]"
                />
              </div>

              {/* Submit Buttons */}
              <div className="mt-6 flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelected(null)}
                  className="flex-1 rounded-xl border border-[#e4d6c4] bg-white py-3 text-xs font-semibold text-[#6d5747] hover:bg-[#f5ece0]"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isAdding}
                  onClick={() => void handleSaveSelected()}
                  className="flex-[2] flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#b58825] to-[#c79930] py-3 text-xs font-bold uppercase tracking-wider text-white shadow-md hover:brightness-110 active:scale-95 disabled:opacity-50"
                >
                  {isAdding ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <Plus className="h-4 w-4" />
                      <span>Add to My Books</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </PageShell>
  );
}
