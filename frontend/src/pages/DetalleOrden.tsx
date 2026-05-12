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
import { MapContainer, Marker, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

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
} from "@/hooks/useOperationsQueries";
import {
  persistOrderDraft,
  type OrderCreationDraft,
  type OrderCompletarLocationState,
  type OrderProductsLocationState,
} from "@/lib/orderCreationDraft";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { LIMA_CENTER } from "@/domain/fleet";

const EMPTY = "—";

function textoSeguro(val: string | null | undefined): string {
  const t = val?.trim();
  return t ? t : EMPTY;
}

function formatIsoCreacion(iso: string | undefined): string | null {
  if (!iso?.trim()) return null;
  try {
    return format(parseISO(iso.trim()), "PPpp", { locale: es });
  } catch {
    return null;
  }
}

/** Precio línea desde API (`unitPrice`). */
function formatoSoles(importe: number): string {
  return new Intl.NumberFormat("es-PE", {
    style: "currency",
    currency: "PEN",
    minimumFractionDigits: 2,
    maximumFractionDigits: 4,
  }).format(importe);
}

function coordsOrden(
  lat: number | undefined,
  lng: number | undefined,
): [number, number] | null {
  if (typeof lat !== "number" || typeof lng !== "number") return null;
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  return [lat, lng];
}

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

  const [resumenOpen, setResumenOpen] = useState(true);
  const [camposOpen, setCamposOpen] = useState(true);
  const [itemsOpen, setItemsOpen] = useState(true);
  const [comentariosOpen, setComentariosOpen] = useState(false);

  const [modifyStatusOpen, setModifyStatusOpen] = useState(false);
  const [modifyForm, setModifyForm] = useState({
    status: "" as OrderStatus | "",
    substatus: "",
  });

  const mapCenter = useMemo(() => coordsOrden(order?.latitude, order?.longitude), [order]);

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
              <section className="overflow-hidden rounded-l border border-border bg-card/40 backdrop-blur-md shadow-sm">
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
                      <p className="text-xs font-medium text-foreground">Dirección</p>
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
                        <p className="font-mono text-sm text-muted-foreground">{textoSeguro(order.vehiclePlate)}</p>
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
              <section className="overflow-hidden rounded-l border border-border bg-card/40 backdrop-blur-md shadow-sm">
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
                      customEntries.map(([key, val]) => (
                        <div key={key}>
                          <p className="text-xs font-medium text-foreground">{key}</p>
                          <p className="text-sm text-muted-foreground break-words">{val?.trim() || EMPTY}</p>
                        </div>
                      ))
                    )}
                  </div>
                </CollapsibleContent>
              </section>
            </Collapsible>

            <Collapsible open={itemsOpen} onOpenChange={setItemsOpen}>
              <section className="overflow-hidden rounded-l border border-border bg-card/40 backdrop-blur-md shadow-sm">
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
              <section className="overflow-hidden rounded-l border border-border bg-card/40 backdrop-blur-md shadow-sm">
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
                    <p className="text-xs text-muted-foreground">
                      La bandeja colaborativa aún no está conectada al backend; aquí podrás dejar observaciones cuando el servicio esté disponible.
                    </p>
                    <Textarea
                      placeholder="Tu comentario…"
                      className="min-h-[120px] resize-none bg-white border-slate-200 text-sm focus-visible:ring-1 focus-visible:ring-ring rounded-xl placeholder:text-muted-foreground"
                      disabled
                    />
                    <div className="flex gap-2 pt-1 opacity-60">
                      <Button variant="outline" size="sm" className="flex-1" type="button" disabled>
                        Adjuntar
                      </Button>
                      <Button variant="outline" size="sm" className="flex-[1.5]" type="button" disabled>
                        Guardar comentario
                      </Button>
                    </div>
                  </div>
                </CollapsibleContent>
              </section>
            </Collapsible>
          </div>
        </aside>

        <main className="flex flex-1 flex-col gap-6 p-4 md:p-6 lg:max-w-3xl">
          <section className="rounded-xl border border-border bg-card/40 backdrop-blur-md p-5 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border/60 pb-4">
              <div>
                <h2 className="text-lg font-semibold tracking-tight">Vista rápida</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Datos leídos desde el servidor. La línea temporal detallada (eventos GPS, evidencias)
                  aparecerá cuando exista auditoría en el sistema.
                </p>
              </div>
              <OrderStatusBadge status={order.status} />
            </div>

            <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
              <div className="flex gap-2">
                <dt className="flex items-center gap-1 text-muted-foreground">
                  <MapPin className="size-3.5 shrink-0" /> Ventana entrega
                </dt>
                <dd className="font-medium text-foreground">
                  {order.deliveryWindowFrom?.trim() && order.deliveryWindowTo?.trim()
                    ? `${order.deliveryWindowFrom} – ${order.deliveryWindowTo}`
                    : EMPTY}
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Modo entrega</dt>
                <dd className="font-medium text-foreground">{textoSeguro(order.deliveryMode)}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Prioridad</dt>
                <dd className="font-medium text-foreground">{textoSeguro(order.deliveryPriority)}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Contraentrega</dt>
                <dd className="font-medium text-foreground">
                  {typeof order.cashOnDelivery === "boolean" ? (order.cashOnDelivery ? "Sí" : "No") : EMPTY}
                </dd>
              </div>
              {typeof order.serviceMinutes === "number" ? (
                <div className="sm:col-span-2">
                  <dt className="text-muted-foreground">Tiempo de servicio previsto</dt>
                  <dd className="font-medium text-foreground">{order.serviceMinutes} min</dd>
                </div>
              ) : null}
            </dl>
          </section>

          <section className="overflow-hidden rounded-xl border border-border bg-card/40 backdrop-blur-md shadow-sm">
            <div className="border-b border-border/60 px-5 py-3">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Ubicación de entrega
              </h3>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Centro del mapa: coordenadas de la orden o vista general de Lima.
              </p>
            </div>
            <div className="h-[260px] w-full shrink-0 sm:h-[300px]">
              <MapContainer
                center={mapCenter ?? LIMA_CENTER}
                zoom={mapCenter ? 15 : 12}
                className="h-full w-full z-0"
                scrollWheelZoom={false}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {mapCenter ? <Marker position={mapCenter} /> : null}
              </MapContainer>
            </div>
            {!mapCenter ? (
              <p className="border-t border-border/60 px-5 py-2 text-xs text-muted-foreground">
                Falta ubicación GPS. Usa «Modificar datos» para georreferenciar la entrega.
              </p>
            ) : (
              <p className="border-t border-border/60 px-5 py-2 font-mono text-[11px] text-muted-foreground">
                Lat {mapCenter[0].toFixed(6)} · Lng {mapCenter[1].toFixed(6)}
              </p>
            )}
          </section>
        </main>
      </div>

      <Dialog open={modifyStatusOpen} onOpenChange={setModifyStatusOpen}>
        <DialogContent className="overflow-hidden border-none p-0 shadow-2xl sm:max-w-lg">
          <DialogHeader className="border-b border-border bg-white p-6">
            <DialogTitle className="text-xl font-bold text-foreground">Modificar estado</DialogTitle>
            <DialogDescription className="text-sm leading-relaxed text-muted-foreground">
              Estado y subestado según configuración vigente en el servidor. El guardado completo desde
              esta pantalla requiere un endpoint de actualización en el backend.
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
                Subestado (libre / catálogo)
              </Label>
              <Input
                id="substatus-edit"
                placeholder="Ej. Recepcionado conforme"
                value={modifyForm.substatus}
                onChange={(e) =>
                  setModifyForm((f) => ({ ...f, substatus: e.target.value }))
                }
              />
              <p className="text-xs text-muted-foreground">
                Lista maestra de subestados:{" "}
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
              className="h-10 px-5 font-semibold border-zinc-300 text-zinc-600 hover:bg-white"
            >
              Cancelar
            </Button>
            <Button
              type="button"
              className="h-10 px-5 font-semibold"
              onClick={() => {
                toast.info(
                  "El backend todavía no expone PATCH de orden; hasta entonces cambia estado con los flujos existentes de operación o soporte técnico.",
                );
                setModifyStatusOpen(false);
              }}
            >
              Guardar cambios
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DetalleOrden;
