import { useEffect, useMemo, useState } from "react";
import { isSameDay, parseISO } from "date-fns";
import { toast } from "sonner";
import PageHeader from "@/components/PageHeader";
import FleetDeviceList from "@/components/flota/FleetDeviceList";
import FleetFilters, { type FleetViewFilters } from "@/components/flota/FleetFilters";
import FleetMap from "@/components/flota/FleetMap";
import type { FleetDevice } from "@/data/liveFleet";
import { fleetDevices } from "@/data/liveFleet";

function deviceMatchesFilters(d: FleetDevice, f: FleetViewFilters): boolean {
  const filterDay = parseISO(`${f.dateIso}T12:00:00`);
  const seen = parseISO(d.lastSeenIso);
  if (!isSameDay(seen, filterDay)) return false;
  if (f.status !== "all" && d.status !== f.status) return false;
  if (f.groupId === "all") return true;
  if (f.groupId === "ungrouped") return d.groupId === null;
  return d.groupId === f.groupId;
}

const DEFAULT_FILTERS: FleetViewFilters = {
  dateIso: "2026-04-28",
  status: "all",
  groupId: "all",
};

const Flota = () => {
  const [filters, setFilters] = useState<FleetViewFilters>(DEFAULT_FILTERS);
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return fleetDevices.filter((d) => {
      if (!deviceMatchesFilters(d, filters)) return false;
      if (!q) return true;
      return d.plate.toLowerCase().includes(q) || d.imei.toLowerCase().includes(q);
    });
  }, [filters, search]);

  useEffect(() => {
    if (selectedId && !filtered.some((d) => d.id === selectedId)) {
      setSelectedId(null);
    }
  }, [filtered, selectedId]);

  const handleApplyFilters = () => {
    toast.success(`${filtered.length} vehículo${filtered.length !== 1 ? "s" : ""} en vista.`);
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-background">
      {/*<PageHeader
        title="Flota en vivo"
        subtitle="Ubicación referencial en mapa y listado de unidades. Datos demo hasta conectar APIs."
      />*/}

      <div className="flex min-h-0 flex-1 flex-col lg:flex-row lg:items-stretch">
        <aside className="flex min-h-0 w-full flex-col border-b border-border/80 lg:w-[min(100%,400px)] lg:max-w-[40vw] lg:shrink-0 lg:border-b-0 lg:border-r">
          <FleetFilters
            variant="sidebar"
            filters={filters}
            onChange={setFilters}
            onApply={handleApplyFilters}
          />
          <div className="min-h-0 flex-1">
            <FleetDeviceList
              devices={filtered}
              search={search}
              onSearchChange={setSearch}
              selectedId={selectedId}
              onSelectDevice={setSelectedId}
            />
          </div>
        </aside>

        <div className="relative flex min-h-[min(45vh,420px)] min-w-0 flex-1 flex-col lg:min-h-0">
          <FleetMap devices={filtered} selectedId={selectedId} onMarkerClick={setSelectedId} />
        </div>
      </div>
    </div>
  );
};

export default Flota;
