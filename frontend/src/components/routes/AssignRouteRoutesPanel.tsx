import { Clock, MapPin, Search } from "lucide-react";
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
import type { Route, RouteStatus } from "@/domain/routes";
import { routeStatusMeta } from "@/domain/routes";
import type { AssignRouteStatusFilter } from "@/lib/assignRouteFilters";

interface Props {
  dayIso: string;
  routes: Route[];
  routeStatusFilter: AssignRouteStatusFilter;
  onRouteStatusFilterChange: (v: AssignRouteStatusFilter) => void;
  routeSearch: string;
  onRouteSearchChange: (v: string) => void;
  selectedRouteId: string | null;
  onSelectRoute: (id: string) => void;
}

const AssignRouteRoutesPanel = ({
  dayIso,
  routes,
  routeStatusFilter,
  onRouteStatusFilterChange,
  routeSearch,
  onRouteSearchChange,
  selectedRouteId,
  onSelectRoute,
}: Props) => (
  <div className="flex flex-col bg-muted/10">
    <div className="border-b border-border bg-background/50 px-4 py-4 sm:px-6">
      <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Rutas del día</h3>
      <p className="mt-1 text-[11px] text-muted-foreground">
        Entrega programada el {dayIso}. Filtro por estado y búsqueda libre.
      </p>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Estado de la ruta</Label>
          <Select
            value={routeStatusFilter}
            onValueChange={(v) => onRouteStatusFilterChange(v as AssignRouteStatusFilter)}
          >
            <SelectTrigger className="h-10 bg-background">
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent className="max-h-[min(50vh,280px)]">
              <SelectItem value="all">Todos los estados</SelectItem>
              {(Object.keys(routeStatusMeta) as RouteStatus[]).map((st) => (
                <SelectItem key={st} value={st}>
                  {routeStatusMeta[st].label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="assign-search-routes" className="text-xs text-muted-foreground">
            Buscar
          </Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="assign-search-routes"
              placeholder="Código, nombre, placa, conductor…"
              className="h-10 bg-background pl-9"
              value={routeSearch}
              onChange={(e) => onRouteSearchChange(e.target.value)}
            />
          </div>
        </div>
      </div>
    </div>

    <div className="flex-1 space-y-3 overflow-y-auto p-4">
      {routes.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center py-12 text-center text-muted-foreground">
          <p className="text-sm">No hay rutas con los filtros elegidos.</p>
          <p className="mt-1 text-xs">Cambia la fecha, el estado o la búsqueda.</p>
        </div>
      ) : (
        routes.map((r) => (
          <div
            key={r.id}
            role="button"
            tabIndex={0}
            className="flex cursor-pointer flex-col rounded-lg border border-border bg-card p-4 shadow-sm transition-colors hover:border-primary/50"
            onClick={() => onSelectRoute(r.id)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onSelectRoute(r.id);
              }
            }}
          >
            <div className="mb-2 flex items-start justify-between gap-2">
              <div className="flex min-w-0 items-center gap-3">
                <Checkbox
                  checked={selectedRouteId === r.id}
                  onCheckedChange={() => onSelectRoute(r.id)}
                  onClick={(e) => e.stopPropagation()}
                />
                <div className="min-w-0">
                  <span className="font-semibold text-foreground">{r.code}</span>
                  <p className="truncate text-xs text-muted-foreground">{r.name}</p>
                </div>
              </div>
              <span
                className={cn(
                  "shrink-0 rounded-full border border-border px-2 py-0.5 text-[10px] font-medium",
                  routeStatusMeta[r.status].className,
                )}
              >
                {routeStatusMeta[r.status].label}
              </span>
            </div>
            <div className="flex flex-col gap-1 pl-7 text-sm text-muted-foreground">
              <p className="text-xs font-medium text-foreground">{r.vehiclePlate}</p>
              <p className="flex items-center gap-1.5 text-xs">
                <Clock className="h-3.5 w-3.5 shrink-0" />
                {r.startTime} – {r.endTime}
              </p>
              {r.place ? (
                <p className="flex items-center gap-1.5 text-xs">
                  <MapPin className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">{r.place}</span>
                </p>
              ) : null}
            </div>
          </div>
        ))
      )}
    </div>
  </div>
);

export default AssignRouteRoutesPanel;
