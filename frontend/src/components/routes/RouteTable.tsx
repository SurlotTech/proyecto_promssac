import { format } from "date-fns";
import { es } from "date-fns/locale";
import { MapPin } from "lucide-react";
import RouteActionsMenu from "@/components/routes/RouteActionsMenu";
import RouteStatusBadge from "@/components/routes/RouteStatusBadge";
import type { Route } from "@/domain/routes";
import { formatRouteCurrency, dispatchPercent, dispatchBarFillClass } from "@/lib/routeMetrics";
import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";

interface Props {
  routes: Route[];
  onSelect: (r: Route) => void;
  onEdit?: (r: Route) => void;
  onDelete?: (r: Route) => void;
  vehicleTypeByPlate?: Record<string, string>;
  driverPhoneMap?: Record<string, string>;
  visibleColumns: string[];
  sortBy: string;
  sortOrder: "asc" | "desc";
  onSort: (column: string) => void;
  selectedIds: Set<string>;
  onSelectionChange: (ids: Set<string>) => void;
}

function formatDateTime(iso: string): { date: string; time: string } {
  if (!iso) return { date: "", time: "" };
  try {
    const parts = iso.split(" ");
    const dateParts = parts[0].split("/");
    if (dateParts.length !== 3) {
      const d = new Date(iso);
      if (isNaN(d.getTime())) return { date: iso, time: "" };
      return {
        date: format(d, "d MMM yyyy", { locale: es }),
        time: format(d, "h:mm a", { locale: es }),
      };
    }
    const d = new Date(+dateParts[2], +dateParts[1] - 1, +dateParts[0]);
    if (parts[1]) {
      const timeParts = parts[1].split(":");
      d.setHours(+timeParts[0], +timeParts[1]);
    }
    if (isNaN(d.getTime())) return { date: iso, time: "" };
    return {
      date: format(d, "d MMM yyyy", { locale: es }),
      time: format(d, "h:mm a", { locale: es }),
    };
  } catch {
    return { date: iso, time: "" };
  }
}

function getInitial(name: string): string {
  return name.charAt(0).toUpperCase();
}

function mockEndDate(deliveryDdMmYyyy: string): string {
  if (!deliveryDdMmYyyy) return "";
  try {
    const parts = deliveryDdMmYyyy.split("/");
    if (parts.length !== 3) return "";
    const d = new Date(+parts[2], +parts[1] - 1, +parts[0]);
    d.setDate(d.getDate() + 7);
    return format(d, "d MMM yyyy", { locale: es });
  } catch {
    return "";
  }
}

