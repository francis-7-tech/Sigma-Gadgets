import type { Metadata } from "next";
import { Logo } from "@/components/logo";
import { requireUser, signOut } from "@/lib/auth";
import { authorizeParamsSchema } from "@/lib/mobile-auth-schema";

export const metadata: Metadata = { title: "Sign in to the app" };

export default async function MobileAuthorizePage({ searchParams }: PageProps<"/mobile/authorize">) {
  const parsed = authorizeParamsSchema.safeParse(await searchParams);

  if (!parsed.success) {
    return (
      <Card title="This sign-in link isn't valid">
        <p className="text-muted-foreground">Go back to the Sigma Gadgets app and tap &quot;Sign in&quot; again.</p>
      </Card>
    );
  }

  const params = parsed.data;
  const query = new URLSearchParams({
    redirect_uri: params.redirect_uri,
    code_challenge: params.code_challenge,
    ...(params.state ? { state: params.state } : {}),
  });
  const returnTo = `/mobile/authorize?${query}`;
  const user = await requireUser(returnTo);

  async function switchAccount() {
    "use server";
    await signOut({ redirectTo: returnTo });
  }

  return (
    <Card title="Sign in to the Sigma Gadgets app">
      <p className="text-muted-foreground">The app will use this account. Your cart is shared with the website.</p>
      <p className="w-full rounded-control bg-muted px-4 py-3">
        <strong className="block">{user.name || "Your account"}</strong>
        <span className="text-sm text-muted-foreground">{user.email}</span>
      </p>

      <form method="post" action="/api/mobile/authorize" className="w-full">
        <input type="hidden" name="redirect_uri" value={params.redirect_uri} />
        <input type="hidden" name="code_challenge" value={params.code_challenge} />
        <input type="hidden" name="state" value={params.state ?? ""} />
        <button
          type="submit"
          className="flex min-h-12 w-full items-center justify-center rounded-full bg-primary px-5 font-bold text-primary-foreground hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          Continue to the app
        </button>
      </form>

      <form action={switchAccount}>
        <button type="submit" className="min-h-11 font-semibold underline underline-offset-4">
          Use a different account
        </button>
      </form>
    </Card>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <main className="flex flex-1 items-center justify-center px-4 py-16">
      <div className="flex w-full max-w-[440px] flex-col items-center gap-5 rounded-card border border-border bg-card p-8 text-center sm:p-12">
        <Logo />
        <h1 className="font-heading text-3xl font-extrabold tracking-tight">{title}</h1>
        {children}
      </div>
    </main>
  );
}
