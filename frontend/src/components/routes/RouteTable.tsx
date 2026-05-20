import { MapPin } from "lucide-react";
import RouteActionsMenu from "@/components/routes/RouteActionsMenu";
import RouteStatusBadge from "@/components/routes/RouteStatusBadge";
import { Route } from "@/domain/routes";
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
  onEdit?: (r: Route) => void;
  onDelete?: (r: Route) => void;
  /** Placa → tipo de vehículo (desde API de flota). */
  vehicleTypeByPlate?: Record<string, string>;
}

const RouteTable = ({ routes, onSelect, onEdit, onDelete, vehicleTypeByPlate = {} }: Props) => {
  return (
    <div className="overflow-hidden rounded-xl border border-border/60 bg-card/80 backdrop-blur-md shadow-sm">
      <div className="overflow-x-auto scrollbar-thin">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-surface-muted text-left text-xs font-medium tracking-wider text-muted-foreground/80">
              <th className="px-3.5 py-2.5">Nombre de la ruta</th>
              <th className="px-3.5 py-2.5">Vehículo</th>
              <th className="px-3.5 py-2.5">Conductor</th>
              <th className="px-3.5 py-2.5">Despachos</th>
              <th className="px-3.5 py-2.5">Fecha entrega</th>
              <th className="px-3.5 py-2.5">Creado en</th>
              <th className="px-3.5 py-2.5 text-right">Recaudación</th>
              <th className="px-3.5 py-2.5 text-center">Estado</th>
              <th className="px-3.5 py-2.5 text-right">Acciones</th>
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
                  className="group transition-colors hover:bg-surface-muted"
                >
                  <td className="px-3.5 py-2.5">
                      <button
                        onClick={() => onSelect(r)}
                        className="flex items-center gap-2 text-left transition-all hover:translate-x-0.5 group/name"
                      >
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-soft text-primary transition-colors group-hover/name:bg-primary group-hover/name:text-white">
                          <MapPin className="h-3.5 w-3.5" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground truncate max-w-[200px] transition-colors group-hover/name:text-primary group-hover/name:underline underline-offset-4">{r.name}</p>
                        </div>
                      </button>
                  </td>
                  <td className="px-3.5 py-2.5">
                    <div className="min-w-0">
                      <p className="font-semibold leading-tight text-foreground">{r.vehiclePlate}</p>
                      <p className="mt-0.5 text-xs font-normal text-muted-foreground">
                        {vehType ?? "—"}
                      </p>
                    </div>
                  </td>
                  <td className="px-3.5 py-2.5 text-foreground">
                    {r.mobileUser || <span className="text-muted-foreground">— Sin asignar</span>}
                  </td>
                  <td className="px-3.5 py-2.5 align-top">
                    <div className="min-w-[9rem] max-w-[12rem]">
                      <div className="flex items-center justify-between gap-3 text-xs font-medium tabular-nums">
                        <span className="text-foreground">
                          {r.dispatchCompleted}/{r.dispatchTotal}
                        </span>
                        <span className="text-xs text-muted-foreground">{dispatchPct}%</span>
                      </div>
                      <div className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-muted">
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
                  <td className="px-3.5 py-2.5 text-foreground">{r.deliveryDate}</td>
                  <td className="px-3.5 py-2.5 text-muted-foreground text-xs">{r.createdAt}</td>
                  <td className="px-3.5 py-2.5 text-right align-top">
                    <p className="font-semibold tabular-nums text-foreground">
                      {formatRouteCurrency(r.currentCollection)}
                    </p>
                    <p className="mt-0.5 text-xs tabular-nums text-muted-foreground">
                      de {formatRouteCurrency(r.totalCollection)} · {pct}%
                    </p>
                  </td>
                  <td className="px-3.5 py-2.5 text-center align-middle">
                    <RouteStatusBadge status={r.status} />
                  </td>
                  <td className="px-3.5 py-2.5 text-right" onClick={(e) => e.stopPropagation()}>
                    <RouteActionsMenu
                      route={r}
                      onSelect={onSelect}
                      onEdit={onEdit}
                      onDelete={onDelete}
                    />
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