import { useCallback, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ChevronDown,
  ClipboardCopy,
  FileEdit,
  GitBranch,
  MapPin,
  Package,
  Phone,
  Truck,
  User,
} from "lucide-react";
import React, { useEffect, useRef } from "react";
import { motion, useAnimation, useInView } from "framer-motion";
import { 
  FaTruck, 
  FaRoute, 
  FaCheckCircle, 
  FaWarehouse,
  FaClock,
} from "react-icons/fa";


import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
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
import { Input } from "@/components/ui/input";
import { orderStatusMeta, type OrderStatus } from "@/domain/orders";
import OrderStatusBadge from "@/components/orders/OrderStatusBadge";
import {
  useOrderDetailQuery,
  useOrderProductLinesQuery,
  useRoutesQuery,
  useEstadosHijosPorClaveQuery,
} from "@/hooks/useOperationsQueries";
import {
  persistOrderDraft,
  type OrderCreationDraft,
  type OrderCompletarLocationState,
  type OrderProductsLocationState,
} from "@/lib/orderCreationDraft";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { ordersApi } from "@/services/orders.api";
import { comentariosApi, type ComentarioDto } from "@/services/comentarios.api";
import piexif from "piexifjs";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { customFieldLabels, type CustomFieldKey } from "@/lib/completarOrden/constants";

const EMPTY = "—";

function textoSeguro(val: string | null | undefined): string {
  const t = val?.trim();
  return t ? t : EMPTY;
}

function binaryStringToFile(binary: string, name: string): File {
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return new File([bytes], name, { type: "image/jpeg" });
}

async function injectarGpsEnExif(file: File, lat: number, lng: number): Promise<File> {
  if (file.type !== "image/jpeg") return file;
  const buf = await file.arrayBuffer();
  let binary = "";
  for (let i = 0; i < buf.byteLength; i++) binary += String.fromCharCode(new Uint8Array(buf)[i]);
  const exifDict = piexif.load(binary);
  exifDict.GPS = exifDict.GPS || {};
  exifDict.GPS[piexif.GPSIFD.GPSLatitudeRef] = lat >= 0 ? "N" : "S";
  exifDict.GPS[piexif.GPSIFD.GPSLatitude] = piexif.GPSHelper.degToDmsRational(Math.abs(lat));
  exifDict.GPS[piexif.GPSIFD.GPSLongitudeRef] = lng >= 0 ? "E" : "W";
  exifDict.GPS[piexif.GPSIFD.GPSLongitude] = piexif.GPSHelper.degToDmsRational(Math.abs(lng));
  return binaryStringToFile(piexif.insert(piexif.dump(exifDict), binary), file.name);
}

async function overlayLocationOnImage(file: File, lat: number, lng: number): Promise<File> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(img.src);
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0);

      const barHeight = Math.max(36, Math.round(img.height * 0.055));
      const fontSize = Math.max(13, Math.round(img.width * 0.032));
      const pad = Math.max(10, Math.round(img.width * 0.025));

      ctx.fillStyle = "rgba(0,0,0,0.55)";
      ctx.fillRect(0, img.height - barHeight, img.width, barHeight);

      ctx.font = `bold ${fontSize}px system-ui, sans-serif`;
      ctx.fillStyle = "#ffffff";
      ctx.textAlign = "left";
      ctx.textBaseline = "middle";
      ctx.fillText(`📍 ${lat.toFixed(6)}, ${lng.toFixed(6)}`, pad, img.height - barHeight / 2);

      canvas.toBlob(async (blob) => {
        if (!blob) { reject(new Error("Error al generar la imagen")); return; }
        let result = new File([blob], file.name, { type: "image/jpeg" });
        try { result = await injectarGpsEnExif(result, lat, lng); } catch { /* ok */ }
        resolve(result);
      }, "image/jpeg", 0.92);
    };
    img.onerror = () => { URL.revokeObjectURL(img.src); reject(new Error("Error al cargar la imagen")); };
    img.src = URL.createObjectURL(file);
  });
}

function formatIsoCreacion(iso: string | undefined): string | null {
  if (!iso?.trim()) return null;
  try {
    return format(parseISO(iso.trim()), "PPpp", { locale: es });
  } catch {
    return null;
  }
}

function formatoSoles(importe: number): string {
  return new Intl.NumberFormat("es-PE", {
    style: "currency",
    currency: "PEN",
    minimumFractionDigits: 2,
    maximumFractionDigits: 4,
  }).format(importe);
}


interface TimelineEvent {
  id: number;
  title: string;
  description: string;
  date: string;
  icon: React.ReactNode;
  isCompleted: boolean;
  color: string;
}

