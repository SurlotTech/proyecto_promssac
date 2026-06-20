import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  Download,
  FileSpreadsheet,
  Loader2,
  Plus,
  Route,
  TrendingUp,
  Truck,
  Upload,
  Users,
  ChevronDown,
  ChevronRight,
  Package,
  MapPin,
  Phone,
  User,
  AlertTriangle,
  Calendar,
  Mail,
  FileText,
} from "lucide-react";
import PageHeader from "@/components/PageHeader";
import StatCard from "@/components/StatCard";
import RouteFilters, { RouteFilters as Filters } from "@/components/routes/RouteFilters";
import RouteTable from "@/components/routes/RouteTable";
import RouteCard from "@/components/routes/RouteCard";
import NewRouteDialog from "@/components/routes/NewRouteDialog";
import RoutesPaginationBar from "@/components/routes/RoutesPaginationBar";
import ConfirmDeleteDialog from "@/components/ui/ConfirmDeleteDialog";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Route as RouteData } from "@/domain/routes";
import { places } from "@/domain/routes";
import { routeMatchesFilters } from "@/lib/routeListFilter";
import { ROUTES_QUERY_KEY } from "@/hooks/useRoutesQueryInvalidation";
import { useMobileUserRouteOptionsQuery, useRoutesQuery, useVehicleOptionsQuery } from "@/hooks/useOperationsQueries";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { routesApi } from "@/services";
import { apiPost } from "@/lib/api";
import { endpoints } from "@/services/endpoints";
import { downloadPlantillaRutasYOrdenes, parseRouteOrderImport, type RouteOrderImportPreview } from "@/lib/routesExcel";
import { toast } from "sonner";

