import type { Metadata } from "next";
import {
  ILLUSTRATIVE_PHOTO_CREDITS,
  PRODUCT_PHOTO_CREDITS,
  SITE_PHOTO_CREDITS,
  type PhotoCredit,
} from "@/lib/photo-credits";

export const metadata: Metadata = { title: "Photo credits" };

export default function CreditsPage() {
  return (
    <main className="mx-auto w-full max-w-[900px] flex-1 px-5 pb-18 pt-7">
      <h1 className="font-heading text-[clamp(1.9rem,4vw,2.75rem)] font-extrabold tracking-tight">Photo credits</h1>
      <p className="mt-2 text-muted-foreground">
        Thank you to the photographers whose work is used on this site. Photos are resized and cropped for display;
        adapted versions of CC BY-SA photos are shared under the same licence.
      </p>

      <CreditList title="Product photos (Wikimedia Commons)" credits={PRODUCT_PHOTO_CREDITS} />
      <CreditList title="Illustrative product photos (Pexels)" credits={ILLUSTRATIVE_PHOTO_CREDITS} />
      <CreditList title="Home page photos (Pexels)" credits={SITE_PHOTO_CREDITS} />
    </main>
  );
}

function CreditList({ title, credits }: { title: string; credits: PhotoCredit[] }) {
  return (
    <section className="mt-10">
      <h2 className="font-heading text-xl font-bold">{title}</h2>
      <ul className="mt-3 divide-y divide-border rounded-card border border-border bg-card">
        {credits.map((credit) => (
          <li key={credit.source} className="flex flex-col gap-0.5 px-5 py-3.5 text-[15px]">
            <span className="font-semibold">{credit.subject}</span>
            <span className="text-muted-foreground">
              by {credit.author} ·{" "}
              {credit.licenceUrl ? (
                <a href={credit.licenceUrl} className="underline underline-offset-3" rel="license noopener" target="_blank">
                  {credit.licence}
                </a>
              ) : (
                credit.licence
              )}{" "}
              ·{" "}
              <a href={credit.source} className="underline underline-offset-3" rel="noopener" target="_blank">
                source
              </a>
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
