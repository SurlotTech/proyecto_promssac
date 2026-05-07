import type { ReactNode } from "react";
import { MapPin, Search, Truck, User, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import RouteDateRangePicker from "@/components/routes/RouteDateRangePicker";

export interface RouteFilters {
  search: string;
  vehicle: string;
  place: string;
  driver: string;
  dateFrom: string;
  dateTo: string;
}

interface Props {
  filters: RouteFilters;
  onChange: (next: RouteFilters) => void;
  onReset: () => void;
  vehicles: { id: string; plate: string }[];
  places: string[];
  drivers: string[];
  toolbarRight?: ReactNode;
}

const pillTrigger =
  "h-9 w-full min-w-0 shrink border-none bg-transparent px-2 py-0 shadow-none transition-colors hover:bg-transparent focus:ring-0 focus:ring-offset-0 data-[state=open]:bg-transparent sm:w-fit sm:max-w-[min(100%,18rem)] font-semibold text-foreground hover:text-foreground/80 [&>div]:mr-2";

const RouteFilters = ({
  filters,
  onChange,
  onReset,
  vehicles,
  places,
  drivers,
  toolbarRight,
}: Props) => {
  const hasActive =
    filters.search ||
    filters.vehicle !== "all" ||
    filters.place !== "all" ||
    filters.driver !== "all" ||
    filters.dateFrom ||
    filters.dateTo;

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center lg:flex-nowrap lg:gap-2">
        <div className="relative min-w-0 flex-1 lg:max-w-lg">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por ID, nombre de ruta..."
            value={filters.search}
            onChange={(e) => onChange({ ...filters, search: e.target.value })}
            className="h-9 rounded-lg border-border/70 bg-white pl-10 shadow-none transition-colors hover:bg-zinc-50 focus-visible:ring-offset-0"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:justify-end lg:contents">
          <Select
            value={filters.vehicle}
            onValueChange={(v) => onChange({ ...filters, vehicle: v })}
          >
            <SelectTrigger className={pillTrigger}>
              <div className="flex items-center gap-2">
                <Truck className="size-4 shrink-0 text-foreground/80" aria-hidden strokeWidth={1.75} />
                <span className="min-w-0 truncate text-left leading-none">
                  <SelectValue placeholder="Vehículo" />
                </span>
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Vehículos</SelectItem>
              {vehicles.map((v) => (
                <SelectItem key={v.id} value={v.id}>
                  {v.plate}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={filters.place}
            onValueChange={(v) => onChange({ ...filters, place: v })}
          >
            <SelectTrigger className={pillTrigger}>
              <div className="flex items-center gap-2">
                <MapPin className="size-4 shrink-0 text-foreground/80" aria-hidden strokeWidth={1.75} />
                <span className="min-w-0 truncate text-left leading-none">
                  <SelectValue placeholder="Lugar" />
                </span>
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Lugar</SelectItem>
              {places.map((p) => (
                <SelectItem key={p} value={p}>
                  {p}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={filters.driver}
            onValueChange={(v) => onChange({ ...filters, driver: v })}
          >
            <SelectTrigger className={pillTrigger}>
              <div className="flex items-center gap-2">
                <User className="size-4 shrink-0 text-foreground/80" aria-hidden strokeWidth={1.75} />
                <span className="min-w-0 truncate text-left leading-none">
                  <SelectValue placeholder="Conductor" />
                </span>
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Conductor</SelectItem>
              {drivers.map((d) => (
                <SelectItem key={d} value={d}>
                  {d}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <RouteDateRangePicker
            dateFrom={filters.dateFrom}
            dateTo={filters.dateTo}
            onRangeChange={(dateFrom, dateTo) => onChange({ ...filters, dateFrom, dateTo })}
            className="w-full min-w-0 max-w-full sm:w-max sm:max-w-none sm:shrink-0"
          />
        </div>

        {toolbarRight ? (
          <div className="flex w-full shrink-0 items-center justify-end pt-1 sm:ml-auto sm:w-auto sm:pt-0">
            {toolbarRight}
          </div>
        ) : null}
      </div>

      {hasActive && (
        <div className="flex justify-end">
          <Button
            variant="ghost"
            size="sm"
            onClick={onReset}
            className="h-8 text-xs text-muted-foreground hover:text-foreground"
          >
            <X className="mr-1 h-3.5 w-3.5" /> Limpiar filtros
          </Button>
        </div>
      )}
    </div>
  );
};

export default RouteFilters;
export type { RouteFilters as Filters };