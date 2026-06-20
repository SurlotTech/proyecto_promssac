import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
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
import { useOrdersQuery } from "@/hooks/useOperationsQueries";
import { toast } from "sonner";
import RoutesPaginationBar from "@/components/routes/RoutesPaginationBar";
import { persistOrderDraft, type OrderCreationDraft, type OrderCompletarLocationState } from "@/lib/orderCreationDraft";

function orderMatches(o: Order, f: OrderFiltersState): boolean {
  if (f.status !== "all" && o.status !== f.status) return false;
  if (f.substatus !== "all" && o.substatus !== f.substatus) return false;
  if (f.vehiclePlate !== "all" && o.vehiclePlate !== f.vehiclePlate) return false;
  if (f.lastDispatchOnly && !o.isLastDispatch) return false;

  const iso = f.dateFilterType === "route" ? (o as any).startDate : o.createdAtIso;
  if (f.dateFrom && iso < f.dateFrom) return false;
  if (f.dateTo && iso > f.dateTo) return false;

  if (f.contactName.trim()) {
    const q = f.contactName.toLowerCase().trim();
    const hit = o.clientName.toLowerCase().includes(q);
    if (!hit) return false;
  }

  return true;
}

const Ordenes = () => {
  const [pageSize, setPageSize] = useState(10);
  const navigate = useNavigate();
  const { data: allOrders = [], isLoading, isError, error } = useOrdersQuery();

  const [filters, setFilters] = useState<OrderFiltersState>(defaultOrderFilters);

  const orderSubstatusOptions = useMemo(
    () => {
      const subs = new Set<string>();
      for (const o of allOrders) {
        if (o.substatus) subs.add(o.substatus);
      }
      return Array.from(subs).sort();
    },
    [allOrders],
  );

  useEffect(() => {
    if (filters.substatus !== "all" && !orderSubstatusOptions.includes(filters.substatus)) {
      setFilters((prev) => ({ ...prev, substatus: "all" }));
    }
  }, [filters.status, orderSubstatusOptions, filters.substatus]);
  const vehiclePlatesInOrders = useMemo(
    () => Array.from(new Set(allOrders.map((o) => o.vehiclePlate).filter((p) => p !== "—"))).sort(),
    [allOrders],
  );

  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set());
  const [page, setPage] = useState(1);
  const [createOrderOpen, setCreateOrderOpen] = useState(false);

  const orderRouteOptions = useMemo(
    () => {
      const seen = new Set<string>();
      const result: { id: string; label: string }[] = [];
      for (const o of allOrders) {
        if (o.routeId && !seen.has(o.routeId)) {
          seen.add(o.routeId);
          const label = (o as any).routeCode && (o as any).routeName
            ? `${(o as any).routeCode} — ${(o as any).routeName}`
            : o.routeId;
          result.push({ id: o.routeId, label });
        }
      }
      return result;
    },
    [allOrders],
  );

  useEffect(() => {
    setSelectedIds(new Set());
  }, [filters]);

  const filtered = useMemo(
    () => allOrders.filter((o) => orderMatches(o, filters)),
    [filters, allOrders],
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
  }, [filters]);

  const stats = useMemo(() => {
    const total = allOrders.length;
    const inRoute = allOrders.filter((o) => o.status === "in_route").length;
    const pending = allOrders.filter((o) => o.status === "pending").length;
    const delivered = allOrders.filter((o) => o.status === "entregado").length;
    return { total, inRoute, pending, delivered };
  }, [allOrders]);

  const handleApplyFilters = () => {
    toast.success(`${filtered.length} orden${filtered.length !== 1 ? "es" : ""} encontrada${filtered.length !== 1 ? "s" : ""}.`);
  };

  const handleResetFilters = () => {
    setFilters(defaultOrderFilters);
    toast.message("Filtros restablecidos.");
  };

  const handleEdit = (order: Order) => {
    const routeLabel = ((order as any).routeCode && (order as any).routeName)
      ? `${(order as any).routeCode} — ${(order as any).routeName}`
      : null;
    const draft: OrderCreationDraft = {
      displayOrderId: order.id,
      routeId: order.routeId ?? "",
      routeLabel,
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
          <>
            <Button
              size="sm"
              type="button"
              className="h-9 gap-2 bg-primary shadow-glow hover:bg-primary-hover"
              onClick={() => setCreateOrderOpen(true)}
            >
              <Plus className="size-4 shrink-0" />
              <span className="hidden sm:inline">Nueva orden</span>
            </Button>
          </>
        }
      />

      <div className="space-y-2 p-4 pt-1 sm:p-6 sm:pt-2 lg:p-8 lg:pt-2">
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
          substatusOptions={orderSubstatusOptions}
          vehiclePlates={vehiclePlatesInOrders}
        />

        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card/40 backdrop-blur-lg px-6 py-16 text-center">
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
              onView={(o) => navigate(`/ordenes/detalle/${encodeURIComponent(o.id)}`)}
              onEdit={handleEdit}
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

      <NewOrderDialog
        open={createOrderOpen}
        onOpenChange={setCreateOrderOpen}
        routeOptions={orderRouteOptions}
      />
    </div>
  );
};

export default Ordenes;
