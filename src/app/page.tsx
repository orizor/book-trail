"use client";

import Link from "next/link";
import {
  ChevronRight,
  FileText,
  Folder as FolderIcon,
  FolderPlus,
  PlayCircle,
  Sparkles,
} from "lucide-react";
import { useMemo, useState } from "react";

import { useBookApp } from "@/components/book-app-provider";
import { PageShell } from "@/components/page-shell";
import type { BookRecord, Folder } from "@/lib/types";
import { buildFolderPath, cn, formatHours } from "@/lib/utils";

export default function Home() {
  const { books, folders, readingBooks, queuedBooks, addFolder, bookHasReadableFormat } =
    useBookApp();
  const [folderName, setFolderName] = useState("");
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [selectedBook, setSelectedBook] = useState<BookRecord | null>(null);

  const folderMap = useMemo(
    () => new Map(folders.map((folder) => [folder.id, folder])),
    [folders],
  );

  const currentFolder = currentFolderId ? folderMap.get(currentFolderId) ?? null : null;
  const childFolders = folders.filter((folder) => folder.parentId === currentFolderId);
  const visibleBooks = books.filter((book) => book.folderId === currentFolderId);
  const breadcrumbFolders = useMemo(() => {
    const chain: Folder[] = [];
    let cursor = currentFolder;

    while (cursor) {
      chain.unshift(cursor);
      cursor = cursor.parentId ? folderMap.get(cursor.parentId) ?? null : null;
    }

    return chain;
  }, [currentFolder, folderMap]);

  const currentFolderLabel = currentFolder
    ? buildFolderPath(currentFolder.id, folders)
    : "Library root";

  function getBookAction(book: BookRecord) {
    if (book.status === "finished") {
      return { label: "Finished", href: `/review?book=${book.id}` };
    }

    if (book.status === "reading") {
      return { label: "Continue reading", href: `/read?book=${book.id}` };
    }

    if (bookHasReadableFormat(book)) {
      return { label: "Start reading", href: `/read?book=${book.id}` };
    }

    return { label: "Choose format", href: `/read?book=${book.id}` };
  }

  return (
    <PageShell
      eyebrow="BookTrail"
      title="Your Library"
      description="Browse folders and books together like a file manager. Open folders, tap books, and jump into reading or review from one place."
    >
      <section className="grid grid-cols-3 gap-3">
        <article className="rounded-[1.75rem] bg-white p-4 shadow-sm ring-1 ring-stone-100">
          <p className="text-xs font-medium text-stone-500">Currently reading</p>
          <p className="mt-2 text-2xl font-semibold text-stone-900">
            {readingBooks.length}
          </p>
        </article>
        <article className="rounded-[1.75rem] bg-white p-4 shadow-sm ring-1 ring-stone-100">
          <p className="text-xs font-medium text-stone-500">Want to read</p>
          <p className="mt-2 text-2xl font-semibold text-stone-900">
            {queuedBooks.length}
          </p>
        </article>
        <Link
          href="/continue"
          className="rounded-[1.75rem] bg-stone-900 p-4 text-white shadow-sm"
        >
          <p className="text-xs font-medium text-stone-300">Continue</p>
          <div className="mt-2 flex items-center justify-between">
            <p className="text-lg font-semibold">Open page</p>
            <ChevronRight className="h-5 w-5" />
          </div>
        </Link>
      </section>

      <section className="rounded-[1.75rem] bg-white p-4 shadow-sm ring-1 ring-stone-100">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-stone-900">File manager</p>
            <p className="mt-1 text-sm text-stone-500">
              Folders and books appear in the same list. Open a folder to see what is
              inside it.
            </p>
          </div>
          <Link
            href="/search"
            className="rounded-full bg-amber-100 px-3 py-2 text-xs font-semibold text-amber-900"
          >
            Add books
          </Link>
        </div>

        <div className="mt-4 rounded-2xl bg-[#f8f3ea] px-4 py-3">
          <div className="flex flex-wrap items-center gap-2 text-xs text-stone-500">
            <button
              type="button"
              onClick={() => setCurrentFolderId(null)}
              className={cn(
                "rounded-full px-3 py-1",
                currentFolderId === null ? "bg-white text-stone-900" : "bg-transparent",
              )}
            >
              Root
            </button>
            {breadcrumbFolders.map((folder) => (
              <button
                key={folder.id}
                type="button"
                onClick={() => setCurrentFolderId(folder.id)}
                className="rounded-full bg-white px-3 py-1 text-stone-900"
              >
                {folder.name}
              </button>
            ))}
          </div>
          <p className="mt-3 text-sm font-medium text-stone-900">{currentFolderLabel}</p>
        </div>

        <div className="mt-4 space-y-2">
          {childFolders.map((folder) => (
            <button
              key={folder.id}
              type="button"
              onClick={() => setCurrentFolderId(folder.id)}
              className="flex w-full items-center justify-between rounded-2xl bg-[#f8f3ea] px-4 py-4 text-left ring-1 ring-stone-100"
            >
              <div className="flex min-w-0 items-center gap-3">
                <div className="rounded-2xl bg-amber-100 p-3 text-amber-800">
                  <FolderIcon className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-stone-900">
                    {folder.name}
                  </p>
                  <p className="mt-1 text-xs text-stone-500">
                    Folder inside {folder.parentId ? buildFolderPath(folder.parentId, folders) : "root"}
                  </p>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-stone-400" />
            </button>
          ))}

          {visibleBooks.map((book) => {
            const action = getBookAction(book);

            return (
              <article
                key={book.id}
                className="rounded-2xl bg-[#f8f3ea] px-4 py-4 ring-1 ring-stone-100"
              >
                <div className="flex items-start justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => setSelectedBook(book)}
                    className="flex min-w-0 flex-1 items-start gap-3 text-left"
                  >
                    <div className="rounded-2xl bg-stone-900 p-3 text-white">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-stone-900">
                        {book.title}
                      </p>
                      <p className="mt-1 truncate text-xs text-stone-500">{book.author}</p>
                      <p className="mt-2 text-xs text-stone-500">
                        {book.status === "reading"
                          ? "In progress"
                          : book.status === "finished"
                            ? "Completed"
                            : "Not started"}{" "}
                        • {formatHours(book.totalSeconds)}
                      </p>
                    </div>
                  </button>

                  <Link
                    href={action.href}
                    className={cn(
                      "shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold",
                      book.status === "finished"
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-white text-stone-900",
                    )}
                  >
                    {action.label}
                  </Link>
                </div>
              </article>
            );
          })}

          {!childFolders.length && !visibleBooks.length ? (
            <article className="rounded-2xl bg-[#f8f3ea] px-4 py-6 text-sm text-stone-500 ring-1 ring-stone-100">
              Nothing is in this folder yet.
            </article>
          ) : null}
        </div>
      </section>

      <section className="rounded-[1.75rem] bg-white p-4 shadow-sm ring-1 ring-stone-100">
        <div className="flex items-center gap-2">
          <FolderPlus className="h-4 w-4 text-amber-700" />
          <h2 className="text-sm font-semibold text-stone-900">Folders</h2>
        </div>

        <form
          className="mt-4 space-y-3"
          onSubmit={(event) => {
            event.preventDefault();
            addFolder(folderName, currentFolderId);
            setFolderName("");
          }}
        >
          <input
            value={folderName}
            onChange={(event) => setFolderName(event.target.value)}
            placeholder={`New folder inside ${currentFolder ? currentFolder.name : "root"}`}
            className="w-full rounded-2xl border border-stone-200 bg-[#f8f3ea] px-4 py-3 text-sm outline-none focus:border-amber-400"
          />
          <button
            type="submit"
            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-amber-700 px-4 py-3 text-sm font-semibold text-white"
          >
            <Sparkles className="h-4 w-4" />
            Save folder
          </button>
        </form>
      </section>

      {selectedBook ? (
        <div className="fixed inset-0 z-40 flex items-end bg-stone-950/45 px-4 pb-24 pt-8">
          <div className="mx-auto w-full max-w-md rounded-[2rem] bg-white p-5 shadow-2xl">
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-stone-400">
              Book action
            </p>
            <h2 className="mt-3 text-xl font-semibold text-stone-900">
              {selectedBook.title}
            </h2>
            <p className="mt-1 text-sm text-stone-500">{selectedBook.author}</p>
            <p className="mt-4 text-sm leading-6 text-stone-500">
              {selectedBook.status === "finished"
                ? "This book is finished. Open the review page to see your notes and rating."
                : selectedBook.status === "reading"
                  ? "This book is already in progress. Continue reading from the timer page."
                  : bookHasReadableFormat(selectedBook)
                    ? "This book is ready to start. Open the reading page to begin your session."
                    : "This book is in your library, but you still need to choose a PDF or physical copy before starting."}
            </p>

            <div className="mt-5 grid gap-3">
              <Link
                href={getBookAction(selectedBook).href}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-stone-900 px-4 py-3 text-sm font-semibold text-white"
              >
                <PlayCircle className="h-4 w-4" />
                {getBookAction(selectedBook).label}
              </Link>
              <button
                type="button"
                onClick={() => setSelectedBook(null)}
                className="rounded-full bg-[#f8f3ea] px-4 py-3 text-sm font-medium text-stone-600"
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
