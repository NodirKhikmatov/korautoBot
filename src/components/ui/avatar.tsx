import Image from "next/image";

import { cn } from "@/lib/utils";

function Avatar({
  className,
  src,
  alt,
  fallback,
}: {
  className?: string;
  src?: string | null;
  alt: string;
  fallback: string;
}) {
  const initials = fallback.slice(0, 2).toUpperCase();

  if (src) {
    return (
      <div
        className={cn(
          "relative overflow-hidden rounded-full bg-muted",
          className,
        )}
      >
        <Image
          src={src}
          alt={alt}
          fill
          unoptimized
          className="object-cover"
          sizes="48px"
        />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-full bg-primary/15 font-semibold text-primary",
        className,
      )}
    >
      {initials}
    </div>
  );
}

export { Avatar };
