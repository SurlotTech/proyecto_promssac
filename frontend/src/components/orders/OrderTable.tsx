import { useMemo } from "react";
import { MoreHorizontal, Package, Eye, Pencil } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import OrderStatusBadge from "@/components/orders/OrderStatusBadge";
import type { Order } from "@/data/orders";
import { cn } from "@/lib/utils";

interface Props {
  orders: Order[];
  selectedIds: Set<string>;
  onSelectionChange: (ids: Set<string>) => void;
  onView?: (o: Order) => void;
}

const OrderTable = ({ orders, selectedIds, onSelectionChange, onView }: Props) => {
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
    <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
      <div className="overflow-x-auto scrollbar-thin">
        <table className="w-full min-w-[800px] text-sm">
          <thead>
            <tr className="border-b border-border bg-surface-muted text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <th className="w-10 px-3 py-3.5">
                <Checkbox
                  checked={allSelected}
                  onCheckedChange={(c) => toggleAll(c === true)}
                  aria-label="Seleccionar todas las filas visibles"
                />
              </th>
              <th className="px-3 py-3.5">Orden</th>
              <th className="px-3 py-3.5">Estado</th>
              <th className="px-3 py-3.5">Subestado</th>
              <th className="px-3 py-3.5">Vehículo</th>
              <th className="px-3 py-3.5">Cliente</th>
              <th className="px-3 py-3.5">Fecha de ruta</th>
              <th className="w-12 px-2 py-3.5 text-right" />
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {orders.map((o) => (
              <tr
                key={o.id}
                className="group transition-colors hover:bg-surface-muted/80"
              >
                <td className="px-3 py-3.5">
                  <Checkbox
                    checked={selectedIds.has(o.id)}
                    onCheckedChange={(c) => toggleOne(o.id, c === true)}
                    aria-label={`Seleccionar ${o.id}`}
                  />
                </td>
                <td className="px-3 py-3.5">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary-soft text-primary">
                      <Package className="h-3.5 w-3.5" />
                    </div>
                    <span className="font-semibold text-foreground">{o.id}</span>
                  </div>
                </td>
                <td className="px-3 py-3.5">
                  <OrderStatusBadge status={o.status} />
                </td>
                <td className="px-3 py-3.5 text-foreground">{o.substatus}</td>
                <td className="px-3 py-3.5">
                  <span
                    className={cn(
                      "font-medium tabular-nums",
                      o.vehiclePlate === "—" && "text-muted-foreground",
                    )}
                  >
                    {o.vehiclePlate}
                  </span>
                </td>
                <td className="max-w-[200px] px-3 py-3.5">
                  <p className="truncate font-medium text-foreground" title={o.clientName}>
                    {o.clientName}
                  </p>
                  <p className="truncate text-xs text-muted-foreground" title={o.contactName}>
                    {o.contactName}
                  </p>
                </td>
                <td className="whitespace-nowrap px-3 py-3.5 tabular-nums text-foreground">
                  {o.routeDate}
                </td>
                <td className="px-1 py-2 text-right" onClick={(e) => e.stopPropagation()}>
                  <DropdownMenu>
                    <DropdownMenuTrigger className="rounded-md p-1.5 text-muted-foreground opacity-0 transition-opacity hover:bg-muted hover:text-foreground group-hover:opacity-100 data-[state=open]:opacity-100">
                      <MoreHorizontal className="h-4 w-4" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-40">
                      <DropdownMenuItem
                        onClick={() => onView?.(o)}
                        className="cursor-pointer"
                      >
                        <Eye className="mr-2 h-4 w-4" /> Ver detalle
                      </DropdownMenuItem>
                      <DropdownMenuItem className="cursor-pointer">
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
    </div>
  );
};

export default OrderTable;
