import { describe, expect, it } from "vitest";
import { checkoutSchema } from "@/lib/checkout-schema";

const valid = {
  name: "Ada Obi",
  phone: "0803 000 0000",
  address: "12 Admiralty Way, Lekki Phase 1",
  city: "Lekki",
  state: "Lagos",
};

function errorFor(values: Record<string, string>, field: string) {
  const result = checkoutSchema.safeParse(values);
  return result.success ? undefined : result.error.issues.find((issue) => issue.path[0] === field)?.message;
}

describe("checkoutSchema", () => {
  it("accepts a complete Nigerian address", () => {
    expect(checkoutSchema.safeParse(valid).success).toBe(true);
  });

  it("trims spaces around the values", () => {
    const result = checkoutSchema.parse({ ...valid, name: "  Ada Obi  ", city: " Lekki " });
    expect(result.name).toBe("Ada Obi");
    expect(result.city).toBe("Lekki");
  });

  it("accepts common phone formats", () => {
    for (const phone of ["08030000000", "0803 000 0000", "+234 803 000 0000", "(0803) 000-0000"]) {
      expect(errorFor({ ...valid, phone }, "phone"), phone).toBeUndefined();
    }
  });

  it("rejects bad phone numbers", () => {
    for (const phone of ["", "12345", "0803-CALL-NOW", "0803000000000000000000"]) {
      expect(errorFor({ ...valid, phone }, "phone"), phone).toBe("Enter a valid phone number, e.g. 0803 000 0000");
    }
  });

  it("explains each missing field", () => {
    const empty = { name: "", phone: "", address: "", city: "", state: "" };
    expect(errorFor(empty, "name")).toBe("Enter your full name");
    expect(errorFor(empty, "address")).toBe("Enter your street address");
    expect(errorFor(empty, "city")).toBe("Enter your city or area");
    expect(errorFor(empty, "state")).toBe("Choose your state");
  });

  it("only accepts real Nigerian states", () => {
    expect(errorFor({ ...valid, state: "Abuja (FCT)" }, "state")).toBeUndefined();
    expect(errorFor({ ...valid, state: "Texas" }, "state")).toBe("Choose your state");
  });

  it("treats a name of only spaces as missing", () => {
    expect(errorFor({ ...valid, name: "    " }, "name")).toBe("Enter your full name");
  });
});
