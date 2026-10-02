import { and, eq, isNull } from "drizzle-orm";
import { db } from "@/db/client";
import { users } from "@/db/schema";
import WelcomeEmail from "@/emails/Welcome";
import { sendEmail } from "@/lib/email";
import { shopWhatsApp, shopWhatsAppUrl, siteUrl } from "@/lib/site";

type NewUser = { id?: string; email?: string | null; name?: string | null };

export async function sendWelcomeEmail(user: NewUser): Promise<void> {
  if (!user.id || !user.email) return;

  try {
    const [row] = await db
      .select({ sentAt: users.welcomeEmailSentAt })
      .from(users)
      .where(eq(users.id, user.id));
    if (!row || row.sentAt) return;

    const firstName = user.name?.trim().split(/\s+/)[0] || null;
    const result = await sendEmail({
      to: { email: user.email, name: user.name ?? undefined },
      subject: firstName ? `Welcome to Sigma Gadgets, ${firstName}` : "Welcome to Sigma Gadgets",
      react: (
        <WelcomeEmail
          firstName={firstName}
          shopUrl={siteUrl}
          whatsApp={shopWhatsApp}
          whatsAppUrl={shopWhatsAppUrl}
        />
      ),
    });

    if (result.sent) {
      await db
        .update(users)
        .set({ welcomeEmailSentAt: new Date() })
        .where(and(eq(users.id, user.id), isNull(users.welcomeEmailSentAt)));
    }
  } catch (error) {
    console.error(`[welcome-email] Could not send welcome email to user ${user.id}:`, error);
  }
}
