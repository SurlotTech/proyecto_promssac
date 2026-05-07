import { useCallback, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  ChevronDown,
  ClipboardCopy,
  Clock,
  FileEdit,
  GitBranch,
  Info,
  Paperclip,
  Plus,
  User,
  XCircle,
} from "lucide-react";
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
  const { data: allOrders = [], isLoading } = useOrdersQuery();
  const { data: routeCatalog = [] } = useRoutesQuery();
  const order = useMemo(
    () => allOrders.find((o) => o.id === decodedId),
    [allOrders, decodedId],
  );

  const [resumenOpen, setResumenOpen] = useState(true);
  const [comentariosOpen, setComentariosOpen] = useState(true);
  const [comentarioPublico, setComentarioPublico] = useState(false);

  const [modifyStatusOpen, setModifyStatusOpen] = useState(false);
  const [modifyForm, setModifyForm] = useState({
    dispatchCenter: "",
    status: "",
    substatus: "",
  });

  const timeline = order ? ORDER_TIMELINE_PLACEHOLDER : [];
  const hasTimelineEvents = timeline.some((g) => g.events.length > 0);

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

  const showGeoWarning = order.vehiclePlate === "—";

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
      <header className="sticky top-0 z-10 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/85">
        <div className="flex flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 shrink-0 self-start text-muted-foreground hover:text-foreground sm:self-center"
              onClick={() => navigate("/ordenes")}
              aria-label="Volver a órdenes"
            >
              <ArrowLeft className="size-5" />
            </Button>
            <div className="min-w-0">
              <nav className="flex flex-wrap items-center gap-x-1 text-sm text-muted-foreground">
                <Link to="/ordenes" className="hover:text-foreground">
                  Órdenes
                </Link>
                <span aria-hidden>/</span>
                <span className="font-semibold text-foreground">{order.id}</span>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-primary hover:bg-primary/10"
                      onClick={copyId}
                      aria-label="Copiar ID de orden"
                    >
                      <ClipboardCopy className="size-3.5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Copiar ID</TooltipContent>
                </Tooltip>
              </nav>
              <div className="mt-1 flex flex-wrap items-center gap-2">
                <OrderStatusBadge status={order.status} />
                <span className="text-xs text-muted-foreground">Ruta {order.routeDate}</span>
              </div>
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

      <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
        {/* Columna izquierda */}
        <aside className="w-full shrink-0 border-b border-border bg-muted/20 lg:w-[min(100%,30rem)] xl:w-[min(100%,34rem)] lg:border-b-0 lg:border-r">
          <div className="space-y-4 p-4 sm:p-5">
            <Collapsible open={resumenOpen} onOpenChange={setResumenOpen}>
              <section className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
                <CollapsibleTrigger asChild>
                  <button
                    type="button"
                    className="flex w-full items-center justify-between gap-2 border-b border-border bg-muted/30 px-4 py-3 text-left transition-colors hover:bg-muted/45"
                  >
                    <span className="text-sm font-semibold text-foreground">Resumen</span>
                    <ChevronDown
                      className={cn("size-4 shrink-0 text-muted-foreground transition-transform duration-200", resumenOpen && "rotate-180")}
                    />
                  </button>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="space-y-4 p-4">
                    <dl className="space-y-3 text-sm">
                      <div>
                        <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Nombre</dt>
                        <dd className="mt-1 font-medium text-primary">
                          {order.clientName?.trim() ? order.clientName : "Sin información"}
                        </dd>
                      </div>
                    </dl>

                    {showGeoWarning && (
                      <div className="rounded-lg border border-destructive/25 bg-destructive/5 px-3 py-2.5 text-xs leading-relaxed text-destructive">
                        <p>
                          No se pudo geolocalizar esta dirección. Puedes contactar al cliente para que corrija su dirección.{" "}
                          <button
                            type="button"
                            className="font-semibold text-primary underline-offset-2 hover:underline"
                            onClick={() => toast.message("Notificación enviada (demo)")}
                          >
                            Enviar notificación
                          </button>
                        </p>
                      </div>
                    )}

                    <dl className="grid gap-3 text-sm sm:grid-cols-2">
                      <div>
                        <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Núm. intentos</dt>
                        <dd className="mt-1 font-semibold tabular-nums text-foreground">0</dd>
                      </div>
                      <div>
                        <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Último estado</dt>
                        <dd className="mt-1">
                          <OrderStatusBadge status={order.status} />
                        </dd>
                      </div>
                      <div className="sm:col-span-2">
                        <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Subestado</dt>
                        <dd className="mt-1 text-foreground">{order.substatus}</dd>
                      </div>
                      <div>
                        <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Vehículo</dt>
                        <dd className={cn("mt-1 font-medium tabular-nums", order.vehiclePlate === "—" && "text-muted-foreground")}>
                          {order.vehiclePlate}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Contacto</dt>
                        <dd className="mt-1 text-foreground">{order.contactName}</dd>
                      </div>
                      <div className="sm:col-span-2">
                        <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Fecha de ruta</dt>
                        <dd className="mt-1 tabular-nums text-foreground">{order.routeDate}</dd>
                      </div>
                    </dl>
                  </div>
                </CollapsibleContent>
              </section>
            </Collapsible>

            <Collapsible open={comentariosOpen} onOpenChange={setComentariosOpen}>
              <section className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
                <CollapsibleTrigger asChild>
                  <button
                    type="button"
                    className="flex w-full items-center justify-between gap-2 border-b border-border bg-muted/30 px-4 py-3 text-left transition-colors hover:bg-muted/45"
                  >
                    <span className="text-sm font-semibold text-foreground">Comentarios (0)</span>
                    <ChevronDown
                      className={cn("size-4 shrink-0 text-muted-foreground transition-transform duration-200", comentariosOpen && "rotate-180")}
                    />
                  </button>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="space-y-3 p-4">
                    <Textarea placeholder="Tu comentario…" className="min-h-[100px] resize-y bg-background text-sm" rows={4} />
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="com-publico"
                        checked={comentarioPublico}
                        onCheckedChange={(v) => setComentarioPublico(v === true)}
                      />
                      <Label htmlFor="com-publico" className="cursor-pointer text-sm font-normal text-foreground">
                        Comentario público
                      </Label>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button type="button" className="text-primary hover:text-primary/80" aria-label="Información">
                            <Info className="size-4" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs">
                          Los comentarios públicos pueden ser visibles para el cliente o el conductor según la configuración.
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <div className="flex flex-wrap gap-2 pt-1">
                      <Button type="button" variant="outline" size="sm" className="h-8 gap-1.5 text-xs">
                        <Paperclip className="size-3.5" />
                        Agregar archivo
                      </Button>
                      <Button type="button" variant="outline" size="sm" className="h-8 gap-1.5 text-xs" onClick={() => toast.message("Comentario guardado (demo)")}>
                        <Plus className="size-3.5" />
                        Nuevo comentario
                      </Button>
                    </div>
                    <p className="text-[11px] text-muted-foreground">Máx. 5 MB por archivo</p>
                  </div>
                </CollapsibleContent>
              </section>
            </Collapsible>
          </div>
        </aside>

        {/* Línea de tiempo */}
        <main className="min-h-0 min-w-0 flex-1 overflow-y-auto p-4 sm:p-6 lg:px-8 lg:py-6">
          <div className="w-full min-w-0">
            <h2 className="mb-5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Historial</h2>
            {!hasTimelineEvents ? (
              <div className="rounded-xl border border-border bg-card p-6 shadow-sm sm:p-8">
                <p className="text-center text-sm leading-relaxed text-muted-foreground">
                  No hay eventos en el historial todavía. Aquí verás cambios de estado, asignaciones y
                  otras acciones cuando el registro de actividad esté disponible desde el servidor.
                </p>
              </div>
            ) : (
              timeline.map((group) => (
                <div key={group.dateLabel} className="w-full min-w-0">
                  <p className="mb-4 text-sm font-medium capitalize tracking-tight text-muted-foreground">{group.dateLabel}</p>
                  <div className="relative w-full min-w-0">
                    <div
                      className="pointer-events-none absolute left-[1.125rem] top-3 bottom-3 z-0 w-0.5 -translate-x-1/2 rounded-full bg-gradient-to-b from-primary via-primary/35 to-border sm:left-[1.375rem]"
                      aria-hidden
                    />
                    <ul className="relative z-[1] w-full min-w-0 space-y-4">
                      {group.events.map((ev, idx) => (
                        <li
                          key={ev.id}
                          className="grid grid-cols-[2.25rem_minmax(0,1fr)] items-start gap-x-3 sm:grid-cols-[2.75rem_minmax(0,1fr)] sm:gap-x-4"
                        >
                          <div className="flex justify-center pt-3.5">
                            <span
                              className={cn(
                                "relative z-[2] flex size-7 shrink-0 items-center justify-center rounded-full border-2 bg-background shadow-sm ring-2 ring-background sm:size-[30px]",
                                idx === 0 ? "border-primary bg-primary/10" : "border-border",
                              )}
                            >
                              <span
                                className={cn(
                                  "size-2 rounded-full sm:size-2.5",
                                  idx === 0 ? "bg-primary" : "bg-muted-foreground/45",
                                )}
                              />
                            </span>
                          </div>
                          <article className="min-w-0 rounded-xl border border-border bg-card p-4 shadow-sm transition-shadow hover:shadow-md sm:p-5">
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
                              <h3 className="min-w-0 text-sm font-semibold leading-snug text-foreground sm:text-base">{ev.title}</h3>
                              <div className="flex shrink-0 flex-wrap items-center gap-x-5 gap-y-1.5 text-xs text-muted-foreground sm:justify-end">
                                <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
                                  <Clock className="size-3.5 shrink-0" />
                                  Registrado: {ev.time}
                                </span>
                                <span className="inline-flex min-w-0 items-center gap-1.5">
                                  <User className="size-3.5 shrink-0" />
                                  <span className="truncate">{ev.user}</span>
                                </span>
                              </div>
                            </div>
                          </article>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))
            )}
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

export default DetalleOrden;
