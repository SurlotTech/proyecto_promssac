import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import FleetDeviceList from "@/components/flota/FleetDeviceList";
import FleetFilters, { type FleetViewFilters } from "@/components/flota/FleetFilters";
import FleetMap from "@/components/flota/FleetMap";
import type { FleetDevice } from "@/domain/fleet";
import { useFleetDevicesQuery } from "@/hooks/useOperationsQueries";
import { fleetCalendarTodayKey } from "@/lib/fleetDateTime";
import { instantIsoToLocalDateKey } from "@/lib/localCalendarDate";

function deviceMatchesFilters(d: FleetDevice, f: FleetViewFilters): boolean {
  if (instantIsoToLocalDateKey(d.lastSeenIso) !== f.dateIso) return false;
  if (f.status !== "all" && d.status !== f.status) return false;
  return true;
}

const Flota = () => {
  const { data: fleetDevices = [], isLoading, isError, error } = useFleetDevicesQuery();
  const [filters, setFilters] = useState<FleetViewFilters>(() => ({
    dateIso: fleetCalendarTodayKey(),
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
    if (fleetDevices.length === 0 || filtered.length > 0) return;
    const keys = fleetDevices.map((d) => instantIsoToLocalDateKey(d.lastSeenIso));
    const latest = keys.reduce((a, b) => (a > b ? a : b));
    if (latest !== filters.dateIso) {
      setFilters((f) => ({ ...f, dateIso: latest }));
    }
  }, [fleetDevices, filtered.length, filters.dateIso]);

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
        </div>
      </div>
    </div>
  );
};

export default Flota;
