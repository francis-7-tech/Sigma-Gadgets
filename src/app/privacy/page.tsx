import type { Metadata } from "next";
import type { ReactNode } from "react";
import { shopWhatsApp, shopWhatsAppUrl } from "@/lib/site";

export const metadata: Metadata = { title: "Privacy policy" };

const contactEmail = process.env.EMAIL_FROM_ADDRESS ?? "";

export default function PrivacyPage() {
  return (
    <main className="mx-auto w-full max-w-[760px] flex-1 px-5 pb-18 pt-7">
      <h1 className="font-heading text-[clamp(1.9rem,4vw,2.75rem)] font-extrabold tracking-tight">Privacy policy</h1>
      <p className="mt-2 text-sm text-muted-foreground">Last updated 2 October 2026</p>

      <Section title="What we collect">
        <ul className="list-disc space-y-1.5 pl-5">
          <li>Your name, email address and profile photo from Google when you sign in.</li>
          <li>The delivery name, phone number and address you enter at checkout.</li>
          <li>Your cart and your orders.</li>
        </ul>
      </Section>

      <Section title="Why we use it">
        <ul className="list-disc space-y-1.5 pl-5">
          <li>To sign you in and keep your cart saved to your account.</li>
          <li>To process, deliver and support your orders.</li>
          <li>To send a welcome email when you first sign up, and a confirmation email for each order.</li>
        </ul>
        <p>We don&apos;t send marketing emails, and we never sell or rent your data.</p>
      </Section>

      <Section title="Who processes it for us">
        <ul className="list-disc space-y-1.5 pl-5">
          <li>Google: sign-in.</li>
          <li>Neon: our database.</li>
          <li>Brevo: sending emails.</li>
          <li>Vercel: hosting the website.</li>
          <li>Cloudinary: product photos (it does not receive your personal data).</li>
        </ul>
      </Section>

      <Section title="Payments">
        <p>
          We don&apos;t take card payments on this site. You pay by bank transfer from your own bank, so we never see your
          card or bank login details.
        </p>
      </Section>

      <Section title="Cookies">
        <p>We use one essential cookie to keep you signed in. There are no advertising or tracking cookies.</p>
      </Section>

      <Section title="How long we keep it">
        <p>
          We keep your account until you ask us to delete it. We keep order records as long as we need them for
          accounting and customer support.
        </p>
      </Section>

      <Section title="Your rights">
        <p>
          You can ask to see, correct or delete your data at any time. Contact us
          {shopWhatsApp ? (
            <>
              {" "}
              on WhatsApp at{" "}
              <a href={shopWhatsAppUrl} className="font-semibold underline underline-offset-3">
                {shopWhatsApp}
              </a>
            </>
          ) : null}
          {shopWhatsApp && contactEmail ? " or" : null}
          {contactEmail ? (
            <>
              {" "}
              by email at{" "}
              <a href={`mailto:${contactEmail}`} className="font-semibold underline underline-offset-3">
                {contactEmail}
              </a>
            </>
          ) : null}
          .
        </p>
      </Section>
    </main>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mt-8 flex flex-col gap-2.5">
      <h2 className="font-heading text-xl font-bold">{title}</h2>
      {children}
    </section>
  );
}
