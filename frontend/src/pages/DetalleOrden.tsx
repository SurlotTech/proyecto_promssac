import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  ChevronDown,
  ClipboardCopy,
  Clock,
  FileEdit,
  GitBranch,
  Image as ImageIcon,
  Info,
  Mail,
  MapPin,
  Package,
  Paperclip,
  Phone,
  Plus,
  Star,
  Truck,
  User,
  XCircle,
} from "lucide-react";
import { motion, useAnimation, useInView } from "framer-motion";
import { MapContainer, TileLayer, Marker } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix for leaflet marker icons
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

// @ts-expect-error _getIconUrl is an internal property
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { orderStatusMeta, type OrderStatus } from "@/domain/orders";
import OrderStatusBadge from "@/components/orders/OrderStatusBadge";
import { useOrdersQuery, useRoutesQuery } from "@/hooks/useOperationsQueries";
import { persistOrderDraft, type OrderCreationDraft, type OrderCompletarLocationState } from "@/lib/orderCreationDraft";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type TimelineEvent = {
  id: string;
  title: string;
  time: string;
  user: string;
};

/** Cuando el backend exponga auditoría, reemplazar por datos reales. */
const ORDER_TIMELINE_PLACEHOLDER: { dateLabel: string; events: TimelineEvent[] }[] = [];

