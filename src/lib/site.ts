export const siteUrl = (process.env.APP_URL ?? "http://localhost:3000").replace(/\/$/, "");

export const shopWhatsApp = process.env.SHOP_WHATSAPP ?? "";

export const shopWhatsAppUrl = `https://wa.me/${shopWhatsApp.replace(/\D/g, "")}`;

export const deliveryFeeKobo = Math.round(Number(process.env.DELIVERY_FEE_NAIRA ?? "5000") * 100);

export const bankDetails = {
  bankName: process.env.BANK_NAME ?? "",
  accountName: process.env.BANK_ACCOUNT_NAME ?? "",
  accountNumber: process.env.BANK_ACCOUNT_NUMBER ?? "",
};

export const PAYMENT_WINDOW_HOURS = 48;

export function formatDateTime(date: Date): string {
  return new Intl.DateTimeFormat("en-NG", {
    timeZone: "Africa/Lagos",
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-NG", {
    timeZone: "Africa/Lagos",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}
