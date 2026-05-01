import { Filter, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { FleetDeviceStatus } from "@/domain/fleet";
import { fleetStatusLabels } from "@/domain/fleet";
import { cn } from "@/lib/utils";

export interface FleetViewFilters {
  dateIso: string;
  status: "all" | FleetDeviceStatus;
}

const pillTrigger =
  "h-10 w-full min-w-0 rounded-xl border-border/70 bg-white px-3 text-sm shadow-none transition-colors hover:bg-zinc-50 focus:ring-2 focus:ring-ring focus:ring-offset-2 data-[state=open]:bg-zinc-50";

const pillTriggerBar = `${pillTrigger} md:min-w-[11rem] md:max-w-[min(100%,17rem)]`;

const pillTriggerSidebar = `${pillTrigger} w-full`;

const filterBtnClass =
  "h-10 gap-2 rounded-xl px-4 text-sm font-medium shadow-sm sm:px-5";

interface Props {
  filters: FleetViewFilters;
  onChange: (next: FleetViewFilters) => void;
  onApply?: () => void;
  variant?: "bar" | "sidebar";
}

const FleetFilters = ({ filters, onChange, onApply, variant = "bar" }: Props) => {
  const isSidebar = variant === "sidebar";
  const pill = isSidebar ? pillTriggerSidebar : pillTriggerBar;
  const hasActive = filters.status !== "all";

  const dateBlock = (
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
          "flex h-10 w-full min-w-0 rounded-xl border border-border/70 bg-white px-2 text-sm shadow-none outline-none transition-colors sm:px-3",
          "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          !isSidebar && "md:max-w-[min(100%,17rem)]",
        )}
      />
    </div>
  );

  const statusBlock = (
    <div className={cn("min-w-0 space-y-1.5", !isSidebar && "lg:max-w-[min(100%,17rem)]")}>
      <Label htmlFor="fleet-status" className="text-xs font-medium text-muted-foreground">
        Estado
      </Label>
      <Select
        value={filters.status}
        onValueChange={(v) => onChange({ ...filters, status: v as FleetViewFilters["status"] })}
      >
        <SelectTrigger id="fleet-status" className={pill}>
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
  );

  const actionButtons = (
    <div
      className={cn(
        "flex min-w-0 items-stretch gap-2",
        isSidebar && "w-full",
        !isSidebar && "shrink-0 flex-wrap lg:ml-auto",
      )}
    >
      <Button
        type="button"
        className={cn(
          filterBtnClass,
          "bg-primary text-primary-foreground hover:bg-primary-hover",
          isSidebar && "min-w-0 flex-1",
        )}
        onClick={() => onApply?.()}
      >
        <Filter className="size-4 shrink-0" />
        Filtrar
      </Button>
      <Button
        type="button"
        variant="outline"
        className={cn(
          "h-10 w-10 shrink-0 rounded-xl border-primary/35 p-0 text-primary hover:bg-primary-soft sm:w-11",
          isSidebar && "self-stretch",
        )}
        disabled={!hasActive}
        onClick={() =>
          onChange({
            ...filters,
            status: "all",
          })
        }
        aria-label="Limpiar filtros"
      >
        <RotateCcw className="size-4" />
      </Button>
    </div>
  );

  if (isSidebar) {
    return (
      <div className="border-b border-border/70 bg-surface-muted/50 px-3 py-3 sm:px-4">
        <div className="grid min-w-0 gap-2.5">
          <div className="grid grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] items-end gap-2 sm:gap-3">
            {dateBlock}
            {statusBlock}
          </div>
          {actionButtons}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 border-b border-border/80 bg-surface-muted/50 px-4 py-3 sm:px-6 lg:flex-row lg:flex-wrap lg:items-end lg:gap-x-4 lg:gap-y-3 lg:py-3.5">
      <div className="grid min-w-0 flex-1 gap-2 sm:gap-3 sm:grid-cols-2 lg:grid-cols-[auto_auto_1fr] lg:items-end xl:grid-cols-none xl:flex xl:flex-wrap xl:gap-x-4">
        {dateBlock}
        {statusBlock}
      </div>
      {actionButtons}
    </div>
  );
};

export default FleetFilters;