const defaultFilters: Filters = {
  search: "",
  vehicle: "all",
  place: "all",
  driver: "all",
  dateFrom: "",
  dateTo: "",
};

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
  const [routeToDelete, setRouteToDelete] = useState<RouteData | null>(null);
  const [importOpen, setImportOpen] = useState(false);
  const [importPreview, setImportPreview] = useState<RouteOrderImportPreview | null>(null);
  const [importFileName, setImportFileName] = useState("");
  const [importError, setImportError] = useState("");
  const [importando, setImportando] = useState(false);
  const [importWarnings, setImportWarnings] = useState<string[]>([]);
  const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set());
  const fileInputRef = useRef<HTMLInputElement>(null);

  const deleteRouteMut = useMutation({
    mutationFn: (id: string) => routesApi.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ROUTES_QUERY_KEY });
      toast.success("Ruta eliminada.");
      setSelected(null);
    },
    onError: (e: Error) => toast.error(e.message),
  });

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

  const confirmDeleteRouteMut = () => {
    if (!routeToDelete) return;
    deleteRouteMut.mutate(routeToDelete.id);
  };

  const groupedByRoute = useMemo(() => {
    if (!importPreview) return [];
    const map = new Map<string, { rows: RouteOrderImportRow[]; nombre: string; placa: string; fechaInicio: string; fechaFin: string }>();
    for (const row of importPreview.rows) {
      const key = row.codigoRuta || `__sin_ruta_${map.size}`;
      if (!map.has(key)) {
        map.set(key, { rows: [], nombre: row.nombreRuta, placa: row.placaVehiculo, fechaInicio: row.fechaInicio, fechaFin: row.fechaFin });
      }
      map.get(key)!.rows.push(row);
    }
    return [...map.entries()];
  }, [importPreview]);

  const groupedByOrder = (rows: RouteOrderImportRow[]) => {
    const map = new Map<string, RouteOrderImportRow[]>();
    for (const row of rows) {
      const key = row.numeroOrden || `__sin_orden_${map.size}`;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(row);
    }
    return [...map.entries()];
  };

  const toggleOrder = (orderNum: string) => {
    setExpandedOrders((prev) => {
      const next = new Set(prev);
      if (next.has(orderNum)) next.delete(orderNum);
      else next.add(orderNum);
      return next;
    });
  };

  const missing = (val: string) => !val || val.trim() === "";

  const hasAnyError = useMemo(() => {
    if (!importPreview) return true;
    return importPreview.rows.some((r) =>
      missing(r.codigoRuta) || missing(r.placaVehiculo) || missing(r.numeroOrden)
      || missing(r.contactoNombre) || missing(r.contactoTelefono) || missing(r.direccion)
    );
  }, [importPreview]);

  const handleImport = async () => {
    if (!importPreview || hasAnyError) return;
    setImportando(true);
    setImportWarnings([]);
    try {
      const response = await apiPost<{ rutasCreadas: number; ordenesCreadas: number; productosCreados: number; errores: string[]; mensajes: string[] }, { items: unknown[] }>(
        `${endpoints.routes}/importacion-lote`,
        { items: importPreview.rows.map((r) => ({
          codigoRuta: r.codigoRuta,
          nombreRuta: r.nombreRuta,
          placaVehiculo: r.placaVehiculo,
          fechaInicio: r.fechaInicio,
          fechaFin: r.fechaFin || undefined,
          numeroOrden: r.numeroOrden,
          estadoOrden: r.estadoOrden || undefined,
          subestado: r.subestado || undefined,
          contactoIdentificador: r.contactoIdentificador || undefined,
          contactoNombre: r.contactoNombre,
          contactoTelefono: r.contactoTelefono,
          contactoEmail: r.contactoEmail || undefined,
          nivel: r.nivel || undefined,
          direccion: r.direccion,
          direccionNormalizada: r.direccionNormalizada || undefined,
          fechaEntrega: r.fechaEntrega || undefined,
          modoEntrega: r.modoEntrega || undefined,
          prioridadEntrega: r.prioridadEntrega || undefined,
          director: r.director || undefined,
          telefonoDirector: r.telefonoDirector || undefined,
          paquetes: r.paquetes || undefined,
          actaEntrega: r.actaEntrega || undefined,
          guiaRemision: r.guiaRemision || undefined,
          guiaTransportista: r.guiaTransportista || undefined,
          correoElectronico: r.correoElectronico || undefined,
          productoCodigo: r.productoCodigo || undefined,
          productoNombre: r.productoNombre || undefined,
          productoCantidad: r.productoCantidad ? Number(r.productoCantidad) : undefined,
          productoPrecioUnit: r.productoPrecioUnit ? Number(r.productoPrecioUnit) : undefined,
          productoPesoKg: r.productoPesoKg ? Number(r.productoPesoKg) : undefined,
          productoCampoExtra: r.productoCampoExtra || undefined,
        })) }
      );

      if (response.errores.length > 0) {
        setImportWarnings(response.errores);
        toast.error(`${response.errores.length} error(es). Revisa los detalles y corrige el archivo.`);
      }
      if (response.mensajes && response.mensajes.length > 0) {
        setImportWarnings((prev) => [...prev, ...response.mensajes]);
      }
      if (response.rutasCreadas > 0 || response.ordenesCreadas > 0) {
        qc.invalidateQueries({ queryKey: ROUTES_QUERY_KEY });
        toast.success(`${response.rutasCreadas} ruta(s), ${response.ordenesCreadas} orden(es), ${response.productosCreados} producto(s) creados`);
      }
      if (response.errores.length === 0) {
        setImportOpen(false);
        setImportPreview(null);
      }
    } catch (e) {
      setImportWarnings([e instanceof Error ? e.message : "Error al importar"]);
    } finally {
      setImportando(false);
    }
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImportFileName(file.name);
    setImportError("");
    setImportWarnings([]);
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const buffer = ev.target?.result as ArrayBuffer;
        const preview = parseRouteOrderImport(buffer);
        setImportPreview(preview);
        setImportOpen(true);
      } catch {
        setImportError("No se pudo leer el archivo. Verifica que sea un Excel válido.");
      }
    };
    reader.onerror = () => setImportError("Error al leer el archivo.");
    reader.readAsArrayBuffer(file);
    e.target.value = "";
  };

  const handleExport = async () => {
    const toastId = toast.loading("Exportando datos...");
    try {
      const token = localStorage.getItem("auth_token");
      const base = import.meta.env.VITE_API_BASE ?? "";
      const res = await fetch(`${base}/api/v1/rutas/exportar`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error("Error al exportar");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "rutas_ordenes.xlsx";
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Exportación completada.", { id: toastId });
    } catch (e) {
      toast.error("Error al exportar.", { id: toastId });
    }
  };

  const filteredRoutes = useMemo(
    () => allRoutes.filter((r) => routeMatchesFilters(r, filters)),
    [filters, allRoutes],
  );

  const totalFiltered = filteredRoutes.length;
  const totalPages = Math.max(1, Math.ceil(totalFiltered / pageSize));
  const currentPage = Math.min(page, totalPages);

  const paginatedRoutes = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredRoutes.slice(start, start + pageSize);
  }, [filteredRoutes, currentPage, pageSize]);

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
            <Tooltip delayDuration={0}>
              <TooltipTrigger asChild>
                <Button size="sm" className="h-9 w-9 bg-primary shadow-glow hover:bg-primary-hover" onClick={downloadPlantillaRutasYOrdenes}>
                  <FileSpreadsheet className="size-4 shrink-0" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">Plantilla</TooltipContent>
            </Tooltip>
            <Tooltip delayDuration={0}>
              <TooltipTrigger asChild>
                <Button size="sm" className="h-9 w-9 bg-primary shadow-glow hover:bg-primary-hover" onClick={() => fileInputRef.current?.click()}>
                  <Upload className="size-4 shrink-0" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">Importar</TooltipContent>
            </Tooltip>
            <input ref={fileInputRef} type="file" accept=".xlsx,.xls" className="hidden" onChange={handleImportFile} />
            <Tooltip delayDuration={0}>
              <TooltipTrigger asChild>
                <Button size="sm" className="h-9 w-9 bg-primary shadow-glow hover:bg-primary-hover" onClick={handleExport}>
                  <Download className="size-4 shrink-0" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">Exportar</TooltipContent>
            </Tooltip>
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
      <div className="space-y-2 p-4 pt-1 sm:p-6 sm:pt-2 lg:p-8 lg:pt-2">
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
          vehicles={vehicleOptions}
          places={places}
          drivers={driverFilterOptions}
        />

        {filteredRoutes.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card/40 backdrop-blur-lg py-16 text-center">
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
                  onSelect={openDetail}
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
                  onSelect={openDetail}
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
                      onSelect={openDetail}
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
              pageSize={pageSize}
              onPageChange={setPage}
              label="rutas"
              onPageSizeChange={setPageSize}
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

      <Dialog open={importOpen} onOpenChange={(open) => { if (!open) { setImportOpen(false); setImportPreview(null); setExpandedOrders(new Set()); setImportWarnings([]); } }}>
        <DialogContent className="max-w-[min(96vw,64rem)] max-h-[90vh] flex flex-col overflow-hidden" aria-describedby={undefined}>
          <DialogHeader className="shrink-0">
            <DialogTitle>Vista previa de importación</DialogTitle>
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <span className="font-medium text-foreground">{importFileName}</span>
              {importPreview && (
                <>
                  <Badge variant="secondary" className="text-xs">{importPreview.rutasUnicas} ruta(s)</Badge>
                  <Badge variant="secondary" className="text-xs">{importPreview.ordenes} orden(es)</Badge>
                  <Badge variant="secondary" className="text-xs">{importPreview.total} fila(s)</Badge>
                </>
              )}
            </div>
          </DialogHeader>
          {importPreview && (
            <div className="overflow-auto flex-1 min-h-0 -mx-6 px-6 space-y-4 py-1">
              {groupedByRoute.map(([rutaCodigo, ruta]) => {
                const orders = groupedByOrder(ruta.rows);
                const rutaHasErrors = missing(rutaCodigo) || missing(ruta.placa) || missing(ruta.fechaInicio);
                return (
                  <div key={rutaCodigo} className={cn("rounded-xl border bg-card/60 backdrop-blur-sm overflow-hidden min-w-[600px]", rutaHasErrors && "border-destructive/40")}>
                    <div className="flex items-center gap-4 px-5 py-3 bg-muted/30 border-b border-border">
                      <div className="flex items-center gap-2.5">
                        <div className={cn("flex h-9 w-9 items-center justify-center rounded-lg", rutaHasErrors ? "bg-destructive/10 text-destructive" : "bg-primary/10 text-primary")}>
                          <Route className="size-4" />
                        </div>
                        <div>
                          <p className={cn("font-semibold text-sm", missing(rutaCodigo) && "text-destructive")}>{rutaCodigo || "Sin código"}</p>
                          <p className="text-xs text-muted-foreground">{ruta.nombre || "—"}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 ml-auto text-xs">
                        <Truck className="size-3 text-muted-foreground shrink-0" />
                        <span className={cn("font-medium", missing(ruta.placa) && "text-destructive")}>{ruta.placa || "—"}</span>
                        <Calendar className="size-3 text-muted-foreground shrink-0" />
                        <span className={cn("font-medium", missing(ruta.fechaInicio) && "text-destructive")}>
                          {ruta.fechaInicio && ruta.fechaFin ? `${ruta.fechaInicio} → ${ruta.fechaFin}` : "—"}
                        </span>
                        <Badge variant="secondary" className="text-[10px]">{orders.length} órdenes</Badge>
                      </div>
                    </div>
                    <div className="divide-y divide-border/50">
                      {orders.map(([orderNum, orderRows]) => {
                        const first = orderRows[0];
                        const hasProducts = orderRows.some((r) => r.productoCodigo || r.productoNombre);
                        const hasCustomFields = first.director || first.telefonoDirector || first.paquetes || first.actaEntrega || first.guiaRemision || first.guiaTransportista || first.correoElectronico || first.contactoEmail || first.modoEntrega || first.fechaEntrega;
                        const hasExtra = hasProducts || hasCustomFields;
                        const isExpanded = expandedOrders.has(orderNum);
                        const orderHasErrors = missing(first.numeroOrden) || missing(first.contactoNombre) || missing(first.contactoTelefono) || missing(first.direccion);
                        const productos = orderRows.filter((r) => r.productoCodigo || r.productoNombre);

                        return (
                          <div key={orderNum} className={cn(orderHasErrors && "bg-destructive/5")}>
                            <div
                              className="flex items-center gap-3 px-5 py-3 cursor-pointer hover:bg-muted/30 transition-colors"
                              onClick={() => toggleOrder(orderNum)}
                            >
                              {hasExtra ? (
                                isExpanded ? <ChevronDown className="size-4 text-muted-foreground shrink-0" /> : <ChevronRight className="size-4 text-muted-foreground shrink-0" />
                              ) : <span className="w-4 shrink-0" />}
                              <div className="flex-1 min-w-0 grid grid-cols-[1fr_auto_2fr_1.5fr_2fr] gap-3 items-center">
                                <div>
                                  <p className={cn("font-medium text-sm truncate", missing(first.numeroOrden) && "text-destructive")}>{first.numeroOrden || "—"}</p>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <Badge variant="outline" className="text-[10px] font-normal">{first.estadoOrden || "—"}</Badge>
                                  {first.subestado && <span className="text-[10px] text-muted-foreground">{first.subestado}</span>}
                                </div>
                                <div className={cn("flex items-center gap-1.5 text-sm min-w-0", missing(first.contactoNombre) && "text-destructive")}>
                                  <User className="size-3 shrink-0" />
                                  <span className="truncate">{first.contactoNombre || "—"}</span>
                                </div>
                                <div className={cn("flex items-center gap-1.5 text-xs text-muted-foreground", missing(first.contactoTelefono) && "text-destructive")}>
                                  <Phone className="size-3 shrink-0" />
                                  <span>{first.contactoTelefono || "—"}</span>
                                </div>
                                <div className={cn("flex items-center gap-1.5 text-xs text-muted-foreground min-w-0", missing(first.direccion) && "text-destructive")}>
                                  <MapPin className="size-3 shrink-0" />
                                  <span className="truncate">{first.direccion || "—"}</span>
                                </div>
                              </div>
                            </div>
                            {isExpanded && hasExtra && (
                              <div className="px-5 pb-4 pl-12 space-y-4 bg-muted/15 border-t border-border/50">
                                {hasCustomFields && (
                                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-2 text-xs pt-3">
                                    <span className="flex items-center gap-1.5"><User className="size-3 text-primary/70 shrink-0" /><span className="font-medium">Director:</span> <span className="text-muted-foreground">{first.director || "—"}</span></span>
                                    <span className="flex items-center gap-1.5"><Phone className="size-3 text-primary/70 shrink-0" /><span className="font-medium">Tel. Director:</span> <span className="text-muted-foreground">{first.telefonoDirector || "—"}</span></span>
                                    <span className="flex items-center gap-1.5"><Mail className="size-3 text-primary/70 shrink-0" /><span className="font-medium">Correo Director:</span> <span className="text-muted-foreground">{first.correoElectronico || "—"}</span></span>
                                    <span className="flex items-center gap-1.5"><Package className="size-3 text-primary/70 shrink-0" /><span className="font-medium">Paquetes:</span> <span className="text-muted-foreground">{first.paquetes || "—"}</span></span>
                                    <span className="flex items-center gap-1.5"><FileText className="size-3 text-primary/70 shrink-0" /><span className="font-medium">Acta:</span> <span className="text-muted-foreground">{first.actaEntrega || "—"}</span></span>
                                    <span className="flex items-center gap-1.5"><FileText className="size-3 text-primary/70 shrink-0" /><span className="font-medium">Guía Remisión:</span> <span className="text-muted-foreground">{first.guiaRemision || "—"}</span></span>
                                    <span className="flex items-center gap-1.5"><FileText className="size-3 text-primary/70 shrink-0" /><span className="font-medium">Guía Transportista:</span> <span className="text-muted-foreground">{first.guiaTransportista || "—"}</span></span>
                                    <span className="flex items-center gap-1.5"><Mail className="size-3 text-primary/70 shrink-0" /><span className="font-medium">Correo Contacto:</span> <span className="text-muted-foreground">{first.contactoEmail || "—"}</span></span>
                                    <span className="flex items-center gap-1.5"><Truck className="size-3 text-primary/70 shrink-0" /><span className="font-medium">Modo:</span> <span className="text-muted-foreground">{first.modoEntrega || "—"}</span></span>
                                    <span className="flex items-center gap-1.5"><Calendar className="size-3 text-primary/70 shrink-0" /><span className="font-medium">F. entrega:</span> <span className="text-muted-foreground">{first.fechaEntrega || "—"}</span></span>
                                  </div>
                                )}
                                {hasProducts && (
                                  <div className="space-y-2">
                                    <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                                      <Package className="size-3" /> Productos ({productos.length})
                                    </div>
                                    <div className="space-y-1.5">
                                      {productos.map((p, pi) => (
                                        <div key={pi} className="flex items-center gap-3 text-xs bg-muted/30 rounded-lg px-3 py-2">
                                          <span className="font-medium text-xs tabular-nums text-primary">{p.productoCodigo || "—"}</span>
                                          <span className="flex-1 truncate">{p.productoNombre || "—"}</span>
                                          {p.productoCantidad && <span className="tabular-nums bg-muted px-1.5 py-0.5 rounded font-medium">x{p.productoCantidad}</span>}
                                          {p.productoPrecioUnit && <span className="tabular-nums font-medium">S/ {p.productoPrecioUnit}</span>}
                                          {p.productoPesoKg && <span className="text-muted-foreground text-[11px]">{p.productoPesoKg}kg</span>}
                                          {p.productoCampoExtra && <span className="text-muted-foreground text-[11px] italic">{p.productoCampoExtra}</span>}
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          {importWarnings.length > 0 && (
            <div className="space-y-1.5 shrink-0">
              {importWarnings.map((w, i) => (
                <div key={i} className="flex items-start gap-2 text-xs bg-destructive/10 text-destructive rounded-lg px-3 py-2">
                  <AlertTriangle className="size-3.5 mt-0.5 shrink-0" />
                  <span>{w}</span>
                </div>
              ))}
            </div>
          )}
          <div className="flex items-center justify-between pt-4 border-t border-border shrink-0">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <AlertTriangle className="size-3.5 text-destructive" />
              Campos en <span className="text-destructive font-medium">rojo</span> están incompletos
            </div>
            <div className="flex gap-3">
                <Button variant="outline" size="sm" onClick={() => { setImportOpen(false); setImportPreview(null); setExpandedOrders(new Set()); setImportWarnings([]); }}>
                  Cancelar
                </Button>
              <Button size="sm" className="bg-primary gap-2" disabled={hasAnyError || importando} onClick={handleImport}>
                {importando ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Importando...
                  </>
                ) : (
                  "Importar"
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!importError} onOpenChange={() => setImportError("")}>
        <DialogContent className="max-w-sm text-center" aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle className="text-destructive">Error al leer archivo</DialogTitle>
            <p className="text-sm text-muted-foreground">{importError}</p>
          </DialogHeader>
          <Button variant="outline" size="sm" onClick={() => setImportError("")} className="w-full">Cerrar</Button>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Rutas;