const RouteTable = ({ routes, onSelect, onEdit, onDelete, vehicleTypeByPlate = {}, driverPhoneMap = {}, visibleColumns, sortBy, sortOrder, onSort, selectedIds, onSelectionChange }: Props) => {
  const toggleSelect = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    onSelectionChange(next);
  };

  const toggleAll = () => {
    if (selectedIds.size === routes.length) {
      onSelectionChange(new Set());
    } else {
      onSelectionChange(new Set(routes.map((r) => r.id)));
    }
  };

  return (
    <div className="overflow-x-auto scrollbar-thin">
      <table className="w-full">
        <thead>
          <tr className="h-11 bg-[#eef1f5] text-left text-xs font-bold text-[#647789]">
            <th className="w-10 px-5">
              <div className="inline-flex items-center justify-center rounded-full p-1.5 transition-colors hover:bg-primary/10 -ml-1.5">
                <Checkbox
                  checked={routes.length > 0 && selectedIds.size === routes.length}
                  onCheckedChange={toggleAll}
                  className="h-4 w-4 border-2 border-gray-400 data-[state=checked]:bg-primary data-[state=checked]:border-primary rounded"
                />
              </div>
            </th>
            <th className={cn("px-3", !visibleColumns.includes("ruta") && "hidden")}>Ruta</th>
            <th className={cn("px-3", !visibleColumns.includes("vehiculo") && "hidden")}>Vehículo</th>
            <th className={cn("px-3", !visibleColumns.includes("conductor") && "hidden")}>Conductor</th>
            <th className={cn("px-3", !visibleColumns.includes("despachos") && "hidden")}>Despachos</th>
            <th className={cn("px-3", !visibleColumns.includes("creacion") && "hidden")}>
              <button onClick={() => onSort("createdAt")} className="flex items-center gap-1 hover:text-[#1f2933] transition-colors">
                Creación
                <span className="text-[10px]">{sortBy === "createdAt" ? (sortOrder === "asc" ? "↑" : "↓") : "↑"}</span>
              </button>
            </th>
            <th className={cn("px-3", !visibleColumns.includes("programada") && "hidden")}>Programada</th>
            <th className={cn("px-3", !visibleColumns.includes("importe") && "hidden")}>Importe</th>
            <th className={cn("px-3", !visibleColumns.includes("estado") && "hidden")}>Estado</th>
            <th className="w-14 px-3"></th>
          </tr>
        </thead>
        <tbody>
          {routes.map((r) => {
            const created = formatDateTime(r.createdAt);
            const delivery = formatDateTime(r.deliveryDate);
            return (
              <tr
                key={r.id}
                className={cn(
                  "h-[60px] border-b border-dashed border-[#e3e8ee] bg-white/30 transition-colors hover:bg-[#fafbfc]",
                  selectedIds.has(r.id) && "bg-red-50",
                )}
              >
                <td className="px-5">
                  <div className="inline-flex items-center justify-center rounded-full p-1.5 transition-colors hover:bg-primary/10 -ml-1.5">
                    <Checkbox
                      checked={selectedIds.has(r.id)}
                      onCheckedChange={() => toggleSelect(r.id)}
                      className="h-4 w-4 border-2 border-gray-400 data-[state=checked]:bg-primary data-[state=checked]:border-primary rounded"
                    />
                  </div>
                </td>
                <td className={cn("px-3", !visibleColumns.includes("ruta") && "hidden")}>
                  <button
                    onClick={() => onSelect(r)}
                    className="flex items-center gap-4 text-left group"
                  >
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[#dfe4ea] text-sm font-bold text-[#5f7282] transition-colors group-hover:bg-primary group-hover:text-white">
                      {getInitial(r.name)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[#1f2933] transition-colors group-hover:text-primary group-hover:underline underline-offset-4">{r.name}</p>
                      <p className="mt-1 text-sm text-[#8a9aab]">{r.code}</p>
                    </div>
                  </button>
                </td>
                <td className={cn("px-3", !visibleColumns.includes("vehiculo") && "hidden")}>
                  <p className="text-sm font-medium text-[#1f2933]">{r.vehiclePlate}</p>
                  {vehicleTypeByPlate[r.vehiclePlate] && (
                    <p className="mt-1 text-xs text-[#52677a]">{vehicleTypeByPlate[r.vehiclePlate]}</p>
                  )}
                </td>
                <td className={cn("px-3", !visibleColumns.includes("conductor") && "hidden")}>
                  <p className="text-sm font-medium text-[#1f2933]">{r.mobileUser || "—"}</p>
                  {r.mobileUser && driverPhoneMap[r.mobileUser] && (
                    <p className="mt-1 text-xs text-[#52677a]">{driverPhoneMap[r.mobileUser]}</p>
                  )}
                </td>
                <td className={cn("px-3", !visibleColumns.includes("despachos") && "hidden")}>
                  <div className="min-w-[7rem] max-w-[10rem]">
                    <div className="flex items-center justify-between gap-3 text-xs font-medium tabular-nums">
                      <span className="text-sm font-medium text-[#1f2933]">
                        {r.dispatchCompleted}/{r.dispatchTotal}
                      </span>
                      <span className="text-xs text-[#52677a]">{dispatchPercent(r.dispatchCompleted, r.dispatchTotal)}%</span>
                    </div>
                    <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-[#e9eef2]">
                      <div
                        className={cn(
                          "h-full rounded-full transition-all",
                          dispatchPercent(r.dispatchCompleted, r.dispatchTotal) > 0
                            ? dispatchBarFillClass(dispatchPercent(r.dispatchCompleted, r.dispatchTotal))
                            : "",
                        )}
                        style={{ width: `${Math.min(dispatchPercent(r.dispatchCompleted, r.dispatchTotal), 100)}%` }}
                      />
                    </div>
                  </div>
                </td>
                <td className={cn("px-3", !visibleColumns.includes("creacion") && "hidden")}>
                  <p className="text-sm font-medium text-[#1f2933]">{created.date}</p>
                  <p className="mt-1 text-xs text-[#52677a]">{created.time}</p>
                </td>
                <td className={cn("px-3", !visibleColumns.includes("programada") && "hidden")}>
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-[#1f2933]">
                      <span className="text-[11px] font-medium text-[#52677a] uppercase tracking-wide mr-1.5">Inicio</span>
                      {delivery.date}
                    </p>
                    <p className="text-sm font-medium text-[#1f2933]">
                      <span className="text-[11px] font-medium text-[#52677a] uppercase tracking-wide mr-1.5">Fin</span>
                      {mockEndDate(r.deliveryDate) || delivery.date}
                    </p>
                  </div>
                </td>
                <td className={cn("px-3", !visibleColumns.includes("importe") && "hidden")}>
                  <p className="text-sm font-medium text-[#1f2933]">
                    {formatRouteCurrency(r.currentCollection)}
                  </p>
                  <p className="mt-1 text-xs text-[#52677a]">
                    de {formatRouteCurrency(r.totalCollection)}
                  </p>
                </td>
                <td className={cn("px-3", !visibleColumns.includes("estado") && "hidden")}>
                  <RouteStatusBadge status={r.status} />
                </td>
                <td className="px-3 text-right" onClick={(e) => e.stopPropagation()}>
                  <RouteActionsMenu
                    route={r}
                    onSelect={onSelect}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    triggerClassName="rounded-md p-1.5 text-[#8a9aab] hover:bg-[#e9eef2] hover:text-[#1f2933] transition-colors"
                  />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {routes.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
          <MapPin className="mb-3 h-12 w-12 opacity-20" />
          <p className="text-sm font-medium">No se encontraron rutas</p>
        </div>
      )}
    </div>
  );
};

export default RouteTable;
