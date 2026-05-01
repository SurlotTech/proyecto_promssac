import { Clock, MapPin, MoreHorizontal, Route as RouteIcon, Truck, User, Eye, Pencil, Trash2 } from "lucide-react";
import { Route, routePriorityMeta } from "@/domain/routes";
import RouteStatusBadge from "@/components/routes/RouteStatusBadge";
import {
  collectionPercent,
  dispatchBarClassByStatus,
  dispatchPercent,
  formatRouteCurrency,
} from "@/lib/routeMetrics";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Props {
  route: Route;
  onSelect: (r: Route) => void;
  vehicleTypeByPlate?: Record<string, string>;
}

const RouteCard = ({ route: r, onSelect, vehicleTypeByPlate = {} }: Props) => {
  const vehType = vehicleTypeByPlate[r.vehiclePlate];
  const collPct = collectionPercent(r.currentCollection, r.totalCollection);
  const dispatchPct = dispatchPercent(r.dispatchCompleted, r.dispatchTotal);
  const pri = routePriorityMeta[r.priority];

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onSelect(r)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect(r);
        }
      }}
      className="group w-full cursor-pointer rounded-xl border border-border bg-card p-4 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 flex-1 items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary-soft text-primary">
            <RouteIcon className="h-5 w-5" strokeWidth={1.75} />
          </div>
          <div className="min-w-0">
            <p className="font-semibold leading-tight text-foreground">{r.id}</p>
            <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">{r.name}</p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
          <RouteStatusBadge status={r.status} />
          <DropdownMenu>
            <DropdownMenuTrigger
              className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              aria-label="Acciones de ruta"
            >
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
          <Clock className="h-3.5 w-3.5 shrink-0" strokeWidth={2} />
          <span className="min-w-0 truncate tabular-nums text-xs sm:text-sm">
            {r.startTime} – {r.endTime}
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
