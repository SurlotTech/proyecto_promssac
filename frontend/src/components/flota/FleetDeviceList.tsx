import { Battery, Radio } from "lucide-react";
import { useMemo } from "react";
import type { FleetDevice } from "@/domain/fleet";
import { fleetStatusLabels } from "@/domain/fleet";
import { formatFleetDateTime } from "@/lib/fleetDateTime";
import { cn } from "@/lib/utils";

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
  const sorted = useMemo(
    () => [...devices].sort((a, b) => a.plate.localeCompare(b.plate, "es")),
    [devices],
  );

  return (
    <div className="flex h-full min-h-0 w-full min-w-0 flex-col overflow-hidden bg-card/40 backdrop-blur-lg">
      <div className="shrink-0 space-y-3 border-b border-border/60 p-3 sm:p-4 bg-surface-muted/50">
        <p className="text-xs text-muted-foreground">
          <span className="font-semibold text-foreground">{devices.length}</span> dispositivo
          {devices.length !== 1 ? "s" : ""} en vista
        </p>
      </div>

      <div
        role="region"
        aria-label="Lista de dispositivos"
        className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-y-contain scrollbar-thin"
      >
        <div className="p-3 pb-4 sm:p-4 sm:pb-5">
          {devices.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-surface-muted/40 px-4 py-12 text-center">
              <div className="flex size-12 items-center justify-center rounded-full bg-primary-soft text-primary">
                <Radio className="size-6 opacity-80" />
              </div>
              <p className="mt-4 text-sm font-semibold text-foreground">No hay dispositivos</p>
              <p className="mt-1 max-w-xs text-xs leading-relaxed text-muted-foreground">
                No hay vehículos que coincidan con los filtros o la búsqueda. Ajusta fecha o estado.
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-border/60 rounded-xl border border-border/70 bg-white shadow-sm">
              {sorted.map((d) => (
                <li key={d.id}>
                  <button
                    type="button"
                    onClick={() => onSelectDevice(d.id)}
                    className={cn(
                      "w-full px-3 py-3 text-left transition-colors sm:px-4",
                      selectedId === d.id
                        ? "bg-primary-soft ring-1 ring-inset ring-primary/25"
                        : "hover:bg-surface-muted/80",
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-foreground">{d.plate}</p>
                        <p className="mt-0.5 truncate text-[11px] text-muted-foreground">
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

                    <p className="mt-2 text-[11px] tabular-nums text-muted-foreground">
                      {formatFleetDateTime(d.lastSeenIso, "EEEE d MMM yyyy HH:mm:ss")}
                    </p>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default FleetDeviceList;
