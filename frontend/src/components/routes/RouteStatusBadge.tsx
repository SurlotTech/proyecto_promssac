import { cn } from "@/lib/utils";
import { routeStatusMeta, type RouteStatus } from "@/domain/routes";

const RouteStatusBadge = ({ status }: { status: RouteStatus }) => {
  const meta = routeStatusMeta[status] ?? {
    label: status,
    className: "bg-[#e9eef2] text-[#5f7282]",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md px-2 py-1.5 text-xs font-bold",
        meta.className,
      )}
    >
      {meta.label}
    </span>
  );
};

export default RouteStatusBadge;
