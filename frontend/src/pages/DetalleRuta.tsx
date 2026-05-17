import { useMemo, useState, useEffect, useRef, type ReactNode } from "react";
import { useParams, Link } from "react-router-dom";
import { 
  ChevronRight, 
  Edit3, 
  MapPin, 
  Package, 
  User, 
  RotateCcw,
  Eye,
  Calendar,
  Clock,
  Search,
  School,
  LayoutGrid,
  List as ListIcon,
  Filter,
  ArrowUpDown,
  MoreHorizontal,
  Pencil,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import NewRouteDialog from "@/components/routes/NewRouteDialog";

import OrderStatusBadge from "@/components/orders/OrderStatusBadge";
import { useMobileUserRouteOptionsQuery, useRouteOrdersQuery, useVehicleOptionsQuery } from "@/hooks/useOperationsQueries";
import { routesApi } from "@/services";
import { useQueryClient } from "@tanstack/react-query";
import type { Route } from "@/domain/routes";
import type { Order } from "@/domain/orders";
import { LIMA_CENTER } from "@/domain/fleet";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { PromssacMap } from "@/components/maps";

type LatLng = [number, number];

function ordenTieneUbicacionMapa(o: Order): boolean {
  const { latitude: lat, longitude: lng } = o;
  if (typeof lat !== "number" || typeof lng !== "number") return false;
  return Number.isFinite(lat) && Number.isFinite(lng);
}

function ordenDestinoMapa(o: Order): LatLng | null {
  if (!ordenTieneUbicacionMapa(o)) return null;
  return [o.longitude!, o.latitude!];
}

function createMarkerElement(color: string) {
  const el = document.createElement("div");
  el.className = "w-6 h-6 rounded-full border-2 border-white shadow-lg";
  el.style.backgroundColor = color;
  return el;
}

function RouteMap({
  mapKey,
  center,
  zoom,
  destination,
  selectedOrder,
}: {
  mapKey: string;
  center: [number, number];
  zoom: number;
  destination: LatLng | null;
  selectedOrder: Order | undefined;
}) {
  const originMarkerRef = useRef<maplibregl.Marker | null>(null);
  const destMarkerRef = useRef<maplibregl.Marker | null>(null);
  const lineSourceRef = useRef<string | null>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const styleLoadedRef = useRef(false);

  const updateMapLayers = (map: maplibregl.Map) => {
    if (!destination || !selectedOrder) {
      if (originMarkerRef.current) {
        originMarkerRef.current.remove();
        originMarkerRef.current = null;
      }
      if (destMarkerRef.current) {
        destMarkerRef.current.remove();
        destMarkerRef.current = null;
      }
      if (lineSourceRef.current && map.getSource(lineSourceRef.current)) {
        map.removeLayer(lineSourceRef.current + "-line");
        map.removeSource(lineSourceRef.current);
        lineSourceRef.current = null;
      }
      map.flyTo({ center, zoom: 12, pitch: 45, duration: 500 });
      return;
    }

    if (!originMarkerRef.current) {
      const el = createMarkerElement("hsl(215 28% 17%)");
      originMarkerRef.current = new maplibregl.Marker({ element: el })
        .setLngLat(center)
        .addTo(map);
    }

    if (!destMarkerRef.current) {
      const el = createMarkerElement("hsl(215 94% 55%)");
      destMarkerRef.current = new maplibregl.Marker({ element: el })
        .setLngLat(destination)
        .addTo(map);
    } else {
      destMarkerRef.current.setLngLat(destination);
    }

    const sourceId = `route-line-${selectedOrder.id}`;
    lineSourceRef.current = sourceId;

    if (!map.getSource(sourceId)) {
      map.addSource(sourceId, {
        type: "geojson",
        data: {
          type: "Feature",
          properties: {},
          geometry: {
            type: "LineString",
            coordinates: [center, destination],
          },
        },
      });
      map.addLayer({
        id: `${sourceId}-line`,
        type: "line",
        source: sourceId,
        layout: {
          "line-join": "round",
          "line-cap": "round",
        },
        paint: {
          "line-color": "hsl(215 94% 55%)",
          "line-width": 4,
          "line-opacity": 0.8,
        },
      });
    } else {
      const source = map.getSource(sourceId) as maplibregl.GeoJSONSource;
      source.setData({
        type: "Feature",
        properties: {},
        geometry: {
          type: "LineString",
          coordinates: [center, destination],
        },
      });
    }

    const bounds = new maplibregl.LngLatBounds();
    bounds.extend(center);
    bounds.extend(destination);
    map.fitBounds(bounds, { padding: 52, maxZoom: 15, pitch: 60, bearing: 0, duration: 500 });
  };

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !styleLoadedRef.current) return;
    updateMapLayers(map);
  }, [destination, selectedOrder]);

  return (
    <PromssacMap
      mapKey={mapKey}
      center={center}
      zoom={zoom}
      showStylePicker={false}
      defaultStyle="liberty"
      className="h-full w-full"
      containerClassName="h-full w-full"
      onMap={(map) => {
        mapRef.current = map;
        map.once("style.load", () => {
          styleLoadedRef.current = true;
          updateMapLayers(map);
        });
      }}
    />
  );
}

