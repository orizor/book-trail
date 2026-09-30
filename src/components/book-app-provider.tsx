"use client";

import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { SupabaseClient } from "@supabase/supabase-js";

import { getPdf, storePdf } from "@/lib/pdf-store";
import { isSupabaseConfigured } from "@/lib/runtime-config";
import { starterSnapshot } from "@/lib/sample-data";
import { getSupabaseBrowserClient } from "@/lib/supabase-browser";
import type {
  ActiveSession,
  AppSnapshot,
  BookRecord,
  Folder,
  ReadingFormat,
  ReadingSession,
  SearchBookResult,
} from "@/lib/types";
import { getBookById, makeId, sortBooksByActivity } from "@/lib/utils";

const STORAGE_KEY = "booktrail-snapshot";
const EMPTY_SNAPSHOT: AppSnapshot = {
  folders: [],
  books: [],
  sessions: [],
  activeSession: null,
};

type SyncMode = "local" | "supabase";

type AddBookInput = {
  book: SearchBookResult;
  folderId?: string;
  hasPhysical?: boolean;
  pdfFile?: File | null;
};

type FolderRow = {
  id: string;
  name: string;
  parent_id: string | null;
  created_at: string;
};

type BookRow = {
  id: string;
  source_book_id: string;
  title: string;
  author: string;
  cover_url: string | null;
  synopsis: string;
  page_count: number | null;
  community_rating: number | string | null;
  folder_id: string | null;
  has_physical: boolean;
  pdf_url: string | null;
  pdf_label: string | null;
  storage_mode: "local" | "cloud" | "none";
  status: "queued" | "reading" | "finished";
  total_seconds: number;
  created_at: string;
  started_at: string | null;
  finished_at: string | null;
  personal_rating: number | null;
  thoughts: string;
};

type SessionRow = {
  id: string;
  book_id: string;
  format: ReadingFormat;
  started_at: string;
  ended_at: string;
  duration_seconds: number;
};

type ActiveSessionRow = {
  book_id: string;
  format: ReadingFormat;
  started_at: string;
};

type BookAppContextValue = {
  snapshot: AppSnapshot;
  books: BookRecord[];
  folders: Folder[];
  sessions: ReadingSession[];
  activeSession: ActiveSession | null;
  activeBook: BookRecord | null;
  readingBooks: BookRecord[];
  queuedBooks: BookRecord[];
  finishedBooks: BookRecord[];
  loading: boolean;
  syncMode: SyncMode;
  errorMessage: string | null;
  addBook: (input: AddBookInput) => Promise<string>;
  addFolder: (name: string, parentId?: string | null) => Promise<void>;
  setBookPhysical: (bookId: string, hasPhysical: boolean) => Promise<void>;
  attachPdf: (bookId: string, file: File) => Promise<void>;
  startReading: (bookId: string, format: ReadingFormat) => Promise<void>;
  stopReading: () => Promise<void>;
  finishBook: (bookId: string) => Promise<void>;
  updateReview: (bookId: string, thoughts: string, rating: number) => Promise<void>;
  bookHasReadableFormat: (book: BookRecord) => boolean;
};

const BookAppContext = createContext<BookAppContextValue | null>(null);

function loadLocalSnapshot(): AppSnapshot {
  if (typeof window === "undefined") {
    return starterSnapshot;
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);

  if (!raw) {
    return starterSnapshot;
  }

  try {
    return JSON.parse(raw) as AppSnapshot;
  } catch {
    return starterSnapshot;
  }
}

function hasReadableFormat(book: BookRecord) {
  return Boolean(book.hasPhysical || book.pdfLabel || book.pdfUrl);
}

function makeUuid() {
  return globalThis.crypto.randomUUID();
}

function sanitizeFileName(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]/g, "-");
}

function toFolder(row: FolderRow): Folder {
  return {
    id: row.id,
    name: row.name,
    parentId: row.parent_id,
    createdAt: row.created_at,
  };
}

