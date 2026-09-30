import Image from "next/image";

export function BookCover({
  title,
  coverUrl,
  priority = false,
}: {
  title: string;
  coverUrl: string | null;
  priority?: boolean;
}) {
  return (
    <div className="relative h-28 w-20 overflow-hidden rounded-[1.25rem] bg-stone-200 shadow-sm">
      {coverUrl ? (
        <Image
          src={coverUrl}
          alt={`${title} cover`}
          fill
          sizes="80px"
          className="object-cover"
          priority={priority}
        />
      ) : (
        <div className="flex h-full items-center justify-center bg-gradient-to-br from-stone-300 to-stone-200 px-2 text-center text-[11px] font-medium text-stone-500">
          {title}
        </div>
      )}
    </div>
  );
}