const DetalleRuta = () => {
  const { id } = useParams<{ id: string }>();
  const [route, setRoute] = useState<Route | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("despachos");
  const [editDialogOpen, setEditDialogOpen] = useState(false);
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
    <div className="flex flex-col h-full bg-transparent animate-in fade-in duration-500 overflow-hidden">
      {/* Light Header / Breadcrumbs */}
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

      {/* Main Tabs Container */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col flex-1 overflow-hidden">
        <div className="px-6 py-4 flex items-center gap-4 shrink-0 bg-transparent">
           <TabsList className="bg-muted/40 p-1 h-12 gap-1 rounded-full border border-border/50">
             <TabsTrigger 
               value="despachos" 
               className="rounded-full px-5 h-10 text-[13px] font-semibold data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all"
             >
               Despachos
             </TabsTrigger>
             <TabsTrigger 
               value="mapa" 
               className="rounded-full px-5 h-10 text-[13px] font-semibold data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all"
             >
               Mapa
             </TabsTrigger>
           </TabsList>

           <div className="h-6 w-px bg-border/60 mx-1" />

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

        {/* Content Area */}
        <div className="flex-1 px-6 pb-6 overflow-hidden flex flex-col">
          <TabsContent value="despachos" className="m-0 p-0 outline-none flex-1 flex flex-col bg-card/40 backdrop-blur-md rounded-xl shadow-sm border border-border/50 overflow-hidden data-[state=inactive]:hidden">
              <div className="overflow-x-auto flex-1 scrollbar-thin">
                <table className="w-full text-[13px] text-left border-collapse">
                  <thead className="bg-muted/20 backdrop-blur-md text-zinc-600 font-bold uppercase text-[11px] tracking-wider border-b border-border/40 sticky top-0 z-10">
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
                              <DropdownMenuContent align="end" className="w-40 border-border bg-card/40 backdrop-blur-md shadow-md">
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
          </TabsContent>

          <TabsContent value="mapa" className="m-0 p-0 outline-none flex-1 flex bg-card/40 backdrop-blur-md rounded-xl shadow-sm border border-border/50 overflow-hidden data-[state=inactive]:hidden">
              <div className="w-[300px] border-r border-border/50 flex flex-col bg-transparent shrink-0 min-h-0">
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
                                "group flex w-full items-start gap-3 rounded-xl px-4 py-3 text-left transition-all duration-200 border bg-white/30 backdrop-blur-sm mb-2",
                                selectedMapOrderId === o.id
                                  ? "shadow-md border-primary/40 ring-1 ring-primary/20 translate-x-1 bg-white/60"
                                  : "border-border/40 hover:bg-white/50 hover:border-zinc-300 hover:translate-x-0.5 shadow-sm",
                              )}
                            >
                              <div className={cn(
                                "flex size-9 shrink-0 items-center justify-center rounded-lg border transition-colors mt-0.5",
                                selectedMapOrderId === o.id 
                                  ? "bg-primary/10 border-primary/20 text-primary" 
                                  : "bg-muted/40 border-border/60 text-muted-foreground group-hover:bg-white group-hover:border-zinc-300"
                              )}>
                                <Package className="size-4.5" />
                              </div>
                              <div className="flex flex-col min-w-0 flex-1 leading-tight">
                                <span className="truncate font-bold text-[14px] text-foreground">{o.id}</span>
                                <div className="flex flex-col mt-2 gap-1.5">
                                  <div className="flex items-center gap-2 text-[11px]">
                                    <School className="size-3.5 text-zinc-500 shrink-0" />
                                    <span className="truncate text-zinc-600 uppercase font-semibold">
                                      {o.clientName || "-"}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2 text-[11px] text-zinc-500">
                                    <User className="size-3.5 text-zinc-400 shrink-0" />
                                    <span className="truncate font-medium">{o.contactName || "-"}</span>
                                  </div>
                                  {o.contactPhone && (
                                     <div className="flex items-center gap-2 text-[11px] text-zinc-500">
                                        <Phone className="size-3.5 text-zinc-400 shrink-0" />
                                        <span className="truncate font-medium">{o.contactPhone}</span>
                                     </div>
                                  )}
                                </div>
                              </div>
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                 </div>
              </div>
              <div className="flex-1 relative h-full min-h-[320px]">
                 {selectedMapOrder && (
                    <div className="absolute top-4 right-4 z-[10] max-w-[280px] bg-white/90 backdrop-blur-md border border-border/40 shadow-xl rounded-2xl p-4 animate-in fade-in slide-in-from-top-2 duration-300">
                      <div className="flex items-start gap-3">
                        <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 border border-primary/20">
                          <MapPin className="size-4 text-primary" />
                        </div>
                        <div className="flex flex-col gap-1 min-w-0">
                          <span className="text-[10px] font-bold text-primary uppercase tracking-wider">Dirección de Entrega</span>
                          <p className="text-[13px] font-medium text-zinc-700 leading-relaxed line-clamp-4">
                            {selectedMapOrder.addressLine ?? selectedMapOrder.normalizedAddress ?? "Sin dirección registrada."}
                          </p>
                          <Link 
                            to={`/ordenes/detalle/${encodeURIComponent(selectedMapOrder.id)}`}
                            className="text-[11px] font-bold text-primary hover:underline mt-1.5 inline-flex items-center gap-1"
                          >
                            Ver detalle <ChevronRight className="size-3" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  )}
<RouteMap
                    mapKey={`detalle-ruta-${id}`}
                    center={[LIMA_CENTER[1], LIMA_CENTER[0]]}
                    zoom={12}
                    destination={mapDestination}
                    selectedOrder={selectedMapOrder}
                  />
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

        </div>
      </Tabs>

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
