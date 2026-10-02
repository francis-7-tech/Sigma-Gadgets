import { render } from "@react-email/render";
import type { ReactElement } from "react";

type SendEmailInput = {
  to: { email: string; name?: string };
  subject: string;
  react: ReactElement;
};

export type SendEmailResult = { sent: true } | { sent: false; reason: "dry-run" };

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is not set. Add it to .env.local (see .env.example).`);
  return value;
}

export async function sendEmail({ to, subject, react }: SendEmailInput): Promise<SendEmailResult> {
  const html = await render(react);
  const text = await render(react, { plainText: true });

  if (process.env.EMAIL_DRY_RUN === "true") {
    console.log(`\n[email dry run] To: ${to.email}\nSubject: ${subject}\n\n${text}\n`);
    return { sent: false, reason: "dry-run" };
  }

  const response = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "api-key": requireEnv("BREVO_API_KEY"),
      "content-type": "application/json",
      accept: "application/json",
    },
    body: JSON.stringify({
      sender: { name: requireEnv("EMAIL_FROM_NAME"), email: requireEnv("EMAIL_FROM_ADDRESS") },
      to: [to],
      subject,
      htmlContent: html,
      textContent: text,
    }),
  });

  if (!response.ok) {
    throw new Error(`Brevo send failed (${response.status}): ${await response.text()}`);
  }
  return { sent: true };
}
