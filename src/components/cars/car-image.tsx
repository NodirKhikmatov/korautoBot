import Image, { type ImageProps } from "next/image";

/** R2 uploads are already WebP-optimized; skip Next.js image proxy for faster loads. */
function isPreOptimizedR2Url(src: ImageProps["src"]): boolean {
  if (typeof src !== "string") {
    return false;
  }

  try {
    const host = new URL(src).hostname;
    return (
      host.endsWith(".r2.dev") ||
      host.includes("r2.cloudflarestorage.com")
    );
  } catch {
    return false;
  }
}

export function CarImage({ src, alt, ...rest }: ImageProps) {
  const unoptimized = isPreOptimizedR2Url(src);

  return <Image src={src} alt={alt} unoptimized={unoptimized} {...rest} />;
}
