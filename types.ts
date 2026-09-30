export type ReadingFormat = "pdf" | "physical";

export type BookStatus = "queued" | "reading" | "finished";

export type Folder = {
  id: string;
  name: string;
  parentId: string | null;
  createdAt: string;
};

export type BookSource = {
  key: string;
  rating: number | null;
  pages: number | null;
};

export type BookRecord = {
  id: string;
  sourceBookId: string;
  title: string;
  author: string;
  coverUrl: string | null;
  synopsis: string;
  pageCount: number | null;
  communityRating: number | null;
  folderId: string | null;
  hasPhysical: boolean;
  pdfUrl: string | null;
  pdfLabel: string | null;
  storageMode: "local" | "cloud" | "none";
  status: BookStatus;
  totalSeconds: number;
  createdAt: string;
  startedAt: string | null;
  finishedAt: string | null;
  personalRating: number | null;
  thoughts: string;
};

export type ReadingSession = {
  id: string;
  bookId: string;
  format: ReadingFormat;
  startedAt: string;
  endedAt: string;
  durationSeconds: number;
};

export type ActiveSession = {
  bookId: string;
  format: ReadingFormat;
  startedAt: string;
};

export type SearchBookResult = {
  id: string;
  title: string;
  author: string;
  coverUrl: string | null;
  synopsis: string;
  pageCount: number | null;
  communityRating: number | null;
};

export type AppSnapshot = {
  folders: Folder[];
  books: BookRecord[];
  sessions: ReadingSession[];
  activeSession: ActiveSession | null;
};
