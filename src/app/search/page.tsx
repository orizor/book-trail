"use client";

import {
  BookOpen,
  Check,
  Compass,
  FileUp,
  Folder as FolderIcon,
  Plus,
  Search,
  Sparkles,
  Star,
  Upload,
  X,
} from "lucide-react";
import { useState } from "react";

import { BookCover } from "@/components/book-cover";
import { useBookApp } from "@/components/book-app-provider";
import { PageShell } from "@/components/page-shell";
import type { SearchBookResult } from "@/lib/types";
import { buildFolderPath, cn } from "@/lib/utils";

const curatedPrompts = [
  "Meditations",
  "The Odyssey",
  "Fyodor Dostoevsky",
  "Virginia Woolf",
  "Marcus Aurelius",
  "Pride and Prejudice",
  "War and Peace",
  "The Great Gatsby",
];

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
  const [hasSearched, setHasSearched] = useState(false);

  async function executeSearch(searchTerm: string) {
    if (!searchTerm.trim()) {
      return;
    }

    setLoading(true);
    setHasSearched(true);
    setNotice("");

    try {
      const response = await fetch(
        `/api/books/search?q=${encodeURIComponent(searchTerm.trim())}`,
      );
      const data = (await response.json()) as { books: SearchBookResult[] };
      setResults(data.books ?? []);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }

  async function handleSearchSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await executeSearch(query);
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

    setNotice(`"${selected.title}" has been cataloged to your library.`);
    setSelected(null);
    setFolderId("");
    setHasPhysical(false);
    setPdfFile(null);
  }

  return (
    <PageShell
      eyebrow="Literary Discovery"
      title="Search Published Works"
      description="Query open literary databases to discover editions, import metadata, and prepare volumes for your reading trajectory."
    >
      {/* Search Input Bar */}
      <section className="relative overflow-hidden rounded-[2.5rem] border border-[#e8dac6] bg-gradient-to-b from-white to-[#fbf8f3] p-6 sm:p-8 shadow-[0_4px_24px_rgba(40,25,10,0.04)]">
        <form onSubmit={handleSearchSubmit} className="relative flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#9e8b7c]" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by title, author, or keyword (e.g. Marcus Aurelius, Homer)..."
              className="w-full rounded-2xl border border-[#e4d6c4] bg-[#fbf8f3] py-4 pl-12 pr-10 text-sm text-[#1c1815] placeholder:text-[#9e8b7c] focus:border-[#c59b27] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#c59b27]/20 sm:text-base"
            />
            {query ? (
              <button
                type="button"
                onClick={() => setQuery("")}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 rounded-full p-1 text-[#9e8b7c] hover:bg-[#ede2d2] hover:text-[#1c1815]"
              >
                <X className="h-4 w-4" />
              </button>
            ) : null}
          </div>

          <button
            type="submit"
            disabled={loading || !query.trim()}
            className="flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#241c16] via-[#1c1511] to-[#120e0b] px-6 py-4 text-sm font-semibold text-[#f8eedc] shadow-[0_4px_16px_rgba(26,20,16,0.25)] transition hover:brightness-110 active:scale-95 disabled:opacity-50"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#dfc385] border-t-transparent" />
                <span>Searching...</span>
              </span>
            ) : (
              <>
                <Search className="h-4 w-4 text-[#deb554]" />
                <span>Find Editions</span>
              </>
            )}
          </button>
        </form>

        {/* Curated Suggestion Pills */}
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[#8c7766]">
            Curated Inquiries:
          </span>
          {curatedPrompts.map((prompt) => (
            <button
              key={prompt}
              type="button"
              onClick={() => {
                setQuery(prompt);
                void executeSearch(prompt);
              }}
              className="rounded-full border border-[#e4d6c4] bg-[#f7eedc]/50 px-3 py-1 text-xs font-medium text-[#6e5847] transition hover:border-[#c59b27] hover:bg-white hover:text-[#1c1815]"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Notification Toast */}
        {notice ? (
          <div className="mt-5 flex items-center gap-2.5 rounded-2xl border border-emerald-300/80 bg-emerald-50/90 px-4 py-3 text-xs md:text-sm font-medium text-emerald-900 shadow-sm">
            <Check className="h-4 w-4 text-emerald-700" />
            <span>{notice}</span>
          </div>
        ) : null}
      </section>

      {/* Selected Book Slipcase & Workbench Drawer / Modal */}
      {selected ? (
        <section className="relative overflow-hidden rounded-[2.5rem] border border-[#c59b27]/40 bg-gradient-to-br from-white via-[#fefcf8] to-[#fbf7ee] p-6 sm:p-8 shadow-[0_12px_40px_rgba(40,25,10,0.08)]">
          <div className="flex items-center justify-between border-b border-[#ebdcc8] pb-4">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-[#c59b27]" />
              <h2 className="font-serif text-lg font-bold text-[#1c1815]">
                Catalog Volume to Your Atelier
              </h2>
            </div>
            <button
              type="button"
              onClick={() => setSelected(null)}
              className="rounded-full p-1.5 text-[#9e8b7c] hover:bg-[#ede2d2] hover:text-[#1c1815]"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-12 md:items-start">
            {/* Book Preview */}
            <div className="flex gap-4 md:col-span-5">
              <BookCover
                title={selected.title}
                coverUrl={selected.coverUrl}
                author={selected.author}
                size="lg"
                priority
              />
              <div className="min-w-0 flex-1">
                <h3 className="font-serif text-xl font-bold leading-tight text-[#1c1815]">
                  {selected.title}
                </h3>
                <p className="mt-1 text-sm font-medium text-[#7d6857]">
                  {selected.author}
                </p>
                {selected.communityRating ? (
                  <div className="mt-2.5 flex items-center gap-1.5 text-xs text-[#8c7766]">
                    <Star className="h-3.5 w-3.5 fill-[#deb554] text-[#deb554]" />
                    <span className="font-semibold text-[#1c1815]">
                      {selected.communityRating}
                    </span>
                    <span>community rating</span>
                  </div>
                ) : null}
                {selected.pageCount ? (
                  <p className="mt-1 text-xs text-[#8c7766]">
                    Approx. {selected.pageCount} pages
                  </p>
                ) : null}
              </div>
            </div>

            {/* Workbench Form */}
            <div className="space-y-4 md:col-span-7">
              {/* Folder Selector */}
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-[#8b7563]">
                  Assign to Library Shelf
                </label>
                <div className="mt-1.5 relative">
                  <FolderIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9e8b7c]" />
                  <select
                    value={folderId}
                    onChange={(e) => setFolderId(e.target.value)}
                    className="w-full rounded-xl border border-[#e4d6c4] bg-[#fbf8f3] py-2.5 pl-10 pr-4 text-xs font-medium text-[#1c1815] focus:border-[#c59b27] focus:bg-white focus:outline-none"
                  >
                    <option value="">Main Library (Root Shelf)</option>
                    {folders.map((f) => (
                      <option key={f.id} value={f.id}>
                        {buildFolderPath(f.id, folders)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Physical Copy Checkbox */}
              <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-[#e8dac6] bg-[#fbf8f3] p-4 text-xs font-semibold text-[#1c1815] transition hover:bg-white">
                <input
                  type="checkbox"
                  checked={hasPhysical}
                  onChange={(e) => setHasPhysical(e.target.checked)}
                  className="h-4 w-4 rounded accent-[#c59b27]"
                />
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-[#1c1815]">
                    I possess a physical hardcover or paperback
                  </p>
                  <p className="text-[11px] font-normal text-[#8c7766]">
                    Enables physical timer sessions and manual reading logging.
                  </p>
                </div>
              </label>

              {/* Attach PDF File */}
              <div className="rounded-2xl border border-[#e8dac6] bg-[#fbf8f3] p-4">
                <div className="flex items-center gap-2 text-xs font-semibold text-[#1c1815]">
                  <FileUp className="h-4 w-4 text-[#c59b27]" />
                  <span>Attach Digital PDF Manuscript (Optional)</span>
                </div>
                <p className="mt-1 text-[11px] text-[#8c7766]">
                  Store locally or sync to your cloud library for in-app reading.
                </p>
                <div className="mt-3">
                  <input
                    type="file"
                    accept="application/pdf"
                    onChange={(e) => setPdfFile(e.target.files?.[0] ?? null)}
                    className="w-full text-xs text-[#6d5747] file:mr-3 file:rounded-full file:border-0 file:bg-[#241c16] file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-[#f8eedc] hover:file:bg-[#120e0b]"
                  />
                </div>
              </div>

              {/* Save Button */}
              <button
                type="button"
                onClick={saveBook}
                className="flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#b58825] via-[#c79930] to-[#ad801e] px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-white shadow-[0_4px_16px_rgba(181,136,37,0.35)] transition hover:brightness-110 active:scale-95"
              >
                <Plus className="h-4 w-4" />
                <span>Confirm & Add to Library</span>
              </button>
            </div>
          </div>
        </section>
      ) : null}

      {/* Search Results Display */}
      {hasSearched ? (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-xl font-bold text-[#1c1815]">
              Discovered Editions
            </h2>
            <p className="text-xs text-[#8c7766]">
              {results.length} {results.length === 1 ? "work found" : "works found"}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {results.map((book) => (
              <article
                key={book.id}
                className="group flex flex-col justify-between overflow-hidden rounded-[2rem] border border-[#e8dac6] bg-gradient-to-b from-white via-[#fdfcf9] to-[#faf6ef] p-5 shadow-[0_4px_24px_rgba(40,25,10,0.04)] transition-all duration-300 hover:-translate-y-1 hover:border-[#c59b27]/60 hover:shadow-lg"
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
                      <h3 className="line-clamp-2 font-serif text-base font-bold text-[#1c1815]">
                        {book.title}
                      </h3>
                      <p className="mt-1 line-clamp-1 text-xs font-medium text-[#7d6857]">
                        {book.author}
                      </p>
                      {book.communityRating ? (
                        <div className="mt-2 flex items-center gap-1 text-[11px] text-[#8c7766]">
                          <Star className="h-3 w-3 fill-[#deb554] text-[#deb554]" />
                          <span>{book.communityRating}</span>
                        </div>
                      ) : null}
                    </div>
                  </div>

                  {book.synopsis ? (
                    <p className="mt-4 line-clamp-3 text-xs leading-relaxed text-[#6d5747]">
                      {book.synopsis}
                    </p>
                  ) : null}
                </div>

                <div className="mt-5 border-t border-[#ede2d2] pt-4">
                  <button
                    type="button"
                    onClick={() => setSelected(book)}
                    className="flex w-full items-center justify-center gap-2 rounded-full bg-[#1f1712] px-4 py-2.5 text-xs font-semibold text-[#f8eedc] shadow-sm transition hover:bg-[#120d0a] active:scale-95"
                  >
                    <Plus className="h-3.5 w-3.5 text-[#deb554]" />
                    <span>Catalog to Collection</span>
                  </button>
                </div>
              </article>
            ))}
          </div>

          {!results.length && !loading ? (
            <div className="flex flex-col items-center justify-center rounded-[2.5rem] border border-dashed border-[#e4d6c4] bg-[#fdfbf7] p-12 text-center">
              <Compass className="h-10 w-10 text-[#c59b27]/60" />
              <h3 className="mt-4 font-serif text-lg font-bold text-[#1c1815]">
                No matching volumes discovered
              </h3>
              <p className="mt-1.5 max-w-sm text-xs leading-relaxed text-[#8c7766]">
                Try adjusting the query, searching by author surname, or using an alternate spelling.
              </p>
            </div>
          ) : null}
        </section>
      ) : (
        /* Empty State Inspiration */
        <section className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          <div className="rounded-[2rem] border border-[#e8dac6] bg-white p-6 shadow-sm">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100/70 text-amber-900">
              <Compass className="h-5 w-5" />
            </div>
            <h3 className="mt-4 font-serif text-base font-bold text-[#1c1815]">
              Universal Metadata
            </h3>
            <p className="mt-2 text-xs leading-relaxed text-[#8c7766]">
              Pull high-resolution book jacket art, comprehensive synopses, and publication metrics with zero friction.
            </p>
          </div>

          <div className="rounded-[2rem] border border-[#e8dac6] bg-white p-6 shadow-sm">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#ede3d4] text-[#6d5543]">
              <BookOpen className="h-5 w-5" />
            </div>
            <h3 className="mt-4 font-serif text-base font-bold text-[#1c1815]">
              Format Agnostic
            </h3>
            <p className="mt-2 text-xs leading-relaxed text-[#8c7766]">
              Read printed editions by candlelight or study digital PDFs on screen with synced reading tracking.
            </p>
          </div>

          <div className="rounded-[2rem] border border-[#e8dac6] bg-white p-6 shadow-sm">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100/70 text-emerald-900">
              <Sparkles className="h-5 w-5" />
            </div>
            <h3 className="mt-4 font-serif text-base font-bold text-[#1c1815]">
              Offline First
            </h3>
            <p className="mt-2 text-xs leading-relaxed text-[#8c7766]">
              Your library resides securely in your browser cache and seamlessly upgrades to Supabase cloud sync.
            </p>
          </div>
        </section>
      )}
    </PageShell>
  );
}
