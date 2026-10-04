import Image from "next/image";
import { BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";

type BookCoverSize = "sm" | "md" | "lg" | "xl";

const sizeClasses: Record<BookCoverSize, { container: string; text: string; icon: string }> = {
  sm: { container: "h-20 w-14 rounded-lg", text: "text-[9px] line-clamp-2", icon: "h-3.5 w-3.5" },
  md: { container: "h-28 w-20 rounded-xl", text: "text-[11px] line-clamp-3", icon: "h-5 w-5" },
  lg: { container: "h-40 w-28 rounded-2xl", text: "text-xs line-clamp-4", icon: "h-6 w-6" },
  xl: { container: "h-56 w-40 rounded-2xl", text: "text-sm line-clamp-4", icon: "h-8 w-8" },
};

export function BookCover({
  title,
  coverUrl,
  author,
  size = "md",
  priority = false,
  className,
}: {
  title: string;
  coverUrl: string | null;
  author?: string;
  size?: BookCoverSize;
  priority?: boolean;
  className?: string;
}) {
  const config = sizeClasses[size];

  return (
    <div
      className={cn(
        "group relative shrink-0 overflow-hidden bg-[#241c16] transition-all duration-300",
        config.container,
        "book-spine-effect ring-1 ring-black/20",
        "before:pointer-events-none before:absolute before:inset-y-0 before:left-0 before:z-20 before:w-2 before:bg-gradient-to-r before:from-black/40 before:via-black/10 before:to-transparent",
        "after:pointer-events-none after:absolute after:inset-y-0 after:right-0 after:z-20 after:w-1 after:bg-gradient-to-l after:from-black/15 after:to-transparent",
        className,
      )}
    >
      {coverUrl ? (
        <Image
          src={coverUrl}
          alt={`${title} cover`}
          fill
          sizes={size === "xl" ? "160px" : size === "lg" ? "112px" : "80px"}
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          priority={priority}
        />
      ) : (
        <div className="relative flex h-full w-full flex-col justify-between bg-gradient-to-br from-[#2a2019] via-[#1e1713] to-[#140f0c] p-2.5 text-center text-[#dfc385]">
          <div className="flex items-center justify-center opacity-40">
            <BookOpen className={config.icon} />
          </div>
          <div className="my-auto px-0.5">
            <p className={cn("font-serif font-bold italic leading-tight text-[#f4eedd]", config.text)}>
              {title}
            </p>
            {author ? (
              <p className="mt-1 line-clamp-1 text-[8px] uppercase tracking-wider text-[#b89c74]">
                {author}
              </p>
            ) : null}
          </div>
          <div className="h-0.5 w-full bg-gradient-to-r from-transparent via-[#c59b27]/60 to-transparent" />
        </div>
      )}
    </div>
  );
}
