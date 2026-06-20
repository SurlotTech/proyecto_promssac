import type { ReactNode } from "react";
import { Activity, Search, Truck, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

interface Filters {
  search: string;
  type: string;
  status: string;
}

interface Props {
  filters: Filters;
  onChange: (next: Filters) => void;
  onReset: () => void;
  toolbarRight?: ReactNode;
}

const pillTrigger =
  "h-9 w-full min-w-0 shrink rounded-lg border bg-zinc-50 px-3 py-0 shadow-none transition-all hover:border-zinc-300 hover:bg-zinc-100 hover:shadow-sm focus:ring-2 focus:ring-ring focus:ring-offset-0 data-[state=open]:bg-zinc-100 sm:w-fit sm:max-w-[min(100%,18rem)] [&>div]:mr-2 [&>svg]:hidden";

const VehicleFilters = ({ filters, onChange, onReset, toolbarRight }: Props) => {
  const hasActive =
    filters.search || filters.type !== "all" || filters.status !== "all";

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-3 rounded-xl bg-muted/20 py-3 sm:flex-row sm:flex-wrap sm:items-center">
        <div className="relative min-w-0 flex-1 sm:max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" strokeWidth={1.75} />
          <Input
            placeholder="Buscar por placa, conductor..."
            value={filters.search}
            onChange={(e) => onChange({ ...filters, search: e.target.value })}
            className="h-9 w-full bg-zinc-50 pl-9 transition-all hover:border-zinc-300 hover:bg-zinc-100 hover:shadow-sm focus-visible:ring-offset-0"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Select
            value={filters.type}
            onValueChange={(v) => onChange({ ...filters, type: v })}
          >
            <SelectTrigger className={pillTrigger}>
              <div className="flex w-full items-center gap-2">
                <Truck className="size-3.5 shrink-0 text-muted-foreground" strokeWidth={1.75} />
                <span className="min-w-0 truncate text-left text-sm text-muted-foreground">
                  <SelectValue placeholder="Tipo de vehículo" />
                </span>
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Vehículos</SelectItem>
              <SelectItem value="Furgón">Furgón</SelectItem>
              <SelectItem value="Camión">Camión</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={filters.status}
            onValueChange={(v) => onChange({ ...filters, status: v })}
          >
            <SelectTrigger className={pillTrigger}>
              <div className="flex w-full items-center gap-2">
                <Activity className="size-3.5 shrink-0 text-muted-foreground" strokeWidth={1.75} />
                <span className="min-w-0 truncate text-left text-sm text-muted-foreground">
                  <SelectValue placeholder="Estado" />
                </span>
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Estados</SelectItem>
              <SelectItem value="active">Activo</SelectItem>
              <SelectItem value="in_route">En ruta</SelectItem>
              <SelectItem value="maintenance">Mantenimiento</SelectItem>
              <SelectItem value="inactive">Inactivo</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {toolbarRight ? (
          <div className="flex shrink-0 items-center ml-auto">
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

export default VehicleFilters;
export type { Filters };