const TimelineCard = ({ event, index, timelineColor }: { event: TimelineEvent; index: number; timelineColor: string }) => {
  const cardRef = useRef(null);
  const isInView = useInView(cardRef, { once: true, margin: "-50px" });
  const controls = useAnimation();

  useEffect(() => {
    if (isInView) {
      controls.start("visible");
    }
  }, [isInView, controls]);

  const cardVariants = {
    hidden: { 
      opacity: 0,
      x: index % 2 === 0 ? -40 : 40,
      y: 20
    },
    visible: {
      opacity: 1,
      x: 0,
      y: 0,
      transition: {
        duration: 0.6,
        delay: index * 0.1
      }
    }
  };

  return (
    <motion.div
      ref={cardRef}
      variants={cardVariants}
      initial="hidden"
      animate={controls}
      className="relative flex flex-col sm:flex-row items-center w-full mb-12"
    >
      <div className={cn(
        "hidden sm:flex flex-1 px-8",
        index % 2 === 0 ? "justify-end" : "order-last justify-start"
      )}>
        <div className={cn(
          "bg-white rounded-2xl border border-zinc-200/60 p-6 shadow-sm transition-all duration-300 hover:shadow-md w-full max-w-2xl",
          !event.isCompleted && "opacity-60 grayscale-[0.5]"
        )}>
          <div className="flex items-center mb-4">
            <div className={cn(
              "size-12 rounded-2xl flex items-center justify-center text-white shadow-md",
              event.isCompleted ? "bg-primary" : "bg-zinc-200"
            )}>
              <div className="text-xl">{event.icon}</div>
            </div>
            <div className="ml-5 flex-1">
              <h3 className="text-lg font-bold text-foreground tracking-tight">{event.title}</h3>
              <p className="text-[12px] font-bold uppercase tracking-widest text-primary flex items-center gap-1.5 mt-1 opacity-80">
                <FaClock className="size-3" /> {event.date}
              </p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {event.description}
          </p>
        </div>
      </div>

      <div className="flex justify-center w-12 z-10 shrink-0">
        <div 
          className={cn(
            "size-6 rounded-full border-4 border-white shadow-lg transition-colors duration-1000 ease-in-out",
            !event.isCompleted && "border-zinc-50"
          )}
          style={{ backgroundColor: event.isCompleted ? timelineColor : "#e2e8f0" }}
        />
      </div>

      <div className={cn(
        "flex-1 px-4 sm:px-8",
        index % 2 === 0 ? "" : "sm:order-first"
      )}>
        <div className={cn(
          "sm:hidden bg-white rounded-2xl border border-zinc-200/60 p-6 shadow-sm mb-6",
          !event.isCompleted && "opacity-60 grayscale-[0.5]"
        )}>
           <div className="flex items-center mb-4">
            <div className={cn(
              "size-10 rounded-xl flex items-center justify-center text-white shadow-sm",
              event.isCompleted ? "bg-primary" : "bg-zinc-200"
            )}>
              <div className="text-lg">{event.icon}</div>
            </div>
            <div className="ml-4">
              <h3 className="text-base font-bold text-foreground tracking-tight">{event.title}</h3>
              <p className="text-[11px] font-bold text-primary uppercase tracking-widest mt-0.5">{event.date}</p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {event.description}
          </p>
        </div>
      </div>
    </motion.div>
  );
};

