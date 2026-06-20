import { useMemo, useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { 
  ChevronRight, 
  Edit3, 
  Package, 
  Eye,
  Search,
  School,
  MoreHorizontal,
  CircleGauge,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import PageHeader from "@/components/PageHeader";
import RoutesPaginationBar from "@/components/routes/RoutesPaginationBar";
import NewRouteDialog from "@/components/routes/NewRouteDialog";

import OrderStatusBadge from "@/components/orders/OrderStatusBadge";
import { useMobileUserRouteOptionsQuery, useVehicleOptionsQuery } from "@/hooks/useOperationsQueries";
import { routesApi } from "@/services";
import type { Route, RouteOrder } from "@/domain/routes";
import { toast } from "sonner";

const DetalleRuta = () => {
  const { id } = useParams<{ id: string }>();
  const [route, setRoute] = useState<Route | null>(null);
  const [loading, setLoading] = useState(true);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const { data: vehicles = [] } = useVehicleOptionsQuery(editDialogOpen);
  const { data: mobileUsers = [] } = useMobileUserRouteOptionsQuery(editDialogOpen);

  const [orderSearch, setOrderSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);

  const routeOrdersRaw = route?.orders ?? [];

  const routeOrdersFiltered = useMemo(() => {
    let list = routeOrdersRaw;
    const q = orderSearch.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (o) =>
          o.id.toLowerCase().includes(q) ||
          o.contactName.toLowerCase().includes(q) ||
          o.contactIdentifier.toLowerCase().includes(q),
      );
    }
    if (statusFilter !== "all") {
      list = list.filter((o) => o.status === statusFilter);
    }
    return list;
  }, [routeOrdersRaw, orderSearch, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(routeOrdersFiltered.length / pageSize));
  const currentPage = Math.min(page, totalPages);

  const paginatedOrders = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return routeOrdersFiltered.slice(start, start + pageSize);
  }, [routeOrdersFiltered, currentPage, pageSize]);

  useEffect(() => {
    setPage(1);
  }, [orderSearch, statusFilter]);

  useEffect(() => {
    setPage((p) => Math.min(p, totalPages));
  }, [totalPages]);

  useEffect(() => {
    if (id) {
      routesApi.get(id)
        .then(setRoute)
        .catch((e) => {
          toast.error(e instanceof Error ? e.message : "Error al cargar la ruta.");
        })
        .finally(() => setLoading(false));
    }
  }, [id]);

  if (loading) return <div className="p-8 text-center text-muted-foreground animate-pulse">Cargando detalles de ruta...</div>;
  if (!route) return <div className="p-8 text-center text-destructive">No se encontró la ruta.</div>;

  return (
    <div className="animate-fade-in">
      <PageHeader
        title={route.code}
        subtitle={
          <div className="flex items-center gap-1 text-sm">
            <Link to="/rutas" className="text-muted-foreground hover:text-foreground transition-colors">Rutas</Link>
            <ChevronRight className="size-3.5 text-muted-foreground/50" />
            <span className="text-muted-foreground">Detalle de ruta</span>
          </div>
        }
        actions={
          <Button size="sm" className="h-9 gap-2 bg-primary shadow-glow hover:bg-primary-hover" onClick={() => setEditDialogOpen(true)}>
            <Edit3 className="size-4" /> Editar ruta
          </Button>
        }
      />
      <div className="space-y-2 p-4 pt-1 sm:p-6 sm:pt-2 lg:p-8 lg:pt-2">
        <div className="flex flex-col gap-3 rounded-xl bg-muted/20 py-3 sm:flex-row sm:flex-wrap sm:items-center">
          <div className="relative min-w-0 flex-1 sm:max-w-xs">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" strokeWidth={1.75} />
            <Input
              placeholder="Número de pedido o contacto"
              value={orderSearch}
              onChange={(e) => setOrderSearch(e.target.value)}
              className="h-9 w-full bg-zinc-50 pl-9 transition-all hover:border-zinc-300 hover:bg-zinc-100 hover:shadow-sm focus-visible:ring-offset-0"
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="h-9 w-full min-w-0 shrink rounded-lg border bg-zinc-50 px-3 py-0 shadow-none transition-all hover:border-zinc-300 hover:bg-zinc-100 hover:shadow-sm focus:ring-2 focus:ring-ring focus:ring-offset-0 data-[state=open]:bg-zinc-100 sm:w-fit sm:max-w-[min(100%,18rem)] [&>div]:mr-2 [&>svg]:hidden">
                <div className="flex w-full items-center gap-2">
                  <CircleGauge className="size-3.5 shrink-0 text-muted-foreground" strokeWidth={1.75} />
                  <span className="min-w-0 truncate text-left text-sm text-muted-foreground">
                    <SelectValue placeholder="Estado: Todos" />
                  </span>
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Estado: Todos</SelectItem>
                <SelectItem value="pending">Pendiente</SelectItem>
                <SelectItem value="in_route">En ruta</SelectItem>
                <SelectItem value="entregado">Entregado</SelectItem>
                <SelectItem value="no_entregado">No entregado</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border border-border bg-card/40 backdrop-blur-lg shadow-sm">
          <div className="overflow-x-auto scrollbar-thin">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-surface-muted text-left text-xs font-medium tracking-wider text-muted-foreground/80">
                  <th className="whitespace-nowrap px-3.5 py-2.5 font-medium">Pedido</th>
                  <th className="whitespace-nowrap px-3.5 py-2.5 font-medium">Institución</th>
                  <th className="whitespace-nowrap px-3.5 py-2.5 font-medium">Estado</th>
                  <th className="whitespace-nowrap px-3.5 py-2.5 font-medium">Subestado</th>
                  <th className="whitespace-nowrap px-3.5 py-2.5 font-medium">Contacto</th>
                  <th className="whitespace-nowrap px-3.5 py-2.5 font-medium">Fecha ruta</th>
                  <th className="whitespace-nowrap px-3.5 py-2.5 font-medium">Placa</th>
                  <th className="max-w-[220px] px-3.5 py-2.5 font-medium">Dirección</th>
                  <th className="whitespace-nowrap px-3.5 py-2.5 pr-5 text-right font-medium">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {routeOrdersFiltered.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-24 text-center">
                      <div className="flex flex-col items-center gap-5">
                        <div className="size-20 rounded-full bg-primary-soft/20 flex items-center justify-center border border-primary-soft/50">
                          <Package className="size-10 text-primary opacity-40" />
                        </div>
                        <p className="text-muted-foreground font-medium text-lg">
                          {routeOrdersRaw.length === 0
                            ? "Ningún pedido está asignado a esta ruta"
                            : "No hay pedidos que coincidan con el filtro"}
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginatedOrders.map((o) => (
                    <tr key={o.id} className="group transition-colors hover:bg-surface-muted">
                      <td className="px-3.5 py-2.5">
                        <Link 
                          to={`/ordenes/detalle/${encodeURIComponent(o.id)}`}
                          className="flex items-center gap-2 text-left transition-all hover:translate-x-0.5 group/id"
                        >
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-soft text-primary transition-colors group-hover/id:bg-primary group-hover/id:text-white">
                            <Package className="size-4" />
                          </div>
                          <span className="font-medium text-foreground transition-colors group-hover/id:text-primary group-hover/id:underline underline-offset-4">
                            {o.id}
                          </span>
                        </Link>
                      </td>
                      <td className="px-3.5 py-2.5">
                        <span className="font-medium text-foreground">{o.clientName || "—"}</span>
                      </td>
                      <td className="px-3.5 py-2.5">
                        <OrderStatusBadge status={o.status} />
                      </td>
                      <td className="px-3.5 py-2.5 text-foreground max-w-[140px] truncate" title={o.substatus}>
                        {o.substatus || "—"}
                      </td>
                      <td className="px-3.5 py-2.5 text-foreground max-w-[180px]">
                        <p className="truncate font-medium text-foreground" title={o.contactName}>
                          {o.contactName || "—"}
                        </p>
                        {o.contactPhone && (
                          <p className="truncate text-xs text-muted-foreground mt-0.5">
                            {o.contactPhone}
                          </p>
                        )}
                      </td>
                      <td className="px-3.5 py-2.5 whitespace-nowrap text-foreground">{o.routeDate}</td>
                      <td className="px-3.5 py-2.5 tabular-nums text-foreground">{o.vehiclePlate}</td>
                      <td className="px-3.5 py-2.5 text-muted-foreground max-w-[240px]">
                        <span className="line-clamp-2" title={o.addressLine}>
                          {o.addressLine ?? "—"}
                        </span>
                      </td>
                      <td className="px-3.5 py-2.5 text-right" onClick={(e) => e.stopPropagation()}>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:bg-muted hover:text-foreground">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-40">
                            <DropdownMenuItem asChild className="cursor-pointer">
                              <Link to={`/ordenes/detalle/${encodeURIComponent(o.id)}`}>
                                <Eye className="mr-2 h-4 w-4" /> Ver detalle
                              </Link>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {routeOrdersFiltered.length > 0 && (
          <RoutesPaginationBar
            currentPage={currentPage}
            totalPages={totalPages}
            totalFiltered={routeOrdersFiltered.length}
            pageSize={pageSize}
            onPageChange={setPage}
            label="pedidos"
            onPageSizeChange={(n) => {
              setPageSize(n);
              setPage(1);
            }}
          />
        )}
      </div>

      <NewRouteDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        vehicles={vehicles}
        mobileUsers={mobileUsers}
        editingRoute={route}
      />
    </div>
  );
};

export default DetalleRuta;
