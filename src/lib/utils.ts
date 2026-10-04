import type { BookRecord, Folder } from "@/lib/types";

export function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

export function formatHours(seconds: number) {
  return `${(seconds / 3600).toFixed(seconds < 3600 ? 1 : 0)}h`;
}

export function formatDuration(seconds: number) {
  const totalMinutes = Math.max(1, Math.round(seconds / 60));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (!hours) {
    return `${minutes}m`;
  }

  if (!minutes) {
    return `${hours}h`;
  }

  return `${hours}h ${minutes}m`;
}

export function formatClockDuration(seconds: number) {
  const safeSeconds = Math.max(0, Math.floor(seconds));
  const hours = Math.floor(safeSeconds / 3600);
  const minutes = Math.floor((safeSeconds % 3600) / 60);
  const remainingSeconds = safeSeconds % 60;

  return [hours, minutes, remainingSeconds]
    .map((value) => value.toString().padStart(2, "0"))
    .join(":");
}

export function formatDate(dateString: string) {
  const d = new Date(dateString);
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

export function formatMonthYear(d: Date) {
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];
  return `${months[d.getMonth()]} ${d.getFullYear()}`;
}

export function formatTimeRange(startedAt: string, endedAt: string) {
  const start = new Date(startedAt);
  const end = new Date(endedAt);

  const pad = (n: number) => n.toString().padStart(2, "0");
  const startHours = pad(start.getHours());
  const startMins = pad(start.getMinutes());
  const endHours = pad(end.getHours());
  const endMins = pad(end.getMinutes());

  return `${formatDate(startedAt)} • ${startHours}:${startMins} - ${endHours}:${endMins}`;
}

export function makeId(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

export function buildFolderPath(folderId: string | null, folders: Folder[]) {
  if (!folderId) {
    return "Unsorted";
  }

  const byId = new Map(folders.map((folder) => [folder.id, folder]));
  const segments: string[] = [];
  let current = byId.get(folderId) ?? null;

  while (current) {
    segments.unshift(current.name);
    current = current.parentId ? byId.get(current.parentId) ?? null : null;
  }

  return segments.join(" / ");
}

export function countNestedChildren(folderId: string, folders: Folder[]): number {
  const children = folders.filter((folder) => folder.parentId === folderId);

  return children.reduce(
    (total, child) => total + 1 + countNestedChildren(child.id, folders),
    0,
  );
}

export function getBookById(books: BookRecord[], bookId: string | null) {
  if (!bookId) {
    return null;
  }

  return books.find((book) => book.id === bookId) ?? null;
}

export function sortBooksByActivity(books: BookRecord[]) {
  return [...books].sort((a, b) => {
    if (a.status === "reading" && b.status !== "reading") {
      return -1;
    }

    if (b.status === "reading" && a.status !== "reading") {
      return 1;
    }

    return +new Date(b.createdAt) - +new Date(a.createdAt);
  });
}
