import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { Plus, Route, TrendingUp, Truck } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import StatsBar from "@/components/StatsBar";
import StatusTabs from "@/components/routes/StatusTabs";
import type { StatusTab } from "@/components/routes/StatusTabs";
import RouteFiltersBar from "@/components/routes/RouteFiltersBar";
import type { RouteFiltersData, RouteColumnKey } from "@/components/routes/RouteFiltersBar";
import { ALL_ROUTE_COLUMNS } from "@/components/routes/RouteFiltersBar";
import RouteTable from "@/components/routes/RouteTable";
import AssignRouteDialog from "@/components/routes/AssignRouteDialog";
import NewRouteDialog from "@/components/routes/NewRouteDialog";
import RoutesPaginationBar from "@/components/routes/RoutesPaginationBar";
import ConfirmDeleteDialog from "@/components/ui/ConfirmDeleteDialog";
import { Button } from "@/components/ui/button";
import type { Route as RouteData } from "@/domain/routes";
import { routeMatchesFilters } from "@/lib/routeListFilter";
import { ROUTES_QUERY_KEY } from "@/hooks/useRoutesQueryInvalidation";
import {
  useMobileUserRouteOptionsQuery,
  useRoutesQuery,
  useVehicleOptionsQuery,
} from "@/hooks/useOperationsQueries";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { routesApi } from "@/services";
import { toast } from "sonner";

const defaultFilters: RouteFiltersData & { place: string; driver: string } = {
  search: "",
  vehicle: "all",
  place: "all",
  driver: "all",
  dateFrom: "",
  dateTo: "",
};

function parseDateTime(ddMmYyyyHhMm: string): number {
  if (!ddMmYyyyHhMm) return 0;
  const parts = ddMmYyyyHhMm.split(" ");
  const dateParts = parts[0].split("/");
  if (dateParts.length !== 3) return 0;
  const d = new Date(+dateParts[2], +dateParts[1] - 1, +dateParts[0]);
  if (parts[1]) {
    const timeParts = parts[1].split(":");
    d.setHours(+timeParts[0], +timeParts[1]);
  }
  return d.getTime();
}

