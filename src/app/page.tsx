"use client";

import Link from "next/link";
import {
  ArrowUpRight,
  BookCheck,
  BookOpen,
  Bookmark,
  ChevronRight,
  Clock,
  FileText,
  Folder as FolderIcon,
  FolderPlus,
  Grid,
  Layers,
  List,
  PlayCircle,
  Plus,
  Search,
  Sparkles,
  Timer,
} from "lucide-react";
import { useMemo, useState } from "react";

import { BookCover } from "@/components/book-cover";
import { useBookApp } from "@/components/book-app-provider";
import { PageShell } from "@/components/page-shell";
import type { BookRecord, Folder } from "@/lib/types";
import { buildFolderPath, cn, formatHours } from "@/lib/utils";

type FilterTab = "all" | "reading" | "queued" | "finished" | "physical" | "pdf";

export default function Home() {
  const {
    books,
    folders,
    readingBooks,
    queuedBooks,
    finishedBooks,
    activeSession,
    activeBook,
    addFolder,
    bookHasReadableFormat,
  } = useBookApp();

  const [folderName, setFolderName] = useState("");
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [selectedBook, setSelectedBook] = useState<BookRecord | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [filterTab, setFilterTab] = useState<FilterTab>("all");
  const [searchFilter, setSearchFilter] = useState("");

  const folderMap = useMemo(
    () => new Map(folders.map((folder) => [folder.id, folder])),
    [folders],
  );

  const currentFolder = currentFolderId ? folderMap.get(currentFolderId) ?? null : null;
  const childFolders = folders.filter((folder) => folder.parentId === currentFolderId);

  // Breadcrumbs
  const breadcrumbFolders = useMemo(() => {
    const chain: Folder[] = [];
    let cursor = currentFolder;
    while (cursor) {
      chain.unshift(cursor);
      cursor = cursor.parentId ? folderMap.get(cursor.parentId) ?? null : null;
    }
    return chain;
  }, [currentFolder, folderMap]);

  // Filter books
  const visibleBooks = useMemo(() => {
    let result = books.filter((book) => book.folderId === currentFolderId);

    if (filterTab === "reading") {
      result = result.filter((b) => b.status === "reading");
    } else if (filterTab === "queued") {
      result = result.filter((b) => b.status === "queued");
    } else if (filterTab === "finished") {
      result = result.filter((b) => b.status === "finished");
    } else if (filterTab === "physical") {
      result = result.filter((b) => b.hasPhysical);
    } else if (filterTab === "pdf") {
      result = result.filter((b) => b.pdfLabel || b.pdfUrl);
    }

    if (searchFilter.trim()) {
      const q = searchFilter.toLowerCase();
      result = result.filter(
        (b) =>
          b.title.toLowerCase().includes(q) ||
          b.author.toLowerCase().includes(q) ||
          b.synopsis.toLowerCase().includes(q),
      );
    }

    return result;
  }, [books, currentFolderId, filterTab, searchFilter]);

  const currentFolderLabel = currentFolder
    ? buildFolderPath(currentFolder.id, folders)
    : "Main Library";

  function getBookAction(book: BookRecord) {
    if (book.status === "finished") {
      return { label: "Review Volume", href: `/review?book=${book.id}`, variant: "finished" as const };
    }
    if (book.status === "reading") {
      return { label: "Continue Reading", href: `/read?book=${book.id}`, variant: "reading" as const };
    }
    if (bookHasReadableFormat(book)) {
      return { label: "Begin Reading", href: `/read?book=${book.id}`, variant: "ready" as const };
    }
    return { label: "Select Format", href: `/read?book=${book.id}`, variant: "neutral" as const };
  }

  const totalReadingSeconds = books.reduce((sum, b) => sum + b.totalSeconds, 0);

  return (
    <PageShell
      eyebrow="The Private Collection"
      title="Atelier Library"
      description="Curate your volumes, organize nested library shelves, and transition seamlessly between physical books and digital manuscripts."
      actions={
        <div className="flex items-center gap-2.5">
          <Link
            href="/search"
            className="flex items-center gap-2 rounded-full bg-gradient-to-r from-[#b58825] via-[#c79930] to-[#ad801e] px-4 py-2.5 text-xs font-semibold text-white shadow-[0_4px_16px_rgba(181,136,37,0.35)] transition hover:brightness-110 active:scale-95"
          >
            <Plus className="h-4 w-4" />
            <span>Discover & Add Books</span>
          </Link>
        </div>
      }
    >
      {/* Top Metric Highlights */}
      <section className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:gap-4">
        {/* Card 1: Currently Reading */}
        <Link
          href="/continue"
          className="group relative overflow-hidden rounded-[1.75rem] border border-[#e8dac6] bg-gradient-to-br from-white via-[#fdfcf9] to-[#fbf7ee] p-5 shadow-[0_4px_20px_rgba(40,25,10,0.04)] transition hover:border-[#c59b27]/50 hover:shadow-md"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#8b7563]">
              In Hand Now
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-100/70 text-amber-800 transition group-hover:scale-110">
              <BookOpen className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-3 font-serif text-3xl font-bold text-[#1e1713]">
            {readingBooks.length}
          </p>
          <p className="mt-1 text-xs text-[#8c7766]">
            {readingBooks.length === 1 ? "1 volume active" : `${readingBooks.length} volumes active`}
          </p>
        </Link>

        {/* Card 2: To Read Queue */}
        <div className="relative overflow-hidden rounded-[1.75rem] border border-[#e8dac6] bg-gradient-to-br from-white via-[#fdfcf9] to-[#fbf7ee] p-5 shadow-[0_4px_20px_rgba(40,25,10,0.04)]">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#8b7563]">
              To Be Read
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#ede3d4] text-[#6d5543]">
              <Bookmark className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-3 font-serif text-3xl font-bold text-[#1e1713]">
            {queuedBooks.length}
          </p>
          <p className="mt-1 text-xs text-[#8c7766]">Awaiting initiation</p>
        </div>

        {/* Card 3: Completed */}
        <Link
          href="/review"
          className="group relative overflow-hidden rounded-[1.75rem] border border-[#e8dac6] bg-gradient-to-br from-white via-[#fdfcf9] to-[#fbf7ee] p-5 shadow-[0_4px_20px_rgba(40,25,10,0.04)] transition hover:border-[#c59b27]/50 hover:shadow-md"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#8b7563]">
              Completed
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-100/70 text-emerald-800 transition group-hover:scale-110">
              <BookCheck className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-3 font-serif text-3xl font-bold text-[#1e1713]">
            {finishedBooks.length}
          </p>
          <p className="mt-1 text-xs text-[#8c7766]">Volumes reviewed</p>
        </Link>

        {/* Card 4: Reading Clock / Active Live */}
        <Link
          href="/read"
          className={cn(
            "group relative overflow-hidden rounded-[1.75rem] p-5 text-white transition hover:shadow-xl",
            activeSession
              ? "bg-gradient-to-br from-[#2a1e16] via-[#1f1712] to-[#120e0b] ring-2 ring-[#c59b27]"
              : "bg-gradient-to-br from-[#241c17] via-[#1c1511] to-[#140e0b] border border-white/10",
          )}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#dfc385]">
              {activeSession ? "Live Timer" : "Chronometer"}
            </span>
            <div
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-xl",
                activeSession ? "bg-[#c59b27] text-white animate-pulse" : "bg-white/10 text-[#dfc385]",
              )}
            >
              <Timer className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-3 font-serif text-3xl font-bold tracking-tight text-white">
            {formatHours(totalReadingSeconds)}
          </p>
          <p className="mt-1 flex items-center gap-1 text-xs text-[#c9b4a1]">
            <span>{activeSession ? "Session running" : "Total logged"}</span>
            <ArrowUpRight className="h-3 w-3 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </p>
        </Link>
      </section>

      {/* Main Responsive Grid Layout (Desktop: Sidebar + Main Stage) */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:items-start">
        {/* Left Column: Folders & Catalog Navigation (Desktop: 4 columns) */}
        <aside className="space-y-6 lg:col-span-4">
          {/* Folders Management Panel */}
          <div className="rounded-[2rem] border border-[#e8dac6] bg-gradient-to-b from-white to-[#fcfaf6] p-6 shadow-[0_4px_24px_rgba(40,25,10,0.04)]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-100/70 text-amber-900">
                  <Layers className="h-4 w-4" />
                </div>
                <div>
                  <h2 className="font-serif text-lg font-bold text-[#1c1815]">
                    Library Shelves
                  </h2>
                  <p className="text-[11px] text-[#857161]">
                    {folders.length} {folders.length === 1 ? "shelf" : "shelves"} cataloged
                  </p>
                </div>
              </div>
            </div>

            {/* Folder Tree List */}
            <div className="mt-4 space-y-1.5">
              <button
                type="button"
                onClick={() => setCurrentFolderId(null)}
                className={cn(
                  "flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-semibold transition-all",
                  currentFolderId === null
                    ? "bg-[#1f1712] text-[#f7eedc] shadow-sm ring-1 ring-white/10"
                    : "text-[#624f41] hover:bg-[#f5ece0] hover:text-[#1c1815]",
                )}
              >
                <div className="flex items-center gap-2.5">
                  <BookOpen className="h-3.5 w-3.5 text-[#deb554]" />
                  <span>Main Library (All Root)</span>
                </div>
                <span
                  className={cn(
                    "rounded-full px-2 py-0.5 text-[10px]",
                    currentFolderId === null ? "bg-[#c59b27]/30 text-[#f5eed0]" : "bg-[#ebe0d1] text-[#6d5747]",
                  )}
                >
                  {books.filter((b) => b.folderId === null).length}
                </span>
              </button>

              {folders.map((folder) => {
                const count = books.filter((b) => b.folderId === folder.id).length;
                const isSelected = currentFolderId === folder.id;

                return (
                  <button
                    key={folder.id}
                    type="button"
                    onClick={() => setCurrentFolderId(folder.id)}
                    className={cn(
                      "flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-semibold transition-all",
                      isSelected
                        ? "bg-[#1f1712] text-[#f7eedc] shadow-sm ring-1 ring-white/10"
                        : "text-[#624f41] hover:bg-[#f5ece0] hover:text-[#1c1815]",
                    )}
                  >
                    <div className="flex min-w-0 items-center gap-2.5">
                      <FolderIcon
                        className={cn(
                          "h-3.5 w-3.5 shrink-0",
                          isSelected ? "text-[#deb554]" : "text-[#9c7a2b]",
                        )}
                      />
                      <span className="truncate">{folder.name}</span>
                    </div>
                    <span
                      className={cn(
                        "rounded-full px-2 py-0.5 text-[10px]",
                        isSelected ? "bg-[#c59b27]/30 text-[#f5eed0]" : "bg-[#ebe0d1] text-[#6d5747]",
                      )}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Create New Folder Form */}
            <form
              className="mt-5 border-t border-[#ede2d2] pt-4"
              onSubmit={(e) => {
                e.preventDefault();
                if (folderName.trim()) {
                  void addFolder(folderName.trim(), currentFolderId);
                  setFolderName("");
                }
              }}
            >
              <label className="text-[11px] font-semibold uppercase tracking-wider text-[#8b7563]">
                Add Shelf inside {currentFolder ? currentFolder.name : "root"}
              </label>
              <div className="mt-2 flex gap-2">
                <input
                  value={folderName}
                  onChange={(e) => setFolderName(e.target.value)}
                  placeholder="e.g. Classical Philosophy"
                  className="min-w-0 flex-1 rounded-xl border border-[#e4d6c4] bg-[#fbf8f3] px-3.5 py-2 text-xs text-[#1c1815] placeholder:text-[#9e8b7b] focus:border-[#c59b27] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#c59b27]"
                />
                <button
                  type="submit"
                  disabled={!folderName.trim()}
                  className="flex shrink-0 items-center justify-center rounded-xl bg-[#241c16] px-3 py-2 text-xs font-semibold text-[#f8eedc] shadow-sm hover:bg-[#150f0c] disabled:opacity-40"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>
            </form>
          </div>

          {/* Quick Discover Callout */}
          <div className="relative overflow-hidden rounded-[2rem] border border-[#c59b27]/30 bg-gradient-to-br from-[#261d17] to-[#16100d] p-6 text-white shadow-md">
            <div className="relative z-10">
              <span className="rounded-full border border-[#c59b27]/40 bg-[#c59b27]/20 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[#f8eedc]">
                Open Library Catalog
              </span>
              <h3 className="mt-3 font-serif text-lg font-bold text-[#faf6ee]">
                Expand Your Collection
              </h3>
              <p className="mt-1.5 text-xs leading-relaxed text-[#c7b4a2]">
                Instantly search millions of published editions, link your own PDFs, or catalog physical hardcovers.
              </p>
              <Link
                href="/search"
                className="mt-4 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#b58825] to-[#c79930] px-4 py-2 text-xs font-semibold text-white shadow-md hover:brightness-110"
              >
                <Search className="h-3.5 w-3.5" />
                <span>Search Books</span>
              </Link>
            </div>
          </div>
        </aside>

        {/* Right Column: Library Volumes Gallery (Desktop: 8 columns) */}
        <main className="space-y-5 lg:col-span-8">
          {/* Shelf Navigation & Search Toolbar */}
          <div className="rounded-[2rem] border border-[#e8dac6] bg-white p-5 shadow-[0_4px_24px_rgba(40,25,10,0.04)]">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              {/* Breadcrumb Path */}
              <div>
                <div className="flex flex-wrap items-center gap-1.5 text-xs text-[#8c7664]">
                  <button
                    type="button"
                    onClick={() => setCurrentFolderId(null)}
                    className={cn(
                      "rounded-lg px-2.5 py-1 font-medium transition",
                      currentFolderId === null
                        ? "bg-[#1f1712] text-white"
                        : "bg-[#f5ece0] text-[#554336] hover:bg-[#ebdcc8]",
                    )}
                  >
                    Root
                  </button>
                  {breadcrumbFolders.map((f) => (
                    <div key={f.id} className="flex items-center gap-1.5">
                      <ChevronRight className="h-3.5 w-3.5 text-[#b09d8c]" />
                      <button
                        type="button"
                        onClick={() => setCurrentFolderId(f.id)}
                        className="rounded-lg bg-[#f5ece0] px-2.5 py-1 font-medium text-[#554336] hover:bg-[#ebdcc8]"
                      >
                        {f.name}
                      </button>
                    </div>
                  ))}
                </div>
                <h2 className="mt-2 font-serif text-xl font-bold text-[#1c1815]">
                  {currentFolderLabel}
                </h2>
              </div>

              {/* View Switcher & Search Input */}
              <div className="flex items-center gap-2.5">
                <div className="relative flex-1 sm:w-48">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#9e8b7c]" />
                  <input
                    value={searchFilter}
                    onChange={(e) => setSearchFilter(e.target.value)}
                    placeholder="Filter shelf..."
                    className="w-full rounded-xl border border-[#e4d6c4] bg-[#fbf8f3] py-1.5 pl-8 pr-3 text-xs text-[#1c1815] placeholder:text-[#9e8b7c] focus:border-[#c59b27] focus:bg-white focus:outline-none"
                  />
                </div>

                <div className="flex items-center rounded-xl border border-[#e4d6c4] bg-[#f8f2e7] p-1">
                  <button
                    type="button"
                    onClick={() => setViewMode("grid")}
                    className={cn(
                      "rounded-lg p-1.5 transition",
                      viewMode === "grid"
                        ? "bg-white text-[#1c1815] shadow-sm"
                        : "text-[#8c7766] hover:text-[#1c1815]",
                    )}
                    aria-label="Grid view"
                  >
                    <Grid className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode("list")}
                    className={cn(
                      "rounded-lg p-1.5 transition",
                      viewMode === "list"
                        ? "bg-white text-[#1c1815] shadow-sm"
                        : "text-[#8c7766] hover:text-[#1c1815]",
                    )}
                    aria-label="List view"
                  >
                    <List className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Filter Pills */}
            <div className="mt-4 flex flex-wrap gap-1.5 border-t border-[#f0e4d4] pt-3">
              {[
                { id: "all", label: "All Volumes" },
                { id: "reading", label: "In Progress" },
                { id: "queued", label: "To Read" },
                { id: "finished", label: "Finished" },
                { id: "physical", label: "Physical Copy" },
                { id: "pdf", label: "Digital PDF" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setFilterTab(tab.id as FilterTab)}
                  className={cn(
                    "rounded-full px-3 py-1 text-xs font-semibold transition",
                    filterTab === tab.id
                      ? "bg-[#241c16] text-[#f7eedc] shadow-sm"
                      : "bg-[#f5ece0]/80 text-[#675446] hover:bg-[#ede0cf]",
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Subfolders in Current Folder */}
          {childFolders.length > 0 ? (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
              {childFolders.map((folder) => {
                const subCount = books.filter((b) => b.folderId === folder.id).length;

                return (
                  <button
                    key={folder.id}
                    type="button"
                    onClick={() => setCurrentFolderId(folder.id)}
                    className="group flex items-center justify-between rounded-2xl border border-[#e8dac6] bg-gradient-to-r from-white to-[#fbf8f3] p-4 text-left shadow-[0_2px_12px_rgba(40,25,10,0.03)] transition hover:border-[#c59b27]/60 hover:shadow-md"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100/70 text-amber-900 transition group-hover:scale-105">
                        <FolderIcon className="h-5 w-5" />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-[#1c1815]">
                          {folder.name}
                        </p>
                        <p className="text-[11px] text-[#8c7766]">
                          {subCount} {subCount === 1 ? "volume" : "volumes"}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-[#b09d8c] transition group-hover:translate-x-0.5 group-hover:text-[#1c1815]" />
                  </button>
                );
              })}
            </div>
          ) : null}

          {/* Book Collection Display */}
          {viewMode === "grid" ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
              {visibleBooks.map((book) => {
                const action = getBookAction(book);

                return (
                  <article
                    key={book.id}
                    className="group relative flex flex-col justify-between overflow-hidden rounded-[2rem] border border-[#e8dac6] bg-gradient-to-b from-white via-[#fdfcf9] to-[#faf6ef] p-5 shadow-[0_4px_24px_rgba(40,25,10,0.04)] transition-all duration-300 hover:-translate-y-1 hover:border-[#c59b27]/50 hover:shadow-[0_12px_32px_rgba(40,25,10,0.09)]"
                  >
                    <div>
                      {/* Top Badges */}
                      <div className="flex items-center justify-between gap-2">
                        <span
                          className={cn(
                            "rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider",
                            book.status === "finished"
                              ? "bg-emerald-100/80 text-emerald-800 border border-emerald-300/50"
                              : book.status === "reading"
                                ? "bg-amber-100/80 text-amber-900 border border-amber-300/50"
                                : "bg-[#ede3d4] text-[#635041]",
                          )}
                        >
                          {book.status === "reading"
                            ? "In Progress"
                            : book.status === "finished"
                              ? "Finished"
                              : "Queued"}
                        </span>

                        <div className="flex items-center gap-1 text-[11px] text-[#8c7766]">
                          <Clock className="h-3 w-3" />
                          <span>{formatHours(book.totalSeconds)}</span>
                        </div>
                      </div>

                      {/* Book Cover & Info */}
                      <div className="mt-4 flex gap-4">
                        <button
                          type="button"
                          onClick={() => setSelectedBook(book)}
                          className="shrink-0 text-left cursor-pointer transition-transform group-hover:scale-105"
                        >
                          <BookCover
                            title={book.title}
                            coverUrl={book.coverUrl}
                            author={book.author}
                            size="md"
                          />
                        </button>

                        <div className="min-w-0 flex-1">
                          <button
                            type="button"
                            onClick={() => setSelectedBook(book)}
                            className="text-left w-full cursor-pointer"
                          >
                            <h3 className="line-clamp-2 font-serif text-base font-bold text-[#1c1815] transition group-hover:text-[#966b1a]">
                              {book.title}
                            </h3>
                          </button>
                          <p className="mt-1 line-clamp-1 text-xs font-medium text-[#7d6857]">
                            {book.author}
                          </p>

                          {/* Formats available */}
                          <div className="mt-3 flex flex-wrap gap-1.5">
                            {book.hasPhysical ? (
                              <span className="inline-flex items-center gap-1 rounded-md bg-[#ede3d4] px-2 py-0.5 text-[10px] font-medium text-[#5a483a]">
                                <span>📖</span> Physical
                              </span>
                            ) : null}
                            {book.pdfLabel || book.pdfUrl ? (
                              <span className="inline-flex items-center gap-1 rounded-md bg-amber-100/70 px-2 py-0.5 text-[10px] font-medium text-amber-900">
                                <span>📄</span> PDF
                              </span>
                            ) : null}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Action Footer */}
                    <div className="mt-5 flex items-center justify-between gap-2 border-t border-[#ede2d2] pt-4">
                      <button
                        type="button"
                        onClick={() => setSelectedBook(book)}
                        className="text-xs font-semibold text-[#8c7766] hover:text-[#1c1815]"
                      >
                        Inspect Details
                      </button>

                      <Link
                        href={action.href}
                        className={cn(
                          "inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold shadow-sm transition active:scale-95",
                          action.variant === "reading"
                            ? "bg-[#1f1712] text-[#f7eedc] hover:bg-[#120d0a]"
                            : action.variant === "finished"
                              ? "bg-emerald-800 text-white hover:bg-emerald-900"
                              : "bg-[#c59b27] text-white hover:bg-[#ad841d]",
                        )}
                      >
                        <PlayCircle className="h-3.5 w-3.5" />
                        <span>{action.label}</span>
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            /* List View */
            <div className="space-y-3">
              {visibleBooks.map((book) => {
                const action = getBookAction(book);

                return (
                  <article
                    key={book.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-[#e8dac6] bg-white p-4 shadow-[0_2px_12px_rgba(40,25,10,0.03)] transition hover:border-[#c59b27]/60 hover:shadow-md"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <BookCover
                        title={book.title}
                        coverUrl={book.coverUrl}
                        author={book.author}
                        size="sm"
                      />
                      <div className="min-w-0">
                        <button
                          type="button"
                          onClick={() => setSelectedBook(book)}
                          className="text-left font-serif text-base font-bold text-[#1c1815] hover:text-[#966b1a] truncate block"
                        >
                          {book.title}
                        </button>
                        <p className="text-xs text-[#7d6857] truncate">{book.author}</p>
                        <div className="mt-1 flex items-center gap-2 text-[11px] text-[#8c7766]">
                          <span>{book.status === "reading" ? "In Progress" : book.status === "finished" ? "Finished" : "Queued"}</span>
                          <span>•</span>
                          <span>{formatHours(book.totalSeconds)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5 shrink-0 self-end sm:self-center">
                      <button
                        type="button"
                        onClick={() => setSelectedBook(book)}
                        className="rounded-full bg-[#f5ece0] px-3 py-1.5 text-xs font-semibold text-[#5a483a] hover:bg-[#ede0cf]"
                      >
                        Details
                      </button>
                      <Link
                        href={action.href}
                        className="rounded-full bg-[#1f1712] px-3.5 py-1.5 text-xs font-semibold text-[#f7eedc] hover:bg-[#120d0a]"
                      >
                        {action.label}
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>
          )}

          {/* Empty State */}
          {!visibleBooks.length && !childFolders.length ? (
            <div className="flex flex-col items-center justify-center rounded-[2.5rem] border border-dashed border-[#e4d6c4] bg-[#fdfbf7] p-10 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100/60 text-[#c59b27]">
                <BookOpen className="h-7 w-7" />
              </div>
              <h3 className="mt-4 font-serif text-lg font-bold text-[#1c1815]">
                This shelf is currently empty
              </h3>
              <p className="mt-1.5 max-w-sm text-xs leading-relaxed text-[#8c7766]">
                Explore published literature, add personal PDFs, or catalog existing hardcovers into this section.
              </p>
              <Link
                href="/search"
                className="mt-5 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#b58825] to-[#c79930] px-5 py-2.5 text-xs font-semibold text-white shadow-md hover:brightness-110"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Search Books to Add</span>
              </Link>
            </div>
          ) : null}
        </main>
      </div>

      {/* Selected Book Slipcase Modal */}
      {selectedBook ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#120e0b]/60 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-lg overflow-hidden rounded-[2.5rem] border border-[#c59b27]/30 bg-gradient-to-b from-white via-[#fdfcf9] to-[#fbf7ee] p-6 sm:p-8 shadow-[0_25px_60px_rgba(20,15,10,0.35)]">
            <div className="flex gap-5">
              <BookCover
                title={selectedBook.title}
                coverUrl={selectedBook.coverUrl}
                author={selectedBook.author}
                size="lg"
              />
              <div className="min-w-0 flex-1">
                <span className="rounded-full border border-[#c59b27]/40 bg-[#c59b27]/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#9c7a2b]">
                  {selectedBook.status === "reading"
                    ? "In Progress"
                    : selectedBook.status === "finished"
                      ? "Finished"
                      : "Awaiting Reading"}
                </span>
                <h3 className="mt-2 font-serif text-xl font-bold leading-snug text-[#1c1815]">
                  {selectedBook.title}
                </h3>
                <p className="mt-1 text-xs font-medium text-[#7d6857]">
                  {selectedBook.author}
                </p>
                <p className="mt-2.5 text-xs text-[#8c7766]">
                  Shelf:{" "}
                  <span className="font-semibold text-[#1c1815]">
                    {buildFolderPath(selectedBook.folderId, folders)}
                  </span>
                </p>
                <p className="mt-1 text-xs text-[#8c7766]">
                  Time logged:{" "}
                  <span className="font-semibold text-[#1c1815]">
                    {formatHours(selectedBook.totalSeconds)}
                  </span>
                </p>
              </div>
            </div>

            {/* Synopsis */}
            {selectedBook.synopsis ? (
              <div className="mt-5 rounded-2xl border border-[#ede2d2] bg-[#f8f3ea]/70 p-4">
                <p className="text-[11px] font-bold uppercase tracking-wider text-[#8b7563]">
                  Synopsis & Overview
                </p>
                <p className="mt-2 line-clamp-4 text-xs leading-relaxed text-[#554336]">
                  {selectedBook.synopsis}
                </p>
              </div>
            ) : null}

            {/* Actions */}
            <div className="mt-6 flex flex-col gap-2.5 sm:flex-row">
              <Link
                href={getBookAction(selectedBook).href}
                className="flex flex-1 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#241c16] to-[#120e0b] px-5 py-3 text-xs font-semibold text-[#f8eedc] shadow-md transition hover:scale-[1.02] active:scale-95"
              >
                <PlayCircle className="h-4 w-4 text-[#deb554]" />
                <span>{getBookAction(selectedBook).label}</span>
              </Link>
              <button
                type="button"
                onClick={() => setSelectedBook(null)}
                className="rounded-full border border-[#e4d6c4] bg-white px-5 py-3 text-xs font-semibold text-[#6d5747] hover:bg-[#f5ece0]"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </PageShell>
  );
}
