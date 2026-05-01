import { useEffect, useMemo, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Package,
  Plus,
  ShoppingBag,
  Truck,
  CheckCircle2,
  Clock,
} from "lucide-react";
import PageHeader from "@/components/PageHeader";
import StatCard from "@/components/StatCard";
import OrderFilters, {
  defaultOrderFilters,
  OrderFiltersState,
} from "@/components/orders/OrderFilters";
import OrderTable from "@/components/orders/OrderTable";
import NewOrderDialog from "@/components/orders/NewOrderDialog";
import { Button } from "@/components/ui/button";
import type { Order } from "@/domain/orders";
import { useOrdersQuery, useRoutesQuery } from "@/hooks/useOperationsQueries";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 8;

function orderMatches(o: Order, f: OrderFiltersState): boolean {
  if (f.orderCode !== "all" && o.id !== f.orderCode) return false;
  if (f.status !== "all" && o.status !== f.status) return false;
  if (f.substatus !== "all" && o.substatus !== f.substatus) return false;
  if (f.vehiclePlate !== "all" && o.vehiclePlate !== f.vehiclePlate) return false;
  if (f.lastDispatchOnly && !o.isLastDispatch) return false;

  const iso = f.dateFilterType === "route" ? o.routeDateIso : o.createdAtIso;
  if (f.dateFrom && iso < f.dateFrom) return false;
  if (f.dateTo && iso > f.dateTo) return false;

  if (f.contactName.trim()) {
    const q = f.contactName.toLowerCase().trim();
    const hit =
      o.contactName.toLowerCase().includes(q) || o.clientName.toLowerCase().includes(q);
    if (!hit) return false;
  }

  if (f.contactIdentifier !== "all") {
    const c = o.contactIdentifier.toLowerCase();
    if (f.contactIdentifier === "dni" && !c.includes("dni")) return false;
    if (f.contactIdentifier === "ruc" && !c.includes("ruc")) return false;
    if (f.contactIdentifier === "tel" && !(c.includes("tel") || c.includes("+51"))) return false;
  }

  return true;
}

function paginationItems(current: number, total: number): (number | "ellipsis")[] {
  if (total <= 9) return Array.from({ length: total }, (_, i) => i + 1);
  const set = new Set<number>([1, total, current, current - 1, current + 1]);
  const sorted = [...set].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b);
  const out: (number | "ellipsis")[] = [];
  for (let i = 0; i < sorted.length; i++) {
    if (i > 0 && sorted[i] - sorted[i - 1] > 1) out.push("ellipsis");
    out.push(sorted[i]);
  }
  return out;
}