function toBookRecord(row: BookRow): BookRecord {
  return {
    id: row.id,
    sourceBookId: row.source_book_id,
    title: row.title,
    author: row.author,
    coverUrl: row.cover_url,
    synopsis: row.synopsis,
    pageCount: row.page_count,
    communityRating:
      row.community_rating === null ? null : Number(row.community_rating),
    folderId: row.folder_id,
    hasPhysical: row.has_physical,
    pdfUrl: row.pdf_url,
    pdfLabel: row.pdf_label,
    storageMode: row.storage_mode,
    status: row.status,
    totalSeconds: row.total_seconds,
    createdAt: row.created_at,
    startedAt: row.started_at,
    finishedAt: row.finished_at,
    personalRating: row.personal_rating,
    thoughts: row.thoughts,
  };
}

function toSession(row: SessionRow): ReadingSession {
  return {
    id: row.id,
    bookId: row.book_id,
    format: row.format,
    startedAt: row.started_at,
    endedAt: row.ended_at,
    durationSeconds: row.duration_seconds,
  };
}

function toActiveSession(row: ActiveSessionRow | null): ActiveSession | null {
  if (!row) {
    return null;
  }

  return {
    bookId: row.book_id,
    format: row.format,
    startedAt: row.started_at,
  };
}

function openBlobInNewTab(blob: Blob) {
  const objectUrl = window.URL.createObjectURL(blob);
  window.open(objectUrl, "_blank", "noopener,noreferrer");
  window.setTimeout(() => window.URL.revokeObjectURL(objectUrl), 60_000);
}

