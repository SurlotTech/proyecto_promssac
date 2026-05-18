import { useEffect, useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Download,
  LayoutGrid,
  List,
  Plus,
  Truck,
  Upload,
  Wrench,
  CheckCircle2,
  MapPin,
} from "lucide-react";
import PageHeader from "@/components/PageHeader";
import StatCard from "@/components/StatCard";
import VehicleFilters, { Filters } from "@/components/vehicles/VehicleFilters";
import VehicleTable from "@/components/vehicles/VehicleTable";
import VehicleCard from "@/components/vehicles/VehicleCard";
import VehicleEditDialog from "@/components/vehicles/VehicleEditDialog";
import NewVehicleDialog from "@/components/vehicles/NewVehicleDialog";
import ConfirmDeleteDialog from "@/components/ui/ConfirmDeleteDialog";
import type { Vehicle } from "@/domain/vehicles";
import { useVehiclesQuery } from "@/hooks/useOperationsQueries";
import { Button } from "@/components/ui/button";
import RoutesPaginationBar from "@/components/routes/RoutesPaginationBar";
import { cn, errorMessageFromUnknown } from "@/lib/utils";
import { vehiclesApi } from "@/services/vehicles.api";
import { toast } from "sonner";

const PAGE_SIZE = 8;

const Vehiculos = () => {
  const queryClient = useQueryClient();
  const { data: allVehicles = [], isLoading, isError, error } = useVehiclesQuery();

  const [filters, setFilters] = useState<Filters>({
    search: "",
    type: "all",
    status: "all",
  });
  const [view, setView] = useState<"table" | "grid">("table");
  const [selected, setSelected] = useState<Vehicle | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [vehicleToDelete, setVehicleToDelete] = useState<Vehicle | null>(null);
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    return allVehicles.filter((v) => {
      const s = filters.search.toLowerCase();
      const matchSearch =
        !s ||
        v.plate.toLowerCase().includes(s) ||
        (v.driver ?? "").toLowerCase().includes(s);
      const matchType = filters.type === "all" || v.type === filters.type;
      const matchStatus = filters.status === "all" || v.status === filters.status;
      return matchSearch && matchType && matchStatus;
    });
  }, [filters, allVehicles]);

  const totalFiltered = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalFiltered / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);

  const paginated = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, currentPage]);

  useEffect(() => {
    setPage(1);
  }, [filters]);

  const stats = useMemo(() => {
    const total = allVehicles.length;
    const active = allVehicles.filter((v) => v.status === "active").length;
    const inRoute = allVehicles.filter((v) => v.status === "in_route").length;
    const maintenance = allVehicles.filter((v) => v.status === "maintenance").length;
    return { total, active, inRoute, maintenance };
  }, [allVehicles]);

  const openDetail = (v: Vehicle) => {
    setSelected(v);
    setEditOpen(true);
  };

  const deleteVehicleMut = useMutation({
    mutationFn: (id: string) => vehiclesApi.remove(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["vehicles"] });
      toast.success("Vehículo eliminado.");
      setVehicleToDelete(null);
    },
    onError: (e: unknown) => toast.error(errorMessageFromUnknown(e, "No se pudo eliminar el vehículo.")),
  });

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center p-12 text-sm text-muted-foreground">
        Cargando vehículos…
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-2 p-12 text-center">
        <p className="text-sm font-medium text-destructive">No se pudo cargar la flota</p>
        <p className="text-xs text-muted-foreground">{error instanceof Error ? error.message : "Error"}</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Vehículos"
        subtitle="Gestiona tu flota, asigna conductores y monitorea el estado en tiempo real."
        actions={
          <>
            <Button variant="outline" size="sm" className="h-9">
              <Download className="mr-2 h-4 w-4" /> Exportar
            </Button>
            <Button variant="outline" size="sm" className="h-9">
              <Upload className="mr-2 h-4 w-4" /> Importar
            </Button>
            <Button
              size="sm"
              onClick={() => setCreateOpen(true)}
              className="h-9 bg-primary shadow-glow hover:bg-primary-hover"
            >
              <Plus className="mr-2 h-4 w-4" /> Nuevo vehículo
            </Button>
          </>
        }
      />

      <div className="space-y-5 p-4 sm:p-6 lg:p-8">
        {/* KPIs */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          <StatCard
            label="Total flota"
            value={stats.total}
            delta="+2 este mes"
            icon={Truck}
            tone="primary"
          />
          <StatCard
            label="Activos"
            value={stats.active}
            delta={`${stats.total ? Math.round((stats.active / stats.total) * 100) : 0}% disponible`}
            icon={CheckCircle2}
            tone="success"
          />
          <StatCard
            label="En ruta"
            value={stats.inRoute}
            icon={MapPin}
            tone="info"
          />
          <StatCard
            label="Mantenimiento"
            value={stats.maintenance}
            icon={Wrench}
            tone="warning"
          />
        </div>

        {/* Filtros + vista tabla/tarjetas (misma fila desde sm) */}
        <VehicleFilters
          filters={filters}
          onChange={setFilters}
          onReset={() =>
            setFilters({ search: "", type: "all", status: "all" })
          }
          toolbarRight={
            <div className="hidden shrink-0 items-center gap-1 rounded-lg border border-border/70 bg-white p-1 sm:inline-flex">
              <button
                type="button"
                onClick={() => setView("table")}
                className={cn(
                  "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                  view === "table"
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                )}
              >
                <List className="size-4 shrink-0" /> Tabla
              </button>
              <button
                type="button"
                onClick={() => setView("grid")}
                className={cn(
                  "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                  view === "grid"
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                )}
              >
                <LayoutGrid className="size-4 shrink-0" /> Tarjetas
              </button>
            </div>
          }
        />

        {/* Contenido */}
        <>
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card/40 backdrop-blur-md py-16 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                <Truck className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="mt-4 text-base font-semibold text-foreground">
                No se encontraron vehículos
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Ajusta los filtros o crea un nuevo vehículo.
              </p>
              <Button
                onClick={() => setCreateOpen(true)}
                className="mt-4 bg-primary hover:bg-primary-hover"
              >
                <Plus className="mr-2 h-4 w-4" /> Nuevo vehículo
              </Button>
            </div>
          ) : (
            <>
              {/* Mobile: siempre tarjetas */}
              <div className="grid grid-cols-1 gap-3 sm:hidden">
                {paginated.map((v) => (
                  <VehicleCard key={v.id} v={v} onClick={() => openDetail(v)} />
                ))}
              </div>

              {/* Desktop: según vista */}
              <div className="hidden sm:block">
                {view === "table" ? (
                  <VehicleTable vehicles={paginated} onSelect={openDetail} onDelete={(v) => setVehicleToDelete(v)} />
                ) : (
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {paginated.map((v) => (
                      <VehicleCard key={v.id} v={v} onClick={() => openDetail(v)} />
                    ))}
                  </div>
                )}
              </div>

              <RoutesPaginationBar
                currentPage={currentPage}
                totalPages={totalPages}
                totalFiltered={totalFiltered}
                pageSize={PAGE_SIZE}
                onPageChange={setPage}
                label="vehículos"
              />
            </>
          )}
        </>
      </div>

      <VehicleEditDialog
        vehicle={selected}
        open={editOpen}
        onOpenChange={setEditOpen}
        onUpdated={() => queryClient.invalidateQueries({ queryKey: ["vehicles"] })}
      />
      <NewVehicleDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreated={() => queryClient.invalidateQueries({ queryKey: ["vehicles"] })}
      />
      <ConfirmDeleteDialog
        open={vehicleToDelete != null}
        onOpenChange={(open) => {
          if (!open) setVehicleToDelete(null);
        }}
        title="Eliminar vehículo"
        description={
          vehicleToDelete
            ? `¿Eliminar el vehículo con placa «${vehicleToDelete.plate}»? Esta acción no se puede deshacer.`
            : ""
        }
        confirmLabel="Eliminar vehículo"
        isPending={deleteVehicleMut.isPending}
        onConfirm={() => {
          if (!vehicleToDelete) return;
          deleteVehicleMut.mutate(vehicleToDelete.id);
        }}
      />
    </div>
  );
};

export default Vehiculos;