import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import FleetDeviceList from "@/components/flota/FleetDeviceList";
import FleetFilters, { type FleetViewFilters } from "@/components/flota/FleetFilters";
import FleetMap from "@/components/flota/FleetMap";
import type { FleetDevice } from "@/domain/fleet";
import { useFleetDevicesQuery } from "@/hooks/useOperationsQueries";
import { instantIsoToLocalDateKey } from "@/lib/localCalendarDate";

function deviceMatchesFilters(d: FleetDevice, f: FleetViewFilters): boolean {
  if (f.dateIso && instantIsoToLocalDateKey(d.lastSeenIso) !== f.dateIso) return false;
  if (f.status !== "all" && d.status !== f.status) return false;
  return true;
}

const Flota = () => {
  const { data: fleetDevices = [], isLoading, isError, error } = useFleetDevicesQuery();
  const [filters, setFilters] = useState<FleetViewFilters>(() => ({
    dateIso: "",
    status: "all",
  }));
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return fleetDevices.filter((d) => {
      if (!deviceMatchesFilters(d, filters)) return false;
      if (!q) return true;
      return (
        d.plate.toLowerCase().includes(q) ||
        d.imei.toLowerCase().includes(q) ||
        (d.alias?.toLowerCase().includes(q) ?? false)
      );
    });
  }, [filters, search, fleetDevices]);

  useEffect(() => {
    if (selectedId && !filtered.some((d) => d.id === selectedId)) {
      setSelectedId(null);
    }
  }, [filtered, selectedId]);

  const handleApplyFilters = () => {
    toast.success(`${filtered.length} vehículo${filtered.length !== 1 ? "s" : ""} en vista.`);
  };

  return (
    <div className="flex h-full min-h-0 w-full flex-1 flex-col overflow-hidden bg-background">
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden lg:flex-row lg:items-stretch">
        <aside className="flex min-h-0 w-full flex-1 flex-col overflow-hidden border-b border-border/80 lg:w-[min(100%,400px)] lg:max-w-[40vw] lg:flex-none lg:border-b-0 lg:border-r">
          {isLoading && (
            <p className="px-4 py-2 text-xs text-muted-foreground">Cargando dispositivos…</p>
          )}
          {isError && (
            <p className="px-4 py-2 text-xs text-destructive">
              {error instanceof Error ? error.message : "Error al cargar flota"}
            </p>
          )}
          <FleetFilters
            variant="sidebar"
            filters={filters}
            onChange={setFilters}
            onApply={handleApplyFilters}
          />
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
            <FleetDeviceList
              devices={filtered}
              totalDevices={fleetDevices.length}
              isLoading={isLoading}
              search={search}
              onSearchChange={setSearch}
              selectedId={selectedId}
              onSelectDevice={setSelectedId}
            />
          </div>
        </aside>

        <div className="relative flex min-h-[min(42vh,260px)] min-w-0 flex-1 flex-col self-stretch overflow-hidden lg:min-h-0">
          <FleetMap
            devices={filtered}
            selectedId={selectedId}
            onMarkerClick={setSelectedId}
            onMarkerPopupClose={(id) => {
              if (selectedId === id) setSelectedId(null);
            }}
          />
          {isLoading && (
            <div className="absolute inset-0 z-[500] flex items-center justify-center bg-background/55 backdrop-blur-[2px]">
              <div className="rounded-md border border-border bg-white px-4 py-3 text-sm font-medium text-foreground shadow-sm">
                Cargando flota...
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Flota;
