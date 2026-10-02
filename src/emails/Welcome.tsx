import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";

export type WelcomeEmailProps = {
  firstName: string | null;
  shopUrl: string;
  whatsApp: string;
  whatsAppUrl: string;
};

export default function WelcomeEmail({ firstName, shopUrl, whatsApp, whatsAppUrl }: WelcomeEmailProps) {
  return (
    <Html lang="en">
      <Head />
      <Preview>Your Sigma Gadgets account is ready. Here&apos;s how ordering works.</Preview>
      <Body style={body}>
        <Container style={container}>
          <Section style={header}>
            <Text style={brand}>
              <span style={brandMark}>Σ</span> Sigma Gadgets
            </Text>
          </Section>

          <Section style={content}>
            <Text style={paragraph}>Hi {firstName ?? "there"},</Text>
            <Text style={paragraph}>Thanks for joining Sigma Gadgets! Your account is ready.</Text>

            <Heading as="h2" style={heading}>
              How ordering works
            </Heading>
            <ol style={list}>
              <li style={listItem}>
                Add the gadgets you want to your cart. It&apos;s saved to your account, so you can finish
                on any device.
              </li>
              <li style={listItem}>
                Place your order. We&apos;ll hold your items for 48 hours and email you our bank details.
              </li>
              <li style={listItem}>
                Pay by bank transfer using your order number as the reference. We confirm and ship as
                soon as it lands.
              </li>
            </ol>

            <Section style={buttonRow}>
              <Button href={`${shopUrl}/products`} style={button}>
                Start shopping
              </Button>
            </Section>

            <Text style={paragraph}>
              Questions? Reply to this email or WhatsApp us on{" "}
              <Link href={whatsAppUrl} style={link}>
                {whatsApp}
              </Link>
              .
            </Text>
            <Text style={paragraph}>– The Sigma Gadgets team</Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

const fontFamily = "Inter, Helvetica, Arial, sans-serif";

const body = { backgroundColor: "#F7F8FA", fontFamily, margin: 0, padding: "32px 12px" };
const container = {
  maxWidth: "560px",
  margin: "0 auto",
  backgroundColor: "#FFFFFF",
  border: "1px solid #E2E5EA",
  borderRadius: "18px",
  overflow: "hidden" as const,
};
const header = { backgroundColor: "#111317", padding: "20px 32px" };
const brand = {
  margin: 0,
  color: "#FFFFFF",
  fontSize: "18px",
  fontWeight: 800,
  lineHeight: "32px",
};
const brandMark = {
  display: "inline-block",
  width: "32px",
  height: "32px",
  marginRight: "8px",
  borderRadius: "8px",
  backgroundColor: "#FFFFFF",
  color: "#111317",
  textAlign: "center" as const,
  verticalAlign: "middle",
};
const content = { padding: "32px" };
const paragraph = { margin: "0 0 16px", color: "#14171C", fontSize: "16px", lineHeight: "26px" };
const heading = { margin: "24px 0 8px", color: "#14171C", fontSize: "18px", fontWeight: 800 };
const list = { margin: "0 0 24px", paddingLeft: "22px", color: "#14171C" };
const listItem = { margin: "0 0 10px", fontSize: "16px", lineHeight: "26px" };
const buttonRow = { margin: "8px 0 24px" };
const button = {
  backgroundColor: "#111317",
  color: "#FFFFFF",
  borderRadius: "999px",
  padding: "14px 28px",
  fontSize: "16px",
  fontWeight: 700,
  textDecoration: "none",
};
const link = { color: "#14171C", textDecoration: "underline" };
