import { describe, expect, it } from "vitest";
import { formatNaira, nairaToKobo } from "@/lib/money";

describe("nairaToKobo", () => {
  it("converts whole naira", () => {
    expect(nairaToKobo(15000)).toBe(1_500_000);
    expect(nairaToKobo(0)).toBe(0);
  });

  it("converts naira with kobo without floating-point drift", () => {
    expect(nairaToKobo(19999.99)).toBe(1_999_999);
    expect(nairaToKobo(0.1 + 0.2)).toBe(30);
  });

  it("rejects more than two decimal places", () => {
    expect(() => nairaToKobo(10.005)).toThrow();
  });

  it("rejects non-numbers", () => {
    expect(() => nairaToKobo(Number.NaN)).toThrow();
    expect(() => nairaToKobo(Infinity)).toThrow();
  });
});

describe("formatNaira", () => {
  it("formats whole naira without decimals", () => {
    expect(formatNaira(1_500_000)).toBe("₦15,000");
    expect(formatNaira(54_800_000)).toBe("₦548,000");
    expect(formatNaira(0)).toBe("₦0");
  });

  it("shows kobo when there are some", () => {
    expect(formatNaira(1_500_050)).toBe("₦15,000.50");
  });

  it("rejects fractional kobo", () => {
    expect(() => formatNaira(10.5)).toThrow();
  });
});
