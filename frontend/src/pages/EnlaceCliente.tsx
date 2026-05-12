import React, { useState } from "react";
import { CheckCircle2, Circle, Package, Truck, MapPin, Phone, Mail, User, FileText, Paperclip, ClipboardList, Car, Navigation, PackageCheck, Calendar, Plus, Minus, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// @ts-expect-error _getIconUrl is an internal property
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

const mockOrderData = {
  orderNumber: "ORD-2026-001",
  historial: [
    { estado: "Ingresado a sistema", fecha: "18/11/2025 19:14", completado: true },
    { estado: "Asignado a vehículo", fecha: "19/11/2025 06:31", completado: true },
    { estado: "En ruta", fecha: "20/11/2025 14:41", completado: true },
    { estado: "Entrega exitosa", fecha: "12/12/2025 15:07", completado: true },
  ],
  orden: {
    pedidoEl: "05 May 2026",
    fechaGestion: "06 May 2026",
    nombreCliente: "Juan Pérez",
    celular: "+51 912 345 678",
    email: "juan.perez@ejemplo.pe",
    direccionDestino: "Av. Javier Prado 1234, Lima, Perú",
  },
  conductor: {
    nombre: "Carlos Mendoza",
    telefono: "+51 987 654 321",
  },
  items: {
    cajas: "10/15",
    total: "10/15",
  },
};

const EnlaceCliente = () => {
  const [activeTab, setActiveTab] = useState("informacion");
  const currentStatus = mockOrderData.historial.filter(h => h.completado).pop()?.estado || "Sin estado";

  const getStatusIcon = (estado: string) => {
    const lowerEstado = estado.toLowerCase();
    if (lowerEstado.includes("ingresado") || lowerEstado.includes("sistema")) return ClipboardList;
    if (lowerEstado.includes("asignado") || lowerEstado.includes("vehículo")) return Car;
    if (lowerEstado.includes("ruta")) return Navigation;
    if (lowerEstado.includes("entrega") || lowerEstado.includes("exitosa")) return PackageCheck;
    return Package;
  };

  return (
    <div className="h-screen bg-transparent animate-fade-in overflow-hidden">
      <div className="flex w-full h-full lg:flex-row">
        {/* Columna Izquierda - Información */}
        <div className="w-full space-y-6 lg:w-1/2 overflow-y-auto px-4 lg:px-8 pb-5 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {/* Número de Orden Centrado */}
          <div className="text-center py-4">
            <h1 className="text-2xl font-bold text-primary">{mockOrderData.orderNumber}</h1>
          </div>

          {/* Historial del Proceso */}
          <div className="space-y-6 px-4 lg:px-8">
            <h2 className="text-2xl font-bold text-black">{currentStatus}</h2>
            <div className="space-y-10">
              {[...mockOrderData.historial].reverse().map((item, index, arr) => (
                <div key={index} className="flex items-start gap-4 relative">
                  {index !== arr.length - 1 && (
                    <div className="absolute left-[15.5px] top-[34px] h-[36px] w-px bg-gray-300" />
                  )}
                  <div
                    className={cn(
                      "relative z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 flex-shrink-0",
                      item.completado
                        ? "bg-primary border-primary"
                        : "bg-transparent border-border"
                    )}
                  >
                    {item.completado ? (
                      React.createElement(getStatusIcon(item.estado), { className: "h-5 w-5 text-primary-foreground" })
                    ) : (
                      <Circle className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1 flex justify-between items-start pt-1">
                    <p className={cn(
                      "text-base",
                      item.completado ? "text-foreground" : "text-muted-foreground"
                    )}>
                      {item.estado}
                    </p>
                    <p className="text-sm text-muted-foreground">{item.fecha}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Card con Tabs */}
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
                  {/* Información de la Orden */}
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
                          <p className="text-base font-semibold text-[#1e293b]">{mockOrderData.orderNumber.split('-').pop()}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        <div className="flex h-10 w-10 items-center justify-center flex-shrink-0">
                          <CheckCircle2 className="size-5 text-gray-500" />
                        </div>
                        <div>
                          <p className="text-[11px] text-muted-foreground font-medium">Pedido el</p>
                          <p className="text-base font-semibold text-[#1e293b]">{mockOrderData.orden.pedidoEl}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        <div className="flex h-10 w-10 items-center justify-center flex-shrink-0">
                          <Calendar className="size-5 text-gray-500" />
                        </div>
                        <div>
                          <p className="text-[11px] text-muted-foreground font-medium">Fecha de gestión</p>
                          <p className="text-base font-semibold text-[#1e293b]">{mockOrderData.orden.fechaGestion}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        <div className="flex h-10 w-10 items-center justify-center flex-shrink-0">
                          <User className="size-5 text-gray-500" />
                        </div>
                        <div>
                          <p className="text-[11px] text-muted-foreground font-medium">Nombre cliente</p>
                          <p className="text-base font-semibold text-[#1e293b]">{mockOrderData.orden.nombreCliente}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        <div className="flex h-10 w-10 items-center justify-center flex-shrink-0">
                          <Phone className="size-5 text-gray-500" />
                        </div>
                        <div>
                          <p className="text-[11px] text-muted-foreground font-medium">Teléfono</p>
                          <p className="text-base font-semibold text-[#1e293b]">{mockOrderData.orden.celular}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        <div className="flex h-10 w-10 items-center justify-center flex-shrink-0">
                          <Mail className="size-5 text-gray-500" />
                        </div>
                        <div>
                          <p className="text-[11px] text-muted-foreground font-medium">Email</p>
                          <p className="text-base font-semibold text-[#1e293b]">{mockOrderData.orden.email}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        <div className="flex h-10 w-10 items-center justify-center flex-shrink-0">
                          <MapPin className="size-5 text-gray-500" />
                        </div>
                        <div>
                          <p className="text-[11px] text-muted-foreground font-medium">Dirección de destino</p>
                          <p className="text-base font-semibold text-[#1e293b]">{mockOrderData.orden.direccionDestino}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Información del Conductor */}
                  <div className="space-y-3 pt-4 border-t">
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                      Conductor
                    </h3>
                    <div className="flex items-center gap-1">
                      <div className="flex h-10 w-10 items-center justify-center">
                        <User className="size-5 text-gray-500" />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-base text-[#1e293b]">{mockOrderData.conductor.nombre}</p>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Phone className="size-3" />
                          {mockOrderData.conductor.telefono}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Items */}
                  <div className="space-y-3 pt-4 border-t">
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                      Items
                    </h3>
                    <div className="flex items-center justify-center gap-8 py-4">
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-2 mb-1">
                          <Package className="size-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">Cajas</span>
                        </div>
                        <p className="text-2xl font-bold text-primary">{mockOrderData.items.cajas}</p>
                      </div>
                      <div className="h-12 w-px bg-border" />
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-2 mb-1">
                          <span className="text-sm text-muted-foreground">Total</span>
                        </div>
                        <p className="text-2xl font-bold text-primary">{mockOrderData.items.total}</p>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="archivos" className="mt-0">
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { title: "Prueba 1 - Foto entrega", src: "https://picsum.photos/seed/proof1/400/300" },
                      { title: "Prueba 2 - Firmado", src: "https://picsum.photos/seed/proof2/400/300" },
                      { title: "Prueba 3 - Destino", src: "https://picsum.photos/seed/proof3/400/300" },
                      { title: "Prueba 4 - Checklist", src: "https://picsum.photos/seed/proof4/400/300" },
                    ].map((file, index) => (
                      <div key={index} className="space-y-2">
                        <div className="aspect-video rounded-lg overflow-hidden border border-border bg-muted">
                          <img
                            src={file.src}
                            alt={file.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <p className="text-xs text-center text-muted-foreground">{file.title}</p>
                      </div>
                    ))}
                  </div>
                </TabsContent>
              </CardContent>
            </Tabs>
          </Card>
        </div>

        {/* Columna Derecha - Mapa */}
        <div className="w-full lg:w-1/2 h-full overflow-hidden relative">
          <MapContainer 
            center={[-12.0464, -77.0428]} 
            zoom={14} 
            style={{ height: "100%", width: "100%" }}
            className="z-10"
          >
            <TileLayer
              attribution='&copy; <a href="https://carto.com/">CARTO</a>'
              url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
            />
            <Marker position={[-12.0464, -77.0428]}>
              <Popup>
                <div className="text-sm">
                  <p className="font-semibold">Ubicación de entrega</p>
                  <p className="text-muted-foreground text-xs">{mockOrderData.orden.direccionDestino}</p>
                </div>
              </Popup>
            </Marker>
          </MapContainer>
        </div>
      </div>
    </div>
  );
};

export default EnlaceCliente;