export function BookAppProvider({ children }: { children: ReactNode }) {
  const [snapshot, setSnapshot] = useState<AppSnapshot>(() =>
    isSupabaseConfigured ? EMPTY_SNAPSHOT : loadLocalSnapshot(),
  );
  const [loading, setLoading] = useState(isSupabaseConfigured);
  const [syncMode, setSyncMode] = useState<SyncMode>(
    isSupabaseConfigured ? "supabase" : "local",
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const supabase = useMemo<SupabaseClient | null>(
    () => (isSupabaseConfigured ? getSupabaseBrowserClient() : null),
    [],
  );

  useEffect(() => {
    if (syncMode !== "local") {
      return;
    }

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
  }, [snapshot, syncMode]);

  const refreshFromSupabase = useCallback(
    async (explicitUserId?: string | null) => {
      if (!supabase) {
        return;
      }

      const ownerId = explicitUserId ?? userId;

      if (!ownerId) {
        return;
      }

      setLoading(true);

      const [foldersResult, booksResult, sessionsResult, activeSessionResult] =
        await Promise.all([
          supabase.from("folders").select("*").order("created_at", { ascending: true }),
          supabase.from("books").select("*").order("created_at", { ascending: false }),
          supabase
            .from("reading_sessions")
            .select("*")
            .order("started_at", { ascending: false }),
          supabase.from("active_sessions").select("*").maybeSingle(),
        ]);

      const firstError =
        foldersResult.error ??
        booksResult.error ??
        sessionsResult.error ??
        activeSessionResult.error;

      if (firstError) {
        setLoading(false);
        throw firstError;
      }

      setSnapshot({
        folders: (foldersResult.data ?? []).map((row) => toFolder(row as FolderRow)),
        books: (booksResult.data ?? []).map((row) => toBookRecord(row as BookRow)),
        sessions: (sessionsResult.data ?? []).map((row) => toSession(row as SessionRow)),
        activeSession: toActiveSession(
          (activeSessionResult.data as ActiveSessionRow | null) ?? null,
        ),
      });
      setErrorMessage(null);
      setSyncMode("supabase");
      setLoading(false);
    },
    [supabase, userId],
  );

  useEffect(() => {
    if (!supabase) {
      return;
    }

    let cancelled = false;

    const initialize = async () => {
      try {
        const { data: sessionData, error: sessionError } =
          await supabase.auth.getSession();

        if (sessionError) {
          throw sessionError;
        }

        let session = sessionData.session;

        if (!session) {
          const { data, error } = await supabase.auth.signInAnonymously();

          if (error) {
            throw error;
          }

          session = data.session ?? null;
        }

        if (cancelled) {
          return;
        }

        const nextUserId = session?.user.id ?? null;
        setUserId(nextUserId);

        if (nextUserId) {
          await refreshFromSupabase(nextUserId);
        } else {
          setLoading(false);
        }
      } catch (error) {
        if (cancelled) {
          return;
        }

        console.error(error);
        setSyncMode("local");
        setSnapshot(loadLocalSnapshot());
        setErrorMessage(
          "Cloud sync could not start. In Supabase, run the SQL migration and enable Anonymous sign-ins under Authentication > Sign In / Providers.",
        );
        setLoading(false);
      }
    };

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const nextUserId = session?.user.id ?? null;
      setUserId(nextUserId);

      if (nextUserId) {
        void refreshFromSupabase(nextUserId);
      }
    });

    void initialize();

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, [refreshFromSupabase, supabase]);

  const books = useMemo(() => sortBooksByActivity(snapshot.books), [snapshot.books]);
  const folders = snapshot.folders;
  const sessions = snapshot.sessions;
  const activeSession = snapshot.activeSession;
  const activeBook = getBookById(books, activeSession?.bookId ?? null);
  const readingBooks = books.filter((book) => book.status === "reading");
  const queuedBooks = books.filter((book) => book.status === "queued");
  const finishedBooks = books.filter((book) => book.status === "finished");

  async function openPdfForBook(book: BookRecord) {
    if (book.storageMode === "local") {
      const localPdf = await getPdf(book.id);

      if (localPdf) {
        openBlobInNewTab(localPdf);
        return;
      }
    }

    if (book.storageMode === "cloud" && book.pdfUrl && supabase) {
      const { data, error } = await supabase.storage
        .from("book-pdfs")
        .download(book.pdfUrl);

      if (error) {
        throw error;
      }

      openBlobInNewTab(data);
      return;
    }

    if (book.pdfUrl) {
      window.open(book.pdfUrl, "_blank", "noopener,noreferrer");
    }
  }

  async function addBook(input: AddBookInput) {
    if (supabase && userId && syncMode === "supabase") {
      const bookId = makeUuid();
      let pdfPath: string | null = null;

      if (input.pdfFile) {
        pdfPath = `${userId}/${bookId}-${sanitizeFileName(input.pdfFile.name)}`;
        const { error: uploadError } = await supabase.storage
          .from("book-pdfs")
          .upload(pdfPath, input.pdfFile, { upsert: true });

        if (uploadError) {
          throw uploadError;
        }
      }

      const { error } = await supabase.from("books").insert({
        id: bookId,
        owner_id: userId,
        source_book_id: input.book.id,
        title: input.book.title,
        author: input.book.author,
        cover_url: input.book.coverUrl,
        synopsis: input.book.synopsis,
        page_count: input.book.pageCount,
        community_rating: input.book.communityRating,
        folder_id: input.folderId || null,
        has_physical: Boolean(input.hasPhysical),
        pdf_url: pdfPath,
        pdf_label: input.pdfFile?.name ?? null,
        storage_mode: pdfPath ? "cloud" : "none",
        status: "queued",
      });

      if (error) {
        throw error;
      }

      await refreshFromSupabase();
      return bookId;
    }

    const id = makeId("book");

    if (input.pdfFile) {
      await storePdf(id, input.pdfFile);
    }

    const nextBook: BookRecord = {
      id,
      sourceBookId: input.book.id,
      title: input.book.title,
      author: input.book.author,
      coverUrl: input.book.coverUrl,
      synopsis: input.book.synopsis,
      pageCount: input.book.pageCount,
      communityRating: input.book.communityRating,
      folderId: input.folderId || null,
      hasPhysical: Boolean(input.hasPhysical),
      pdfUrl: null,
      pdfLabel: input.pdfFile?.name ?? null,
      storageMode: input.pdfFile ? "local" : "none",
      status: "queued",
      totalSeconds: 0,
      createdAt: new Date().toISOString(),
      startedAt: null,
      finishedAt: null,
      personalRating: null,
      thoughts: "",
    };

    setSnapshot((current) => ({
      ...current,
      books: [nextBook, ...current.books],
    }));

    return id;
  }

  async function addFolder(name: string, parentId?: string | null) {
    const trimmed = name.trim();

    if (!trimmed) {
      return;
    }

    if (supabase && userId && syncMode === "supabase") {
      const { error } = await supabase.from("folders").insert({
        owner_id: userId,
        name: trimmed,
        parent_id: parentId || null,
      });

      if (error) {
        throw error;
      }

      await refreshFromSupabase();
      return;
    }

    const folder: Folder = {
      id: makeId("folder"),
      name: trimmed,
      parentId: parentId || null,
      createdAt: new Date().toISOString(),
    };

    setSnapshot((current) => ({
      ...current,
      folders: [...current.folders, folder],
    }));
  }

  async function setBookPhysical(bookId: string, hasPhysical: boolean) {
    if (supabase && userId && syncMode === "supabase") {
      const { error } = await supabase
        .from("books")
        .update({ has_physical: hasPhysical })
        .eq("id", bookId);

      if (error) {
        throw error;
      }

      await refreshFromSupabase();
      return;
    }

    setSnapshot((current) => ({
      ...current,
      books: current.books.map((book) =>
        book.id === bookId ? { ...book, hasPhysical } : book,
      ),
    }));
  }

  async function attachPdf(bookId: string, file: File) {
    if (supabase && userId && syncMode === "supabase") {
      const pdfPath = `${userId}/${bookId}-${sanitizeFileName(file.name)}`;
      const { error: uploadError } = await supabase.storage
        .from("book-pdfs")
        .upload(pdfPath, file, { upsert: true });

      if (uploadError) {
        throw uploadError;
      }

      const { error } = await supabase
        .from("books")
        .update({
          pdf_url: pdfPath,
          pdf_label: file.name,
          storage_mode: "cloud",
        })
        .eq("id", bookId);

      if (error) {
        throw error;
      }

      await refreshFromSupabase();
      return;
    }

    await storePdf(bookId, file);

    setSnapshot((current) => ({
      ...current,
      books: current.books.map((book) =>
        book.id === bookId
          ? {
              ...book,
              pdfLabel: file.name,
              storageMode: "local",
            }
          : book,
      ),
    }));
  }

  async function startReading(bookId: string, format: ReadingFormat) {
    const target = getBookById(snapshot.books, bookId);

    if (!target) {
      return;
    }

    if (snapshot.activeSession && snapshot.activeSession.bookId !== bookId) {
      return;
    }

    if (format === "pdf") {
      await openPdfForBook(target);
    }

    const nextActiveSession: ActiveSession = {
      bookId,
      format,
      startedAt: new Date().toISOString(),
    };

    if (supabase && userId && syncMode === "supabase") {
      const { error: sessionError } = await supabase.from("active_sessions").upsert(
        {
          owner_id: userId,
          book_id: bookId,
          format,
          started_at: nextActiveSession.startedAt,
        },
        { onConflict: "owner_id" },
      );

      if (sessionError) {
        throw sessionError;
      }

      const { error: bookError } = await supabase
        .from("books")
        .update({
          status: "reading",
          started_at: target.startedAt ?? nextActiveSession.startedAt,
        })
        .eq("id", bookId);

      if (bookError) {
        throw bookError;
      }

      await refreshFromSupabase();
      return;
    }

    setSnapshot((current) => ({
      ...current,
      activeSession: nextActiveSession,
      books: current.books.map((book) =>
        book.id === bookId
          ? {
              ...book,
              status: "reading",
              startedAt: book.startedAt ?? nextActiveSession.startedAt,
            }
          : book,
      ),
    }));
  }

  async function stopReading() {
    if (!snapshot.activeSession) {
      return;
    }

    const endedAt = new Date().toISOString();
    const durationSeconds = Math.max(
      60,
      Math.floor(
        (+new Date(endedAt) - +new Date(snapshot.activeSession.startedAt)) / 1000,
      ),
    );

    if (supabase && userId && syncMode === "supabase") {
      const currentBook = getBookById(snapshot.books, snapshot.activeSession.bookId);
      const { error: sessionError } = await supabase.from("reading_sessions").insert({
        owner_id: userId,
        book_id: snapshot.activeSession.bookId,
        format: snapshot.activeSession.format,
        started_at: snapshot.activeSession.startedAt,
        ended_at: endedAt,
        duration_seconds: durationSeconds,
      });

      if (sessionError) {
        throw sessionError;
      }

      const { error: bookError } = await supabase
        .from("books")
        .update({
          total_seconds: (currentBook?.totalSeconds ?? 0) + durationSeconds,
        })
        .eq("id", snapshot.activeSession.bookId);

      if (bookError) {
        throw bookError;
      }

      const { error: activeError } = await supabase
        .from("active_sessions")
        .delete()
        .eq("owner_id", userId);

      if (activeError) {
        throw activeError;
      }

      await refreshFromSupabase();
      return;
    }

    const session: ReadingSession = {
      id: makeId("session"),
      bookId: snapshot.activeSession.bookId,
      format: snapshot.activeSession.format,
      startedAt: snapshot.activeSession.startedAt,
      endedAt,
      durationSeconds,
    };

    setSnapshot((current) => ({
      ...current,
      activeSession: null,
      sessions: [session, ...current.sessions],
      books: current.books.map((book) =>
        book.id === session.bookId
          ? { ...book, totalSeconds: book.totalSeconds + durationSeconds }
          : book,
      ),
    }));
  }

  async function finishBook(bookId: string) {
    if (snapshot.activeSession?.bookId === bookId) {
      await stopReading();
    }

    if (supabase && userId && syncMode === "supabase") {
      const { error } = await supabase
        .from("books")
        .update({
          status: "finished",
          finished_at: new Date().toISOString(),
        })
        .eq("id", bookId);

      if (error) {
        throw error;
      }

      await refreshFromSupabase();
      return;
    }

    setSnapshot((current) => ({
      ...current,
      books: current.books.map((book) =>
        book.id === bookId
          ? {
              ...book,
              status: "finished",
              finishedAt: new Date().toISOString(),
            }
          : book,
      ),
    }));
  }

  async function updateReview(bookId: string, thoughts: string, rating: number) {
    if (supabase && userId && syncMode === "supabase") {
      const { error } = await supabase
        .from("books")
        .update({
          thoughts,
          personal_rating: rating,
        })
        .eq("id", bookId);

      if (error) {
        throw error;
      }

      await refreshFromSupabase();
      return;
    }

    setSnapshot((current) => ({
      ...current,
      books: current.books.map((book) =>
        book.id === bookId
          ? { ...book, thoughts, personalRating: rating }
          : book,
      ),
    }));
  }

  const value: BookAppContextValue = {
    snapshot,
    books,
    folders,
    sessions,
    activeSession,
    activeBook,
    readingBooks,
    queuedBooks,
    finishedBooks,
    loading,
    syncMode,
    errorMessage,
    addBook,
    addFolder,
    setBookPhysical,
    attachPdf,
    startReading,
    stopReading,
    finishBook,
    updateReview,
    bookHasReadableFormat: hasReadableFormat,
  };

  return (
    <BookAppContext.Provider value={value}>{children}</BookAppContext.Provider>
  );
}

export function useBookApp() {
  const context = useContext(BookAppContext);

  if (!context) {
    throw new Error("useBookApp must be used inside BookAppProvider");
  }

  return context;
}
