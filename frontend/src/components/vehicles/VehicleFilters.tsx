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
  /** Controles al final de la misma fila que buscador y filtros (ej. vista tabla/tarjetas) */
  toolbarRight?: ReactNode;
}

/** Ancho según contenido (sm+); en columna estrecha siguen ocupando todo el ancho */
const pillTrigger =
  "h-12 w-full min-w-0 shrink rounded-full border-border/100 bg-transparent px-4 py-0 shadow-none transition-colors hover:bg-zinc-50 focus:ring-2 focus:ring-ring focus:ring-offset-2 data-[state=open]:bg-zinc-50 sm:w-fit sm:max-w-[min(100%,18rem)] [&>div]:mr-2";

const VehicleFilters = ({ filters, onChange, onReset, toolbarRight }: Props) => {
  const hasActive =
    filters.search || filters.type !== "all" || filters.status !== "all";

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center lg:flex-nowrap lg:gap-2">
        <div className="relative min-w-0 flex-1 lg:max-w-lg">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por placa, conductor..."
            value={filters.search}
            onChange={(e) => onChange({ ...filters, search: e.target.value })}
            className="h-12 rounded-full border-border/100 bg-transparent pl-10 shadow-none transition-colors hover:bg-zinc-50 focus-visible:ring-offset-0"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:justify-end lg:contents">
        <Select
          value={filters.type}
          onValueChange={(v) => onChange({ ...filters, type: v })}
        >
          <SelectTrigger className={pillTrigger}>
            <div className="flex items-center gap-2">
              <Truck className="size-4 shrink-0 text-foreground/80" aria-hidden strokeWidth={1.75} />
              <span className="min-w-0 truncate text-left text-sm">
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
            <div className="flex items-center gap-2">
              <Activity className="size-4 shrink-0 text-foreground/80" aria-hidden strokeWidth={1.75} />
              <span className="min-w-0 truncate text-left text-sm">
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
          <div className="flex shrink-0 items-center justify-end pt-1 sm:ml-auto sm:pt-0">
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