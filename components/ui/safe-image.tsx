"use client";

import { useEffect, useState } from "react";

import { DEFAULT_PRODUCT_IMAGE_SRC } from "@/lib/ui/default-images";
import { cn } from "@/lib/utils";

type SafeImageProps = Omit<React.ImgHTMLAttributes<HTMLImageElement>, "src"> & {
  src?: string | null;
  fallbackSrc?: string;
};

export function SafeImage({
  src,
  fallbackSrc = DEFAULT_PRODUCT_IMAGE_SRC,
  alt = "",
  className,
  onError,
  ...props
}: SafeImageProps) {
  const resolved = src?.trim() || fallbackSrc;
  const [currentSrc, setCurrentSrc] = useState(resolved);

  useEffect(() => {
    setCurrentSrc(src?.trim() || fallbackSrc);
  }, [src, fallbackSrc]);

  return (
    <img
      {...props}
      src={currentSrc}
      alt={alt}
      className={cn(className)}
      onError={(event) => {
        onError?.(event);
        if (currentSrc !== fallbackSrc) {
          setCurrentSrc(fallbackSrc);
        }
      }}
    />
  );
}
