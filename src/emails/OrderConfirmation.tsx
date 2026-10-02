import { Body, Container, Head, Html, Link, Preview, Section, Text } from "@react-email/components";

export type OrderConfirmationProps = {
  firstName: string | null;
  orderNumber: string;
  orderDate: string;
  items: { name: string; quantity: number; lineTotal: string }[];
  subtotal: string;
  deliveryFee: string;
  total: string;
  bankName: string;
  accountName: string;
  accountNumber: string;
  shippingLine: string;
  orderUrl: string;
  whatsApp: string;
  whatsAppUrl: string;
};

export default function OrderConfirmation(props: OrderConfirmationProps) {
  const { orderNumber, total } = props;
  return (
    <Html lang="en">
      <Head />
      <Preview>{`Transfer ${total} with reference ${orderNumber} to complete your order.`}</Preview>
      <Body style={body}>
        <Container style={container}>
          <Section style={header}>
            <Text style={brand}>
              <span style={brandMark}>Σ</span> Sigma Gadgets
            </Text>
          </Section>

          <Section style={content}>
            <Text style={paragraph}>Hi {props.firstName ?? "there"},</Text>
            <Text style={paragraph}>
              Thanks for shopping with Sigma Gadgets! We&apos;ve received your order and reserved your items.
            </Text>
            <Text style={paragraph}>
              <strong>Order {orderNumber}</strong> · {props.orderDate}
            </Text>

            <table style={table} cellPadding={0} cellSpacing={0} role="presentation">
              <thead>
                <tr>
                  <th style={{ ...th, textAlign: "left" }}>Item</th>
                  <th style={{ ...th, textAlign: "center" }}>Qty</th>
                  <th style={{ ...th, textAlign: "right" }}>Price</th>
                </tr>
              </thead>
              <tbody>
                {props.items.map((item, i) => (
                  <tr key={i}>
                    <td style={td}>{item.name}</td>
                    <td style={{ ...td, textAlign: "center" }}>{item.quantity}</td>
                    <td style={{ ...td, textAlign: "right", whiteSpace: "nowrap" }}>{item.lineTotal}</td>
                  </tr>
                ))}
                <tr>
                  <td style={sumLabel}>Subtotal</td>
                  <td />
                  <td style={sumValue}>{props.subtotal}</td>
                </tr>
                <tr>
                  <td style={sumLabel}>Delivery</td>
                  <td />
                  <td style={sumValue}>{props.deliveryFee}</td>
                </tr>
                <tr>
                  <td style={{ ...sumLabel, color: "#14171C", fontWeight: 800 }}>Total</td>
                  <td />
                  <td style={{ ...sumValue, fontWeight: 800 }}>{total}</td>
                </tr>
              </tbody>
            </table>

            <Section style={payBox}>
              <Text style={payTitle}>How to pay</Text>
              <Text style={payLine}>
                Please transfer <strong>{total}</strong> to:
              </Text>
              <Text style={payLine}>Bank: {props.bankName}</Text>
              <Text style={payLine}>Account name: {props.accountName}</Text>
              <Text style={payLine}>Account number: {props.accountNumber}</Text>
              <Text style={payLine}>
                <strong>Reference / narration: {orderNumber}</strong>
              </Text>
            </Section>

            <Text style={paragraph}>
              Your items are held for <strong>48 hours</strong>. When your payment arrives, we&apos;ll confirm
              your order and send it out. If we don&apos;t receive payment within that time, the order is
              cancelled automatically and the items go back on sale.
            </Text>

            <Text style={paragraph}>
              <strong>Delivering to</strong>
              <br />
              {props.shippingLine}
            </Text>

            <Text style={paragraph}>
              You can also see these details on your{" "}
              <Link href={props.orderUrl} style={link}>
                order page
              </Link>
              .
            </Text>

            <Text style={paragraph}>
              Questions? Reply to this email or WhatsApp us on{" "}
              <Link href={props.whatsAppUrl} style={link}>
                {props.whatsApp}
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
  maxWidth: "600px",
  margin: "0 auto",
  backgroundColor: "#FFFFFF",
  border: "1px solid #E2E5EA",
  borderRadius: "18px",
  overflow: "hidden" as const,
};
const header = { backgroundColor: "#111317", padding: "20px 32px" };
const brand = { margin: 0, color: "#FFFFFF", fontSize: "18px", fontWeight: 800, lineHeight: "32px" };
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
const table = { width: "100%", borderCollapse: "collapse" as const, margin: "8px 0 24px", fontSize: "15px" };
const th = {
  padding: "8px 0",
  borderBottom: "1px solid #DADDE2",
  color: "#59606B",
  fontWeight: 600,
  fontSize: "14px",
};
const td = { padding: "12px 4px 12px 0", borderBottom: "1px solid #EDEFF2", color: "#14171C" };
const sumLabel = { padding: "8px 0 0", color: "#59606B" };
const sumValue = { padding: "8px 0 0", textAlign: "right" as const, color: "#14171C", whiteSpace: "nowrap" as const };
const payBox = { backgroundColor: "#EEF0F2", borderRadius: "12px", padding: "20px", margin: "0 0 20px" };
const payTitle = { margin: "0 0 8px", color: "#14171C", fontSize: "17px", fontWeight: 800 };
const payLine = { margin: "0 0 4px", color: "#14171C", fontSize: "15px", lineHeight: "24px" };
const link = { color: "#14171C", textDecoration: "underline" };
