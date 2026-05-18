import { MapPin, Route as RouteIcon, Truck, User } from "lucide-react";
import RouteActionsMenu from "@/components/routes/RouteActionsMenu";
import { Route, routePriorityMeta } from "@/domain/routes";
import RouteStatusBadge from "@/components/routes/RouteStatusBadge";
import {
  collectionPercent,
  dispatchBarClassByStatus,
  dispatchPercent,
  formatRouteCurrency,
} from "@/lib/routeMetrics";
import { cn } from "@/lib/utils";
interface Props {
  route: Route;
  onSelect: (r: Route) => void;
  onEdit?: (r: Route) => void;
  onDelete?: (r: Route) => void;
  vehicleTypeByPlate?: Record<string, string>;
}

const RouteCard = ({ route: r, onSelect, onEdit, onDelete, vehicleTypeByPlate = {} }: Props) => {
  const vehType = vehicleTypeByPlate[r.vehiclePlate];
  const collPct = collectionPercent(r.currentCollection, r.totalCollection);
  const dispatchPct = dispatchPercent(r.dispatchCompleted, r.dispatchTotal);
  const pri = routePriorityMeta[r.priority];

  return (
    <div
      className="group w-full rounded-xl border border-border bg-card/40 backdrop-blur-lg p-4 text-left shadow-sm transition-all"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 flex-1 items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary-soft text-primary">
            <RouteIcon className="h-5 w-5" strokeWidth={1.75} />
          </div>
          <div className="min-w-0">
            <button 
              onClick={() => onSelect(r)}
              className="text-left font-semibold leading-tight text-foreground line-clamp-2 transition-colors hover:text-primary hover:underline underline-offset-4"
            >
              {r.name}
            </button>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
          <RouteStatusBadge status={r.status} />
          <RouteActionsMenu
            route={r}
            onSelect={onSelect}
            onEdit={onEdit}
            onDelete={onDelete}
            triggerClassName="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            triggerAriaLabel="Acciones de ruta"
          />
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-x-3 gap-y-2.5 text-sm">
        <div className="flex min-w-0 items-center gap-2 text-foreground">
          <User className="h-3.5 w-3.5 shrink-0 text-muted-foreground" strokeWidth={2} />
          <span className="min-w-0 truncate">{r.mobileUser || "—"}</span>
        </div>
        <div className="flex min-w-0 items-center gap-2 text-foreground">
          <Truck className="h-3.5 w-3.5 shrink-0 text-muted-foreground" strokeWidth={2} />
          <span className="min-w-0 truncate">
            <span className="font-medium tabular-nums">{r.vehiclePlate}</span>
            {vehType ? (
              <span className="text-muted-foreground"> · {vehType}</span>
            ) : null}
          </span>
        </div>
        <div className="flex min-w-0 items-center gap-2 text-muted-foreground">
          <MapPin className="h-3.5 w-3.5 shrink-0" strokeWidth={2} />
          <span className="min-w-0 truncate text-xs sm:text-sm">{r.place}</span>
        </div>
      </div>

      <div className="mt-4 border-t border-border/80 pt-4">
        <div className="flex items-center justify-between gap-2 text-xs font-medium tabular-nums">
          <span className="text-foreground">
            {r.dispatchCompleted}/{r.dispatchTotal} entregas
          </span>
          <span className="text-muted-foreground">{dispatchPct}%</span>
        </div>
        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
          <div
            className={cn(
              "h-full rounded-full transition-all",
              dispatchBarClassByStatus(r.status, dispatchPct),
            )}
            style={{ width: `${Math.min(dispatchPct, 100)}%` }}
          />
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-end justify-between gap-3 border-t border-border/60 pt-4">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
            Recaudación
          </p>
          <p className="mt-1 text-sm tabular-nums text-foreground">
            <span className="font-semibold">{formatRouteCurrency(r.currentCollection)}</span>
            <span className="text-muted-foreground">
              {" "}
              / {formatRouteCurrency(r.totalCollection)}
            </span>
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">{collPct}% del objetivo</p>
        </div>
        <span
          className={cn(
            "inline-flex shrink-0 rounded-full px-2.5 py-1 text-xs font-medium",
            pri.className,
          )}
        >
          {pri.label}
        </span>
      </div>
    </div>
  );
};

export default RouteCard;
