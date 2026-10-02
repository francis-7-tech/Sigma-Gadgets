export function safeCallbackUrl(value: string | string[] | undefined): string {
  if (typeof value !== "string" || !value.startsWith("/")) return "/";

  const base = "http://same-site.invalid";
  try {
    const url = new URL(value, base);
    if (url.origin !== base) return "/";
    return url.pathname + url.search + url.hash;
  } catch {
    return "/";
  }
}