const OrderTimeline = ({ order }: { order: any }) => {
  const [timelineColor, setTimelineColor] = React.useState("rgb(59, 130, 246)");

  useEffect(() => {
    const interval = setInterval(() => {
      const colors = [
        "rgb(59, 130, 246)",
        "rgb(16, 185, 129)",
        "rgb(245, 158, 11)",
        "rgb(139, 92, 246)",
        "rgb(236, 72, 153)",
      ];
      setTimelineColor(colors[Math.floor(Math.random() * colors.length)]);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const events: TimelineEvent[] = useMemo(() => {
    const list: TimelineEvent[] = [];
    
    list.push({
      id: 1,
      title: "Registro en sistema",
      description: "La orden ha sido creada exitosamente y se encuentra en espera de programación.",
      date: order.createdAtIso ? formatIsoCreacion(order.createdAtIso) || "Hoy" : "Hoy",
      icon: <FaWarehouse />,
      isCompleted: true,
      color: "blue"
    });

    const hasVehicle = !!order.vehiclePlate;
    list.push({
      id: 2,
      title: "Asignado a vehículo",
      description: hasVehicle 
        ? `Programado para despacho en unidad ${order.vehiclePlate}. Conductor: ${order.driverName || "N/A"}.` 
        : "Esperando asignación de unidad de transporte y ruta operativa.",
      date: order.routeDate || "Pendiente",
      icon: <FaTruck />,
      isCompleted: hasVehicle,
      color: hasVehicle ? "indigo" : "zinc"
    });

    const inRoute = ["in_route", "entregado", "no_entregado"].includes(order.status);
    list.push({
      id: 3,
      title: "Despacho en curso",
      description: inRoute
        ? "El vehículo ha iniciado el recorrido GPS. La orden se encuentra próxima a ser visitada."
        : "Pendiente de inicio de ruta por parte del transportista.",
      date: inRoute ? "En tránsito" : "Pendiente",
      icon: <FaRoute />,
      isCompleted: inRoute,
      color: inRoute ? "amber" : "zinc"
    });

    const finalStatus = ["entregado", "no_entregado"].includes(order.status);
    list.push({
      id: 4,
      title: order.status === "no_entregado" ? "Visita fallida" : "Entrega final",
      description: finalStatus
        ? `Gestión finalizada con estado: ${order.status === "entregado" ? "Conforme" : "Incidencia"}.`
        : "Esperando reporte de cierre por parte del conductor.",
      date: finalStatus ? "Finalizado" : "En espera",
      icon: <FaCheckCircle />,
      isCompleted: finalStatus,
      color: finalStatus ? "green" : "zinc"
    });

    return list;
  }, [order]);

  return (
    <div className="relative w-full py-10 flex flex-col items-center">
      <div 
        className="absolute left-6 sm:left-1/2 transform sm:-translate-x-1/2 w-0.5 h-full bg-zinc-200/80" 
      />
      <div 
        className="absolute left-6 sm:left-1/2 transform sm:-translate-x-1/2 w-1 h-full transition-colors duration-1000 ease-in-out opacity-60" 
        style={{ backgroundColor: timelineColor }}
      />

      <div className="relative space-y-4">
        {events.map((event, index) => (
          <TimelineCard 
            key={event.id} 
            event={event} 
            index={index} 
            timelineColor={timelineColor} 
          />
        ))}
      </div>
    </div>
  );
};

const DetalleOrden = () => {
  const { orderId = "" } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const decodedId = decodeURIComponent(orderId);

  const {
    data: order,
    isLoading,
    isError,
    isFetching,
    refetch,
    error,
  } = useOrderDetailQuery(decodedId);
  const {
    data: productLines = [],
    isLoading: linesLoading,
    isError: linesError,
    refetch: refetchLines,
  } = useOrderProductLinesQuery(decodedId);
  const { data: routeCatalog = [] } = useRoutesQuery();

  const [modifyStatusOpen, setModifyStatusOpen] = useState(false);
  const [modifyForm, setModifyForm] = useState({
    status: "" as OrderStatus | "",
    substatus: "",
  });
  const [savingStatus, setSavingStatus] = useState(false);

  const statusToName: Record<string, string> = {
    entregado: "Entregado",
    no_entregado: "No entregado",
    in_route: "En ruta",
    pending: "Pendiente",
  };
  const { data: substatusesFromApi = [] } = useEstadosHijosPorClaveQuery(
    statusToName[modifyForm.status] || undefined,
  );

  const [resumenOpen, setResumenOpen] = useState(true);
  const [camposOpen, setCamposOpen] = useState(true);
  const [itemsOpen, setItemsOpen] = useState(true);
  const [comentariosOpen, setComentariosOpen] = useState(false);

  const [comentarios, setComentarios] = useState<ComentarioDto[]>([]);
  const [comentarioTexto, setComentarioTexto] = useState("");
  const [comentarioArchivo, setComentarioArchivo] = useState<File | null>(null);
  const [comentarioGuardando, setComentarioGuardando] = useState(false);
  const [comentarioUbicacion, setComentarioUbicacion] = useState<{lat: number; lng: number} | null>(null);
  const [archivoModalOpen, setArchivoModalOpen] = useState(false);
  const [archivoModalUrl, setArchivoModalUrl] = useState<string | null>(null);
  const [archivoModalTipo, setArchivoModalTipo] = useState("");
  const [archivoModalMeta, setArchivoModalMeta] = useState<{latitud: number | null; longitud: number | null; creadoPor: string; creadoEn: string} | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [manualUbicacionOpen, setManualUbicacionOpen] = useState(false);
  const [manualLat, setManualLat] = useState("");
  const [manualLng, setManualLng] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const ubicacionRef = useRef<{lat: number; lng: number} | null>(null);
  const pendingFileRef = useRef<File | null>(null);

  useEffect(() => {
    if (comentariosOpen && order?.id) {
      comentariosApi.list(order.id)
        .then(setComentarios)
        .catch(() => toast.error("Error al cargar comentarios."));
    }
  }, [comentariosOpen, order?.id]);

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

  const irAGestionProductos = useCallback(() => {
    if (!order) return;
    const state: OrderProductsLocationState = { displayOrderId: order.id };
    navigate("/ordenes/productos", { state });
  }, [navigate, order]);

  const creadoFormato = useMemo(() => formatIsoCreacion(order?.createdAtIso), [order?.createdAtIso]);

  const customEntries = order?.customFields ? Object.entries(order.customFields) : [];

  const copyId = async () => {
    if (!order) return;
    try {
      await navigator.clipboard.writeText(order.id);
      toast.success("ID copiado al portapapeles");
    } catch {
      toast.error("No se pudo copiar");
    }
  };

  const handleAdjuntarClick = () => {
    fileInputRef.current?.click();
  };

  const handleObtenerUbicacion = () => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        ubicacionRef.current = loc;
        setComentarioUbicacion(loc);
        toast.success("📍 Ubicación capturada");
      },
      () => {
        toast.error("📍 No se pudo obtener ubicación. Puedes ingresarla manualmente.");
        setManualUbicacionOpen(true);
      },
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 0 },
    );
  };

  const handleAplicarUbicacionManual = () => {
    const lat = parseFloat(manualLat);
    const lng = parseFloat(manualLng);
    if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      toast.error("Coordenadas inválidas. Usa formato decimal (ej: -16.3988).");
      return;
    }
    const loc = { lat, lng };
    ubicacionRef.current = loc;
    setComentarioUbicacion(loc);
    setManualUbicacionOpen(false);
    toast.success("📍 Ubicación ingresada manualmente");
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(file.type.startsWith("image/") ? URL.createObjectURL(file) : null);
    setComentarioArchivo(file);
    pendingFileRef.current = null;
  };

  const verArchivo = async (url: string, comentario: ComentarioDto) => {
    try {
      const token = localStorage.getItem("auth_token");
      const res = await fetch(url, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
      if (!res.ok) throw new Error("Error al cargar archivo");
      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);
      setArchivoModalUrl(blobUrl);
      setArchivoModalTipo(blob.type);
      setArchivoModalMeta({ latitud: comentario.latitud, longitud: comentario.longitud, creadoPor: comentario.creadoPor, creadoEn: comentario.creadoEn });
      setArchivoModalOpen(true);
    } catch {
      toast.error("No se pudo cargar el archivo.");
    }
  };

  const cerrarArchivoModal = () => {
    setArchivoModalOpen(false);
    if (archivoModalUrl) URL.revokeObjectURL(archivoModalUrl);
    setArchivoModalUrl(null);
    setArchivoModalTipo("");
    setArchivoModalMeta(null);
  };

  const capturarUbicacion = (timeout = 5000): Promise<{lat: number; lng: number} | null> => {
    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => resolve(null),
        { enableHighAccuracy: false, timeout, maximumAge: 15000 },
      );
    });
  };

  const handleGuardarComentario = async () => {
    if (!order?.id || !comentarioTexto.trim()) return;
    setComentarioGuardando(true);

    let fileParaSubir = comentarioArchivo;
    let lat = comentarioUbicacion?.lat;
    let lng = comentarioUbicacion?.lng;

    if (fileParaSubir && lat == null) {
      toast.loading("Obteniendo ubicación…", { id: "gps" });
      const loc = await capturarUbicacion(6000);
      if (loc) {
        lat = loc.lat;
        lng = loc.lng;
        ubicacionRef.current = loc;
        setComentarioUbicacion(loc);
        toast.success("📍 Ubicación capturada", { id: "gps" });
      } else {
        toast.error("📍 No se pudo obtener ubicación (GPS no disponible)", { id: "gps" });
      }
    }

    if (fileParaSubir && lat != null && fileParaSubir.type.startsWith("image/")) {
      try {
        fileParaSubir = await overlayLocationOnImage(fileParaSubir, lat, lng);
      } catch { /* fallback */ }
    }

    try {
      const nuevo = await comentariosApi.create(
        order.id,
        comentarioTexto,
        fileParaSubir || undefined,
        lat,
        lng,
      );
      setComentarios((prev) => [...prev, nuevo]);
      setComentarioTexto("");
      setComentarioArchivo(null);
      setComentarioUbicacion(null);
      ubicacionRef.current = null;
      pendingFileRef.current = null;
      setPreviewUrl(null);
      setManualUbicacionOpen(false);
      setManualLat("");
      setManualLng("");
      if (fileInputRef.current) fileInputRef.current.value = "";
      toast.success("Comentario guardado.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Error al guardar.");
    } finally {
      setComentarioGuardando(false);
    }
  };

  const loadingBanner = (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 p-12 text-sm text-muted-foreground animate-fade-in">
      <p>Cargando orden…</p>
      {(isFetching || isLoading) && (
        <p className="text-xs opacity-75">Consultando el servidor.</p>
      )}
    </div>
  );

  if (decodedId.trim() === "") {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 bg-transparent p-8 animate-fade-in">
        <p className="text-center text-muted-foreground">Identificador de orden no válido.</p>
        <Button asChild variant="outline">
          <Link to="/ordenes">Volver a órdenes</Link>
        </Button>
      </div>
    );
  }

  if (isLoading || (isFetching && !order)) return loadingBanner;

  if (isError || !order) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 bg-transparent p-8 animate-fade-in">
        <p className="max-w-md text-center text-muted-foreground">
          {isError && error instanceof Error
            ? error.message
            : "No se encontró la orden o no se pudo cargar desde el servidor."}
        </p>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => void refetch()}>
            Reintentar
          </Button>
          <Button asChild variant="outline">
            <Link to="/ordenes">Volver a órdenes</Link>
          </Button>
        </div>
      </div>
    );
  }

  const direccionPrimaria =
    order.addressLine?.trim() ?? order.normalizedAddress?.trim() ?? "";

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-transparent animate-fade-in">
      <header className="sticky top-0 z-10">
        <div className="flex flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
            <div className="min-w-0">
              <nav className="flex flex-wrap items-center gap-x-1 text-sm text-muted-foreground">
                <Link to="/ordenes" className="hover:text-foreground">
                  Órdenes
                </Link>
                <span aria-hidden>/</span>
                <span className="font-semibold text-foreground break-all">{order.id}</span>
                <button
                  type="button"
                  onClick={() => void copyId()}
                  className="ml-2 inline-flex size-8 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
                  aria-label="Copiar identificador de orden"
                  title="Copiar ID"
                >
                  <ClipboardCopy className="size-4" />
                </button>
              </nav>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" size="sm" className="h-9 gap-2 font-medium" onClick={goToCompletarDatos}>
              <FileEdit className="size-4" />
              Modificar datos
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-9 gap-2 font-medium"
              onClick={irAGestionProductos}
            >
              <Package className="size-4" />
              Productos
            </Button>
            <Button
              size="sm"
              className="h-9 gap-2 shadow-glow"
              onClick={() => {
                if (!order) return;
                setModifyForm({
                  status: order.status,
                  substatus: order.substatus?.trim() ?? "",
                });
                setModifyStatusOpen(true);
              }}
            >
              <GitBranch className="size-4" />
              Modificar estado
            </Button>
          </div>
        </div>
      </header>

      <div className="flex flex-1 flex-col overflow-y-auto custom-scrollbar bg-transparent lg:flex-row">
        <aside className="w-full shrink-0 border-b border-border bg-transparent lg:w-96 xl:w-[400px] lg:border-b-0 lg:border-r">
          <div className="space-y-4 p-4">
            <Collapsible open={resumenOpen} onOpenChange={setResumenOpen}>
              <section className="overflow-hidden rounded-l border border-border/60 bg-card/80 backdrop-blur-md shadow-sm">
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
                  <div className="space-y-4 p-4">
                    <div>
                      <p className="text-xs font-medium text-foreground">Cliente</p>
                      <p className="text-sm text-primary underline underline-offset-4 decoration-primary/30">
                        {textoSeguro(order.clientName)}
                      </p>
                    </div>
                    <div>
                      <p className="flex items-center gap-1 text-xs font-medium text-foreground">
                        <Phone className="size-3.5 shrink-0" /> Teléfono
                      </p>
                      <p className="text-sm text-muted-foreground">{textoSeguro(order.contactPhone)}</p>
                    </div>
                    {order.contactEmail?.trim() ? (
                      <div>
                        <p className="text-xs font-medium text-foreground">Correo</p>
                        <p className="text-sm text-muted-foreground">{order.contactEmail.trim()}</p>
                      </div>
                    ) : null}
                    <div>
                      <p className="text-xs font-medium text-foreground">Contacto</p>
                      <p className="text-sm text-muted-foreground">{textoSeguro(order.contactName)}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Identificador: {textoSeguro(order.contactIdentifier)}
                      </p>
                    </div>
                    <div>
                      <p className="flex items-center gap-1 text-xs font-medium text-foreground">
                        Dirección
                        {typeof order.latitude === "number" && typeof order.longitude === "number" ? (
                          <a
                            href={`https://www.google.com/maps?q=${order.latitude},${order.longitude}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex size-6 items-center justify-center rounded-md text-primary hover:bg-primary-soft transition-colors"
                            title="Abrir en Google Maps"
                            aria-label="Abrir ubicación en Google Maps"
                          >
                            <MapPin className="size-3.5" />
                          </a>
                        ) : null}
                      </p>
                      <p className="text-sm text-muted-foreground">{direccionPrimaria || EMPTY}</p>
                      {order.addressReference?.trim() ? (
                        <p className="mt-1 text-xs text-muted-foreground italic">
                          Ref.: {order.addressReference.trim()}
                        </p>
                      ) : null}
                    </div>
                    <div className="flex flex-wrap gap-4 border-t border-border/60 pt-3 text-[13px]">
                      <div>
                        <p className="text-xs font-medium text-foreground">Fecha de ruta</p>
                        <p className="text-sm text-muted-foreground">{textoSeguro(order.routeDate)}</p>
                      </div>
                      <div>
                        <p className="flex items-center gap-1 text-xs font-medium text-foreground">
                          <Truck className="size-3.5 shrink-0" /> Placa
                        </p>
                        <p className="text-sm text-muted-foreground">{textoSeguro(order.vehiclePlate)}</p>
                      </div>
                      <div className="min-w-0 basis-full sm:basis-auto">
                        <p className="flex items-center gap-1 text-xs font-medium text-foreground">
                          <User className="size-3.5 shrink-0" /> Conductor
                        </p>
                        <p className="text-sm text-muted-foreground break-words">{textoSeguro(order.driverName)}</p>
                        <div className="mt-2 w-full text-left">
                          <p className="flex flex-wrap items-center justify-start gap-1 text-xs font-medium text-foreground">
                            <Phone className="size-3 shrink-0 text-muted-foreground" />
                            <span>Teléfono conductor</span>
                          </p>
                          {order.driverPhone?.trim() ? (
                            <a
                              href={`tel:${order.driverPhone.replace(/\s+/g, "")}`}
                              className="mt-1 block text-left text-sm font-medium text-primary hover:underline"
                            >
                              {order.driverPhone.trim()}
                            </a>
                          ) : (
                            <p className="mt-1 text-left text-sm text-muted-foreground">{EMPTY}</p>
                          )}
                        </div>
                      </div>
                      {order.isLastDispatch ? (
                        <div>
                          <p className="text-xs font-medium text-foreground">Último despacho</p>
                          <p className="text-sm text-muted-foreground">Sí</p>
                        </div>
                      ) : null}
                    </div>
                    <div>
                      <p className="text-xs font-medium text-foreground">Estado</p>
                      <div className="mt-1 flex flex-wrap items-center gap-2">
                        <OrderStatusBadge status={order.status} />
                        <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                          {textoSeguro(order.substatus)}
                        </span>
                      </div>
                    </div>
                    {creadoFormato ? (
                      <div>
                        <p className="text-xs font-medium text-foreground">Alta registrada</p>
                        <p className="text-sm text-muted-foreground">{creadoFormato}</p>
                      </div>
                    ) : null}
                  </div>
                </CollapsibleContent>
              </section>
            </Collapsible>

            <Collapsible open={camposOpen} onOpenChange={setCamposOpen}>
              <section className="overflow-hidden rounded-l border border-border/60 bg-card/80 backdrop-blur-md shadow-sm">
                <div className="flex w-full items-center justify-between gap-2 px-4 py-3 text-left">
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                    Campos personalizados
                  </h3>
                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-slate-100 transition-colors">
                      <ChevronDown className={cn("size-4 text-slate-500 transition-transform duration-200", camposOpen && "rotate-180")} />
                    </Button>
                  </CollapsibleTrigger>
                </div>
                <div className="h-px bg-slate-100 mx-4" />
                <CollapsibleContent>
                  <div className="space-y-4 p-4">
                    {customEntries.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No hay campos registrados para esta orden.</p>
                    ) : (
                      <div className="grid grid-cols-2 gap-3">
                        {customEntries.map(([key, val]) => (
                          <div key={key}>
                            <p className="text-xs font-medium text-foreground">
                              {customFieldLabels[key as CustomFieldKey] ?? key}
                            </p>
                            <p className="text-sm text-muted-foreground break-words">{val?.trim() || EMPTY}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </CollapsibleContent>
              </section>
            </Collapsible>

            <Collapsible open={itemsOpen} onOpenChange={setItemsOpen}>
              <section className="overflow-hidden rounded-l border border-border/60 bg-card/80 backdrop-blur-md shadow-sm">
                <div className="flex w-full flex-wrap items-center justify-between gap-2 px-4 py-3 text-left">
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Ítems</h3>
                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0 rounded-full hover:bg-slate-100 transition-colors">
                      <ChevronDown className={cn("size-4 text-slate-500 transition-transform duration-200", itemsOpen && "rotate-180")} />
                    </Button>
                  </CollapsibleTrigger>
                </div>
                <div className="h-px bg-slate-100 mx-4" />
                <CollapsibleContent>
                  <div className="space-y-3 p-4">
                    {linesError ? (
                      <div className="space-y-2">
                        <p className="text-sm text-destructive">No se pudieron cargar las líneas.</p>
                        <Button type="button" variant="outline" size="sm" onClick={() => void refetchLines()}>
                          Reintentar productos
                        </Button>
                      </div>
                    ) : linesLoading ? (
                      <p className="text-sm text-muted-foreground animate-pulse">Cargando productos…</p>
                    ) : productLines.length === 0 ? (
                      <p className="text-sm text-muted-foreground">
                        Esta orden no tiene líneas cargadas.{` `}
                        <button type="button" className="font-medium text-primary underline" onClick={irAGestionProductos}>
                          Añadir en la página de productos
                        </button>
                      </p>
                    ) : (
                      <ul className="space-y-4">
                        {productLines.map((line) => (
                          <li key={line.id} className="rounded-md border border-border/80 bg-muted/20 p-3 text-sm">
                            <p className="font-semibold text-foreground">{line.name.trim()}</p>
                            <p className="text-xs text-muted-foreground">
                              Código: {line.code.trim() || EMPTY} · Cantidad:{` `}
                              <span className="font-medium text-foreground">{line.quantity}</span>
                            </p>
                            <p className="mt-1 text-xs text-muted-foreground">
                              Precio unitario: {formatoSoles(Number(line.unitPrice))}
                              {typeof line.weight === "number" && Number.isFinite(line.weight) ? (
                                <>
                                  {` · `}Peso: {line.weight} kg
                                </>
                              ) : null}
                            </p>
                            {line.customField?.trim() ? (
                              <p className="mt-1 text-xs italic text-muted-foreground">
                                Campo aux.: {line.customField.trim()}
                              </p>
                            ) : null}
                          </li>
                        ))}
                      </ul>
                    )}
                    {!linesLoading && !linesError ? (
                      <Button type="button" variant="outline" size="sm" className="w-full" onClick={irAGestionProductos}>
                        Abrir pantalla completa de productos
                      </Button>
                    ) : null}
                  </div>
                </CollapsibleContent>
              </section>
            </Collapsible>

            <Collapsible open={comentariosOpen} onOpenChange={setComentariosOpen}>
              <section className="overflow-hidden rounded-l border border-border/60 bg-card/80 backdrop-blur-md shadow-sm">
                <div className="flex w-full items-center justify-between gap-2 px-4 py-3 text-left">
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Comentarios</h3>
                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-slate-100 transition-colors">
                      <ChevronDown className={cn("size-4 text-slate-500 transition-transform duration-200", comentariosOpen && "rotate-180")} />
                    </Button>
                  </CollapsibleTrigger>
                </div>
                <div className="h-px bg-slate-100 mx-4" />
                <CollapsibleContent>
                  <div className="space-y-4 p-4">
                    {comentarios.length > 0 && (
                      <div className="max-h-48 space-y-3 overflow-y-auto">
                        {comentarios.map((c) => (
                          <div key={c.id} className="rounded-lg border border-border/60 bg-muted/20 p-3 text-sm">
                            <p className="text-foreground whitespace-pre-wrap">{c.texto}</p>
                            <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
                              {c.latitud != null && c.longitud != null && (
                                <span className="inline-flex items-center gap-1 text-muted-foreground">
                                  <MapPin className="size-3 text-primary" />
                                  {c.latitud.toFixed(6)}, {c.longitud.toFixed(6)}
                                  <a
                                    href={`https://www.google.com/maps?q=${c.latitud},${c.longitud}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="ml-1 font-medium text-primary hover:underline"
                                  >
                                    Maps
                                  </a>
                                </span>
                              )}
                              {c.archivoUrl && (
                                <button onClick={() => void verArchivo(c.archivoUrl!, c)}
                                  className="font-medium text-primary hover:underline cursor-pointer">
                                  Ver foto
                                </button>
                              )}
                            </div>
                            <p className="mt-1.5 text-[11px] text-muted-foreground">
                              {c.creadoPor} · {c.creadoEn}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                    <Textarea
                      placeholder="Tu comentario…"
                      value={comentarioTexto}
                      onChange={(e) => setComentarioTexto(e.target.value)}
                      className="min-h-[100px] resize-none bg-white border-slate-200 text-sm focus-visible:ring-1 focus-visible:ring-ring rounded-xl placeholder:text-muted-foreground"
                    />
                    {previewUrl && (
                      <div className="relative overflow-hidden rounded-lg border border-border/60">
                        <img src={previewUrl} alt="Preview" className="max-h-48 w-full object-contain bg-black/5" />
                      </div>
                    )}
                    <div className="flex gap-2 pt-1">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*,.pdf"
                        className="hidden"
                        onChange={(e) => void handleFileChange(e)}
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        type="button"
                        onClick={handleAdjuntarClick}
                      >
                        {comentarioArchivo ? comentarioArchivo.name.slice(0, 20) : "Adjuntar"}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        type="button"
                        onClick={handleObtenerUbicacion}
                        className="px-2.5"
                        title="Obtener ubicación"
                      >
                        <MapPin className="size-4 shrink-0" />
                      </Button>
                      {comentarioUbicacion && (
                        <span className="inline-flex items-center gap-1 rounded-md bg-green-50 px-2 py-1 text-[11px] text-green-700 border border-green-200 whitespace-nowrap">
                          <MapPin className="size-3" />
                          OK
                        </span>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-[1.5]"
                        type="button"
                        disabled={!comentarioTexto.trim() || comentarioGuardando}
                        onClick={() => void handleGuardarComentario()}
                      >
                        {comentarioGuardando ? "Guardando…" : "Guardar comentario"}
                      </Button>
                    </div>
                    {manualUbicacionOpen && (
                      <div className="flex items-center gap-2 pt-1">
                        <input value={manualLat} onChange={(e) => setManualLat(e.target.value)}
                          placeholder="Latitud (ej: -16.3988)"
                          className="flex-1 h-8 rounded-md border border-slate-200 bg-white px-2 text-xs outline-none focus:border-primary" />
                        <input value={manualLng} onChange={(e) => setManualLng(e.target.value)}
                          placeholder="Longitud (ej: -71.5350)"
                          className="flex-1 h-8 rounded-md border border-slate-200 bg-white px-2 text-xs outline-none focus:border-primary" />
                        <Button variant="default" size="sm" type="button" onClick={handleAplicarUbicacionManual}
                          className="h-8 text-xs px-3 whitespace-nowrap">
                          Aplicar
                        </Button>
                      </div>
                    )}
                  </div>
                </CollapsibleContent>
              </section>
            </Collapsible>
          </div>
        </aside>

        <main className="flex flex-1 flex-col gap-8 p-4 md:p-10">
          <OrderTimeline order={order} />
        </main>
      </div>

      <Dialog open={archivoModalOpen} onOpenChange={(open) => { if (!open) cerrarArchivoModal(); }}>
        <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto p-0 border-none shadow-2xl">
          <DialogHeader className="border-b border-border bg-white p-4 sticky top-0 z-10 rounded-t-lg">
            <DialogTitle className="text-base">Foto adjunta</DialogTitle>
          </DialogHeader>
          <div className="p-4 space-y-3">
            {archivoModalMeta && (
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground bg-muted/30 rounded-lg px-3 py-2">
                {archivoModalMeta.latitud != null && archivoModalMeta.longitud != null && (
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="size-3 text-primary" />
                    {archivoModalMeta.latitud.toFixed(6)}, {archivoModalMeta.longitud.toFixed(6)}
                    <a href={`https://www.google.com/maps?q=${archivoModalMeta.latitud},${archivoModalMeta.longitud}`}
                      target="_blank" rel="noopener noreferrer"
                      className="ml-1 font-medium text-primary hover:underline">
                      Maps
                    </a>
                  </span>
                )}
                <span>{archivoModalMeta.creadoPor}</span>
                <span>{archivoModalMeta.creadoEn}</span>
              </div>
            )}
            {archivoModalTipo.startsWith("image/") ? (
              <img src={archivoModalUrl!} alt="Foto adjunta" className="w-full rounded-lg" />
            ) : archivoModalTipo === "application/pdf" ? (
              <iframe src={archivoModalUrl!} className="w-full h-[70vh] rounded-lg" title="PDF" />
            ) : (
              <a href={archivoModalUrl!} download
                className="inline-block text-primary underline">
                Descargar archivo
              </a>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={modifyStatusOpen} onOpenChange={setModifyStatusOpen}>
        <DialogContent className="overflow-hidden border-none p-0 shadow-2xl sm:max-w-lg">
          <DialogHeader className="border-b border-border bg-white p-6">
            <DialogTitle className="text-xl font-bold text-foreground">Modificar estado</DialogTitle>
            <DialogDescription className="text-sm leading-relaxed text-muted-foreground">
              Estado y subestado según configuración vigente en el servidor.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 p-6">
            <div className="space-y-2">
              <Label htmlFor="status-edit" className="text-sm font-semibold text-muted-foreground">
                Estado operativo
              </Label>
              <Select
                value={modifyForm.status}
                onValueChange={(v) => setModifyForm((f) => ({ ...f, status: v as OrderStatus }))}
              >
                <SelectTrigger id="status-edit" className="h-10">
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
              <Label htmlFor="substatus-edit" className="text-sm font-semibold text-muted-foreground">
                Subestado
              </Label>
              <Select
                value={modifyForm.substatus || "_none"}
                onValueChange={(v) => setModifyForm((f) => ({ ...f, substatus: v === "_none" ? "" : v }))}
              >
                <SelectTrigger id="substatus-edit" className="h-10">
                  <SelectValue placeholder="Seleccionar subestado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="_none">Ninguno</SelectItem>
                  {modifyForm.status
                    ? substatusesFromApi.map((s) => (
                        <SelectItem key={s.id} value={s.nombre}>
                          {s.nombre}
                        </SelectItem>
                      ))
                    : null}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Lista maestra de estados:{" "}
                <Link to="/configuracion/subestados" className="font-medium text-primary underline">
                  Configuración
                </Link>
                .
              </p>
            </div>
          </div>

          <DialogFooter className="shrink-0 gap-3 border-t border-border bg-zinc-50/50 p-6 sm:justify-end">
            <Button
              variant="outline"
              type="button"
              onClick={() => setModifyStatusOpen(false)}
              disabled={savingStatus}
              className="h-10 px-5 font-semibold border-zinc-300 text-zinc-600 hover:bg-white"
            >
              Cancelar
            </Button>
            <Button
              type="button"
              className="h-10 px-5 font-semibold"
              disabled={!modifyForm.status || savingStatus}
              onClick={() => {
                if (!order?.id) return;
                setSavingStatus(true);
                ordersApi.patchEstado(order.id, {
                  estado: modifyForm.status || undefined,
                  subestado: modifyForm.substatus || undefined,
                }).then(() => {
                  void refetch();
                  toast.success("Estado actualizado.");
                  setModifyStatusOpen(false);
                }).catch((e: unknown) => {
                  toast.error(e instanceof Error ? e.message : "Error al actualizar.");
                }).finally(() => setSavingStatus(false));
              }}
            >
              {savingStatus ? "Guardando…" : "Guardar cambios"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DetalleOrden;
