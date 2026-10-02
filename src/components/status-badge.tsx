import { STATUS_LABELS, type OrderStatus } from "@/lib/orders";

const STYLES: Record<OrderStatus, string> = {
  pending: "bg-[#FFF1DC] text-[#874600]",
  confirmed: "bg-[#E8EEF6] text-[#25466F]",
  shipped: "bg-[#EFE9FF] text-[#5B2DB3]",
  delivered: "bg-[#DCF5E4] text-[#1D6B3A]",
  cancelled: "bg-muted text-[#4A515C]",
};

export function StatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span className={`inline-flex items-center whitespace-nowrap rounded-full px-3 py-1 text-[13px] font-bold ${STYLES[status]}`}>
      {STATUS_LABELS[status]}
    </span>
  );
}
