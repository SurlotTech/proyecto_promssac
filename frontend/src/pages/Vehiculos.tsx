import { useEffect, useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Columns3,
  Download,
  MoreVertical,
  Plus,
  Search,
  Trash2,
  Truck,
  Upload,
  Wrench,
  CheckCircle2,
  MapPin,
} from "lucide-react";
import PageHeader from "@/components/PageHeader";
import StatsBar from "@/components/StatsBar";
import StatusTabs from "@/components/routes/StatusTabs";
import VehicleTable from "@/components/vehicles/VehicleTable";
import VehicleCard from "@/components/vehicles/VehicleCard";
import VehicleEditDialog from "@/components/vehicles/VehicleEditDialog";
import NewVehicleDialog from "@/components/vehicles/NewVehicleDialog";
import ConfirmDeleteDialog from "@/components/ui/ConfirmDeleteDialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import type { Vehicle } from "@/domain/vehicles";
import { useVehiclesQuery } from "@/hooks/useOperationsQueries";
import { Button } from "@/components/ui/button";
import RoutesPaginationBar from "@/components/routes/RoutesPaginationBar";
import { cn, errorMessageFromUnknown } from "@/lib/utils";
import { vehiclesApi } from "@/services/vehicles.api";
import { toast } from "sonner";

const Vehiculos = () => {
  const [pageSize, setPageSize] = useState(10);
  const queryClient = useQueryClient();
  const { data: allVehicles = [], isLoading, isError, error } = useVehiclesQuery();

  const [filters, setFilters] = useState({
    search: "",
    type: "all" as string,
    status: "all" as string,
  });
  const [activeTab, setActiveTab] = useState("all");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [selected, setSelected] = useState<Vehicle | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [vehicleToDelete, setVehicleToDelete] = useState<Vehicle | null>(null);
  const [page, setPage] = useState(1);


  const statusCounts = useMemo(() => ({
    all: allVehicles.length,
    active: allVehicles.filter((v) => v.status === "active").length,
    in_route: allVehicles.filter((v) => v.status === "in_route").length,
    maintenance: allVehicles.filter((v) => v.status === "maintenance").length,
    inactive: allVehicles.filter((v) => v.status === "inactive").length,
  }), [allVehicles]);

  const statusTabs = useMemo(() => [
    { status: "all", label: "Todos", count: statusCounts.all, variant: "all" as const },
    { status: "active", label: "Activos", count: statusCounts.active, variant: "success" as const },
    { status: "in_route", label: "En ruta", count: statusCounts.in_route, variant: "info" as const },
    { status: "maintenance", label: "Mantenimiento", count: statusCounts.maintenance, variant: "warning" as const },
    { status: "inactive", label: "Inactivos", count: statusCounts.inactive, variant: "neutral" as const },
  ], [statusCounts]);

  const filteredByStatus = useMemo(
    () => activeTab === "all" ? allVehicles : allVehicles.filter((v) => v.status === activeTab),
    [allVehicles, activeTab],
  );

  const filtered = useMemo(() => {
    return filteredByStatus.filter((v) => {
      const s = filters.search.toLowerCase();
      const matchSearch =
        !s ||
        v.plate.toLowerCase().includes(s) ||
        (v.driver ?? "").toLowerCase().includes(s);
      const matchType = filters.type === "all" || v.type === filters.type;
      const matchStatus = filters.status === "all" || v.status === filters.status;
      return matchSearch && matchType && matchStatus;
    });
  }, [filters, filteredByStatus]);

  const totalFiltered = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalFiltered / pageSize));
  const currentPage = Math.min(page, totalPages);

  const paginated = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, currentPage, pageSize]);

  useEffect(() => {
    setPage(1);
  }, [filters, activeTab]);

  const ALL_VEHICLE_COLUMNS = [
    { key: "vehiculo", label: "Vehículo" },
    { key: "tipo", label: "Tipo" },
    { key: "conductor", label: "Conductor" },
    { key: "estado", label: "Estado" },
    { key: "servicio", label: "Último servicio" },
  ] as const;

  type VehicleColumnKey = (typeof ALL_VEHICLE_COLUMNS)[number]["key"];

  const [visibleColumns, setVisibleColumns] = useState<VehicleColumnKey[]>(
    ALL_VEHICLE_COLUMNS.map((c) => c.key),
  );

  const hasActiveFilters = filters.search || filters.type !== "all" || filters.status !== "all";

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

  const deleteSelectedVehicles = () => {
    if (selectedIds.size === 0) return;
    const ids = Array.from(selectedIds);
    Promise.all(ids.map((id) => vehiclesApi.remove(id)))
      .then(() => {
        queryClient.invalidateQueries({ queryKey: ["vehicles"] });
        setSelectedIds(new Set());
        toast.success(`${ids.length} vehículo${ids.length !== 1 ? "s" : ""} eliminado${ids.length !== 1 ? "s" : ""}.`);
      })
      .catch((e: Error) => toast.error(e.message));
  };

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

            <Button
              size="sm"
              onClick={() => setCreateOpen(true)}
              className="h-12 gap-1.5 text-base font-normal bg-primary hover:bg-primary text-white px-6 shadow-md transition-all hover:scale-105 active:scale-95"
            >
