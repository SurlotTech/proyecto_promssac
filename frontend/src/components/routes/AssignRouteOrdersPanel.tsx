import { Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type { Order } from "@/domain/orders";
import { orderStatusMeta } from "@/domain/orders";
import type { AssignOrderStatusFilter } from "@/lib/assignRouteFilters";

interface Props {
  dayIso: string;
  loadingOrders: boolean;
  orders: Order[];
  orderStatusFilter: AssignOrderStatusFilter;
  onOrderStatusFilterChange: (v: AssignOrderStatusFilter) => void;
  orderSearch: string;
  onOrderSearchChange: (v: string) => void;
  selectedOrderIds: string[];
  onToggleOrder: (id: string) => void;
  onNuevaOrden: () => void;
}

const AssignRouteOrdersPanel = ({
  dayIso,
  loadingOrders,
  orders,
  orderStatusFilter,
  onOrderStatusFilterChange,
  orderSearch,
  onOrderSearchChange,
  selectedOrderIds,
  onToggleOrder,
  onNuevaOrden,
}: Props) => {
  return (
    <div className="flex flex-col border-r border-border bg-muted/10">
      <div className="border-b border-border bg-background/50 px-4 py-4 sm:px-6">
        <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Órdenes candidatas</h3>
        <p className="mt-1 text-[11px] text-muted-foreground">
          Misma fecha de ruta ({dayIso}). Usa el filtro y la búsqueda para acotar.
        </p>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Estado de la orden</Label>
            <Select
              value={orderStatusFilter}
              onValueChange={(v) => onOrderStatusFilterChange(v as AssignOrderStatusFilter)}
            >
              <SelectTrigger className="h-10 bg-background">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Pendiente o en preparación</SelectItem>
                <SelectItem value="pending">Solo pendiente</SelectItem>
                <SelectItem value="preparing">Solo en preparación</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="assign-search-orders" className="text-xs text-muted-foreground">
              Buscar
            </Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="assign-search-orders"
                placeholder="Nº orden, cliente, contacto, placa…"
                className="h-10 bg-background pl-9"
                value={orderSearch}
                onChange={(e) => onOrderSearchChange(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        {loadingOrders ? (
          <p className="text-center text-sm text-muted-foreground">Cargando órdenes…</p>
        ) : orders.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground">
            No hay órdenes con los filtros elegidos para esta fecha.
          </p>
        ) : (
          orders.map((order) => (
            <div
              key={order.id}
              role="button"
              tabIndex={0}
              className="flex cursor-pointer flex-col rounded-lg border border-border bg-card p-4 shadow-sm transition-colors hover:border-primary/50"
              onClick={() => onToggleOrder(order.id)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onToggleOrder(order.id);
                }
              }}
            >
              <div className="mb-2 flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <Checkbox
                    checked={selectedOrderIds.includes(order.id)}
                    onCheckedChange={() => onToggleOrder(order.id)}
                    onClick={(e) => e.stopPropagation()}
                  />
                  <span className="font-semibold text-foreground">{order.id}</span>
                </div>
                <span
                  className={cn(
                    "rounded-full border border-border px-2.5 py-0.5 text-xs font-medium",
                    orderStatusMeta[order.status].className,
                  )}
                >
                  {orderStatusMeta[order.status].label}
                </span>
              </div>
              <div className="mt-2 flex flex-col gap-1.5 pl-7 text-sm text-muted-foreground">
                <p className="text-xs text-foreground/90">{order.clientName || "—"}</p>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs">{order.routeDate}</span>
                  <span className="text-xs text-muted-foreground tabular-nums">{order.vehiclePlate}</span>
                </div>
              </div>
            </div>
          ))
        )}

        <div className="flex justify-center pt-4">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            className="h-8 rounded-full text-xs shadow-sm"
            onClick={onNuevaOrden}
          >
            <Plus className="mr-1 h-3.5 w-3.5" /> Nueva orden
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AssignRouteOrdersPanel;
