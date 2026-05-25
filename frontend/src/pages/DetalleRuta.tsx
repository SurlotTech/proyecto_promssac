import { useMemo, useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { 
  ChevronRight, 
  Edit3, 
  Package, 
  User, 
  Eye,
  Search,
  School,
  MoreHorizontal,
  CircleGauge,
  Route as RouteIcon,
  Phone
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
    <div className="flex flex-col h-full bg-transparent animate-in fade-in duration-500 overflow-hidden">
      <header className="px-6 py-4 flex items-center justify-between shrink-0 bg-transparent">
        <div className="flex items-center gap-3">
          <Link to="/rutas" className="text-muted-foreground hover:text-foreground transition-colors flex items-center text-sm font-medium">
            <RouteIcon className="mr-1.5 size-3.5 opacity-60" /> Rutas
          </Link>
          <ChevronRight className="size-4 text-muted-foreground/50" />
          <span className="font-bold text-lg text-foreground tracking-tight">{route.code}</span>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            size="sm" 
            className="h-9 border-border hover:bg-zinc-50 rounded-full px-4"
            onClick={() => setEditDialogOpen(true)}
          >
            <Edit3 className="mr-2 size-4" /> Editar ruta
          </Button>
        </div>
      </header>

      <div className="px-6 py-4 flex items-center gap-4 shrink-0 bg-transparent">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[200px] h-12 rounded-full border-border bg-transparent text-sm shadow-none transition-colors hover:bg-zinc-50 focus:ring-2 focus:ring-ring focus:ring-offset-2">
            <div className="flex items-center gap-2">
              <CircleGauge className="h-4 w-4 shrink-0 text-muted-foreground" />
              <SelectValue placeholder="Estado: Todos" />
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

        <div className="relative flex-1 max-w-md">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input 
            placeholder="Número de pedido o contacto" 
            className="w-full bg-transparent border border-border h-12 pl-11 pr-4 shadow-none transition-colors hover:bg-zinc-50 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-full text-sm"
            value={orderSearch}
            onChange={(e) => setOrderSearch(e.target.value)}
          />
        </div>
        <div className="flex-1" />
      </div>

      <div className="flex-1 px-6 pb-6 overflow-hidden flex flex-col">
        <div className="flex-1 flex flex-col bg-card/40 backdrop-blur-lg rounded-xl shadow-sm border border-border/50 overflow-hidden">
          <div className="overflow-x-auto flex-1 scrollbar-thin">
            <table className="w-full text-[13px] text-left border-collapse">
              <thead className="bg-muted/20 backdrop-blur-lg text-zinc-600 font-bold uppercase text-[11px] tracking-wider border-b border-border/40 sticky top-0 z-10">
                <tr>
                  <th className="px-4 py-4">Pedido</th>
                  <th className="px-4 py-4">Estado</th>
                  <th className="px-4 py-4">Subestado</th>
                  <th className="px-4 py-4">Contacto</th>
                  <th className="px-4 py-4">Fecha ruta</th>
                  <th className="px-4 py-4">Placa</th>
                  <th className="px-4 py-4 max-w-[220px]">Dirección</th>
                  <th className="px-4 py-4 text-right pr-6">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {routeOrdersFiltered.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-24 text-center">
                      <div className="flex flex-col items-center gap-5">
                        <div className="size-20 rounded-full bg-primary-soft/20 flex items-center justify-center border border-primary-soft/50">
                          <Package className="size-10 text-primary opacity-40" />
                        </div>
                        <p className="text-zinc-400 font-medium text-lg">
                          {routeOrdersRaw.length === 0
                            ? "Ningún pedido está asignado a esta ruta"
                            : "No hay pedidos que coincidan con el filtro"}
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  routeOrdersFiltered.map((o) => (
                    <tr key={o.id} className="border-b border-border/40 hover:bg-white/5">
                      <td className="px-4 py-3">
                        <Link 
                          to={`/ordenes/detalle/${encodeURIComponent(o.id)}`}
                          className="flex items-center gap-2 text-left transition-all hover:translate-x-0.5 group/id"
                        >
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary-soft text-primary transition-colors group-hover/id:bg-primary group-hover/id:text-white">
                            <Package className="h-3.5 w-3.5" />
                          </div>
                          <div className="flex flex-col leading-tight">
                            <span className="font-semibold text-foreground transition-colors group-hover/id:text-primary group-hover/id:underline underline-offset-4">
                              {o.id}
                            </span>
                            <div className="flex flex-col text-[11px] text-muted-foreground mt-2 gap-1.5">
                              <div className="flex items-center gap-2">
                                <School className="size-3.5 text-zinc-500 shrink-0" />
                                <span className="uppercase font-semibold text-zinc-600">{o.clientName || "-"}</span>
                              </div>
                              <div className="flex items-center gap-2 text-zinc-500">
                                <User className="size-3.5 text-zinc-400 shrink-0" />
                                <span className="font-medium">{o.contactName || "-"}</span>
                              </div>
                              {o.contactPhone && (
                                <div className="flex items-center gap-2 text-zinc-500">
                                  <Phone className="size-3.5 text-zinc-400 shrink-0" />
                                  <span className="font-medium">{o.contactPhone}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </Link>
                      </td>
                      <td className="px-4 py-3">
                        <OrderStatusBadge status={o.status} />
                      </td>
                      <td className="px-4 py-3 text-zinc-700 max-w-[140px] truncate" title={o.substatus}>
                        {o.substatus || "—"}
                      </td>
                      <td className="px-4 py-3 text-zinc-700 max-w-[180px]">
                        <span className="block truncate" title={[o.contactName, o.contactIdentifier].filter(Boolean).join(" · ")}>
                          {o.contactName || o.contactIdentifier
                            ? [o.contactName, o.contactIdentifier].filter(Boolean).join(" · ")
                            : "—"}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-zinc-700">{o.routeDate}</td>
                      <td className="px-4 py-3 tabular-nums text-zinc-700">{o.vehiclePlate}</td>
                      <td className="px-4 py-3 text-zinc-600 max-w-[240px]">
                        <span className="line-clamp-2" title={o.addressLine}>
                          {o.addressLine ?? "—"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right pr-6">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:bg-muted hover:text-foreground">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-40 border-border bg-card/40 backdrop-blur-lg shadow-md">
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
