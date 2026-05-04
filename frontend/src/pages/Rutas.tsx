import { useEffect, useMemo, useState } from "react";
import {
  Download,
  FileUp,
  Plus,
  Route,
  Send,
  TrendingUp,
  Truck,
  Users,
} from "lucide-react";
import PageHeader from "@/components/PageHeader";
import StatCard from "@/components/StatCard";
import RouteFilters, { RouteFilters as Filters } from "@/components/routes/RouteFilters";
import RouteTable from "@/components/routes/RouteTable";
import RouteCard from "@/components/routes/RouteCard";
import AssignRouteDialog from "@/components/routes/AssignRouteDialog";
import NewRouteDialog from "@/components/routes/NewRouteDialog";
import RoutesPaginationBar from "@/components/routes/RoutesPaginationBar";
import RoutesViewToggle from "@/components/routes/RoutesViewToggle";
import { Button } from "@/components/ui/button";
import type { Route as RouteData } from "@/domain/routes";
import { places } from "@/domain/routes";
import { routeMatchesFilters } from "@/lib/routeListFilter";
import { ROUTES_QUERY_KEY } from "@/hooks/useRoutesQueryInvalidation";
import { useMobileUserRouteOptionsQuery, useRoutesQuery, useVehicleOptionsQuery } from "@/hooks/useOperationsQueries";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { routesApi } from "@/services";
import { toast } from "sonner";

const defaultFilters: Filters = {
  search: "",
  vehicle: "all",
  place: "all",
  driver: "all",
  dateFrom: "",
  dateTo: "",
};

const PAGE_SIZE = 6;

