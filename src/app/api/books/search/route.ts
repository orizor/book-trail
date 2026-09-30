import { NextRequest, NextResponse } from "next/server";

import type { SearchBookResult } from "@/lib/types";

type OpenLibraryDoc = {
  key: string;
  title: string;
  author_name?: string[];
  cover_i?: number;
  first_sentence?: string | string[];
  number_of_pages_median?: number;
  ratings_average?: number;
};

function normalizeSynopsis(value: OpenLibraryDoc["first_sentence"]) {
  if (Array.isArray(value)) {
    return value[0] ?? "";
  }

  return value ?? "";
}

function normalizeBook(doc: OpenLibraryDoc): SearchBookResult {
  return {
    id: doc.key,
    title: doc.title,
    author: doc.author_name?.[0] ?? "Unknown author",
    coverUrl: doc.cover_i
      ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-L.jpg`
      : null,
    synopsis:
      normalizeSynopsis(doc.first_sentence) ||
      "Synopsis unavailable from the current book source.",
    pageCount: doc.number_of_pages_median ?? null,
    communityRating: doc.ratings_average
      ? Number(doc.ratings_average.toFixed(1))
      : null,
  };
}

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q")?.trim();

  if (!query) {
    return NextResponse.json({ books: [] satisfies SearchBookResult[] });
  }

  const url = new URL("https://openlibrary.org/search.json");
  url.searchParams.set("q", query);
  url.searchParams.set("limit", "12");
  url.searchParams.set("fields", "key,title,author_name,cover_i,first_sentence,number_of_pages_median,ratings_average");

  const response = await fetch(url, {
    headers: {
      "User-Agent": "BookTrail/1.0 book search",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    return NextResponse.json(
      { error: "Book search is temporarily unavailable." },
      { status: 502 },
    );
  }

  const data = (await response.json()) as { docs?: OpenLibraryDoc[] };

  return NextResponse.json({
    books: (data.docs ?? []).map(normalizeBook),
  });
}
