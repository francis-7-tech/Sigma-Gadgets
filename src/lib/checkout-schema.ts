import { z } from "zod";
import { NIGERIAN_STATES } from "@/lib/nigeria";

export const checkoutSchema = z.object({
  name: z.string().trim().min(2, "Enter your full name").max(100),
  phone: z
    .string()
    .trim()
    .regex(/^\+?[0-9 ()-]{10,20}$/, "Enter a valid phone number, e.g. 0803 000 0000"),
  address: z.string().trim().min(5, "Enter your street address").max(200),
  city: z.string().trim().min(2, "Enter your city or area").max(100),
  state: z.enum(NIGERIAN_STATES, { message: "Choose your state" }),
});

export type CheckoutField = keyof z.infer<typeof checkoutSchema>;
