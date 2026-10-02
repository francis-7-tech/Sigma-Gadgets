import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Logo } from "@/components/logo";
import { getSession, safeCallbackUrl, signIn } from "@/lib/auth";

export const metadata: Metadata = { title: "Sign in" };

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const { callbackUrl, error } = await searchParams;
  const redirectTo = safeCallbackUrl(callbackUrl);

  const session = await getSession();
  if (session?.user) redirect(redirectTo);

  async function signInWithGoogle() {
    "use server";
    await signIn("google", { redirectTo });
  }

  return (
    <main className="flex flex-1 items-center justify-center px-4 py-16">
      <div className="flex w-full max-w-[440px] flex-col items-center gap-5 rounded-card border border-border bg-card p-8 text-center sm:p-12">
        <Link href="/" aria-label="Sigma Gadgets home">
          <Logo />
        </Link>
        <h1 className="font-heading text-3xl font-extrabold tracking-tight">Sign in to Sigma Gadgets</h1>
        <p className="text-muted-foreground">
          Sign in to add items to your cart and check out. We&apos;ll send order confirmations to your
          Google email.
        </p>

        {error ? (
          <p role="alert" className="w-full rounded-control bg-muted px-4 py-3 text-sm">
            Sign-in didn&apos;t work. Please try again.
          </p>
        ) : null}

        <form action={signInWithGoogle} className="w-full">
          <button
            type="submit"
            className="flex min-h-12 w-full items-center justify-center gap-3 rounded-full border border-[#747775] bg-white px-5 font-semibold text-[#1F1F1F] transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            <GoogleIcon />
            Continue with Google
          </button>
        </form>

        <Link href="/" className="font-semibold underline underline-offset-4">
          Keep browsing
        </Link>
      </div>
    </main>
  );
}

function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 48 48" aria-hidden="true">
      <path
        fill="#EA4335"
        d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
      />
      <path
        fill="#4285F4"
        d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
      />
      <path
        fill="#FBBC05"
        d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
      />
      <path
        fill="#34A853"
        d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
      />
    </svg>
  );
}