const Rutas = () => {
  const [pageSize, setPageSize] = useState(10);
  const qc = useQueryClient();
  const navigate = useNavigate();

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

  const driverPhoneMap = useMemo(
    () => Object.fromEntries(mobileUsersRuta.map((u) => [u.nombreCompleto, u.telefono ?? ""])),
    [mobileUsersRuta],
  );

  const driverFilterOptions = useMemo(() => {
    const fromRoutes = allRoutes
      .map((r) => r.mobileUser)
      .filter((s): s is string => Boolean(s && String(s).trim()));
    const fromMobile = mobileUsersRuta.map((u) => u.nombreCompleto.trim()).filter(Boolean);
    return [...new Set([...fromRoutes, ...fromMobile])].sort((a, b) => a.localeCompare(b, "es"));
  }, [allRoutes, mobileUsersRuta]);

  const [visibleColumns, setVisibleColumns] = useState<RouteColumnKey[]>(
    ALL_ROUTE_COLUMNS.map((c) => c.key),
  );
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const [filters, setFilters] = useState<RouteFiltersData & { place: string; driver: string }>(defaultFilters);
  const [activeTab, setActiveTab] = useState<RouteData["status"] | "all">("all");
  const [sortBy, setSortBy] = useState<string>("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [selected, setSelected] = useState<RouteData | null>(null);
  const [page, setPage] = useState(1);
  const [routeDialogOpen, setRouteDialogOpen] = useState(false);
  const [editingRoute, setEditingRoute] = useState<RouteData | null>(null);
  const [assignRouteOpen, setAssignRouteOpen] = useState(false);
  const [routeToDelete, setRouteToDelete] = useState<RouteData | null>(null);

  const deleteRouteMut = useMutation({
    mutationFn: (id: string) => routesApi.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ROUTES_QUERY_KEY });
      toast.success("Ruta eliminada.");
      setSelected(null);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteSelectedRoutes = () => {
    if (selectedIds.size === 0) return;
    const ids = Array.from(selectedIds);
    Promise.all(ids.map((id) => routesApi.remove(id)))
      .then(() => {
        qc.invalidateQueries({ queryKey: ROUTES_QUERY_KEY });
        setSelectedIds(new Set());
        toast.success(`${ids.length} ruta${ids.length !== 1 ? "s" : ""} eliminada${ids.length !== 1 ? "s" : ""}.`);
      })
      .catch((e: Error) => toast.error(e.message));
  };

  const openDetail = (r: RouteData) => {
    navigate(`/rutas/${r.id}`);
  };

  const openNewRoute = () => {
    setEditingRoute(null);
    setRouteDialogOpen(true);
  };

  const openEditRoute = (r: RouteData) => {
    setEditingRoute(r);
    setRouteDialogOpen(true);
  };

  const confirmDeleteRoute = (r: RouteData) => {
    setRouteToDelete(r);
  };

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(column);
      setSortOrder("asc");
    }
  };

  const confirmDeleteRouteMut = () => {
    if (!routeToDelete) return;
    deleteRouteMut.mutate(routeToDelete.id);
  };

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const r of allRoutes) {
      counts[r.status] = (counts[r.status] || 0) + 1;
    }
    return counts;
  }, [allRoutes]);

  const statusTabs: StatusTab[] = useMemo(() => [
    { status: "all", label: "Todas", count: allRoutes.length, variant: "all" },
    { status: "in_progress", label: "Activas", count: statusCounts.in_progress || 0, variant: "success" },
    { status: "scheduled", label: "Pendientes", count: statusCounts.scheduled || 0, variant: "warning" },
    { status: "delayed", label: "Retrasadas", count: statusCounts.delayed || 0, variant: "danger" },
    { status: "completed", label: "Completadas", count: statusCounts.completed || 0, variant: "neutral" },
    { status: "cancelled", label: "Canceladas", count: statusCounts.cancelled || 0, variant: "neutral" },
  ], [allRoutes, statusCounts]);

  const filteredByStatus = useMemo(
    () => activeTab === "all" ? allRoutes : allRoutes.filter((r) => r.status === activeTab),
    [allRoutes, activeTab],
  );

  const filtered = useMemo(() => {
    const result = filteredByStatus.filter((r) => routeMatchesFilters(r, filters));
    result.sort((a, b) => {
      if (sortBy === "createdAt") {
        const aDate = parseDateTime(a.createdAt);
        const bDate = parseDateTime(b.createdAt);
        return sortOrder === "asc" ? bDate - aDate : aDate - bDate;
      }
      return 0;
    });
    return result;
  }, [filteredByStatus, filters, sortBy, sortOrder]);

  const totalFiltered = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalFiltered / pageSize));
  const currentPage = Math.min(page, totalPages);

  const paginatedRoutes = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, currentPage, pageSize]);

  useEffect(() => {
    setPage(1);
  }, [filters, activeTab]);

  useEffect(() => {
    setPage((p) => Math.min(p, totalPages));
  }, [totalPages]);

  const stats = useMemo(() => {
    const total = allRoutes.length;
    const active = allRoutes.filter((r) => r.status === "in_progress").length;
    const completed = allRoutes.filter((r) => r.status === "completed").length;
    const totalCollection = allRoutes.reduce(
      (acc, r) => acc + r.totalCollection,
      0,
    );
    return { total, active, completed, totalCollection };
  }, [allRoutes]);

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
          <Button
            size="sm"
            type="button"
            className="h-12 gap-1.5 text-base font-normal bg-primary hover:bg-primary text-white px-6 shadow-md transition-all hover:scale-105 active:scale-95"
            onClick={openNewRoute}
          >
            <Plus className="size-5 shrink-0" />
            Nuevo
          </Button>
        }
      />
      <div className="space-y-10 p-4 pb-2 pt-1 sm:p-6 sm:pb-3 sm:pt-2 lg:p-8 lg:pb-4 lg:pt-2">
        <StatsBar
          items={[
            {
              label: "Total de rutas",
              subtext: `${stats.total} ruta${stats.total !== 1 ? "s" : ""}`,
              value: `S/ ${stats.totalCollection.toLocaleString("es-PE", { minimumFractionDigits: 2 })}`,
              icon: Route,
              tone: "primary",
            },
            {
              label: "Rutas activas",
              subtext: `${stats.active} activa${stats.active !== 1 ? "s" : ""}`,
              value: stats.active,
              icon: TrendingUp,
              tone: "info",
            },
            {
              label: "Rutas completadas",
              subtext: `${stats.completed} completa${stats.completed !== 1 ? "das" : "da"}`,
              value: stats.completed,
              icon: Truck,
              tone: "success",
            },
          ]}
        />

        <div className="rounded-[14px] border border-border/40 bg-white/30 shadow-md overflow-hidden">
          <StatusTabs
            tabs={statusTabs}
            activeStatus={activeTab}
            onChange={setActiveTab}
          />
          <RouteFiltersBar
            filters={filters}
            onChange={(next) => setFilters({ ...filters, ...next })}
            onAssignRoute={() => setAssignRouteOpen(true)}
            vehicles={vehicleOptions}
            drivers={driverFilterOptions}
            visibleColumns={visibleColumns}
            onVisibleColumnsChange={setVisibleColumns}
            totalFiltered={totalFiltered}
            selectedCount={selectedIds.size}
            onDeleteSelected={deleteSelectedRoutes}
          />

          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                <Route className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="mt-4 text-base font-semibold text-foreground">No se encontraron rutas</p>
              <p className="mt-1 text-sm text-muted-foreground">Ajusta los filtros o crea una nueva ruta.</p>
            </div>
          ) : (
            <>
              <RouteTable
                routes={paginatedRoutes}
                onSelect={openDetail}
                onEdit={openEditRoute}
                onDelete={confirmDeleteRoute}
                vehicleTypeByPlate={vehicleTypeByPlate}
                driverPhoneMap={driverPhoneMap}
                visibleColumns={visibleColumns}
                sortBy={sortBy}
                sortOrder={sortOrder}
                onSort={handleSort}
                selectedIds={selectedIds}
                onSelectionChange={setSelectedIds}
              />
              <RoutesPaginationBar
                currentPage={currentPage}
                totalPages={totalPages}
                totalFiltered={totalFiltered}
                pageSize={pageSize}
                onPageChange={setPage}
                label="rutas"
                onPageSizeChange={setPageSize}
              />
            </>
          )}
        </div>
      </div>

      <NewRouteDialog
        open={routeDialogOpen}
        onOpenChange={closeRouteDialog}
        editingRoute={editingRoute}
        vehicles={vehicleOpciones}
        mobileUsers={mobileUsersRuta}
      />

      <AssignRouteDialog
        open={assignRouteOpen}
        onOpenChange={setAssignRouteOpen}
        routes={allRoutes}
      />

      <ConfirmDeleteDialog
        open={routeToDelete != null}
        onOpenChange={(open) => {
          if (!open) setRouteToDelete(null);
        }}
        title="Eliminar ruta"
        description={
          routeToDelete
            ? `¿Eliminar la ruta «${routeToDelete.code}»? Esta acción no se puede deshacer.`
            : ""
        }
        confirmLabel="Eliminar ruta"
        isPending={deleteRouteMut.isPending}
        onConfirm={confirmDeleteRouteMut}
      />
    </div>
  );
};

export default Rutas;
