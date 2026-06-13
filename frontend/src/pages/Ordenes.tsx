import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  CheckCircle2,
  Clock,
  Columns3,
  Download,
  Filter,
  Flag,
  MoreVertical,
  Package,
  Plus,
  Search,
  ShoppingBag,
  Trash2,
  Truck,
  Upload,
} from "lucide-react";
import PageHeader from "@/components/PageHeader";
import StatsBar from "@/components/StatsBar";
import StatusTabs from "@/components/routes/StatusTabs";
import type { StatusTab } from "@/components/routes/StatusTabs";
import OrderTable from "@/components/orders/OrderTable";
import NewOrderDialog from "@/components/orders/NewOrderDialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
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
import { cn } from "@/lib/utils";
import type { Order } from "@/domain/orders";
import { DateFilter } from "@/components/routes/RouteFiltersBar";
import { useOrdersQuery, useRoutesQuery, useEstadosHijosPorClaveQuery } from "@/hooks/useOperationsQueries";
import { toast } from "sonner";
import RoutesPaginationBar from "@/components/routes/RoutesPaginationBar";
import { persistOrderDraft, type OrderCreationDraft, type OrderCompletarLocationState } from "@/lib/orderCreationDraft";

function orderMatches(o: Order, f: typeof defaultFilters): boolean {
  if (f.status !== "all" && o.status !== f.status) return false;
  if (f.vehiclePlate !== "all" && o.vehiclePlate !== f.vehiclePlate) return false;
  if (f.substatus !== "all" && o.substatus !== f.substatus) return false;

  const iso = f.dateFilterType === "route" ? o.routeDateIso : o.createdAtIso;
  if (f.dateFrom && iso < f.dateFrom) return false;
  if (f.dateTo && iso > f.dateTo) return false;

  if (f.search.trim()) {
    const q = f.search.toLowerCase().trim();
    const hit = o.clientName.toLowerCase().includes(q) || o.id.toLowerCase().includes(q) || o.contactName.toLowerCase().includes(q);
    if (!hit) return false;
  }

  return true;
}

const defaultFilters = {
  search: "",
  dateFilterType: "route" as "route" | "created",
  dateFrom: "",
  dateTo: "",
  status: "all",
  vehiclePlate: "all",
  substatus: "all",
};

