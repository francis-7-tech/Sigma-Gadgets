import { cancelExpiredOrders } from "@/lib/orders";

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  const cancelled = await cancelExpiredOrders();
  if (cancelled.length) console.log(`[cron] Cancelled expired orders: ${cancelled.join(", ")}`);
  return Response.json({ cancelled });
}