const Ordenes = () => {
  const { data: allOrders = [], isLoading, isError, error } = useOrdersQuery();
  const { data: routeCatalog = [] } = useRoutesQuery();

  const orderSubstatusOptions = useMemo(
    () => Array.from(new Set(allOrders.map((o) => o.substatus))).sort(),
    [allOrders],
  );
  const vehiclePlatesInOrders = useMemo(
    () => Array.from(new Set(allOrders.map((o) => o.vehiclePlate).filter((p) => p !== "—"))).sort(),
    [allOrders],
  );

  const [filters, setFilters] = useState<OrderFiltersState>(defaultOrderFilters);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set());
  const [page, setPage] = useState(1);
  const [createOrderOpen, setCreateOrderOpen] = useState(false);

  const orderRouteOptions = useMemo(
    () =>
      routeCatalog.map((r) => ({
        id: r.id,
        label: `${r.id} — ${r.name}`,
      })),
    [routeCatalog],
  );

  useEffect(() => {
    setSelectedIds(new Set());
  }, [filters]);

  const filtered = useMemo(
    () => allOrders.filter((o) => orderMatches(o, filters)),
    [filters, allOrders],
  );

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

  useEffect(() => {
    setPage((p) => Math.min(p, totalPages));
  }, [totalPages]);

  const stats = useMemo(() => {
    const total = allOrders.length;
    const inRoute = allOrders.filter((o) => o.status === "in_route").length;
    const pending = allOrders.filter((o) => o.status === "pending").length;
    const delivered = allOrders.filter((o) => o.status === "delivered").length;
    return { total, inRoute, pending, delivered };
  }, [allOrders]);

  const orderIds = useMemo(() => allOrders.map((o) => o.id), [allOrders]);

  const handleApplyFilters = () => {
    toast.success(`${filtered.length} orden${filtered.length !== 1 ? "es" : ""} encontrada${filtered.length !== 1 ? "s" : ""}.`);
  };

  const handleResetFilters = () => {
    setFilters(defaultOrderFilters);
    toast.message("Filtros restablecidos.");
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
            className="h-9 gap-2 bg-primary shadow-glow hover:bg-primary-hover"
            onClick={() => setCreateOrderOpen(true)}
          >
            <Plus className="size-4 shrink-0" />
            <span className="hidden sm:inline">Nueva orden</span>
          </Button>
        }
      />

      <div className="space-y-5 p-4 sm:p-6 lg:p-8">
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          <StatCard label="Total órdenes" value={stats.total} icon={ShoppingBag} tone="primary" />
          <StatCard label="En ruta" value={stats.inRoute} icon={Truck} tone="info" />
          <StatCard label="Pendientes" value={stats.pending} icon={Clock} tone="warning" />
          <StatCard label="Entregadas" value={stats.delivered} icon={CheckCircle2} tone="success" />
        </div>

        <OrderFilters
          filters={filters}
          onChange={setFilters}
          onReset={handleResetFilters}
          onApply={handleApplyFilters}
          orderIds={orderIds}
          substatusOptions={orderSubstatusOptions}
          vehiclePlates={vehiclePlatesInOrders}
        />

        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card px-6 py-16 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-info-soft text-info">
              <Package className="h-7 w-7" />
            </div>
            <p className="mt-4 text-base font-semibold text-foreground">
              No hay órdenes con estos filtros
            </p>
            <p className="mt-1 max-w-sm text-sm text-muted-foreground">
              Ajusta los criterios o restablece los filtros para ver el listado completo.
            </p>
            <Button variant="outline" className="mt-6" onClick={handleResetFilters}>
              Limpiar filtros
            </Button>
          </div>
        ) : (
          <>
            <OrderTable
              orders={paginated}
              selectedIds={selectedIds}
              onSelectionChange={setSelectedIds}
              onView={(o) => toast.message(`Detalle de ${o.id} (demo).`)}
            />

            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-muted-foreground">
                Mostrando{" "}
                <span className="font-semibold text-foreground">
                  {(currentPage - 1) * PAGE_SIZE + 1}
                </span>
                –
                <span className="font-semibold text-foreground">
                  {Math.min(currentPage * PAGE_SIZE, totalFiltered)}
                </span>{" "}
                de <span className="font-semibold text-foreground">{totalFiltered}</span> órdenes
              </p>

              <nav
                className="flex flex-wrap items-center justify-end gap-2"
                aria-label="Paginación de órdenes"
              >
                <button
                  type="button"
                  disabled={currentPage <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  aria-label="Página anterior"
                  className={cn(
                    "flex size-9 shrink-0 items-center justify-center rounded-full border-2 bg-white transition-colors",
                    currentPage <= 1
                      ? "cursor-not-allowed border-primary/25 text-primary/35"
                      : "border-primary text-primary hover:bg-primary-soft",
                  )}
                >
                  <ChevronLeft className="size-4" strokeWidth={2.25} />
                </button>

                {paginationItems(currentPage, totalPages).map((item, idx) =>
                  item === "ellipsis" ? (
                    <span
                      key={`e-${idx}`}
                      className="flex size-9 shrink-0 items-center justify-center text-sm font-medium text-muted-foreground"
                      aria-hidden
                    >
                      …
                    </span>
                  ) : (
                    <button
                      key={item}
                      type="button"
                      onClick={() => setPage(item)}
                      aria-label={`Ir a página ${item}`}
                      aria-current={currentPage === item ? "page" : undefined}
                      className={cn(
                        "flex size-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold transition-colors",
                        currentPage === item
                          ? "bg-primary text-primary-foreground shadow-sm"
                          : "border-2 border-primary bg-white text-foreground hover:bg-primary-soft",
                      )}
                    >
                      {item}
                    </button>
                  ),
                )}

                <button
                  type="button"
                  disabled={currentPage >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  aria-label="Página siguiente"
                  className={cn(
                    "flex size-9 shrink-0 items-center justify-center rounded-full border-2 bg-white transition-colors",
                    currentPage >= totalPages
                      ? "cursor-not-allowed border-primary/25 text-primary/35"
                      : "border-primary text-primary hover:bg-primary-soft",
                  )}
                >
                  <ChevronRight className="size-4" strokeWidth={2.25} />
                </button>
              </nav>
            </div>
          </>
        )}
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
