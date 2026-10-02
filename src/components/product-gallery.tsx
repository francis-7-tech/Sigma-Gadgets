"use client";

import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { useRef, useState } from "react";
import { ProductImage } from "@/components/product-image";

type ProductGalleryProps = { images: string[]; categorySlug: string; name: string };

export function ProductGallery({ images, categorySlug, name }: ProductGalleryProps) {
  const photos: (string | undefined)[] = images.length ? images : [undefined];
  const [index, setIndex] = useState(0);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const touchStartX = useRef<number | null>(null);

  const go = (delta: number) => setIndex((i) => (i + delta + photos.length) % photos.length);

  return (
    <div className="flex flex-col gap-3">
      <button
        type="button"
        onClick={() => dialogRef.current?.showModal()}
        aria-label={`Open full-screen photo of ${name}`}
        className="relative aspect-square w-full cursor-zoom-in overflow-hidden rounded-card border border-border bg-white"
      >
        <ProductImage
          publicId={photos[index]}
          categorySlug={categorySlug}
          alt={name}
          sizes="(min-width: 1024px) 560px, 100vw"
          eager
        />
      </button>

      {photos.length > 1 ? (
        <div className="grid grid-cols-4 gap-2.5">
          {photos.map((photo, i) => (
            <button
              key={photo ?? i}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`Show photo ${i + 1}`}
              aria-current={i === index}
              className={`relative aspect-square overflow-hidden rounded-control bg-white ${
                i === index ? "border-2 border-primary" : "border border-border opacity-80"
              }`}
            >
              <ProductImage publicId={photo} categorySlug={categorySlug} alt="" sizes="120px" />
            </button>
          ))}
        </div>
      ) : null}

      <dialog
        ref={dialogRef}
        aria-label={`Photos of ${name}`}
        onKeyDown={(e) => {
          if (e.key === "ArrowRight") go(1);
          if (e.key === "ArrowLeft") go(-1);
        }}
        onClick={(e) => {
          if (e.target === dialogRef.current) dialogRef.current?.close();
        }}
        className="m-0 h-dvh max-h-none w-screen max-w-none bg-white p-0 backdrop:bg-black/60"
      >
        <div
          className="relative h-full w-full touch-pinch-zoom"
          onTouchStart={(e) => (touchStartX.current = e.touches[0].clientX)}
          onTouchEnd={(e) => {
            if (touchStartX.current === null || e.touches.length > 0) return;
            const dx = e.changedTouches[0].clientX - touchStartX.current;
            if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1);
            touchStartX.current = null;
          }}
        >
          <ProductImage publicId={photos[index]} categorySlug={categorySlug} alt={name} sizes="100vw" square={false} />
          <button
            type="button"
            onClick={() => dialogRef.current?.close()}
            aria-label="Close"
            className="absolute right-4 top-4 flex size-11 items-center justify-center rounded-full bg-primary text-primary-foreground"
          >
            <X className="size-5" aria-hidden="true" />
          </button>
          {photos.length > 1 ? (
            <>
              <button
                type="button"
                onClick={() => go(-1)}
                aria-label="Previous photo"
                className="absolute left-4 top-1/2 flex size-11 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-white"
              >
                <ChevronLeft className="size-5" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={() => go(1)}
                aria-label="Next photo"
                className="absolute right-4 top-1/2 flex size-11 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-white"
              >
                <ChevronRight className="size-5" aria-hidden="true" />
              </button>
              <p className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-muted px-3 py-1 text-sm font-semibold">
                {index + 1} / {photos.length}
              </p>
            </>
          ) : null}
        </div>
      </dialog>
    </div>
  );
}
