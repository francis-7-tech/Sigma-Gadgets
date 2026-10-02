import { beforeEach, describe, expect, it, vi } from "vitest";

const fake = vi.hoisted(() => ({
  userExists: true,
  welcomeEmailSentAt: null as Date | null,
  sendEmail: vi.fn(),
  authConfig: null as null | { events?: Record<string, unknown>; callbacks?: Record<string, unknown> },
}));

vi.mock("@/db/client", () => ({
  db: {
    select: () => ({
      from: () => ({
        where: async () => (fake.userExists ? [{ sentAt: fake.welcomeEmailSentAt }] : []),
      }),
    }),
    update: () => ({
      set: (values: { welcomeEmailSentAt: Date }) => ({
        where: async () => {
          if (fake.welcomeEmailSentAt === null) fake.welcomeEmailSentAt = values.welcomeEmailSentAt;
        },
      }),
    }),
  },
}));
vi.mock("@/lib/email", () => ({ sendEmail: fake.sendEmail }));

vi.mock("next-auth", () => ({
  default: (config: typeof fake.authConfig) => {
    fake.authConfig = config;
    return { handlers: {}, auth: vi.fn(), signIn: vi.fn(), signOut: vi.fn() };
  },
}));
vi.mock("next-auth/providers/google", () => ({ default: {} }));
vi.mock("@auth/drizzle-adapter", () => ({ DrizzleAdapter: () => ({}) }));

const { sendWelcomeEmail } = await import("@/lib/welcome");

const ada = { id: "user-1", email: "ada@example.com", name: "Ada Obi" };

beforeEach(() => {
  fake.userExists = true;
  fake.welcomeEmailSentAt = null;
  fake.sendEmail.mockReset().mockResolvedValue({ sent: true });
  vi.spyOn(console, "error").mockImplementation(() => {});
});

describe("sendWelcomeEmail", () => {
  it("sends one welcome email to a new user and records it", async () => {
    await sendWelcomeEmail(ada);

    expect(fake.sendEmail).toHaveBeenCalledTimes(1);
    expect(fake.sendEmail.mock.calls[0][0]).toMatchObject({
      to: { email: "ada@example.com", name: "Ada Obi" },
      subject: "Welcome to Sigma Gadgets, Ada",
    });
    expect(fake.welcomeEmailSentAt).toBeInstanceOf(Date);
  });

  it("never sends a second welcome email to the same user", async () => {
    await sendWelcomeEmail(ada);
    await sendWelcomeEmail(ada);
    await sendWelcomeEmail(ada);

    expect(fake.sendEmail).toHaveBeenCalledTimes(1);
  });

  it("does not record a dry run, so a real send can still happen later", async () => {
    fake.sendEmail.mockResolvedValue({ sent: false, reason: "dry-run" });

    await sendWelcomeEmail(ada);

    expect(fake.sendEmail).toHaveBeenCalledTimes(1);
    expect(fake.welcomeEmailSentAt).toBeNull();
  });

  it("does not throw when Brevo fails, and leaves the user unmarked", async () => {
    fake.sendEmail.mockRejectedValue(new Error("Brevo send failed (500)"));

    await expect(sendWelcomeEmail(ada)).resolves.toBeUndefined();
    expect(fake.welcomeEmailSentAt).toBeNull();
    expect(console.error).toHaveBeenCalled();
  });

  it("uses a neutral subject when Google gives no name", async () => {
    await sendWelcomeEmail({ id: "user-1", email: "ada@example.com", name: null });

    expect(fake.sendEmail.mock.calls[0][0].subject).toBe("Welcome to Sigma Gadgets");
  });

  it("sends nothing without an email address or a matching user", async () => {
    await sendWelcomeEmail({ id: "user-1", email: null });
    fake.userExists = false;
    await sendWelcomeEmail(ada);

    expect(fake.sendEmail).not.toHaveBeenCalled();
  });
});

describe("Auth.js wiring", () => {
  it("sends the welcome email only when a user is created, not on later sign-ins", async () => {
    await import("@/lib/auth");
    const config = fake.authConfig!;

    expect(Object.keys(config.events ?? {})).toEqual(["createUser"]);
    expect(config.callbacks?.signIn).toBeUndefined();

    const createUser = config.events!.createUser as (msg: { user: typeof ada }) => Promise<void>;
    await createUser({ user: ada });
    await sendWelcomeEmail(ada);
    expect(fake.sendEmail).toHaveBeenCalledTimes(1);
  });
});
