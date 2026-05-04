import Image from "next/image";

import { cn } from "@/lib/utils";

export type VetraLogoProps = {
  alt: string;
  /** Display size, e.g. `size-9`, `h-10 w-10`. */
  className?: string;
  priority?: boolean;
};

/** App mark from `public/logo.svg`; control size via `className` at each call site. */
export function VetraLogo({ alt, className, priority }: VetraLogoProps) {
  return (
    <Image
      src="/logo.svg"
      alt={alt}
      width={64}
      height={64}
      className={cn("shrink-0 object-contain", className)}
      priority={priority}
    />
  );
}
