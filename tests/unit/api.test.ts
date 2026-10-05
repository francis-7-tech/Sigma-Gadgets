import { describe, expect, it } from "vitest";
import { z } from "zod";
import { apiError, apiJson, bearerToken, readJsonBody, unauthorized, validationError } from "@/lib/api";

describe("bearerToken", () => {
  it("reads the token from a Bearer header", () => {
    expect(bearerToken("Bearer 3f6c1e0a-9d2b-4c57-8a41-0b7e5d9c2f10")).toBe("3f6c1e0a-9d2b-4c57-8a41-0b7e5d9c2f10");
  });

  it("rejects anything that isn't a well-formed Bearer token", () => {
    for (const header of [null, "", "Bearer", "Bearer ", "Bearer short", "Basic dXNlcjpwYXNz", "bearer 3f6c1e0a-9d2b-4c57-8a41-0b7e5d9c2f10", "Bearer has spaces in the token value", `Bearer ${"a".repeat(513)}`]) {
      expect(bearerToken(header), JSON.stringify(header)).toBeNull();
    }
  });
});

describe("API responses", () => {
  it("never lets responses be cached", () => {
    expect(apiJson({ ok: true }).headers.get("cache-control")).toBe("no-store");
    expect(apiError(404, "x", "y").headers.get("cache-control")).toBe("no-store");
  });

  it("uses one error shape with a status code", async () => {
    const response = apiError(409, "out_of_stock", "Sorry, this item is out of stock.");
    expect(response.status).toBe(409);
    expect(await response.json()).toEqual({ error: { code: "out_of_stock", message: "Sorry, this item is out of stock." } });
  });

  it("answers 401 when nobody is signed in", async () => {
    const response = unauthorized();
    expect(response.status).toBe(401);
    expect((await response.json()).error.code).toBe("unauthorized");
  });

  it("lists the first problem for each invalid field", async () => {
    const schema = z.object({ productId: z.number("Send productId as a number"), quantity: z.number().min(1, "Quantity must be at least 1") });
    const parsed = schema.safeParse({ productId: "7", quantity: 0 });
    const response = validationError(parsed.error!);

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({
      error: {
        code: "invalid_request",
        message: "Some values are missing or invalid.",
        fields: { productId: "Send productId as a number", quantity: "Quantity must be at least 1" },
      },
    });
  });
});

describe("readJsonBody", () => {
  it("returns the parsed body", async () => {
    const request = new Request("http://test.local", { method: "POST", body: JSON.stringify({ quantity: 2 }) });
    expect(await readJsonBody(request)).toEqual({ quantity: 2 });
  });

  it("returns undefined for a missing or broken body instead of throwing", async () => {
    expect(await readJsonBody(new Request("http://test.local", { method: "POST" }))).toBeUndefined();
    expect(await readJsonBody(new Request("http://test.local", { method: "POST", body: "{not json" }))).toBeUndefined();
  });
});
