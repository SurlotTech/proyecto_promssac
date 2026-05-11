import { useMemo, useState, useEffect, type ReactNode } from "react";
import { useParams, Link } from "react-router-dom";
import { 
  ChevronRight, 
  Edit3, 
  Plus, 
  MapPin, 
  Package, 
  User, 
  CreditCard,
  RotateCcw,
  Eye,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import NewRouteDialog from "@/components/routes/NewRouteDialog";
import AssociateOrderDialog from "@/components/routes/AssociateOrderDialog";
import OrderStatusBadge from "@/components/orders/OrderStatusBadge";
import { useMobileUserRouteOptionsQuery, useRouteOrdersQuery, useVehicleOptionsQuery } from "@/hooks/useOperationsQueries";
import { routesApi } from "@/services";
import { useQueryClient } from "@tanstack/react-query";
import type { Route } from "@/domain/routes";
import type { Order } from "@/domain/orders";
import { LIMA_CENTER } from "@/domain/fleet";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  MapContainer,
  Marker,
  Polyline,
  Popup,
  TileLayer,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix for leaflet icons
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// @ts-expect-error _getIconUrl is an internal property
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

type LatLng = [number, number];

function ordenTieneUbicacionMapa(o: Order): boolean {
  const { latitude: lat, longitude: lng } = o;
  if (typeof lat !== "number" || typeof lng !== "number") return false;
  return Number.isFinite(lat) && Number.isFinite(lng);
}

function ordenDestinoMapa(o: Order): LatLng | null {
  if (!ordenTieneUbicacionMapa(o)) return null;
  return [o.latitude!, o.longitude!];
}

/** Ajusta el mapa a origen→destino o centra Lima si no hay destino válido. */
function FitRouteMapView({ origin, destination }: { origin: LatLng; destination: LatLng | null }) {
  const map = useMap();
  useEffect(() => {
    if (destination) {
      const bounds = L.latLngBounds([origin, destination]);
      map.fitBounds(bounds, { padding: [52, 52], maxZoom: 15 });
      return;
    }
    map.setView(origin, 12);
  }, [map, origin[0], origin[1], destination?.[0], destination?.[1]]);
  return null;
}

/** Contenido del mapa: capa base + enfoque y trazo solo cuando hay orden con GPS. */
function RouteOrdersMapLayers({
  origin,
  destination,
  selectedOrder,
}: {
  origin: LatLng;
  destination: LatLng | null;
  selectedOrder: Order | undefined;
}) {
  const marcadoresPopup: ReactNode =
    destination && selectedOrder ? (
      <>
        <Marker position={origin}>
          <Popup>
            <span className="text-[13px] font-medium">Referencia origen</span>
            <p className="text-xs text-muted-foreground mt-0.5 mb-0">Punto base (Lima). La ruta real puede variar según punto de despacho.</p>
          </Popup>
        </Marker>
        <Marker position={destination}>
          <Popup>
            <span className="text-[13px] font-semibold">{selectedOrder.id}</span>
            {selectedOrder.addressLine || selectedOrder.normalizedAddress ? (
              <p className="text-xs mt-1 mb-0 max-w-[240px]">
                {selectedOrder.addressLine ?? selectedOrder.normalizedAddress}
              </p>
            ) : null}
          </Popup>
        </Marker>
      </>
    ) : null;

  return (
    <>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <FitRouteMapView origin={origin} destination={destination} />
      {destination ? (
        <Polyline
          positions={[origin, destination]}
          pathOptions={{
            color: "hsl(var(--primary))",
            weight: 4,
            opacity: 0.8,
          }}
        />
      ) : null}
      {marcadoresPopup}
    </>
  );
}

const DetalleRuta = () => {
  const { id } = useParams<{ id: string }>();
  const [route, setRoute] = useState<Route | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("despachos");
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [associateDialogOpen, setAssociateDialogOpen] = useState(false);
  const qc = useQueryClient();
  const { data: vehicles = [] } = useVehicleOptionsQuery();
  const { data: mobileUsers = [] } = useMobileUserRouteOptionsQuery();
  const {
    data: routeOrdersRaw = [],
    isLoading: routeOrdersLoading,
    isError: routeOrdersError,
  } = useRouteOrdersQuery(id);

  const [orderSearch, setOrderSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedMapOrderId, setSelectedMapOrderId] = useState<string | null>(null);

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

  const selectedMapOrder = useMemo(
    () =>
      selectedMapOrderId
        ? routeOrdersRaw.find((o) => o.id === selectedMapOrderId)
        : undefined,
    [routeOrdersRaw, selectedMapOrderId],
  );

  const mapDestination = useMemo(
    (): LatLng | null => (selectedMapOrder ? ordenDestinoMapa(selectedMapOrder) : null),
    [selectedMapOrder],
  );

  function invalidateRouteOrders() {
    void qc.invalidateQueries({ queryKey: ["rutas", id, "ordenes"] });
    void qc.invalidateQueries({ queryKey: ["rutas"] });
    void qc.invalidateQueries({ queryKey: ["ordenes"] });
  }

  useEffect(() => {
    if (id) {
      routesApi.get(id)
        .then(setRoute)
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [id]);

  useEffect(() => {
    setSelectedMapOrderId(null);
  }, [id]);

  if (loading) return <div className="p-8 text-center text-muted-foreground animate-pulse">Cargando detalles de ruta...</div>;
  if (!route) return <div className="p-8 text-center text-destructive">No se encontró la ruta.</div>;

  return (
    <div className="flex flex-col h-full bg-[#f8f9fc] animate-in fade-in duration-500 overflow-hidden">
      {/* Light Header / Breadcrumbs */}
      <header className="bg-white border-b border-border px-6 py-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <Link to="/rutas" className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1 text-sm font-medium">
            Rutas
          </Link>
          <ChevronRight className="size-4 text-muted-foreground/50" />
          <span className="font-bold text-lg text-foreground tracking-tight">{route.code}</span>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            size="sm" 
            className="h-9 border-border hover:bg-zinc-50"
            onClick={() => setEditDialogOpen(true)}
          >
            <Edit3 className="mr-2 size-4" /> Editar ruta
          </Button>
          <Button 
            size="sm" 
            className="bg-primary hover:bg-primary-hover text-primary-foreground border-none h-9 shadow-sm"
            onClick={() => setAssociateDialogOpen(true)}
          >
            <Plus className="mr-2 size-4" /> Asociar pedido
          </Button>
        </div>
      </header>

      {/* Main Tabs Container */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col flex-1 overflow-hidden">
        {/* Info Bar and Tabs List */}
        <div className="bg-white border-b border-border px-6 shrink-0">
          <div className="flex items-center justify-between">
            <TabsList className="bg-transparent h-14 p-0 gap-6">
              <TabsTrigger 
                value="despachos" 
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary text-muted-foreground px-0 h-14 font-semibold transition-all hover:text-foreground"
              >
                Despachos
              </TabsTrigger>
              <TabsTrigger 
                value="mapa" 
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary text-muted-foreground px-0 h-14 font-semibold transition-all hover:text-foreground"
              >
                Mapa
              </TabsTrigger>
              <TabsTrigger 
                value="cobros" 
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary text-muted-foreground px-0 h-14 font-semibold transition-all hover:text-foreground"
              >
                Cobros
              </TabsTrigger>
            </TabsList>

            <div className="flex items-center gap-6 text-muted-foreground text-[13px]">
              <div className="flex items-center gap-2">
                <div className="size-6 rounded-full bg-zinc-100 flex items-center justify-center border border-zinc-200">
                  <User className="size-3.5 text-zinc-500" />
                </div>
                <span className="font-medium text-foreground">{route.mobileUser || "-"}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="size-4 text-zinc-400" />
                <span>Inicio de ruta</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="size-4 text-zinc-400" />
                <span>Fin de ruta</span>
              </div>
              <div className="flex items-center gap-4">
                <span>
                  Pedidos (asignados):{" "}
                  <span className="text-foreground font-semibold">{routeOrdersRaw.length}</span>
                </span>
                <span>Gestionados: <span className="text-foreground font-semibold">{route.dispatchCompleted}</span></span>
              </div>
              <Button size="sm" variant="outline" className="h-8 text-[11px] font-bold uppercase tracking-wider border-zinc-200">
                Reordenar ruta
              </Button>
            </div>
          </div>
        </div>

        {/* Action/Filter Bar */}
        <div className="px-6 py-4 flex items-center gap-3 shrink-0 bg-[#f8f9fc]">
           <Select value={statusFilter} onValueChange={setStatusFilter}>
             <SelectTrigger className="w-[180px] bg-white border border-border h-10 text-muted-foreground shadow-sm focus:ring-1 focus:ring-primary/20">
               <SelectValue placeholder="Estado" />
             </SelectTrigger>
             <SelectContent>
               <SelectItem value="all">Todos los estados</SelectItem>
               <SelectItem value="pending">Pendiente</SelectItem>
               <SelectItem value="in_route">En ruta</SelectItem>
               <SelectItem value="delivered">Entregado</SelectItem>
               <SelectItem value="no_delivered">No entregado</SelectItem>
               <SelectItem value="partially_delivered">Parcial</SelectItem>
             </SelectContent>
           </Select>

           <div className="relative flex-1 max-w-md">
             <Input 
              placeholder="Número de pedido o contacto" 
              className="w-full bg-white border border-border h-10 pl-4 pr-10 shadow-sm focus-visible:ring-1 focus-visible:ring-primary/20"
              value={orderSearch}
              onChange={(e) => setOrderSearch(e.target.value)}
             />
           </div>

           <Button
             type="button"
             variant="outline"
             className="bg-primary-soft border-none text-primary hover:bg-primary-soft/80 h-10 px-6 font-bold flex gap-2 shadow-sm"
             onClick={() => {
               setOrderSearch("");
               setStatusFilter("all");
             }}
           >
             <RotateCcw className="size-4" /> Limpiar filtros
           </Button>

           <div className="flex-1" />

           {activeTab === "cobros" && (
              <Button variant="outline" className="bg-white border-zinc-200 text-zinc-700 hover:bg-zinc-50 h-10 px-6 font-bold shadow-sm">
                Colecciones
              </Button>
           )}
        </div>

        {/* Content Area */}
        <div className="flex-1 px-6 pb-6 overflow-hidden flex flex-col">
          <TabsContent value="despachos" className="m-0 p-0 outline-none flex-1 flex flex-col bg-white rounded-xl shadow-sm border border-zinc-200 overflow-hidden data-[state=inactive]:hidden">
              <div className="overflow-x-auto flex-1 scrollbar-thin">
                <table className="w-full text-[13px] text-left border-collapse">
                  <thead className="bg-zinc-50 text-zinc-600 font-bold uppercase text-[11px] tracking-wider border-b border-zinc-200 sticky top-0 z-10">
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
                    {routeOrdersLoading ? (
                      <tr>
                        <td colSpan={8} className="py-16 text-center text-zinc-500">
                          Cargando pedidos de la ruta…
                        </td>
                      </tr>
                    ) : routeOrdersError ? (
                      <tr>
                        <td colSpan={8} className="py-16 text-center text-destructive">
                          No se pudieron cargar los pedidos de esta ruta.
                        </td>
                      </tr>
                    ) : routeOrdersFiltered.length === 0 ? (
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
                        <tr key={o.id} className="border-b border-zinc-100 hover:bg-zinc-50/80">
                          <td className="px-4 py-3 font-semibold text-foreground tabular-nums">{o.id}</td>
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
                            <Button variant="ghost" size="sm" className="h-8 gap-1.5 font-semibold" asChild>
                              <Link to={`/ordenes/detalle/${encodeURIComponent(o.id)}`}>
                                <Eye className="size-4" />
                                Ver
                              </Link>
                            </Button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
          </TabsContent>

          <TabsContent value="mapa" className="m-0 p-0 outline-none flex-1 flex bg-white rounded-xl shadow-sm border border-zinc-200 overflow-hidden data-[state=inactive]:hidden">
              <div className="w-[300px] border-r border-zinc-200 flex flex-col bg-zinc-50/50 shrink-0 min-h-0">
                 <div className="bg-zinc-50 px-6 py-4 text-zinc-600 font-bold uppercase text-[11px] tracking-wider border-b border-zinc-200 flex items-center gap-2 shrink-0">
                    <div className="size-4 rounded border border-zinc-300 bg-white" />
                    Pedido
                 </div>
                 <div className="flex-1 overflow-y-auto p-3 min-h-0">
                    {routeOrdersLoading ? (
                      <p className="py-8 text-center text-xs text-zinc-500">Cargando…</p>
                    ) : routeOrdersFiltered.length === 0 ? (
                      <div className="flex flex-col items-center justify-center p-6 text-center gap-4">
                        <Package className="size-8 text-primary opacity-30" />
                        <p className="text-zinc-400 text-sm font-medium">Sin pedidos en esta vista</p>
                      </div>
                    ) : (
                      <ul className="space-y-1">
                        {routeOrdersFiltered.map((o) => (
                          <li key={o.id}>
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedMapOrderId(o.id);
                                if (!ordenTieneUbicacionMapa(o)) {
                                  toast.message("Este pedido no tiene ubicación GPS. Complétalo en la ficha o el asistente.");
                                }
                              }}
                              title={o.id}
                              className={cn(
                                "block w-full truncate rounded-lg px-3 py-2 text-left text-sm font-medium text-foreground hover:bg-white hover:shadow-sm border transition-colors",
                                selectedMapOrderId === o.id
                                  ? "bg-white shadow-sm border-primary/35 ring-1 ring-primary/20"
                                  : "border-transparent hover:border-zinc-200",
                              )}
                            >
                              {o.id}
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                 </div>
                 {selectedMapOrder && (
                   <div className="border-t border-zinc-200 bg-white p-4 shrink-0 space-y-2">
                     {(selectedMapOrder.addressLine ?? selectedMapOrder.normalizedAddress) ? (
                       <p className="text-xs text-zinc-600 leading-snug line-clamp-3">
                         {selectedMapOrder.addressLine ?? selectedMapOrder.normalizedAddress}
                       </p>
                     ) : (
                       <p className="text-xs text-zinc-400">Sin dirección registrada.</p>
                     )}
                     <Button variant="link" className="h-auto p-0 text-xs font-semibold text-primary" asChild>
                       <Link to={`/ordenes/detalle/${encodeURIComponent(selectedMapOrder.id)}`}>
                         Abrir detalle completo →
                       </Link>
                     </Button>
                   </div>
                 )}
              </div>
              <div className="flex-1 relative h-full min-h-[320px]">
                 <MapContainer
                  center={LIMA_CENTER}
                  zoom={12}
                  className="h-full w-full z-0 [&_.leaflet-control-attribution]:text-[10px]"
                  scrollWheelZoom={false}
                >
                  <RouteOrdersMapLayers
                    origin={LIMA_CENTER}
                    destination={mapDestination}
                    selectedOrder={selectedMapOrder}
                  />
                </MapContainer>
                <div className="pointer-events-none absolute inset-x-0 bottom-3 z-[410] flex justify-center px-3">
                  {!selectedMapOrderId ? (
                    <p className="rounded-md bg-white/92 px-3 py-2 text-xs text-zinc-600 shadow-sm ring-1 ring-zinc-200/80 backdrop-blur-[2px] max-w-lg text-center">
                      Selecciona un pedido para ver la línea origen → destino en el mapa.
                    </p>
                  ) : selectedMapOrder && !mapDestination ? (
                    <p className="rounded-md bg-zinc-900/82 px-3 py-2 text-xs text-white shadow-sm max-w-md text-center">
                      Este pedido no tiene coordenadas. Complétalo para ver la entrega aquí.
                    </p>
                  ) : null}
                </div>
              </div>
          </TabsContent>

          <TabsContent value="cobros" className="m-0 p-0 outline-none flex-1 flex flex-col bg-white rounded-xl shadow-sm border border-zinc-200 overflow-hidden data-[state=inactive]:hidden">
               <div className="overflow-x-auto flex-1 scrollbar-thin">
                <table className="w-full text-[13px] text-left border-collapse">
                  <thead className="bg-zinc-50 text-zinc-600 font-bold uppercase text-[11px] tracking-wider border-b border-zinc-200 sticky top-0 z-10">
                    <tr>
                      <th className="px-6 py-4 w-10">#</th>
                      <th className="px-4 py-4">Tipo de movimiento</th>
                      <th className="px-4 py-4">Tipo de transacción</th>
                      <th className="px-4 py-4">Monto</th>
                      <th className="px-4 py-4">Código de pedido</th>
                      <th className="px-4 py-4">Hora de gestión</th>
                      <th className="px-4 py-4">Dirección</th>
                      <th className="px-4 py-4">Observaciones</th>
                      <th className="px-4 py-4 text-right pr-6">Pruebas de recolección</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td colSpan={9} className="py-24 text-center">
                        <div className="flex flex-col items-center gap-5">
                           <div className="size-20 rounded-full bg-primary-soft/20 flex items-center justify-center border border-primary-soft/50">
                              <CreditCard className="size-10 text-primary opacity-40" />
                           </div>
                           <p className="text-zinc-400 font-medium text-lg">No se han encontrado resultados</p>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
          </TabsContent>
        </div>
      </Tabs>

      <NewRouteDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        vehicles={vehicles}
        mobileUsers={mobileUsers}
        editingRoute={route}
      />

      <AssociateOrderDialog
        open={associateDialogOpen}
        onOpenChange={setAssociateDialogOpen}
        rutaId={route.id}
        fechaRuta={route.deliveryDate}
        onCreated={() => invalidateRouteOrders()}
      />
    </div>
  );
};

export default DetalleRuta;
