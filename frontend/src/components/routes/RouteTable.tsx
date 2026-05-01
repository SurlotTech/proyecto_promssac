import { MoreHorizontal, Eye, Pencil, Trash2, MapPin } from "lucide-react";
import RouteStatusBadge from "@/components/routes/RouteStatusBadge";
import { Route } from "@/domain/routes";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  collectionPercent,
  dispatchBarFillClass,
  dispatchPercent,
  formatRouteCurrency,
} from "@/lib/routeMetrics";
import { cn } from "@/lib/utils";

interface Props {
  routes: Route[];
  onSelect: (r: Route) => void;
  /** Placa → tipo de vehículo (desde API de flota). */
  vehicleTypeByPlate?: Record<string, string>;
}

const RouteTable = ({ routes, onSelect, vehicleTypeByPlate = {} }: Props) => {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
      <div className="overflow-x-auto scrollbar-thin">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-surface-muted text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <th className="px-4 py-3.5">ID / Nombre</th>
              <th className="px-4 py-3.5">Vehículo</th>
              <th className="px-4 py-3.5">Conductor</th>
              <th className="px-4 py-3.5">Despachos</th>
              <th className="px-4 py-3.5">Fecha entrega</th>
              <th className="px-4 py-3.5">Hora inicio</th>
              <th className="px-4 py-3.5">Creado en</th>
              <th className="px-4 py-3.5 text-right">Recaudación</th>
              <th className="px-4 py-3.5 text-center">Estado</th>
              <th className="px-4 py-3.5 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {routes.map((r) => {
              const vehType = vehicleTypeByPlate[r.vehiclePlate];
              const pct = collectionPercent(r.currentCollection, r.totalCollection);
              const dispatchPct = dispatchPercent(r.dispatchCompleted, r.dispatchTotal);

              return (
                <tr
                  key={r.id}
                  onClick={() => onSelect(r)}
                  className="group cursor-pointer transition-colors hover:bg-surface-muted"
                >
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-soft text-primary">
                        <MapPin className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">{r.id}</p>
                        <p className="text-xs text-muted-foreground truncate max-w-[150px]">
                          {r.name}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="min-w-0">
                      <p className="font-semibold leading-tight text-foreground">{r.vehiclePlate}</p>
                      <p className="mt-0.5 text-xs font-normal text-muted-foreground">
                        {vehType ?? "—"}
                      </p>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-foreground">
                    {r.mobileUser || <span className="text-muted-foreground">— Sin asignar</span>}
                  </td>
                  <td className="px-4 py-4 align-top">
                    <div className="min-w-[9rem] max-w-[12rem]">
                      <div className="flex items-center justify-between gap-3 text-xs font-medium tabular-nums">
                        <span className="text-foreground">
                          {r.dispatchCompleted}/{r.dispatchTotal}
                        </span>
                        <span className="text-muted-foreground">{dispatchPct}%</span>
                      </div>
                      <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                        <div
                          className={cn(
                            "h-full rounded-full transition-all",
                            dispatchPct > 0 ? dispatchBarFillClass(dispatchPct) : "",
                          )}
                          style={{ width: `${Math.min(dispatchPct, 100)}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-foreground">{r.deliveryDate}</td>
                  <td className="px-4 py-4 text-foreground">{r.startTime}</td>
                  <td className="px-4 py-4 text-muted-foreground text-xs">{r.createdAt}</td>
                  <td className="px-4 py-4 text-right align-top">
                    <p className="font-semibold tabular-nums text-foreground">
                      {formatRouteCurrency(r.currentCollection)}
                    </p>
                    <p className="mt-0.5 text-xs tabular-nums text-muted-foreground">
                      de {formatRouteCurrency(r.totalCollection)} · {pct}%
                    </p>
                  </td>
                  <td className="px-4 py-4 text-center align-middle">
                    <RouteStatusBadge status={r.status} />
                  </td>
                  <td className="px-4 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground">
                        <MoreHorizontal className="h-4 w-4" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-40">
                        <DropdownMenuItem onClick={() => onSelect(r)}>
                          <Eye className="mr-2 h-4 w-4" /> Ver detalle
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Pencil className="mr-2 h-4 w-4" /> Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive focus:text-destructive">
                          <Trash2 className="mr-2 h-4 w-4" /> Eliminar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {routes.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
          <MapPin className="mb-2 h-12 w-12 opacity-20" />
          <p>No se encontraron rutas</p>
        </div>
      )}
    </div>
  );
};

export default RouteTable;