const Ordenes = () => {
  const [pageSize, setPageSize] = useState(10);
  const navigate = useNavigate();
  const { data: allOrders = [], isLoading, isError, error } = useOrdersQuery();
  const { data: routeCatalog = [] } = useRoutesQuery();
  const { data: pendingSubs = [] } = useEstadosHijosPorClaveQuery("Pendiente");
  const { data: inRouteSubs = [] } = useEstadosHijosPorClaveQuery("En ruta");
  const { data: entregadoSubs = [] } = useEstadosHijosPorClaveQuery("Entregado");
  const { data: noEntregadoSubs = [] } = useEstadosHijosPorClaveQuery("No entregado");

  const [filters, setFilters] = useState(defaultFilters);
  const [activeTab, setActiveTab] = useState("all");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [page, setPage] = useState(1);
  const [createOrderOpen, setCreateOrderOpen] = useState(false);

  const ORDER_COLUMNS = [
    { key: "orden", label: "Orden" },
    { key: "estado", label: "Estado" },
    { key: "subestado", label: "Subestado" },
    { key: "vehiculo", label: "Vehículo" },
    { key: "cliente", label: "Cliente" },
    { key: "contacto", label: "Contacto" },
    { key: "fecha", label: "Fecha ruta" },
  ] as const;

  type OrderColumnKey = (typeof ORDER_COLUMNS)[number]["key"];

  const [visibleColumns, setVisibleColumns] = useState<OrderColumnKey[]>(
    ORDER_COLUMNS.map((c) => c.key),
  );

  const orderRouteOptions = useMemo(
    () =>
      routeCatalog.map((r) => ({
        id: r.id,
        label: `${r.code} — ${r.name}`,
      })),
    [routeCatalog],
  );

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const o of allOrders) {
      counts[o.status] = (counts[o.status] || 0) + 1;
    }
    return counts;
  }, [allOrders]);

  const statusTabs: StatusTab[] = useMemo(() => [
    { status: "all", label: "Todas", count: allOrders.length, variant: "all" },
    { status: "pending", label: "Pendientes", count: statusCounts.pending || 0, variant: "warning" },
    { status: "in_route", label: "En ruta", count: statusCounts.in_route || 0, variant: "success" },
    { status: "entregado", label: "Entregadas", count: statusCounts.entregado || 0, variant: "success" },
    { status: "no_entregado", label: "No entregadas", count: statusCounts.no_entregado || 0, variant: "danger" },
  ], [allOrders, statusCounts]);

  const vehiclePlatesInOrders = useMemo(
    () => Array.from(new Set(allOrders.map((o) => o.vehiclePlate).filter((p) => p !== "—"))).sort(),
    [allOrders],
  );

  const substatusOptions = useMemo(() => {
    const all = [
      ...pendingSubs.map((s: { nombre: string }) => s.nombre),
      ...inRouteSubs.map((s: { nombre: string }) => s.nombre),
      ...entregadoSubs.map((s: { nombre: string }) => s.nombre),
      ...noEntregadoSubs.map((s: { nombre: string }) => s.nombre),
    ];
    return [...new Set(all)];
  }, [pendingSubs, inRouteSubs, entregadoSubs, noEntregadoSubs]);

  const toggleColumn = (key: OrderColumnKey) => {
    if (visibleColumns.includes(key)) {
      setVisibleColumns(visibleColumns.filter((c) => c !== key));
    } else {
      setVisibleColumns([...visibleColumns, key]);
    }
  };

  const filteredByStatus = useMemo(
    () => activeTab === "all" ? allOrders : allOrders.filter((o) => o.status === activeTab),
    [allOrders, activeTab],
  );

  const filtered = useMemo(
    () => filteredByStatus.filter((o) => orderMatches(o, filters)),
    [filteredByStatus, filters],
  );

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

  const stats = useMemo(() => {
    const total = allOrders.length;
    const inRoute = allOrders.filter((o) => o.status === "in_route").length;
    const pending = allOrders.filter((o) => o.status === "pending").length;
    const delivered = allOrders.filter((o) => o.status === "entregado").length;
    return { total, inRoute, pending, delivered };
  }, [allOrders]);

  const handleEdit = (order: Order) => {
    const ruta = order.routeId ? routeCatalog.find((r) => r.id === order.routeId) : undefined;
    const draft: OrderCreationDraft = {
      displayOrderId: order.id,
      routeId: order.routeId ?? "",
      routeLabel: ruta ? `${ruta.code} — ${ruta.name}` : null,
      autoCode: order.id.startsWith("ORD-AUTO-"),
    };
    persistOrderDraft(draft);
    const state: OrderCompletarLocationState = { orderDraft: draft };
    navigate("/ordenes/completar", { state });
  };

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center p-12 text-sm text-muted-foreground">
        Cargando órdenes…
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-2 p-12 text-center">
        <p className="text-sm font-medium text-destructive">No se pudieron cargar las órdenes</p>
        <p className="text-xs text-muted-foreground">{error instanceof Error ? error.message : "Error"}</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Órdenes"
        subtitle="Gestiona órdenes de entrega, estado operativo y despachos."
        actions={
          <Button
            size="sm"
            type="button"
            className="h-12 gap-1.5 text-base font-normal bg-primary hover:bg-primary text-white px-6 shadow-md transition-all hover:scale-105 active:scale-95"
            onClick={() => setCreateOrderOpen(true)}
          >
            <Plus className="size-5 shrink-0" />
            Nuevo
          </Button>
        }
      />
      <div className="space-y-10 p-4 pb-2 pt-1 sm:p-6 sm:pb-3 sm:pt-2 lg:p-8 lg:pb-4 lg:pt-2">
        <StatsBar
          items={[
            { label: "Total órdenes", value: stats.total, subtext: `${stats.total} orden${stats.total !== 1 ? "es" : ""}`, icon: ShoppingBag, tone: "primary" },
            { label: "En ruta", value: stats.inRoute, subtext: `${stats.inRoute} en curso`, icon: Truck, tone: "info" },
            { label: "Pendientes", value: stats.pending, subtext: `${stats.pending} pendiente${stats.pending !== 1 ? "s" : ""}`, icon: Clock, tone: "warning" },
            { label: "Entregadas", value: stats.delivered, subtext: `${stats.delivered} entregada${stats.delivered !== 1 ? "s" : ""}`, icon: CheckCircle2, tone: "success" },
          ]}
        />

        <div className="rounded-[14px] border border-border/40 bg-white/30 shadow-md overflow-hidden">
          <StatusTabs
            tabs={statusTabs}
            activeStatus={activeTab}
            onChange={setActiveTab}
          />

          <div className="bg-white/30">
            <div className="flex items-center gap-4 px-5 py-5">
              <div className="relative flex-1 max-w-[380px]">
                <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-[#8a9aab]" />
                <Input
                  placeholder="Buscar orden, cliente o contacto..."
                  value={filters.search}
                  onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
                  className="h-14 rounded-lg border border-[#e1e7ee] bg-white/60 pl-10 text-[15px] text-[#1f2933] placeholder:text-[#8a9aab] transition-colors hover:border-primary focus-visible:ring-1"
                />
              </div>

              <div className="relative group">
                <span className={cn(
                  "absolute left-3 z-10 transition-all pointer-events-none bg-white px-1.5",
                  filters.vehiclePlate !== "all"
                    ? "-top-1.5 text-[11px] text-primary"
                    : "top-1/2 -translate-y-1/2 text-sm text-[#8a9aab] group-has-[[data-state=open]]:-top-1.5 group-has-[[data-state=open]]:text-[11px] group-has-[[data-state=open]]:text-primary",
                )}>
                  Vehículo
                </span>
                <Select
                  value={filters.vehiclePlate}
                  onValueChange={(v) => setFilters((prev) => ({ ...prev, vehiclePlate: v }))}
                >
                  <SelectTrigger className={cn(
                    "h-14 w-[160px] rounded-lg border bg-white/60 px-3.5 text-[15px] text-[#8a9aab] focus:ring-0 focus:ring-offset-0 data-[state=open]:border-primary transition-colors hover:border-primary [&_svg]:text-[#52677a] [&_svg]:opacity-100",
                    filters.vehiclePlate !== "all" ? "pt-4 border-primary" : "border-[#e1e7ee]",
                  )}>
                    {filters.vehiclePlate !== "all" ? (
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
                    {vehiclePlatesInOrders.map((p) => (
                      <SelectItem key={p} value={p}>
                        {p}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="relative group">
                <span className={cn(
                  "absolute left-3 z-10 transition-all pointer-events-none bg-white px-1.5",
                  filters.substatus !== "all"
                    ? "-top-1.5 text-[11px] text-primary"
                    : "top-1/2 -translate-y-1/2 text-sm text-[#8a9aab] group-has-[[data-state=open]]:-top-1.5 group-has-[[data-state=open]]:text-[11px] group-has-[[data-state=open]]:text-primary",
                )}>
                  Subestado
                </span>
                <Select
                  value={filters.substatus}
                  onValueChange={(v) => setFilters((prev) => ({ ...prev, substatus: v }))}
                >
                  <SelectTrigger className={cn(
                    "h-14 w-[180px] rounded-lg border bg-white/60 px-3.5 text-[15px] text-[#8a9aab] focus:ring-0 focus:ring-offset-0 data-[state=open]:border-primary transition-colors hover:border-primary [&_svg]:text-[#52677a] [&_svg]:opacity-100",
                    filters.substatus !== "all" ? "pt-4 border-primary" : "border-[#e1e7ee]",
                  )}>
                    {filters.substatus !== "all" ? (
                      <div className="flex items-center gap-2">
                        <Flag className="size-4 shrink-0" strokeWidth={1.75} />
                        <SelectValue />
                      </div>
                    ) : (
                      <span />
                    )}
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    {substatusOptions.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedIds.size > 0 && (
                <Button
                  variant="ghost"
                  className="ml-auto h-14 gap-2 px-3 text-[15px] text-red-600 hover:text-red-700 hover:bg-red-50"
                  onClick={() => toast.error("Función de eliminación no disponible aún.")}
                >
                  <Trash2 className="size-4" />
                  Eliminar ({selectedIds.size})
                </Button>
              )}

              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="ghost" className={cn("h-14 gap-2 px-3 text-[15px] text-black hover:text-[#1f2933]", selectedIds.size === 0 && "ml-auto")}>
                    <Columns3 className="size-4" />
                    Columnas
                  </Button>
                </PopoverTrigger>
                <PopoverContent align="end" className="w-48 p-3">
                  <div className="space-y-2">
                    {ORDER_COLUMNS.map((col) => (
                      <label
                        key={col.key}
                        className="flex items-center gap-2 cursor-pointer text-sm text-[#1f2933] hover:text-primary transition-colors"
                      >
                        <Checkbox
                          checked={visibleColumns.includes(col.key)}
                          onCheckedChange={() => toggleColumn(col.key)}
                          className="h-4 w-4 border-2 border-gray-400 data-[state=checked]:bg-primary data-[state=checked]:border-primary rounded mt-px"
                        />
                        {col.label}
                      </label>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>

              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="ghost" className="h-14 gap-2 px-3 text-[15px] text-black hover:text-[#1f2933]">
                    <Filter className="size-4" />
                    Filtros
                  </Button>
                </PopoverTrigger>
                <PopoverContent align="end" className="w-[600px] p-4">
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-medium text-[#1f2933] whitespace-nowrap">Fecha de ruta:</span>
                    <DateFilter
                      label="Fecha inicio"
                      value={filters.dateFrom}
                      onChange={(val) => setFilters((prev) => ({ ...prev, dateFrom: val }))}
                      noAutoFocus
                    />
                    <DateFilter
                      label="Fecha fin"
                      value={filters.dateTo}
                      onChange={(val) => setFilters((prev) => ({ ...prev, dateTo: val }))}
                      noAutoFocus
                    />
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

            {(filters.search || filters.dateFrom || filters.dateTo || filters.vehiclePlate !== "all" || filters.substatus !== "all") && (
              <div className="px-5 pb-3 flex flex-col gap-2">
                <span className="text-sm font-semibold text-[#1f2933]">{totalFiltered} resultado{totalFiltered !== 1 ? "s" : ""}</span>
                <div className="flex items-center gap-2 flex-wrap">
                  {filters.dateFrom && (
                    <span className="inline-flex items-center gap-1.5 rounded-md bg-[#eef1f5] px-2.5 py-1 text-xs font-medium text-[#52677a]">
                      Fechas: {filters.dateFrom} — {filters.dateTo || "..."}
                      <button onClick={() => setFilters((prev) => ({ ...prev, dateFrom: "", dateTo: "" }))} className="ml-0.5 text-[#8a9aab] hover:text-[#1f2933]">✕</button>
                    </span>
                  )}
                  {filters.vehiclePlate !== "all" && (
                    <span className="inline-flex items-center gap-1.5 rounded-md bg-[#eef1f5] px-2.5 py-1 text-xs font-medium text-[#52677a]">
                      Vehículo: {filters.vehiclePlate}
                      <button onClick={() => setFilters((prev) => ({ ...prev, vehiclePlate: "all" }))} className="ml-0.5 text-[#8a9aab] hover:text-[#1f2933]">✕</button>
                    </span>
                  )}
                  {filters.search && (
                    <span className="inline-flex items-center gap-1.5 rounded-md bg-[#eef1f5] px-2.5 py-1 text-xs font-medium text-[#52677a]">
                      Búsqueda: {filters.search}
                      <button onClick={() => setFilters((prev) => ({ ...prev, search: "" }))} className="ml-0.5 text-[#8a9aab] hover:text-[#1f2933]">✕</button>
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>

          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                <Package className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="mt-4 text-base font-semibold text-foreground">No se encontraron órdenes</p>
              <p className="mt-1 text-sm text-muted-foreground">Ajusta los filtros o crea una nueva orden.</p>
            </div>
          ) : (
            <>
              <OrderTable
                orders={paginated}
                selectedIds={selectedIds}
                onSelectionChange={setSelectedIds}
                onView={(o) => navigate(`/ordenes/detalle/${encodeURIComponent(o.id)}`)}
                onEdit={handleEdit}
                visibleColumns={visibleColumns}
              />
              <RoutesPaginationBar
                currentPage={currentPage}
                totalPages={totalPages}
                totalFiltered={totalFiltered}
                pageSize={pageSize}
                onPageChange={setPage}
                label="órdenes"
                onPageSizeChange={setPageSize}
              />
            </>
          )}
        </div>
      </div>

      <NewOrderDialog
        open={createOrderOpen}
        onOpenChange={setCreateOrderOpen}
        routeOptions={orderRouteOptions}
      />
    </div>
  );
};

export default Ordenes;
