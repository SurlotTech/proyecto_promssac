import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { CheckCircle2, Circle, Package, MapPin, Phone, Mail, User, FileText, Calendar, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { apiUrl } from "@/lib/api-url";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import {
  PROMSSAC_MAP_STYLES,
  type PromssacMapStyleKey,
  add3dBuildingsToMap,
} from "@/lib/promssacMapStyles";

interface HistorialEntry {
  estado: string;
  fecha: string;
}

interface EnlaceData {
  numeroOrden: string;
  estado: string;
  nombreCliente: string;
  contactoNombre: string;
  contactoTelefono: string;
  contactoEmail: string;
  direccionLinea: string;
  latitud: number | null;
  longitud: number | null;
  fechaRuta: string;
  creadoEn: string;
  conductorNombre: string;
  conductorTelefono: string;
  historial: HistorialEntry[];
}

const TRADUCCION: Record<string, string> = {
  pending: "Pendiente",
  in_route: "En ruta",
  delivered: "Entregado",
  entregado: "Entregado",
  no_entregado: "No entregado",
  cancelled: "Cancelado",
  completed: "Completado",
  preparing: "En preparación",
};

const traducirEstado = (estado: string) => TRADUCCION[estado] || estado;

const formatFecha = (iso: string) => {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("es-PE", { day: "2-digit", month: "short", year: "numeric" })
    + " " + d.toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit" });
};

const MAP_STYLE_LABELS: Record<PromssacMapStyleKey, string> = {
  default: "CARTO (claro)",
  bright: "OpenFreeMap · bright",
  liberty: "OpenFreeMap · 3D",
};

const EnlaceCliente = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const [data, setData] = useState<EnlaceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!orderId) return;
    setLoading(true);
    fetch(apiUrl(`/api/v1/enlace/${encodeURIComponent(orderId)}`))
      .then((res) => {
        if (!res.ok) throw new Error("No encontrado");
        return res.json();
      })
      .then((json: EnlaceData) => setData(json))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [orderId]);

  const [activeTab, setActiveTab] = useState("informacion");

  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markerRef = useRef<maplibregl.Marker | null>(null);
  const [mapStyle, setMapStyle] = useState<PromssacMapStyleKey>("default");

  useEffect(() => {
    if (!data) return;
    const el = containerRef.current;
    if (!el || mapRef.current) return;

    const lat = data.latitud ?? -12.0464;
    const lng = data.longitud ?? -77.0428;

    const map = new maplibregl.Map({
      container: el,
      style: PROMSSAC_MAP_STYLES["default"],
      center: [lng, lat],
      zoom: 14,
      maxPitch: 85,
      attributionControl: false,
    });

    map.addControl(
      new maplibregl.NavigationControl({
        visualizePitch: true,
        showCompass: true,
        showZoom: true,
      }),
      "top-right",
    );

    const popup = new maplibregl.Popup({ offset: 25 }).setHTML(
      `<div style="font-size:14px">
        <p style="font-weight:600">Ubicación de entrega</p>
        <p style="color:#6b7280;font-size:12px">${data.direccionLinea || "Sin dirección"}</p>
      </div>`
    );

    const marker = new maplibregl.Marker({ color: "#2563eb" })
      .setLngLat([lng, lat])
      .setPopup(popup)
      .addTo(map);

    mapRef.current = map;
    markerRef.current = marker;

    return () => {
      marker.remove();
      map.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
  }, [data]);

  const handleStyleChange = (style: PromssacMapStyleKey) => {
    setMapStyle(style);
    const map = mapRef.current;
    if (!map) return;

    map.once("style.load", () => {
      if (style === "liberty") {
        add3dBuildingsToMap(map);
      }
      map.easeTo({ pitch: style === "liberty" ? 60 : 0, duration: 500 });
    });
    map.setStyle(PROMSSAC_MAP_STYLES[style]);
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-transparent">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-transparent gap-4">
        <Package className="size-16 text-muted-foreground" />
        <p className="text-lg text-muted-foreground">Orden no encontrada</p>
        <p className="text-sm text-muted-foreground">Verifica el enlace e inténtalo nuevamente.</p>
      </div>
    );
  }

  const estadoTraducido = traducirEstado(data.estado);

  const historial = data.historial && data.historial.length > 0
    ? data.historial.map((h) => ({
        estado: traducirEstado(h.estado),
        fecha: formatFecha(h.fecha),
        completado: true,
      }))
    : [{
        estado: estadoTraducido,
        fecha: formatFecha(data.creadoEn),
        completado: true,
      }];

  return (
    <div className="h-screen bg-transparent animate-fade-in overflow-hidden">
      <div className="flex w-full h-full lg:flex-row">
        <div className="w-full space-y-6 lg:w-1/2 overflow-y-auto px-4 lg:px-8 pb-5 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <div className="text-center py-4">
            <h1 className="text-2xl font-bold text-primary">{data.numeroOrden}</h1>
          </div>

          <div className="space-y-6 px-4 lg:px-8">
            <h2 className="text-2xl font-bold text-black">{estadoTraducido}</h2>
            <div className="space-y-10">
              {[...historial].reverse().map((item, index, arr) => (
                <div key={index} className="flex items-start gap-4 relative">
                  {index !== arr.length - 1 && (
                    <div className="absolute left-[15.5px] top-[34px] h-[36px] w-px bg-gray-300" />
                  )}
                  <div className={cn(
                    "relative z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 flex-shrink-0",
                    "bg-primary border-primary"
                  )}>
                    <CheckCircle2 className="h-5 w-5 text-primary-foreground" />
                  </div>
                  <div className="flex-1 flex justify-between items-start pt-1">
                    <p className="text-base text-foreground">{item.estado}</p>
                    <p className="text-sm text-muted-foreground">{item.fecha}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Card className="border-none shadow-none mb-8">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <div className="p-4">
                <TabsList className="grid w-full grid-cols-2 bg-transparent border-b border-border h-12 rounded-none p-0">
                  <TabsTrigger 
                    value="informacion" 
                    className="data-[state=active]:border-b-[3px] data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:shadow-none h-12 rounded-none bg-transparent px-1 text-base font-normal transition-all data-[state=inactive]:text-muted-foreground data-[state=active]:bg-transparent"
                  >
                    Información
                  </TabsTrigger>
                  <TabsTrigger 
                    value="archivos" 
                    className="data-[state=active]:border-b-[3px] data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:shadow-none h-12 rounded-none bg-transparent px-1 text-base font-normal transition-all data-[state=inactive]:text-muted-foreground data-[state=active]:bg-transparent"
                  >
                    Prueba de entrega
                  </TabsTrigger>
                </TabsList>
              </div>

              <CardContent className="p-6">
                <TabsContent value="informacion" className="space-y-4 -mt-3">
                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                      Información
                    </h3>
                    <div className="space-y-5">
                      <div className="flex items-center gap-1">
                        <div className="flex h-10 w-10 items-center justify-center flex-shrink-0">
                          <FileText className="size-5 text-gray-500" />
                        </div>
                        <div>
                          <p className="text-[11px] text-muted-foreground font-medium">Orden</p>
                          <p className="text-base font-semibold text-[#1e293b]">{data.numeroOrden.split('-').pop()}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        <div className="flex h-10 w-10 items-center justify-center flex-shrink-0">
                          <CheckCircle2 className="size-5 text-gray-500" />
                        </div>
                        <div>
                          <p className="text-[11px] text-muted-foreground font-medium">Estado</p>
                          <p className="text-base font-semibold text-[#1e293b]">{estadoTraducido}</p>
                        </div>
                      </div>

                      {data.fechaRuta && (
                        <div className="flex items-center gap-1">
                          <div className="flex h-10 w-10 items-center justify-center flex-shrink-0">
                            <Calendar className="size-5 text-gray-500" />
                          </div>
                          <div>
                            <p className="text-[11px] text-muted-foreground font-medium">Fecha de entrega</p>
                            <p className="text-base font-semibold text-[#1e293b]">{formatFecha(data.fechaRuta)}</p>
                          </div>
                        </div>
                      )}

                      <div className="flex items-center gap-1">
                        <div className="flex h-10 w-10 items-center justify-center flex-shrink-0">
                          <User className="size-5 text-gray-500" />
                        </div>
                        <div>
                          <p className="text-[11px] text-muted-foreground font-medium">Nombre cliente</p>
                          <p className="text-base font-semibold text-[#1e293b]">{data.nombreCliente || "—"}</p>
                        </div>
                      </div>

                      {data.contactoTelefono && (
                        <div className="flex items-center gap-1">
                          <div className="flex h-10 w-10 items-center justify-center flex-shrink-0">
                            <Phone className="size-5 text-gray-500" />
                          </div>
                          <div>
                            <p className="text-[11px] text-muted-foreground font-medium">Teléfono</p>
                            <p className="text-base font-semibold text-[#1e293b]">{data.contactoTelefono}</p>
                          </div>
                        </div>
                      )}

                      {data.contactoEmail && (
                        <div className="flex items-center gap-1">
                          <div className="flex h-10 w-10 items-center justify-center flex-shrink-0">
                            <Mail className="size-5 text-gray-500" />
                          </div>
                          <div>
                            <p className="text-[11px] text-muted-foreground font-medium">Email</p>
                            <p className="text-base font-semibold text-[#1e293b]">{data.contactoEmail}</p>
                          </div>
                        </div>
                      )}

                      {data.direccionLinea && (
                        <div className="flex items-center gap-1">
                          <div className="flex h-10 w-10 items-center justify-center flex-shrink-0">
                            <MapPin className="size-5 text-gray-500" />
                          </div>
                          <div>
                            <p className="text-[11px] text-muted-foreground font-medium">Dirección de destino</p>
                            <p className="text-base font-semibold text-[#1e293b]">{data.direccionLinea}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {data.conductorNombre && (
                    <div className="space-y-3 pt-4 border-t">
                      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                        Conductor
                      </h3>
                      <div className="flex items-center gap-1">
                        <div className="flex h-10 w-10 items-center justify-center">
                          <User className="size-5 text-gray-500" />
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-base text-[#1e293b]">{data.conductorNombre}</p>
                          {data.conductorTelefono && (
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <Phone className="size-3" />
                              {data.conductorTelefono}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="archivos" className="mt-0">
                  <div className="flex items-center justify-center py-16 text-muted-foreground">
                    <div className="text-center space-y-2">
                      <FileText className="size-10 mx-auto" />
                      <p className="text-sm">Prueba de entrega no disponible aún</p>
                      <p className="text-xs">Se mostrará cuando el pedido sea entregado.</p>
                    </div>
                  </div>
                </TabsContent>
              </CardContent>
            </Tabs>
          </Card>
        </div>

        <div className="w-full lg:w-1/2 h-full overflow-hidden relative">
          <div ref={containerRef} className="h-full w-full" />

          <div className="absolute left-2 top-2 z-10">
            <select
              value={mapStyle}
              onChange={(e) => handleStyleChange(e.target.value as PromssacMapStyleKey)}
              className="rounded-md border border-border bg-background/95 px-2 py-1.5 text-xs text-foreground shadow-sm backdrop-blur-sm"
            >
              {Object.entries(MAP_STYLE_LABELS).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnlaceCliente;