const Rutas = () => {
  const qc = useQueryClient();
  const { data: allRoutes = [], isLoading, isError, error } = useRoutesQuery();
  const { data: vehicleOpciones = [] } = useVehicleOptionsQuery();
  const { data: mobileUsersRuta = [] } = useMobileUserRouteOptionsQuery();

  const vehicleOptions = useMemo(
    () => vehicleOpciones.map((x) => ({ id: x.id, plate: x.plate })),
    [vehicleOpciones],
  );

  const vehicleTypeByPlate = useMemo(
    () => Object.fromEntries(vehicleOpciones.map((v) => [v.plate, v.type])),
    [vehicleOpciones],
  );

  const driverFilterOptions = useMemo(() => {
    const fromRoutes = allRoutes
      .map((r) => r.mobileUser)
      .filter((s): s is string => Boolean(s && String(s).trim()));
    const fromMobile = mobileUsersRuta.map((u) => u.nombreCompleto.trim()).filter(Boolean);
    return [...new Set([...fromRoutes, ...fromMobile])].sort((a, b) => a.localeCompare(b, "es"));
  }, [allRoutes, mobileUsersRuta]);

  const [filters, setFilters] = useState<Filters>(defaultFilters);
  const [selected, setSelected] = useState<RouteData | null>(null);
  const [view, setView] = useState<"table" | "grid">("table");
  const [page, setPage] = useState(1);
  const [routeDialogOpen, setRouteDialogOpen] = useState(false);
  const [editingRoute, setEditingRoute] = useState<RouteData | null>(null);
  const [assignRouteOpen, setAssignRouteOpen] = useState(false);

  const deleteRouteMut = useMutation({
    mutationFn: (id: string) => routesApi.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ROUTES_QUERY_KEY });
      toast.success("Ruta eliminada.");
      setSelected(null);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const openNewRoute = () => {
    setEditingRoute(null);
    setRouteDialogOpen(true);
  };

  const openEditRoute = (r: RouteData) => {
    setEditingRoute(r);
    setRouteDialogOpen(true);
  };

  const confirmDeleteRoute = (r: RouteData) => {
    if (!window.confirm(`¿Eliminar la ruta «${r.code}»? Esta acción no se puede deshacer.`)) return;
    deleteRouteMut.mutate(r.id);
  };

  const filteredRoutes = useMemo(
    () => allRoutes.filter((r) => routeMatchesFilters(r, filters)),
    [filters, allRoutes],
  );

  const totalFiltered = filteredRoutes.length;
  const totalPages = Math.max(1, Math.ceil(totalFiltered / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);

  const paginatedRoutes = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredRoutes.slice(start, start + PAGE_SIZE);
  }, [filteredRoutes, currentPage]);

  useEffect(() => {
    setPage(1);
  }, [filters]);

  useEffect(() => {
    setPage((p) => Math.min(p, totalPages));
  }, [totalPages]);

  const stats = useMemo(() => {
    const total = allRoutes.length;
    const active = allRoutes.filter((r) => r.status === "in_progress").length;
    const completed = allRoutes.filter((r) => r.status === "completed").length;
    const totalCollection = allRoutes.reduce((acc, r) => acc + r.totalCollection, 0);
    return { total, active, completed, totalCollection };
  }, [allRoutes]);

  const handleResetFilters = () => setFilters(defaultFilters);

  const closeRouteDialog = (open: boolean) => {
    setRouteDialogOpen(open);
    if (!open) setEditingRoute(null);
  };

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center p-12 text-sm text-muted-foreground">
        Cargando rutas…
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-2 p-12 text-center">
        <p className="text-sm font-medium text-destructive">No se pudieron cargar las rutas</p>
        <p className="text-xs text-muted-foreground">{error instanceof Error ? error.message : "Error"}</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Rutas"
        subtitle="Planifica y monitorea las rutas de entrega."
        actions={
          <>
            <Button variant="outline" size="sm" className="h-9 gap-2">
              <FileUp className="size-4 shrink-0" />
              <span className="hidden sm:inline">Importar</span>
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-9 gap-2"
              onClick={() => setAssignRouteOpen(true)}
            >
              <Send className="size-4 shrink-0" />
              <span className="hidden sm:inline">Asignar ruta</span>
            </Button>
            <Button variant="outline" size="sm" className="h-9 gap-2">
              <Download className="size-4 shrink-0" />
              <span className="hidden sm:inline">Exportar</span>
            </Button>
            <Button
              size="sm"
              type="button"
              className="h-9 gap-2 bg-primary shadow-glow hover:bg-primary-hover"
              onClick={openNewRoute}
            >
              <Plus className="size-4 shrink-0" />
              <span className="hidden sm:inline">Nueva ruta</span>
            </Button>
          </>
        }
      />
      <div className="space-y-5 p-4 sm:p-6 lg:p-8">
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          <StatCard
            label="Total de rutas"
            value={stats.total}
            icon={Route}
            tone="primary"
          />
          <StatCard label="Rutas activas" value={stats.active} icon={TrendingUp} tone="info" />
          <StatCard label="Rutas completadas" value={stats.completed} icon={Truck} tone="success" />
          <StatCard
            label="Recaudación total"
            value={`S/ ${stats.totalCollection.toLocaleString("es-PE", { minimumFractionDigits: 2 })}`}
            icon={Users}
            tone="warning"
          />
        </div>

        <RouteFilters
          filters={filters}
          onChange={setFilters}
          onReset={handleResetFilters}
          vehicles={vehicleOptions}
          places={places}
          drivers={driverFilterOptions}
          toolbarRight={<RoutesViewToggle view={view} onViewChange={setView} />}
        />

        {filteredRoutes.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card py-16 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
              <Route className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="mt-4 text-base font-semibold text-foreground">No se encontraron rutas</p>
            <p className="mt-1 text-sm text-muted-foreground">Ajusta los filtros o crea una nueva ruta.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-3 sm:hidden">
              {paginatedRoutes.map((r) => (
                <RouteCard
                  key={r.id}
                  route={r}
                  onSelect={setSelected}
                  onEdit={openEditRoute}
                  onDelete={confirmDeleteRoute}
                  vehicleTypeByPlate={vehicleTypeByPlate}
                />
              ))}
            </div>

            <div className="hidden sm:block">
              {view === "table" ? (
                <RouteTable
                  routes={paginatedRoutes}
                  onSelect={setSelected}
                  onEdit={openEditRoute}
                  onDelete={confirmDeleteRoute}
                  vehicleTypeByPlate={vehicleTypeByPlate}
                />
              ) : (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {paginatedRoutes.map((r) => (
                    <RouteCard
                      key={r.id}
                      route={r}
                      onSelect={setSelected}
                      onEdit={openEditRoute}
                      onDelete={confirmDeleteRoute}
                      vehicleTypeByPlate={vehicleTypeByPlate}
                    />
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
            />
          </>
        )}
      </div>

      <NewRouteDialog
        open={routeDialogOpen}
        onOpenChange={closeRouteDialog}
        editingRoute={editingRoute}
        vehicles={vehicleOpciones}
        mobileUsers={mobileUsersRuta}
      />

      <AssignRouteDialog open={assignRouteOpen} onOpenChange={setAssignRouteOpen} routes={allRoutes} />
    </div>
  );
};

export default Rutas;
