import { useMemo } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { MoreVertical, Package, Eye, Pencil } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import OrderStatusBadge from "@/components/orders/OrderStatusBadge";
import type { Order } from "@/domain/orders";
import { cn } from "@/lib/utils";

function formatDate(ddMmYyyy: string): string {
  if (!ddMmYyyy) return "";
  try {
    const parts = ddMmYyyy.split("/");
    if (parts.length !== 3) return ddMmYyyy;
    const d = new Date(+parts[2], +parts[1] - 1, +parts[0]);
    return format(d, "d MMM yyyy", { locale: es });
  } catch {
    return ddMmYyyy;
  }
}

interface Props {
  orders: Order[];
  selectedIds: Set<string>;
  onSelectionChange: (ids: Set<string>) => void;
  onView?: (o: Order) => void;
  onEdit?: (o: Order) => void;
  visibleColumns: string[];
}

const OrderTable = ({ orders, selectedIds, onSelectionChange, onView, onEdit, visibleColumns }: Props) => {
  const allVisibleIds = useMemo(() => orders.map((o) => o.id), [orders]);
  const allSelected =
    orders.length > 0 && orders.every((o) => selectedIds.has(o.id));

  const toggleAll = (checked: boolean) => {
    if (checked) {
      onSelectionChange(new Set([...selectedIds, ...allVisibleIds]));
    } else {
      const next = new Set(selectedIds);
      allVisibleIds.forEach((id) => next.delete(id));
      onSelectionChange(next);
    }
  };

  const toggleOne = (id: string, checked: boolean) => {
    const next = new Set(selectedIds);
    if (checked) next.add(id);
    else next.delete(id);
    onSelectionChange(next);
  };

  return (
    <div className="overflow-x-auto scrollbar-thin">
      <table className="w-full">
        <thead>
          <tr className="h-11 bg-[#eef1f5] text-left text-xs font-bold text-[#647789]">
            <th className="w-10 px-5">
              <div className="inline-flex items-center justify-center rounded-full p-1 transition-colors hover:bg-primary/10 -ml-1.5">
                <Checkbox
                  checked={allSelected}
                  onCheckedChange={(c) => toggleAll(c === true)}
                  className="h-4 w-4 border-2 border-gray-400 data-[state=checked]:bg-primary data-[state=checked]:border-primary rounded"
                />
              </div>
            </th>
            <th className={cn("px-3", !visibleColumns.includes("orden") && "hidden")}>Orden</th>
            <th className={cn("px-3", !visibleColumns.includes("estado") && "hidden")}>Estado</th>
            <th className={cn("px-3", !visibleColumns.includes("subestado") && "hidden")}>Subestado</th>
            <th className={cn("px-3", !visibleColumns.includes("vehiculo") && "hidden")}>Vehículo</th>
            <th className={cn("px-3", !visibleColumns.includes("cliente") && "hidden")}>Cliente</th>
            <th className={cn("px-3", !visibleColumns.includes("contacto") && "hidden")}>Contacto</th>
            <th className={cn("px-3", !visibleColumns.includes("fecha") && "hidden")}>Fecha ruta</th>
            <th className="w-14 px-3"></th>
          </tr>
        </thead>
        <tbody>
          {orders.map((o) => (
            <tr
              key={o.id}
              className={cn(
                "h-[60px] border-b border-dashed border-[#e3e8ee] bg-white/30 transition-colors hover:bg-[#fafbfc]",
                selectedIds.has(o.id) && "bg-red-50",
              )}
            >
              <td className="px-5">
                <div className="inline-flex items-center justify-center rounded-full p-1 transition-colors hover:bg-primary/10 -ml-1.5">
                  <Checkbox
                    checked={selectedIds.has(o.id)}
                    onCheckedChange={(c) => toggleOne(o.id, c === true)}
                    className="h-4 w-4 border-2 border-gray-400 data-[state=checked]:bg-primary data-[state=checked]:border-primary rounded"
                  />
                </div>
              </td>
                <td className={cn("px-3", !visibleColumns.includes("orden") && "hidden")}>
                <button
                  onClick={() => onView?.(o)}
                  className="flex items-center gap-3 text-left group"
                >
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[#dfe4ea] text-[#5f7282] transition-colors group-hover:bg-primary group-hover:text-white">
                    <Package className="h-3.5 w-3.5" />
                  </div>
                  <span className="text-sm font-medium text-[#1f2933] transition-colors group-hover:text-primary group-hover:underline underline-offset-4">
                    {o.id}
                  </span>
                </button>
              </td>
              <td className={cn("px-3", !visibleColumns.includes("estado") && "hidden")}>
                <OrderStatusBadge status={o.status} />
              </td>
              <td className={cn("px-3", !visibleColumns.includes("subestado") && "hidden")}>
                <span className="text-sm text-[#52677a]">{o.substatus || "—"}</span>
              </td>
              <td className={cn("px-3", !visibleColumns.includes("vehiculo") && "hidden")}>
                <span className={cn(
                  "text-sm font-medium text-[#1f2933]",
                  o.vehiclePlate === "—" && "text-muted-foreground",
                )}>
                  {o.vehiclePlate}
                </span>
              </td>
              <td className={cn("max-w-[180px] px-3", !visibleColumns.includes("cliente") && "hidden")}>
                <p className="truncate text-sm font-medium text-[#1f2933]" title={o.clientName}>
                  {o.clientName}
                </p>
              </td>
              <td className={cn("max-w-[160px] px-3", !visibleColumns.includes("contacto") && "hidden")}>
                <p className="truncate text-sm text-[#52677a]" title={o.contactName}>
                  {o.contactName || "—"}
                </p>
              </td>
              <td className={cn("whitespace-nowrap px-3 text-sm tabular-nums text-[#1f2933]", !visibleColumns.includes("fecha") && "hidden")}>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-[#1f2933]">
                    <span className="text-[11px] font-medium text-[#52677a] uppercase tracking-wide mr-1.5">Inicio</span>
                    {formatDate(o.routeDate)}
                  </p>
                  <p className="text-sm font-medium text-[#1f2933]">
                    <span className="text-[11px] font-medium text-[#52677a] uppercase tracking-wide mr-1.5">Fin</span>
                    {formatDate(o.routeDate)}
                  </p>
                </div>
              </td>
              <td className="px-3 text-right" onClick={(e) => e.stopPropagation()}>
                <DropdownMenu>
                  <DropdownMenuTrigger className="rounded-md p-1.5 text-[#8a9aab] hover:bg-[#e9eef2] hover:text-[#1f2933] transition-colors">
                    <MoreVertical className="h-4 w-4" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-40">
                    <DropdownMenuItem onClick={() => onView?.(o)} className="cursor-pointer">
                      <Eye className="mr-2 h-4 w-4" /> Ver detalle
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onEdit?.(o)} className="cursor-pointer">
                      <Pencil className="mr-2 h-4 w-4" /> Editar
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default OrderTable;
