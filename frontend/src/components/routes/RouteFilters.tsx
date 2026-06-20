import type { ReactNode } from "react";
import { Search, Truck, User } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  vehicles: { id: string; plate: string }[];
  places: string[];
  drivers: string[];
  toolbarRight?: ReactNode;
}

const pillTrigger =
  "h-9 w-full min-w-0 shrink rounded-lg border bg-zinc-50 px-3 py-0 shadow-none transition-all hover:border-zinc-300 hover:bg-zinc-100 hover:shadow-sm focus:ring-2 focus:ring-ring focus:ring-offset-0 data-[state=open]:bg-zinc-100 sm:w-fit sm:max-w-[min(100%,18rem)] [&>div]:mr-2 [&>svg]:hidden";

const RouteFilters = ({
  filters,
  onChange,
  vehicles,
  places,
  drivers,
  toolbarRight,
}: Props) => {
  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-3 rounded-xl bg-muted/20 py-3 sm:flex-row sm:flex-wrap sm:items-center">
        <div className="relative min-w-0 flex-1 sm:max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" strokeWidth={1.75} />
          <Input
            placeholder="Buscar por nombre de ruta..."
            value={filters.search}
            onChange={(e) => onChange({ ...filters, search: e.target.value })}
            className="h-9 w-full bg-zinc-50 pl-9 transition-all hover:border-zinc-300 hover:bg-zinc-100 hover:shadow-sm focus-visible:ring-offset-0"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Select
            value={filters.vehicle}
            onValueChange={(v) => onChange({ ...filters, vehicle: v })}
          >
            <SelectTrigger className={pillTrigger}>
              <div className="flex w-full items-center gap-2">
                <Truck className="size-3.5 shrink-0 text-muted-foreground" strokeWidth={1.75} />
                <span className="min-w-0 truncate text-left text-sm text-muted-foreground">
                  <SelectValue placeholder="Vehículos" />
                </span>
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all" >Vehículos</SelectItem>
              {vehicles.map((v) => (
                <SelectItem key={v.id} value={v.id}>
                  {v.plate}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={filters.driver}
            onValueChange={(v) => onChange({ ...filters, driver: v })}
          >
            <SelectTrigger className={pillTrigger}>
              <div className="flex w-full items-center gap-2">
                <User className="size-3.5 shrink-0 text-muted-foreground" strokeWidth={1.75} />
                <span className="min-w-0 truncate text-left text-sm text-muted-foreground">
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
          <div className="flex shrink-0 items-center ml-auto">
            {toolbarRight}
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default RouteFilters;
export type { RouteFilters as Filters };