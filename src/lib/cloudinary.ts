export const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ?? "";

export function cloudinaryUrl(
  publicId: string,
  width: number,
  aspect?: string,
  quality?: number,
  mode: "fill" | "pad" = "fill",
): string {
  const shape = !aspect ? "c_limit" : mode === "pad" ? `c_pad,ar_${aspect},b_white` : `c_fill,ar_${aspect},g_auto`;
  const transforms = ["f_auto", `q_${quality ?? "auto"}`, shape, `w_${width}`].join(",");
  return `https://res.cloudinary.com/${cloudName}/image/upload/${transforms}/${publicId}`;
}

export function placeholderFor(categorySlug: string): string {
  const known = ["phones", "laptops", "audio", "wearables", "accessories"];
  return `/placeholders/${known.includes(categorySlug) ? categorySlug : "accessories"}.svg`;
}
