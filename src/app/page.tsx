"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BookCheck,
  BookOpen,
  Check,
  ChevronRight,
  Clock,
  Folder as FolderIcon,
  FolderPlus,
  PlayCircle,
  Plus,
  Radio,
  Search,
  Sparkles,
  X,
} from "lucide-react";

import { BookCover } from "@/components/book-cover";
import { useBookApp } from "@/components/book-app-provider";
import { PageShell } from "@/components/page-shell";
import type { BookRecord, Folder } from "@/lib/types";
import { buildFolderPath, cn, formatHours } from "@/lib/utils";

export default function Home() {
  const {
    books,
    folders,
    readingBooks,
    activeSession,
    activeBook,
    addFolder,
  } = useBookApp();

  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [selectedBook, setSelectedBook] = useState<BookRecord | null>(null);
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");

  const folderMap = useMemo(
    () => new Map(folders.map((f) => [f.id, f])),
    [folders],
  );

  const currentFolder = currentFolderId ? folderMap.get(currentFolderId) ?? null : null;
  const childFolders = folders.filter((f) => f.parentId === currentFolderId);
  const visibleBooks = books.filter((b) => b.folderId === currentFolderId);

  // Breadcrumbs
  const breadcrumbs = useMemo(() => {
    const list: Folder[] = [];
    let cursor = currentFolder;
    while (cursor) {
      list.unshift(cursor);
      cursor = cursor.parentId ? folderMap.get(cursor.parentId) ?? null : null;
    }
    return list;
  }, [currentFolder, folderMap]);

  async function handleCreateFolder(e: React.FormEvent) {
    e.preventDefault();
    if (!newFolderName.trim()) return;

    await addFolder(newFolderName.trim(), currentFolderId);
    setNewFolderName("");
    setIsCreatingFolder(false);
  }

  return (
    <PageShell
      eyebrow="BookTrail"
      title="Your Library"
      description="Quickly jump back into what you are reading, or organize your collection into folders."
      actions={
        <Link
          href="/search"
          className="flex items-center gap-1.5 rounded-full bg-gradient-to-r from-[#b58825] to-[#c79930] px-4 py-2 text-xs font-semibold text-white shadow-sm hover:brightness-110 active:scale-95"
        >
          <Plus className="h-4 w-4" />
          <span>Add Books</span>
        </Link>
      }
    >
      {/* 1. Quick Access: Books Already Being Read */}
      {readingBooks.length > 0 ? (
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
              <h2 className="font-serif text-lg font-bold text-[#1c1815]">
                Jump Back In
              </h2>
            </div>
            <Link
              href="/continue"
              className="text-xs font-semibold text-[#966b1a] hover:underline"
            >
              View all in-progress ({readingBooks.length})
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
            {readingBooks.map((book) => {
              const isCurrentlyActive = activeSession?.bookId === book.id;

              return (
                <div
                  key={book.id}
                  className={cn(
                    "group relative flex flex-col justify-between rounded-2xl border p-4 shadow-sm transition hover:shadow-md",
                    isCurrentlyActive
                      ? "border-[#c59b27] bg-gradient-to-br from-[#241c16] to-[#140e0b] text-white"
                      : "border-[#e8dac6] bg-white text-[#1c1815]",
                  )}
                >
                  <div className="flex gap-3.5">
                    <BookCover
                      title={book.title}
                      coverUrl={book.coverUrl}
                      author={book.author}
                      size="sm"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={cn(
                            "rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider",
                            isCurrentlyActive
                              ? "bg-[#c59b27] text-white"
                              : "bg-amber-100/80 text-amber-900",
                          )}
                        >
                          {isCurrentlyActive ? "Timer Live" : "In Progress"}
                        </span>
                      </div>

                      <h3
                        className={cn(
                          "mt-1 font-serif text-sm font-bold line-clamp-1",
                          isCurrentlyActive ? "text-white" : "text-[#1c1815]",
                        )}
                      >
                        {book.title}
                      </h3>
                      <p
                        className={cn(
                          "text-xs line-clamp-1",
                          isCurrentlyActive ? "text-[#d1c0b0]" : "text-[#7d6857]",
                        )}
                      >
                        {book.author}
                      </p>

                      <div
                        className={cn(
                          "mt-2 flex items-center gap-1 text-[11px]",
                          isCurrentlyActive ? "text-[#dfc385]" : "text-[#8c7766]",
                        )}
                      >
                        <Clock className="h-3 w-3" />
                        <span>{formatHours(book.totalSeconds)} read</span>
                      </div>
                    </div>
                  </div>

                  <Link
                    href={`/read?book=${book.id}`}
                    className={cn(
                      "mt-3 flex items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-semibold shadow-sm transition active:scale-95",
                      isCurrentlyActive
                        ? "bg-gradient-to-r from-[#c59b27] to-[#deb554] text-[#1c140d] hover:brightness-110"
                        : "bg-[#1f1712] text-[#f8eedc] hover:bg-[#120d0a]",
                    )}
                  >
                    <PlayCircle className="h-3.5 w-3.5" />
                    <span>Continue Reading</span>
                  </Link>
                </div>
              );
            })}
          </div>
        </section>
      ) : null}

      {/* 2. Your Books & Folders Section */}
      <section className="space-y-4 rounded-3xl border border-[#e8dac6] bg-white p-5 sm:p-7 shadow-sm">
        {/* Navigation & Action Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#f0e4d4] pb-4">
          {/* Breadcrumbs Path */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <button
              type="button"
              onClick={() => setCurrentFolderId(null)}
              className={cn(
                "rounded-lg px-2.5 py-1 font-semibold transition",
                currentFolderId === null
                  ? "bg-[#1f1712] text-white"
                  : "bg-[#f5ece0] text-[#554336] hover:bg-[#ebdcc8]",
              )}
            >
              Main Library
            </button>
            {breadcrumbs.map((f) => (
              <div key={f.id} className="flex items-center gap-1.5">
                <ChevronRight className="h-3.5 w-3.5 text-[#b09d8c]" />
                <button
                  type="button"
                  onClick={() => setCurrentFolderId(f.id)}
                  className={cn(
                    "rounded-lg px-2.5 py-1 font-semibold transition",
                    currentFolderId === f.id
                      ? "bg-[#1f1712] text-white"
                      : "bg-[#f5ece0] text-[#554336] hover:bg-[#ebdcc8]",
                  )}
                >
                  {f.name}
                </button>
              </div>
            ))}
          </div>

          {/* Action: + New Folder Button */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setIsCreatingFolder(true)}
              className="flex items-center gap-1.5 rounded-xl border border-[#c59b27]/60 bg-[#fdfaf2] px-3.5 py-2 text-xs font-semibold text-[#886217] shadow-sm hover:bg-[#fbf4e2] active:scale-95"
            >
              <FolderPlus className="h-4 w-4 text-[#c59b27]" />
              <span>+ New Folder</span>
            </button>
          </div>
        </div>

        {/* Create Folder Inline Modal / Popover */}
        {isCreatingFolder ? (
          <form
            onSubmit={handleCreateFolder}
            className="flex flex-col sm:flex-row items-center gap-2 rounded-2xl border border-[#c59b27]/40 bg-[#fdfaf2] p-3 animate-in fade-in"
          >
            <div className="flex items-center gap-2 flex-1 w-full">
              <FolderIcon className="h-4 w-4 text-[#c59b27] shrink-0" />
              <input
                autoFocus
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                placeholder={`Name for folder inside ${currentFolder?.name ?? "Main Library"}...`}
                className="w-full rounded-xl border border-[#e4d6c4] bg-white px-3 py-2 text-xs text-[#1c1815] focus:border-[#c59b27] focus:outline-none"
              />
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <button
                type="submit"
                disabled={!newFolderName.trim()}
                className="rounded-xl bg-[#1f1712] px-4 py-2 text-xs font-semibold text-[#f8eedc] hover:bg-[#120d0a] disabled:opacity-40"
              >
                Create
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsCreatingFolder(false);
                  setNewFolderName("");
                }}
                className="rounded-xl border border-[#e4d6c4] bg-white px-3 py-2 text-xs font-semibold text-[#6d5747] hover:bg-[#f5ece0]"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : null}

        {/* Subfolders in Current Location */}
        {childFolders.length > 0 ? (
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 md:grid-cols-4">
            {childFolders.map((folder) => {
              const bookCount = books.filter((b) => b.folderId === folder.id).length;

              return (
                <button
                  key={folder.id}
                  type="button"
                  onClick={() => setCurrentFolderId(folder.id)}
                  className="group flex items-center justify-between rounded-xl border border-[#e8dac6] bg-[#fbf8f3] p-3 text-left transition hover:border-[#c59b27] hover:bg-white hover:shadow-sm"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <FolderIcon className="h-4 w-4 shrink-0 text-[#c59b27]" />
                    <span className="truncate text-xs font-semibold text-[#1c1815]">
                      {folder.name}
                    </span>
                  </div>
                  <span className="rounded-full bg-[#ede2d2] px-2 py-0.5 text-[10px] text-[#6d5543] shrink-0">
                    {bookCount}
                  </span>
                </button>
              );
            })}
          </div>
        ) : null}

        {/* Books List in Current Location */}
        <div className="space-y-3 pt-2">
          {visibleBooks.map((book) => {
            const isFinished = book.status === "finished";
            const isReading = book.status === "reading";

            return (
              <article
                key={book.id}
                className="group flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 rounded-2xl border border-[#e8dac6] bg-[#fdfcf9] p-3.5 sm:p-4 shadow-sm transition hover:border-[#c59b27]/60 hover:shadow-md"
              >
                {/* Book Cover & Details */}
                <div className="flex items-center gap-3.5 min-w-0 flex-1">
                  <button
                    type="button"
                    onClick={() => setSelectedBook(book)}
                    className="shrink-0 cursor-pointer"
                  >
                    <BookCover
                      title={book.title}
                      coverUrl={book.coverUrl}
                      author={book.author}
                      size="sm"
                    />
                  </button>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      {/* Exact Badges Requested: Finished, In Progress, or Not Started */}
                      {isFinished ? (
                        <span className="inline-flex items-center gap-1 rounded-full border border-emerald-300 bg-emerald-100/80 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-900">
                          <Check className="h-3 w-3 text-emerald-700" />
                          <span>Finished</span>
                        </span>
                      ) : isReading ? (
                        <span className="inline-flex items-center gap-1 rounded-full border border-amber-300 bg-amber-100/80 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-900">
                          <span className="h-1.5 w-1.5 rounded-full bg-amber-600 animate-pulse" />
                          <span>In Progress</span>
                        </span>
                      ) : (
                        <span className="rounded-full bg-[#ede2d2] px-2.5 py-0.5 text-[10px] font-medium text-[#635041]">
                          Not Started
                        </span>
                      )}

                      {book.hasPhysical ? (
                        <span className="text-[10px] text-[#8c7766]">📖 Physical</span>
                      ) : book.pdfLabel || book.pdfUrl ? (
                        <span className="text-[10px] text-[#8c7766]">📄 PDF</span>
                      ) : null}
                    </div>

                    <button
                      type="button"
                      onClick={() => setSelectedBook(book)}
                      className="text-left font-serif text-sm sm:text-base font-bold text-[#1c1815] hover:text-[#966b1a] truncate block mt-1"
                    >
                      {book.title}
                    </button>
                    <p className="text-xs text-[#7d6857] truncate">{book.author}</p>

                    {book.totalSeconds > 0 ? (
                      <p className="mt-1 text-[11px] text-[#8c7766]">
                        {formatHours(book.totalSeconds)} logged
                      </p>
                    ) : null}
                  </div>
                </div>

                {/* Primary Action Button */}
                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                  {isFinished ? (
                    <Link
                      href={`/review?book=${book.id}`}
                      className="flex items-center gap-1.5 rounded-xl border border-emerald-300 bg-emerald-50 px-3.5 py-2 text-xs font-semibold text-emerald-900 hover:bg-emerald-100"
                    >
                      <BookCheck className="h-3.5 w-3.5 text-emerald-700" />
                      <span>Review</span>
                    </Link>
                  ) : isReading ? (
                    <Link
                      href={`/read?book=${book.id}`}
                      className="flex items-center gap-1.5 rounded-xl bg-[#1f1712] px-4 py-2 text-xs font-semibold text-[#f8eedc] shadow-sm hover:bg-[#120d0a] active:scale-95"
                    >
                      <PlayCircle className="h-3.5 w-3.5 text-[#deb554]" />
                      <span>Continue Reading</span>
                    </Link>
                  ) : (
                    <Link
                      href={`/read?book=${book.id}`}
                      className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-[#b58825] to-[#c79930] px-4 py-2 text-xs font-semibold text-white shadow-sm hover:brightness-110 active:scale-95"
                    >
                      <PlayCircle className="h-3.5 w-3.5" />
                      <span>Start Reading</span>
                    </Link>
                  )}
                </div>
              </article>
            );
          })}

          {/* Empty Folder State */}
          {!visibleBooks.length && !childFolders.length ? (
            <div className="rounded-2xl border border-dashed border-[#e4d6c4] bg-[#fbf8f3] p-8 text-center">
              <p className="font-serif text-sm font-bold text-[#1c1815]">
                No books in this folder yet.
              </p>
              <p className="mt-1 text-xs text-[#8c7766]">
                Add a book from the catalog or create a new shelf above.
              </p>
              <div className="mt-4 flex justify-center gap-2">
                <Link
                  href="/search"
                  className="inline-flex items-center gap-1 rounded-xl bg-[#1f1712] px-4 py-2 text-xs font-semibold text-[#f8eedc] shadow-sm hover:bg-[#120d0a]"
                >
                  <Plus className="h-3.5 w-3.5 text-[#deb554]" />
                  <span>Add Books</span>
                </Link>
              </div>
            </div>
          ) : null}
        </div>
      </section>

      {/* Book Quick Modal Slipcase */}
      {selectedBook ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-[#c59b27]/40 bg-white p-6 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-start justify-between border-b border-[#ede2d2] pb-3">
              <span className="rounded-full bg-[#ede2d2] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#6d5543]">
                Book Details
              </span>
              <button
                type="button"
                onClick={() => setSelectedBook(null)}
                className="rounded-full p-1 text-[#9e8b7c] hover:bg-[#ede2d2]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-4 flex gap-4">
              <BookCover
                title={selectedBook.title}
                coverUrl={selectedBook.coverUrl}
                author={selectedBook.author}
                size="md"
              />
              <div className="min-w-0 flex-1">
                <h3 className="font-serif text-base font-bold text-[#1c1815]">
                  {selectedBook.title}
                </h3>
                <p className="text-xs text-[#7d6857]">{selectedBook.author}</p>
                <p className="mt-2 text-xs text-[#8c7766]">
                  Shelf:{" "}
                  <span className="font-semibold text-[#1c1815]">
                    {buildFolderPath(selectedBook.folderId, folders)}
                  </span>
                </p>
                <p className="mt-0.5 text-xs text-[#8c7766]">
                  Time logged:{" "}
                  <span className="font-semibold text-[#1c1815]">
                    {formatHours(selectedBook.totalSeconds)}
                  </span>
                </p>
              </div>
            </div>

            {selectedBook.synopsis ? (
              <div className="mt-4 rounded-xl bg-[#f8f3ea] p-3 text-xs text-[#554336] leading-relaxed line-clamp-4">
                {selectedBook.synopsis}
              </div>
            ) : null}

            <div className="mt-5 flex gap-2">
              <Link
                href={
                  selectedBook.status === "finished"
                    ? `/review?book=${selectedBook.id}`
                    : `/read?book=${selectedBook.id}`
                }
                className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-[#1f1712] py-2.5 text-xs font-semibold text-[#f8eedc] shadow-sm hover:bg-[#120d0a]"
              >
                <PlayCircle className="h-4 w-4 text-[#deb554]" />
                <span>
                  {selectedBook.status === "finished"
                    ? "Review Book"
                    : selectedBook.status === "reading"
                      ? "Continue Reading"
                      : "Start Reading"}
                </span>
              </Link>
              <button
                type="button"
                onClick={() => setSelectedBook(null)}
                className="rounded-xl border border-[#e4d6c4] bg-white px-4 py-2.5 text-xs font-semibold text-[#6d5747] hover:bg-[#f5ece0]"
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
