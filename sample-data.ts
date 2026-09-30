import type { AppSnapshot } from "@/lib/types";

const now = new Date().toISOString();

export const starterSnapshot: AppSnapshot = {
  folders: [
    { id: "root-self-help", name: "Self Help", parentId: null, createdAt: now },
    {
      id: "root-self-help-mindset",
      name: "Mindset",
      parentId: "root-self-help",
      createdAt: now,
    },
    { id: "root-business", name: "Business", parentId: null, createdAt: now },
  ],
  books: [
    {
      id: "starter-atomic-habits",
      sourceBookId: "/works/OL17930368W",
      title: "Atomic Habits",
      author: "James Clear",
      coverUrl: "https://covers.openlibrary.org/b/id/10594758-L.jpg",
      synopsis:
        "A practical guide to building good habits, breaking bad ones, and improving a little every day.",
      pageCount: 320,
      communityRating: 4.4,
      folderId: "root-self-help-mindset",
      hasPhysical: true,
      pdfUrl: null,
      pdfLabel: null,
      storageMode: "none",
      status: "reading",
      totalSeconds: 5400,
      createdAt: now,
      startedAt: now,
      finishedAt: null,
      personalRating: null,
      thoughts: "",
    },
    {
      id: "starter-deep-work",
      sourceBookId: "/works/OL17348256W",
      title: "Deep Work",
      author: "Cal Newport",
      coverUrl: "https://covers.openlibrary.org/b/id/9259251-L.jpg",
      synopsis:
        "A focused argument for cultivating concentration in a distracted world.",
      pageCount: 304,
      communityRating: 4.2,
      folderId: "root-business",
      hasPhysical: false,
      pdfUrl: null,
      pdfLabel: null,
      storageMode: "none",
      status: "finished",
      totalSeconds: 10200,
      createdAt: now,
      startedAt: now,
      finishedAt: now,
      personalRating: 5,
      thoughts: "Great reminder to protect deep focus blocks and avoid shallow work.",
    },
  ],
  sessions: [
    {
      id: "session-1",
      bookId: "starter-atomic-habits",
      format: "physical",
      startedAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
      endedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      durationSeconds: 1800,
    },
    {
      id: "session-2",
      bookId: "starter-deep-work",
      format: "physical",
      startedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      endedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 45 * 60 * 1000).toISOString(),
      durationSeconds: 2700,
    },
  ],
  activeSession: null,
};
