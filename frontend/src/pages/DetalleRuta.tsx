import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { 
  ChevronRight, 
  Edit3, 
  Plus, 
  MapPin, 
  Package, 
  User, 
  Filter, 
  CreditCard,
  RotateCcw
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
import { useMobileUserRouteOptionsQuery, useVehicleOptionsQuery } from "@/hooks/useOperationsQueries";
import { routesApi } from "@/services";
import { useQueryClient } from "@tanstack/react-query";
import type { Route } from "@/domain/routes";
import { MapContainer, TileLayer } from "react-leaflet";
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

  useEffect(() => {
    if (id) {
      routesApi.get(id)
        .then(setRoute)
        .catch(console.error)
        .finally(() => setLoading(false));
    }
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
                <span>Pedidos: <span className="text-foreground font-semibold">{route.dispatchTotal}</span></span>
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
           <Select defaultValue="all">
             <SelectTrigger className="w-[180px] bg-white border border-border h-10 text-muted-foreground shadow-sm focus:ring-1 focus:ring-primary/20">
               <SelectValue placeholder="Estado" />
             </SelectTrigger>
             <SelectContent>
               <SelectItem value="all">Estado</SelectItem>
               <SelectItem value="delivered">Entregado</SelectItem>
               <SelectItem value="pending">Pendiente</SelectItem>
             </SelectContent>
           </Select>

           <div className="relative flex-1 max-w-md">
             <Input 
              placeholder="Número de pedido" 
              className="w-full bg-white border border-border h-10 pl-4 pr-10 shadow-sm focus-visible:ring-1 focus-visible:ring-primary/20"
             />
           </div>

           <Button variant="outline" className="bg-primary-soft border-none text-primary hover:bg-primary-soft/80 h-10 px-6 font-bold flex gap-2 shadow-sm">
             <Filter className="size-4" /> Filtrar
           </Button>

           <Button variant="outline" className="bg-zinc-100 border-none text-zinc-500 hover:bg-zinc-200 h-10 w-10 p-0 shadow-sm">
             <RotateCcw className="size-4" />
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
                      <th className="px-6 py-4 w-10">
                        <div className="size-4 rounded border border-zinc-300 bg-white" />
                      </th>
                      <th className="px-4 py-4">Pedido</th>
                      <th className="px-4 py-4">Estado</th>
                      <th className="px-4 py-4">Contacto</th>
                      <th className="px-4 py-4">Hora estimada</th>
                      <th className="px-4 py-4">Hora real</th>
                      <th className="px-4 py-4">Dirección</th>
                      <th className="px-4 py-4">Artículos</th>
                      <th className="px-4 py-4 text-right pr-6">Cobro</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td colSpan={9} className="py-24 text-center">
                        <div className="flex flex-col items-center gap-5">
                           <div className="size-20 rounded-full bg-primary-soft/20 flex items-center justify-center border border-primary-soft/50">
                              <Package className="size-10 text-primary opacity-40" />
                           </div>
                           <p className="text-zinc-400 font-medium text-lg">No se han encontrado resultados</p>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
          </TabsContent>

          <TabsContent value="mapa" className="m-0 p-0 outline-none flex-1 flex bg-white rounded-xl shadow-sm border border-zinc-200 overflow-hidden data-[state=inactive]:hidden">
              <div className="w-[300px] border-r border-zinc-200 flex flex-col bg-zinc-50/50 shrink-0">
                 <div className="bg-zinc-50 px-6 py-4 text-zinc-600 font-bold uppercase text-[11px] tracking-wider border-b border-zinc-200 flex items-center gap-2">
                    <div className="size-4 rounded border border-zinc-300 bg-white" />
                    Pedido
                 </div>
                 <div className="flex-1 flex flex-col items-center justify-center p-8 text-center gap-5">
                    <div className="size-16 rounded-full bg-primary-soft/20 flex items-center justify-center border border-primary-soft/50">
                      <Package className="size-8 text-primary opacity-40" />
                    </div>
                    <p className="text-zinc-400 font-medium text-sm">No se han encontrado resultados</p>
                 </div>
              </div>
              <div className="flex-1 relative h-full">
                 <MapContainer 
                  center={[-12.046374, -77.042793]} 
                  zoom={13} 
                  className="h-full w-full z-0"
                  scrollWheelZoom={false}
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                </MapContainer>
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
        onCreated={() => qc.invalidateQueries({ queryKey: ["routes"] })}
      />
    </div>
  );
};

export default DetalleRuta;
