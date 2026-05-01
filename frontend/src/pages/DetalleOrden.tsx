import { useMemo, useState } from "react";
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
import OrderStatusBadge from "@/components/orders/OrderStatusBadge";
import { orderStatusMeta } from "@/domain/orders";
import { useOrdersQuery } from "@/hooks/useOperationsQueries";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type TimelineEvent = {
  id: string;
  title: string;
  time: string;
  user: string;
};

function formatLongDateEs(isoDate: string): string {
  const d = new Date(isoDate + "T12:00:00");
  return new Intl.DateTimeFormat("es-PE", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(d);
}

function buildTimeline(orderId: string, createdIso: string, statusLabel: string): { dateLabel: string; events: TimelineEvent[] }[] {
  const dateLabel = formatLongDateEs(createdIso);
  return [
    {
      dateLabel,
      events: [
        {
          id: "e1",
          title: "Ingresado al sistema",
          time: "08:12",
          user: "Rosa Gonzales Esquivel",
        },
        {
          id: "e2",
          title: `Estado actualizado a «${statusLabel}»`,
          time: "09:40",
          user: "Sistema",
        },
        {
          id: "e3",
          title: "Asignación revisada en despacho",
          time: "11:05",
          user: "Carlos Mendoza",
        },
        {
          id: "e4",
          title: `Vinculación de orden ${orderId}`,
          time: "11:18",
          user: "Sistema",
        },
      ],
    },
  ];
}

const DetalleOrden = () => {
  const { orderId = "" } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const decodedId = decodeURIComponent(orderId);
  const { data: allOrders = [], isLoading } = useOrdersQuery();
  const order = useMemo(
    () => allOrders.find((o) => o.id === decodedId),
    [allOrders, decodedId],
  );

  const [resumenOpen, setResumenOpen] = useState(true);
  const [comentariosOpen, setComentariosOpen] = useState(true);
  const [comentarioPublico, setComentarioPublico] = useState(false);

  const timeline = useMemo(() => {
    if (!order) return [];
    return buildTimeline(order.id, order.createdAtIso, orderStatusMeta[order.status].label);
  }, [order]);

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
            <Button
              variant="outline"
              size="sm"
              className="h-9 gap-2 border-destructive/40 text-destructive hover:bg-destructive/10"
              onClick={() => toast.message("Limpiar orden (demo)")}
            >
              <XCircle className="size-4" />
              Limpiar orden
            </Button>
            <Button variant="outline" size="sm" className="h-9 gap-2 font-medium" onClick={() => toast.message("Modificar datos (demo)")}>
              <FileEdit className="size-4" />
              Modificar datos
            </Button>
            <Button size="sm" className="h-9 gap-2 shadow-glow" onClick={() => toast.message("Modificar estado (demo)")}>
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
            {timeline.map((group) => (
              <div key={group.dateLabel} className="w-full min-w-0">
                <p className="mb-4 text-sm font-medium capitalize tracking-tight text-muted-foreground">{group.dateLabel}</p>
                <div className="relative w-full min-w-0">
                  {/* Eje vertical: alineado al centro del carril de nodos (fuera de las tarjetas) */}
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
            ))}
          </div>
        </main>
      </div>
    </div>
  );
};

export default DetalleOrden;
