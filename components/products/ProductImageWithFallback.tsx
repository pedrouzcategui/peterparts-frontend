"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { isBlobProductImageUrl } from "@/lib/product-image-storage";

const REMOTE_PRODUCT_PLACEHOLDER_SRC =
  "https://m.media-amazon.com/images/I/615kwOY9+3L._AC_UF894,1000_QL80_.jpg";
const LOCAL_PRODUCT_PLACEHOLDER_SRC = "/images/placeholder.jpg";

type ProductImageWithFallbackProps = {
  src?: string;
  alt: string;
  sizes: string;
  className?: string;
  priority?: boolean;
};

export default function ProductImageWithFallback({
  src,
  alt,
  sizes,
  className,
  priority = false,
}: ProductImageWithFallbackProps) {
  const [imageSrc, setImageSrc] = useState(src || REMOTE_PRODUCT_PLACEHOLDER_SRC);
  const unoptimized = isBlobProductImageUrl(imageSrc);

  useEffect(() => {
    setImageSrc(src || REMOTE_PRODUCT_PLACEHOLDER_SRC);
  }, [src]);

  return (
    <Image
      src={imageSrc}
      alt={alt}
      fill
      sizes={sizes}
      className={className}
      priority={priority}
      unoptimized={unoptimized}
      onError={() => {
        if (imageSrc !== REMOTE_PRODUCT_PLACEHOLDER_SRC) {
          setImageSrc(REMOTE_PRODUCT_PLACEHOLDER_SRC);
          return;
        }

        setImageSrc(LOCAL_PRODUCT_PLACEHOLDER_SRC);
      }}
    />
  );
}