const DetalleOrden = () => {
  const { orderId = "" } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const decodedId = decodeURIComponent(orderId);
  const { data: allOrdersFromQuery = [], isLoading } = useOrdersQuery();
  const { data: routeCatalog = [] } = useRoutesQuery();

  const allOrders = useMemo(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const mockOrder: any = {
      id: "11073 LLIPYARAQ MICAELA BASTIDAS",
      clientName: "11073 LLIPYARAQ MICAELA BASTIDAS",
      contactName: "Micaela Bastidas",
      contactIdentifier: "DNI 12345678",
      status: "delivered",
      substatus: "Recepcionado Conforme",
      routeDate: "12/12/2025",
      routeDateIso: "2025-12-12",
      createdAtIso: "2025-12-12T10:00:00Z",
      vehiclePlate: "BHT-734",
      routeId: "route-1",
      isLastDispatch: true,
      address: "SHANKAPAMPA",
      email: "micaela@example.com",
      phone: "968909932",
      camposPersonalizados: {
        "DIRECTOR": "CRONWEL CALDERON PURIHUAMAN",
        "CAJA M": "9",
        "CAJA S": "5",
        "CAJA AC": "1",
        "ACTA DE ENTREGA": "2769",
        "GUIA DE REMISION": "0003-3681"
      }
    };
    return [mockOrder, ...allOrdersFromQuery];
  }, [allOrdersFromQuery]);

  const order = useMemo(
    () => allOrders.find((o) => o.id === decodedId),
    [allOrders, decodedId],
  );

  const [resumenOpen, setResumenOpen] = useState(true);
  const [camposOpen, setCamposOpen] = useState(true);
  const [itemsOpen, setItemsOpen] = useState(true);
  const [comentariosOpen, setComentariosOpen] = useState(true);
  const [comentarioPublico, setComentarioPublico] = useState(false);

  const [modifyStatusOpen, setModifyStatusOpen] = useState(false);
  const [modifyForm, setModifyForm] = useState({
    dispatchCenter: "",
    status: "",
    substatus: "",
  });

  const timelineColor = "rgb(59, 130, 246)"; // Color azul estático profesional

  const timelineEvents = [
    {
      id: "1",
      date: "viernes 12 de diciembre de 2025",
      type: "gestion",
      title: "Gestión de orden",
      time: "20:01",
      location: "SHANKAPAMPA",
      driver: "EMERSON JEAN TINEO DURAN",
      vehicle: "BHT-734",
      status: "delivered",
      substatus: "Recepcionado Conforme",
      metrics: "Tiempo de entrega: 288 minutos",
      milestones: [
        { label: "Llegué 19:58, 80009 mts", color: "blue" },
        { label: "Gestionado 20:01, 80006 mts", color: "blue" }
      ],
      items: [
        { name: "CAJAS", current: 15, total: 15 }
      ],
      photos: [
        { title: "Foto del frontis de la IE", src: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=300&h=200&fit=crop" },
      ],
      receptionist: "Cronwel Purihuaman Calderón"
    },
    {
      id: "2",
      type: "status",
      title: "Llegué",
      time: "19:37",
      driver: "EMERSON JEAN TINEO DURAN",
      vehicle: "BHT-734",
      status: "pending"
    },
    {
      id: "3",
      type: "status",
      title: "En ruta a destino",
      time: "15:12",
      vehicle: "BHT-734",
      status: "pending"
    },
    {
      id: "4",
      type: "status",
      title: "Asignado en vehículo",
      time: "15:07",
      driver: "JESUS FELICITA VELASQUEZ VASQUEZ",
      vehicle: "BHT-734",
      status: "pending"
    }
  ];

  const goToCompletarDatos = useCallback(() => {
    if (!order) return;
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
  }, [navigate, order, routeCatalog]);

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center p-12 text-sm text-muted-foreground animate-fade-in">
        Cargando orden…
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 bg-background p-8 animate-fade-in">
        <p className="text-center text-muted-foreground">No se encontró la orden solicitada.</p>
        <Button asChild variant="outline">
          <Link to="/ordenes">Volver a órdenes</Link>
        </Button>
      </div>
    );
  }

  const copyId = async () => {
    try {
      await navigator.clipboard.writeText(order.id);
      toast.success("ID copiado al portapapeles");
    } catch {
      toast.error("No se pudo copiar");
    }
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-background animate-fade-in">
      {/* Cabecera */}
      <header className="sticky top-0 z-10">
        <div className="flex flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
            <div className="min-w-0">
              <nav className="flex flex-wrap items-center gap-x-1 text-m text-muted-foreground">
                <Link to="/ordenes" className="hover:text-foreground">
                  Órdenes
                </Link>
                <span aria-hidden>/</span>
                <span className="font-semibold text-foreground">{order.id}</span>
              </nav>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            
            <Button variant="outline" size="sm" className="h-9 gap-2 font-medium" onClick={goToCompletarDatos}>
              <FileEdit className="size-4" />
              Modificar datos
            </Button>
            <Button size="sm" className="h-9 gap-2 shadow-glow" onClick={() => setModifyStatusOpen(true)}>
              <GitBranch className="size-4" />
              Modificar estado
            </Button>
          </div>
        </div>
      </header>

      <div className="flex flex-1 flex-col lg:flex-row overflow-y-auto custom-scrollbar bg-background">
        {/* Columna izquierda (Sidebar) */}
        <aside className="w-full shrink-0 border-b border-border bg-background lg:w-96 xl:w-[400px] lg:border-b-0">
          <div className="space-y-4 p-4">
            {/* Resumen */}
            <Collapsible open={resumenOpen} onOpenChange={setResumenOpen}>
              <section className="overflow-hidden rounded-l border border-border bg-card shadow-sm">
                <div className="flex w-full items-center justify-between gap-2 px-4 py-3 text-left">
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Resumen</h3>
                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-slate-100 transition-colors">
                      <ChevronDown className={cn("size-4 text-slate-500 transition-transform duration-200", resumenOpen && "rotate-180")} />
                    </Button>
                  </CollapsibleTrigger>
                </div>
                <div className="h-px bg-slate-100 mx-4" />
                <CollapsibleContent>
                  <div className="p-4 space-y-4">
                    <div>
                      <p className="text-xs font-medium text-foreground">Nombre</p>
                      <p className="text-sm text-primary underline underline-offset-4 decoration-primary/30">{order.clientName}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-foreground">Teléfono</p>
                      <p className="text-sm text-muted-foreground">{order.phone || "968909932"}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-foreground">Dirección</p>
                      <p className="text-sm text-muted-foreground">{order.address || "SHANKAPAMPA"}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs font-medium text-foreground">Núm. Intentos</p>
                        <p className="text-sm text-muted-foreground">1</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-foreground">Último estado</p>
                      <div className="mt-1 flex flex-wrap items-center gap-2">
                        <OrderStatusBadge status={order.status} />
                        <span className="text-[10px] text-slate-500 uppercase tracking-wider">{order.substatus}</span>
                      </div>
                    </div>
                  </div>
                </CollapsibleContent>
              </section>
            </Collapsible>

            {/* Campos personalizados */}
            <Collapsible open={camposOpen} onOpenChange={setCamposOpen}>
              <section className="overflow-hidden rounded-l border border-border bg-card shadow-sm">
                <div className="flex w-full items-center justify-between gap-2 px-4 py-3 text-left">
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Campos personalizados</h3>
                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-slate-100 transition-colors">
                      <ChevronDown className={cn("size-4 text-slate-500 transition-transform duration-200", camposOpen && "rotate-180")} />
                    </Button>
                  </CollapsibleTrigger>
                </div>
                <div className="h-px bg-slate-100 mx-4" />
                <CollapsibleContent>
                  <div className="p-4 space-y-4">
                    {order.camposPersonalizados && Object.entries(order.camposPersonalizados).map(([key, val]) => (
                      <div key={key}>
                        <p className="text-xs font-medium text-foreground">{key}</p>
                        <p className="text-sm text-muted-foreground">{val as React.ReactNode}</p>
                      </div>
                    ))}
                  </div>
                </CollapsibleContent>
              </section>
            </Collapsible>

            {/* Ítems */}
            <Collapsible open={itemsOpen} onOpenChange={setItemsOpen}>
              <section className="overflow-hidden rounded-l border border-border bg-card shadow-sm">
                <div className="flex w-full items-center justify-between gap-2 px-4 py-3 text-left">
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Ítems</h3>
                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-slate-100 transition-colors">
                      <ChevronDown className={cn("size-4 text-slate-500 transition-transform duration-200", itemsOpen && "rotate-180")} />
                    </Button>
                  </CollapsibleTrigger>
                </div>
                <div className="h-px bg-slate-100 mx-4" />
                <CollapsibleContent>
                  <div className="p-4 space-y-4">

                      <div>
                        <p className="text-xs font-medium text-foreground">Nombre</p>
                        <p className="text-sm text-muted-foreground">CAJAS</p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-foreground">Total unidades</p>
                        <p className="text-sm text-muted-foreground">15</p>
                      </div>


                      <div>
                        <p className="text-xs font-medium text-foreground">Código</p>
                        <p className="text-sm text-muted-foreground">-</p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-foreground">Precio</p>
                        <p className="text-sm text-muted-foreground">0.0</p>
                      </div>

                  </div>
                </CollapsibleContent>
              </section>
            </Collapsible>

            {/* Comentarios */}
            <Collapsible open={comentariosOpen} onOpenChange={setComentariosOpen}>
              <section className="overflow-hidden rounded-l border border-border bg-card shadow-sm">
                <div className="flex w-full items-center justify-between gap-2 px-4 py-3 text-left">
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Comentarios (0)</h3>
                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-slate-100 transition-colors">
                      <ChevronDown className={cn("size-4 text-slate-500 transition-transform duration-200", comentariosOpen && "rotate-180")} />
                    </Button>
                  </CollapsibleTrigger>
                </div>
                <div className="h-px bg-slate-100 mx-4" />
                <CollapsibleContent>
                  <div className="p-4 space-y-4">
                    <Textarea 
                      placeholder="Tu comentario ..." 
                      className="min-h-[120px] resize-none bg-white border-slate-200 text-sm focus-visible:ring-1 focus-visible:ring-blue-500 rounded-xl placeholder:text-slate-400" 
                    />
                    <div className="flex gap-2 pt-1">
                      <Button variant="outline" size="sm" className="flex-1 justify-center gap-1.5 h-10 border-slate-200 text-slate-500 font-bold text-[10px] rounded-xl hover:bg-slate-50 uppercase px-2 bg-transparent">
                        Adjuntar
                      </Button>
                      <Button variant="outline" size="sm" className="flex-[1.5] gap-1.5 h-10 border-red-200 text-red-600 font-bold text-[10px] rounded-xl hover:bg-red-50 uppercase px-2 bg-transparent shadow-none">
                        Guardar comentario
                      </Button>
                    </div>
                  </div>
                </CollapsibleContent>
              </section>
            </Collapsible>
          </div>
        </aside>

        {/* Cuerpo Principal (Timeline Estilo Zig-Zag) */}
        <main className="flex-1 p-0 md:p-4 lg:p-6">
          <div className="w-full relative py-10">
            {/* Línea central dinámica */}
            <div 
              className="absolute left-1/2 transform -translate-x-1/2 w-1 top-0 bottom-0 transition-colors duration-1000 ease-in-out z-0 hidden md:block" 
              style={{ backgroundColor: timelineColor }}
            />

            <div className="space-y-12 relative z-10">
              {timelineEvents.map((event, index) => (
                <TimelineCard
                  key={event.id}
                  event={event}
                  index={index}
                  timelineColor={timelineColor}
                />
              ))}
            </div>
          </div>
        </main>
      </div>

      <Dialog open={modifyStatusOpen} onOpenChange={setModifyStatusOpen}>
        <DialogContent className="p-0 sm:max-w-lg overflow-hidden border-none shadow-2xl">
          <DialogHeader className="p-6 border-b border-border bg-white">
            <DialogTitle className="text-xl font-bold text-foreground">
              Modificar estado
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground leading-relaxed">
              Actualiza el centro de despacho, estado y subestado de la orden.
            </DialogDescription>
          </DialogHeader>

          <div className="p-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="dispatch-center" className="text-sm font-semibold text-muted-foreground">
                Centro de despacho
              </Label>
              <Select
                value={modifyForm.dispatchCenter}
                onValueChange={(v) => setModifyForm((f) => ({ ...f, dispatchCenter: v }))}
              >
                <SelectTrigger id="dispatch-center" className="h-10">
                  <SelectValue placeholder="Seleccionar centro" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cd-principal">CD Principal</SelectItem>
                  <SelectItem value="cd-norte">CD Norte</SelectItem>
                  <SelectItem value="cd-sur">CD Sur</SelectItem>
                  <SelectItem value="cd-centro">CD Centro</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status" className="text-sm font-semibold text-muted-foreground">
                Estado
              </Label>
              <Select
                value={modifyForm.status}
                onValueChange={(v) => setModifyForm((f) => ({ ...f, status: v }))}
              >
                <SelectTrigger id="status" className="h-10">
                  <SelectValue placeholder="Seleccionar estado" />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(orderStatusMeta) as OrderStatus[]).map((s) => (
                    <SelectItem key={s} value={s}>
                      {orderStatusMeta[s].label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="substatus" className="text-sm font-semibold text-muted-foreground">
                Subestado
              </Label>
              <Select
                value={modifyForm.substatus}
                onValueChange={(v) => setModifyForm((f) => ({ ...f, substatus: v }))}
              >
                <SelectTrigger id="substatus" className="h-10">
                  <SelectValue placeholder="Seleccionar subestado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="entrega-terceros">Entrega Terceros</SelectItem>
                  <SelectItem value="entrega-cliente">Entrega Cliente</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter className="border-t border-border bg-zinc-50/50 p-6 sm:justify-end gap-3 shrink-0">
            <Button
              variant="outline"
              onClick={() => setModifyStatusOpen(false)}
              className="h-10 px-5 font-semibold border-zinc-300 text-zinc-600 hover:bg-white"
            >
              Cancelar
            </Button>
            <Button
              onClick={() => {
                toast.success("Estado modificado correctamente");
                setModifyStatusOpen(false);
                setModifyForm({ dispatchCenter: "", status: "", substatus: "" });
              }}
              className="h-10 px-5 font-semibold"
            >
              Guardar cambios
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const TimelineCard = ({ event, index, timelineColor }: { event: any, index: number, timelineColor: string }) => {
  const cardRef = useRef(null);
  const isInView = useInView(cardRef, { once: true, margin: "-100px" });
  const controls = useAnimation();

  useEffect(() => {
    if (isInView) {
      controls.start("visible");
    }
  }, [isInView, controls]);

  const cardVariants: import("framer-motion").Variants = {
    hidden: { 
      opacity: 0,
      x: index % 2 === 0 ? -50 : 50,
      y: 20
    },
    visible: {
      opacity: 1,
      x: 0,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };

  const isGestion = event.type === "gestion";

  return (
    <motion.div
      ref={cardRef}
      variants={cardVariants}
      initial="hidden"
      animate={controls}
      className={cn(
        "flex flex-col md:flex-row items-center w-full mb-8",
        index % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
      )}
    >
      {/* Contenido del Card */}
      <div className="w-full md:w-1/2 px-4">
        {isGestion ? (
          <section className="bg-white rounded-l border border-slate-200 overflow-hidden transition-all duration-300">
            <div className="p-5">
              <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                <h3 className="text-xl font-medium text-slate-800">Gestión de orden</h3>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-black border border-emerald-200 uppercase">Entregado</span>
                  <span className="text-[10px] font-black text-slate-500 uppercase">Recepcionado Conforme</span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-[11px] font-bold text-slate-500 mb-4 uppercase tracking-tight">
                <span className="flex items-center gap-1.5"><Clock className="size-3.5 text-blue-500" /> {event.metrics}</span>
                <span className="flex items-center gap-1.5"><User className="size-3.5 text-blue-500" /> {event.driver}</span>
                <span className="flex items-center gap-1.5"><Truck className="size-3.5 text-blue-500" /> {event.vehicle}</span>
              </div>

              {/* Mapa */}
              <div className="h-[220px] w-full rounded-l overflow-hidden border border-slate-100 mb-6 relative">
                <MapContainer center={[-8.1118, -79.0287]} zoom={12} style={{ height: "100%", width: "100%" }} zoomControl={false}>
                  <TileLayer url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" />
                  <Marker position={[-8.1118, -79.0287]} />
                </MapContainer>
              </div>

              <div className="space-y-6">
                <div>
                  <h4 className="text-[11px] font-black text-slate-600 uppercase tracking-widest mb-3">Cumplimiento</h4>
                  <div className="flex flex-wrap gap-2">
                    {(event.items as { name: string; current: number; total: number }[])?.map((item, i: number) => (
                      <div key={i} className="px-3 py-1.5 rounded-full border border-emerald-100 bg-emerald-50/50 text-emerald-700 text-[10px] font-black uppercase">
                        {item.name}: {item.current}/{item.total}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-50">
                  <h4 className="text-[11px] font-black text-slate-600 uppercase tracking-widest mb-3">Pruebas</h4>
                  <div className="space-y-4">
                    <div className="flex justify-between items-start">
                      <p className="text-[10px] text-slate-400 font-bold uppercase">Persona receptora</p>
                      <p className="text-xs font-black text-slate-700">{event.receptionist}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      {(event.photos as { title: string; src: string }[])?.map((photo, i: number) => (
                        <div key={i} className="space-y-1.5">
                          <p className="text-[9px] text-slate-400 font-bold uppercase truncate">{photo.title}</p>
                          <div className="aspect-video rounded-l overflow-hidden border border-slate-100">
                            <img src={photo.src} alt={photo.title} className="w-full h-full object-cover" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        ) : (
          <section className="bg-white rounded-l border border-slate-200 p-5 transition-all duration-300">
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-slate-800">{event.title}</h3>
                <span className="px-2 py-0.5 rounded-full border border-slate-100 text-slate-400 text-[9px] font-medium uppercase tracking-widest">Pendiente</span>
              </div>
              <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[11px] font-bold text-slate-500 uppercase tracking-tight">
                <span className="flex items-center gap-1.5"><Clock className="size-3.5 text-blue-500" /> {event.time}</span>
                {event.driver && <span className="flex items-center gap-1.5"><User className="size-3.5 text-blue-500" /> {event.driver}</span>}
              </div>
            </div>
          </section>
        )}
      </div>

      {/* Punto central del timeline */}
      <div className="w-10 flex justify-center relative z-20 my-4 md:my-0">
        <div 
          className="w-5 h-5 rounded-full border-4 border-white shadow-lg transition-colors duration-1000 ease-in-out"
          style={{ backgroundColor: timelineColor }}
        />
      </div>

      {/* Espaciador para el zig-zag */}
      <div className="hidden md:block md:w-1/2" />
    </motion.div>
  );
};

export default DetalleOrden;
