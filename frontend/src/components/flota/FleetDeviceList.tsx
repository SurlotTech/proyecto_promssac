import {
  Battery,
  ChevronDown,
  Eye,
  MapPinned,
  Radio,
  Search,
  Truck,
} from "lucide-react";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import type { FleetDevice } from "@/data/liveFleet";
import { fleetGroups, fleetStatusLabels } from "@/data/liveFleet";
import { cn } from "@/lib/utils";

function groupLabelForDevice(d: FleetDevice): string {
  if (d.groupId == null) {
    return fleetGroups.find((g) => g.id === "ungrouped")?.label ?? "Sin agrupar";
  }
  return fleetGroups.find((g) => g.id === d.groupId)?.label ?? d.groupId;
}

function groupDevices(devices: FleetDevice[]): Map<string, FleetDevice[]> {
  const map = new Map<string, FleetDevice[]>();
  for (const d of devices) {
    const key = groupLabelForDevice(d);
    const arr = map.get(key) ?? [];
    arr.push(d);
    map.set(key, arr);
  }
  return map;
}

interface Props {
  devices: FleetDevice[];
  search: string;
  onSearchChange: (v: string) => void;
  selectedId: string | null;
  onSelectDevice: (id: string) => void;
}

const FleetDeviceList = ({
  devices,
  search,
  onSearchChange,
  selectedId,
  onSelectDevice,
}: Props) => {
  const grouped = groupDevices(devices);
  const entries = [...grouped.entries()].sort(([a], [b]) => a.localeCompare(b, "es"));

  return (
    <div className="flex h-full min-h-0 w-full min-w-0 flex-col bg-card">
      <div className="shrink-0 space-y-3 border-b border-border/60 p-3 sm:p-4">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Buscar por placa o IMEI…"
            className="h-10 rounded-xl border-border/70 bg-white pl-10 pr-3 shadow-none"
            aria-label="Buscar dispositivos"
          />
        </div>
        <p className="text-xs text-muted-foreground">
          <span className="font-semibold text-foreground">{devices.length}</span> dispositivo
          {devices.length !== 1 ? "s" : ""} en vista
        </p>
      </div>

      <ScrollArea className="min-h-0 flex-1">
        <div className="space-y-2 p-3 sm:p-4">
          {devices.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-surface-muted/40 px-4 py-12 text-center">
              <div className="flex size-12 items-center justify-center rounded-full bg-primary-soft text-primary">
                <Radio className="size-6 opacity-80" />
              </div>
              <p className="mt-4 text-sm font-semibold text-foreground">No hay dispositivos</p>
              <p className="mt-1 max-w-xs text-xs leading-relaxed text-muted-foreground">
                No hay vehículos que coincidan con los filtros o la búsqueda. Ajusta fecha, estado o
                grupo.
              </p>
            </div>
          ) : (
            entries.map(([groupName, list]) => (
              <Collapsible key={groupName} defaultOpen className="rounded-xl border border-border/70 bg-white shadow-sm">
                <CollapsibleTrigger className="group flex w-full items-center gap-2 rounded-t-xl bg-info px-3 py-2.5 text-left text-info-foreground transition-colors hover:bg-info/90">
                  <span className="min-w-0 flex-1 truncate text-sm font-semibold">{groupName}</span>
                  <Badge
                    variant="secondary"
                    className="shrink-0 border-0 bg-white/25 text-info-foreground hover:bg-white/35"
                  >
                    {list.length}
                  </Badge>
                  <Eye className="size-4 shrink-0 opacity-90" aria-hidden />
                  <ChevronDown className="size-4 shrink-0 opacity-90 transition-transform duration-200 group-data-[state=open]:rotate-180" />
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <ul className="divide-y divide-border/60 p-2">
                    {list.map((d) => (
                      <li key={d.id}>
                        <button
                          type="button"
                          onClick={() => onSelectDevice(d.id)}
                          className={cn(
                            "w-full rounded-lg px-2 py-3 text-left transition-colors",
                            selectedId === d.id
                              ? "bg-primary-soft ring-1 ring-primary/30"
                              : "hover:bg-surface-muted/80",
                          )}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <p className="truncate font-semibold text-foreground">{d.plate}</p>
                              <p className="mt-0.5 truncate font-mono text-[11px] text-muted-foreground">
                                {d.imei}
                              </p>
                            </div>
                            <span
                              className={cn(
                                "shrink-0 rounded-md px-1.5 py-0.5 text-[10px] font-medium uppercase",
                                d.status === "in_route" && "bg-success-soft text-success",
                                d.status === "stopped" && "bg-warning-soft text-warning",
                                d.status === "offline" && "bg-muted text-muted-foreground",
                              )}
                            >
                              {fleetStatusLabels[d.status]}
                            </span>
                          </div>

                          <div className="mt-2 flex items-center gap-3 text-success">
                            <Truck className="size-4 shrink-0" strokeWidth={2} aria-hidden />
                            <div className="flex gap-0.5" aria-label={`Señal ${d.signalBars} de 4`}>
                              {[1, 2, 3, 4].map((i) => (
                                <span
                                  key={i}
                                  className={cn(
                                    "h-2 w-1 rounded-sm",
                                    i <= d.signalBars ? "bg-success" : "bg-border",
                                  )}
                                />
                              ))}
                            </div>
                            <Battery
                              className="size-4 shrink-0"
                              strokeWidth={2}
                              aria-label={`Batería ${d.batteryPct}%`}
                            />
                            <span className="ml-auto tabular-nums text-xs font-medium text-foreground">
                              {d.batteryPct}%
                            </span>
                          </div>

                          <button
                            type="button"
                            className="mt-2 text-left text-xs font-medium text-primary hover:underline"
                            onClick={(e) => {
                              e.stopPropagation();
                              onSelectDevice(d.id);
                            }}
                          >
                            Ver en mapa
                          </button>

                          <p className="mt-2 text-[11px] tabular-nums text-muted-foreground">
                            {format(parseISO(d.lastSeenIso), "EEEE d MMM yyyy HH:mm:ss", {
                              locale: es,
                            })}
                          </p>

                          <div className="mt-2 flex items-center justify-end gap-1 border-t border-border/40 pt-2 opacity-70">
                            <span className="rounded-md p-1.5 hover:bg-muted" title="Historial">
                              <MapPinned className="size-3.5" />
                            </span>
                          </div>
                        </button>
                      </li>
                    ))}
                  </ul>
                </CollapsibleContent>
              </Collapsible>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

export default FleetDeviceList;
