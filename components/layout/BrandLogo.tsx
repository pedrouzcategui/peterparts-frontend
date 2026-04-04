import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

type BrandLogoProps = {
  href?: string;
  className?: string;
  logoClassName?: string;
  priority?: boolean;
  variant?: "auto" | "light" | "dark";
  sizes?: string;
};

type BrandIconProps = {
  className?: string;
  iconClassName?: string;
  priority?: boolean;
  variant?: "auto" | "light" | "dark";
  sizes?: string;
};

function BrandLogoImages({
  priority,
  variant,
  sizes,
}: Pick<BrandLogoProps, "priority" | "variant" | "sizes">) {
  if (variant === "light") {
    return (
      <Image
        src="/images/logo.png"
        alt=""
        fill
        priority={priority}
        sizes={sizes}
        className="object-contain"
      />
    );
  }

  if (variant === "dark") {
    return (
      <Image
        src="/images/logo-dark.png"
        alt=""
        fill
        priority={priority}
        sizes={sizes}
        className="object-contain"
      />
    );
  }

  return (
    <>
      <Image
        src="/images/logo.png"
        alt=""
        fill
        priority={priority}
        sizes={sizes}
        className="object-contain dark:hidden"
      />
      <Image
        src="/images/logo-dark.png"
        alt=""
        fill
        priority={priority}
        sizes={sizes}
        className="hidden object-contain dark:block"
      />
    </>
  );
}

function BrandIconImages({
  priority,
  variant,
  sizes,
}: Pick<BrandIconProps, "priority" | "variant" | "sizes">) {
  if (variant === "light") {
    return (
      <Image
        src="/images/icon.png"
        alt=""
        fill
        priority={priority}
        sizes={sizes}
        className="object-contain"
      />
    );
  }

  if (variant === "dark") {
    return (
      <Image
        src="/images/icon-dark.png"
        alt=""
        fill
        priority={priority}
        sizes={sizes}
        className="object-contain"
      />
    );
  }

  return (
    <>
      <Image
        src="/images/icon.png"
        alt=""
        fill
        priority={priority}
        sizes={sizes}
        className="object-contain dark:hidden"
      />
      <Image
        src="/images/icon-dark.png"
        alt=""
        fill
        priority={priority}
        sizes={sizes}
        className="hidden object-contain dark:block"
      />
    </>
  );
}

export function BrandLogo({
  href = "/",
  className,
  logoClassName,
  priority = false,
  variant = "auto",
  sizes = "(max-width: 640px) 9rem, 14rem",
}: BrandLogoProps) {
  const content = (
    <>
      <span className="sr-only">PeterParts</span>
      <span
        className={cn(
          "relative block h-12 w-24 shrink-0 overflow-hidden",
          logoClassName,
        )}
        aria-hidden="true"
      >
        <BrandLogoImages priority={priority} variant={variant} sizes={sizes} />
      </span>
    </>
  );

  if (!href) {
    return (
      <span className={cn("inline-flex items-center", className)}>
        {content}
      </span>
    );
  }

  return (
    <Link href={href} className={cn("inline-flex items-center", className)}>
      {content}
    </Link>
  );
}

export function BrandIcon({
  className,
  iconClassName,
  priority = false,
  variant = "auto",
  sizes = "(max-width: 640px) 4rem, 5rem",
}: BrandIconProps) {
  return (
    <span
      className={cn("relative block overflow-hidden", className)}
      aria-hidden="true"
    >
      <span className="sr-only">PeterParts</span>
      <span
        className={cn("relative block h-full w-full", iconClassName)}
        aria-hidden="true"
      >
        <BrandIconImages priority={priority} variant={variant} sizes={sizes} />
      </span>
    </span>
  );
}
