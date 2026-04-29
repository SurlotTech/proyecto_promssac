import { Filter, RotateCcw, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { FleetDeviceStatus } from "@/data/liveFleet";
import { fleetGroups, fleetStatusLabels } from "@/data/liveFleet";
import { cn } from "@/lib/utils";

export interface FleetViewFilters {
  /** yyyy-MM-dd — día operativo del listado */
  dateIso: string;
  status: "all" | FleetDeviceStatus;
  groupId: "all" | string;
}

const pillTrigger =
  "h-10 w-full min-w-0 rounded-xl border-border/70 bg-white px-3 text-sm shadow-none transition-colors hover:bg-zinc-50 focus:ring-2 focus:ring-ring focus:ring-offset-2 data-[state=open]:bg-zinc-50 md:h-9";

const pillTriggerBar =
  `${pillTrigger} md:min-w-[11rem] md:max-w-[min(100%,17rem)]`;

const pillTriggerSidebar = `${pillTrigger} w-full`;

interface Props {
  filters: FleetViewFilters;
  onChange: (next: FleetViewFilters) => void;
  onApply?: () => void;
  /** "bar" = franja completa arriba; "sidebar" = columna estrecha junto al listado */
  variant?: "bar" | "sidebar";
}

const FleetFilters = ({ filters, onChange, onApply, variant = "bar" }: Props) => {
  const isSidebar = variant === "sidebar";
  const pill = isSidebar ? pillTriggerSidebar : pillTriggerBar;
  const hasGroup = filters.groupId !== "all";

  const hasActive =
    filters.status !== "all" || filters.groupId !== "all";

  return (
    <div
      className={cn(
        "flex flex-col gap-3 bg-surface-muted/50",
        isSidebar
          ? "border-b border-border/70 px-3 py-3 sm:px-4"
          : "border-b border-border/80 px-4 py-3 sm:px-6 lg:flex-row lg:flex-wrap lg:items-end lg:gap-x-4 lg:gap-y-3 lg:py-3.5",
      )}
    >
      <div
        className={cn(
          "grid min-w-0 gap-3",
          isSidebar
            ? "grid-cols-1"
            : "flex-1 sm:grid-cols-2 lg:grid-cols-[auto_auto_1fr] lg:items-end xl:grid-cols-none xl:flex xl:flex-wrap xl:gap-x-4",
        )}
      >
        <div className={cn("min-w-0 space-y-1.5", !isSidebar && "lg:max-w-[min(100%,17rem)]")}>
          <Label htmlFor="fleet-date" className="text-xs font-medium text-muted-foreground">
            Fecha
          </Label>
          <input
            id="fleet-date"
            type="date"
            value={filters.dateIso}
            onChange={(e) => onChange({ ...filters, dateIso: e.target.value })}
            className={cn(
              "flex h-10 w-full min-w-0 rounded-xl border border-border/70 bg-white px-3 text-sm shadow-none outline-none transition-colors",
              "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
              !isSidebar && "md:h-9 md:max-w-[min(100%,17rem)]",
              isSidebar && "md:h-9",
            )}
          />
        </div>

        <div className={cn("min-w-0 space-y-1.5", !isSidebar && "lg:max-w-[min(100%,17rem)]")}>
          <Label className="text-xs font-medium text-muted-foreground">Estado</Label>
          <Select
            value={filters.status}
            onValueChange={(v) => onChange({ ...filters, status: v as FleetViewFilters["status"] })}
          >
            <SelectTrigger className={pill}>
              <SelectValue placeholder="Todos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              {(Object.keys(fleetStatusLabels) as FleetDeviceStatus[]).map((s) => (
                <SelectItem key={s} value={s}>
                  {fleetStatusLabels[s]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div
          className={cn(
            "relative min-w-0 space-y-1.5 sm:col-span-2 lg:col-span-1 xl:col-auto",
            !isSidebar && "lg:max-w-[min(100%,17rem)]",
          )}
        >
          <Label className="text-xs font-medium text-muted-foreground">Grupo</Label>
          <div className="relative">
            <Select
              value={filters.groupId}
              onValueChange={(v) => onChange({ ...filters, groupId: v })}
            >
              <SelectTrigger className={cn(pill, hasGroup && "pr-9")}>
                <SelectValue placeholder="Todos los grupos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los grupos</SelectItem>
                {fleetGroups.map((g) => (
                  <SelectItem key={g.id} value={g.id}>
                    {g.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {hasGroup ? (
              <button
                type="button"
                className="absolute right-2 top-1/2 z-[1] flex size-7 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
                aria-label="Quitar filtro de grupo"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onChange({ ...filters, groupId: "all" });
                }}
              >
                <X className="size-4" />
              </button>
            ) : null}
          </div>
        </div>
      </div>

      <div
        className={cn(
          "flex shrink-0 flex-wrap items-center gap-2",
          !isSidebar && "lg:ml-auto",
          isSidebar && "pt-1",
        )}
      >
        <Button
          type="button"
          size="sm"
          className="h-9 gap-2 rounded-xl bg-primary px-4 text-primary-foreground shadow-sm hover:bg-primary-hover"
          onClick={() => onApply?.()}
        >
          <Filter className="size-4" />
          Filtrar
        </Button>
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="size-9 shrink-0 rounded-xl border-primary/35 text-primary hover:bg-primary-soft"
          disabled={!hasActive}
          onClick={() =>
            onChange({
              ...filters,
              status: "all",
              groupId: "all",
            })
          }
          aria-label="Limpiar filtros"
        >
          <RotateCcw className="size-4" />
        </Button>
      </div>
    </div>
  );
};

export default FleetFilters;
