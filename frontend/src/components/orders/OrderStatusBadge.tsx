import { cn } from "@/lib/utils";
import { orderStatusMeta, type OrderStatus } from "@/domain/orders";

const OrderStatusBadge = ({ status }: { status: OrderStatus }) => {
  const meta = orderStatusMeta[status] ?? {
    label: status,
    className: "bg-muted text-muted-foreground",
    dot: "bg-muted-foreground",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
        meta.className,
      )}
    >
      <span className={cn("h-1.5 w-1.5 shrink-0 rounded-full", meta.dot)} />
      {meta.label}
    </span>
  );
};

export default OrderStatusBadge;
