"use client";

import Image from "next/image";
import { cloudinaryUrl } from "@/lib/cloudinary";

type CloudinaryImageProps = {
  publicId: string;
  alt: string;
  sizes: string;
  aspect: string;
  eager?: boolean;
};

export function CloudinaryImage({ publicId, alt, sizes, aspect, eager }: CloudinaryImageProps) {
  return (
    <Image
      loader={({ src, width, quality }) => cloudinaryUrl(src, width, aspect, quality)}
      src={publicId}
      alt={alt}
      fill
      sizes={sizes}
      loading={eager ? "eager" : "lazy"}
      fetchPriority={eager ? "high" : undefined}
      className="object-cover"
    />
  );
}