<Plus className="size-5" /> Nuevo
            </Button>
          </>
        }
      />
 
      <div className="space-y-10 p-4 pb-2 pt-1 sm:p-6 sm:pb-3 sm:pt-2 lg:p-8 lg:pb-4 lg:pt-2">
        <StatsBar
          items={[
            {
              label: "Total flota",
              value: stats.total,
              subtext: `${stats.total} vehículo${stats.total !== 1 ? "s" : ""}`,
              icon: Truck,
              tone: "primary",
            },
            {
              label: "Activos",
              value: stats.active,
              subtext: `${stats.total ? Math.round((stats.active / stats.total) * 100) : 0}% disponible`,
              icon: CheckCircle2,
              tone: "success",
            },
            {
              label: "En ruta",
              value: stats.inRoute,
              subtext: `${stats.inRoute} en ruta`,
              icon: MapPin,
              tone: "info",
            },
            {
              label: "Mantenimiento",
              value: stats.maintenance,
              subtext: `${stats.maintenance} en mantenimiento`,
              icon: Wrench,
              tone: "warning",
            },
          ]}
        />

        <div className="rounded-[14px] border border-border/40 bg-white/30 shadow-md overflow-hidden">
          <StatusTabs tabs={statusTabs} activeStatus={activeTab} onChange={setActiveTab} />

          <div className="bg-white/30">
            <div className="flex items-center gap-4 px-5 py-5">
              <div className="relative flex-1 max-w-[380px]">
                <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-[#8a9aab]" />
                <Input
                  placeholder="Buscar por placa, conductor..."
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  className="h-14 rounded-lg border border-[#e1e7ee] bg-white/60 pl-10 text-[15px] text-[#1f2933] placeholder:text-[#8a9aab] transition-colors hover:border-primary focus-visible:ring-1"
                />
              </div>

              <div className="relative group">
                <span className={cn(
                  "absolute left-3 z-10 transition-all pointer-events-none bg-white px-1.5",
                  filters.type !== "all"
                    ? "-top-1.5 text-[11px] text-primary"
                    : "top-1/2 -translate-y-1/2 text-sm text-[#8a9aab] group-has-[[data-state=open]]:-top-1.5 group-has-[[data-state=open]]:text-[11px] group-has-[[data-state=open]]:text-primary",
                )}>
                  Vehículo
                </span>
                <Select
                  value={filters.type}
                  onValueChange={(v) => setFilters({ ...filters, type: v })}
                >
                  <SelectTrigger className={cn(
                    "h-14 w-[160px] rounded-lg border bg-white/60 px-3.5 text-[15px] text-[#8a9aab] focus:ring-0 focus:ring-offset-0 data-[state=open]:border-primary transition-colors hover:border-primary [&_svg]:text-[#52677a] [&_svg]:opacity-100",
                    filters.type !== "all" ? "pt-4 border-primary" : "border-[#e1e7ee]",
                  )}>
                    {filters.type !== "all" ? (
                      <div className="flex items-center gap-2">
                        <Truck className="size-4 shrink-0" strokeWidth={1.75} />
                        <SelectValue />
                      </div>
                    ) : (
                      <span />
                    )}
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="Furgón">Furgón</SelectItem>
                    <SelectItem value="Camión">Camión</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {selectedIds.size > 0 && (
                <Button
                  variant="ghost"
                  className="ml-auto h-14 gap-2 px-3 text-[15px] text-red-600 hover:text-red-700 hover:bg-red-50"
                  onClick={deleteSelectedVehicles}
                >
                  <Trash2 className="size-4" />
                  Eliminar ({selectedIds.size})
                </Button>
              )}

              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="ghost" className={selectedIds.size > 0 ? "h-14 gap-2 px-3 text-[15px] text-black hover:text-[#1f2933]" : "ml-auto h-14 gap-2 px-3 text-[15px] text-black hover:text-[#1f2933]"}>
                    <Columns3 className="size-4" />
                    Columnas
                  </Button>
                </PopoverTrigger>
                <PopoverContent align="end" className="w-48 p-3">
                  <div className="space-y-2">
                    {ALL_VEHICLE_COLUMNS.map((col) => (
                      <label
                        key={col.key}
                        className="flex items-center gap-2 cursor-pointer text-sm text-[#1f2933] hover:text-primary transition-colors"
                      >
                        <Checkbox
                          checked={visibleColumns.includes(col.key)}
                          onCheckedChange={() => {
                            if (visibleColumns.includes(col.key)) {
                              setVisibleColumns(visibleColumns.filter((c) => c !== col.key));
                            } else {
                              setVisibleColumns([...visibleColumns, col.key]);
                            }
                          }}
                          className="h-4 w-4 border-2 border-gray-400 data-[state=checked]:bg-primary data-[state=checked]:border-primary rounded mt-px"
                        />
                        {col.label}
                      </label>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-14 gap-2 px-3 text-[15px] text-black hover:text-[#1f2933]">
                    <MoreVertical className="size-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-44">
                  <DropdownMenuItem onClick={() => {}}>
                    <Upload className="mr-2 size-4" /> Importar
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => {}}>
                    <Download className="mr-2 size-4" /> Exportar
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {hasActiveFilters && (
              <div className="px-5 pb-3 flex flex-col gap-2">
                <span className="text-sm font-semibold text-[#1f2933]">{totalFiltered} resultado{totalFiltered !== 1 ? "s" : ""}</span>
                <div className="flex items-center gap-2 flex-wrap">
                  {filters.search && (
                    <span className="inline-flex items-center gap-1.5 rounded-md bg-[#eef1f5] px-2.5 py-1 text-xs font-medium text-[#52677a]">
                      Búsqueda: {filters.search}
                      <button onClick={() => setFilters({ ...filters, search: "" })} className="ml-0.5 text-[#8a9aab] hover:text-[#1f2933]">✕</button>
                    </span>
                  )}
                  {filters.type !== "all" && (
                    <span className="inline-flex items-center gap-1.5 rounded-md bg-[#eef1f5] px-2.5 py-1 text-xs font-medium text-[#52677a]">
                      Tipo: {filters.type}
                      <button onClick={() => setFilters({ ...filters, type: "all" })} className="ml-0.5 text-[#8a9aab] hover:text-[#1f2933]">✕</button>
                    </span>
                  )}
                  {filters.status !== "all" && (
                    <span className="inline-flex items-center gap-1.5 rounded-md bg-[#eef1f5] px-2.5 py-1 text-xs font-medium text-[#52677a]">
                      Estado: {filters.status === "active" ? "Activo" : filters.status === "in_route" ? "En ruta" : filters.status === "maintenance" ? "Mantenimiento" : "Inactivo"}
                      <button onClick={() => setFilters({ ...filters, status: "all" })} className="ml-0.5 text-[#8a9aab] hover:text-[#1f2933]">✕</button>
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>

          <>
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
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
                  size="sm"
                  onClick={() => setCreateOpen(true)}
                  className="mt-4 h-12 gap-1.5 text-base font-normal bg-primary hover:bg-primary text-white px-6 shadow-md transition-all hover:scale-105 active:scale-95"
                >
                  <Plus className="size-5" /> Nuevo
                </Button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 gap-3 sm:hidden">
                  {paginated.map((v) => (
                    <VehicleCard key={v.id} v={v} onClick={() => openDetail(v)} />
                  ))}
                </div>

                <div className="hidden sm:block">
                  <VehicleTable
                    vehicles={paginated}
                    onSelect={openDetail}
                    onDelete={(v) => setVehicleToDelete(v)}
                    selectedIds={selectedIds}
                    onSelectionChange={setSelectedIds}
                    visibleColumns={visibleColumns}
                  />
                </div>

                <RoutesPaginationBar
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalFiltered={totalFiltered}
                  pageSize={pageSize}
                  onPageChange={setPage}
                  label="vehículos"
                  onPageSizeChange={setPageSize}
                />
              </>
            )}
          </>
        </div>
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