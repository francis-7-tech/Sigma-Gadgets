"use client";

import Image from "next/image";
import { useState } from "react";
import { cloudinaryUrl, cloudName, placeholderFor } from "@/lib/cloudinary";

type ProductImageProps = {
  publicId?: string;
  categorySlug: string;
  alt: string;
  sizes: string;
  eager?: boolean;
  square?: boolean;
};

export function ProductImage({ publicId, categorySlug, alt, sizes, eager, square = true }: ProductImageProps) {
  const [failed, setFailed] = useState(false);

  if (publicId && cloudName && !failed) {
    return (
      <Image
        loader={({ src, width, quality }) =>
          cloudinaryUrl(src, width, square ? "1:1" : undefined, quality, "pad")
        }
        src={publicId}
        alt={alt}
        fill
        sizes={sizes}
        loading={eager ? "eager" : "lazy"}
        fetchPriority={eager ? "high" : undefined}
        onError={() => setFailed(true)}
        className="object-contain"
      />
    );
  }

  return (
    <Image
      src={placeholderFor(categorySlug)}
      alt={alt}
      fill
      unoptimized
      sizes={sizes}
      loading={eager ? "eager" : "lazy"}
      className="object-contain p-[10%]"
    />
  );
}
