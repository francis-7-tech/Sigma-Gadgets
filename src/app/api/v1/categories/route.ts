import { apiJson } from "@/lib/api";
import { getCategoriesWithCounts } from "@/lib/catalog";

export const dynamic = "force-dynamic";

export async function GET() {
  return apiJson({ categories: await getCategoriesWithCounts() });
}
