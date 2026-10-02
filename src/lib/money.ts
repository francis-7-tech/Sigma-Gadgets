const KOBO_PER_NAIRA = 100;

export function nairaToKobo(naira: number): number {
  if (!Number.isFinite(naira)) {
    throw new Error(`Invalid naira amount: ${naira}`);
  }
  const kobo = Math.round(naira * KOBO_PER_NAIRA);
  if (Math.abs(kobo - naira * KOBO_PER_NAIRA) > 1e-6) {
    throw new Error(`Naira amount has more than two decimal places: ${naira}`);
  }
  return kobo;
}

const wholeNaira = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

const nairaWithKobo = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function formatNaira(kobo: number): string {
  if (!Number.isSafeInteger(kobo)) {
    throw new Error(`Kobo amount must be a whole number: ${kobo}`);
  }
  const formatter = kobo % KOBO_PER_NAIRA === 0 ? wholeNaira : nairaWithKobo;
  return formatter.format(kobo / KOBO_PER_NAIRA);
}
