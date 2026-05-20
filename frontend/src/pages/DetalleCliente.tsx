import { useState, useMemo, type ReactNode } from "react";
import { Link, useParams } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  Ban,
  CheckCircle,
  ChevronRight,
  CircleSlash,
  ClipboardList,
  Fingerprint,
  Link2,
  Loader2,
  Mail,
  MapPinned,
  Package,
  Pencil,
  Phone,
  RefreshCw,
  School,
  Search,
  User,
} from "lucide-react";
import ClientFormDialog from "@/components/clients/ClientFormDialog";
import { ClienteMaplibreUbicacion } from "@/components/clients/ClienteMaplibreUbicacion";
import OrderStatusBadge from "@/components/orders/OrderStatusBadge";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useClientDetailQuery, useClientOrdersQuery, useOrdersQuery } from "@/hooks/useOperationsQueries";
import { nombreInstitucionYNivelCliente, nivelPreferidoCliente } from "@/domain/clients";
import { cn, errorMessageFromUnknown } from "@/lib/utils";
import { clientsApi } from "@/services/clients.api";
import { ordersApi } from "@/services/orders.api";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const DetalleCliente = () => {
  const { id } = useParams<{ id: string }>();
  const decoded = id?.trim() ? decodeURIComponent(id.trim()) : "";
  const qc = useQueryClient();

  const { data: cliente, isLoading, isError, refetch, isFetching } = useClientDetailQuery(decoded);
  const {
    data: ordenes = [],
    isLoading: ordenesLoading,
    refetch: refetchOrdenes,
  } = useClientOrdersQuery(decoded);

  const [formOpen, setFormOpen] = useState(false);
  const [vincularDialogOpen, setVincularDialogOpen] = useState(false);
  const [searchOrderQuery, setSearchOrderQuery] = useState("");
  const [linkingOrderId, setLinkingOrderId] = useState<string | null>(null);

  const { data: allOrders = [], isLoading: allOrdersLoading } = useOrdersQuery();

  const ordersToSelect = useMemo(() => {
    if (!cliente) return [];
    return allOrders.filter((o) => {
      // Filtrar las que ya están vinculadas a este cliente
      if (o.clientId === cliente.id || o.clientName === cliente.nombre) return false;
      // Buscar coincidencia
      const q = searchOrderQuery.toLowerCase().trim();
      if (!q) return true;
      return (
        o.id.toLowerCase().includes(q) ||
        (o.clientName ?? "").toLowerCase().includes(q) ||
        (o.addressLine ?? "").toLowerCase().includes(q)
      );
    });
  }, [allOrders, cliente, searchOrderQuery]);

  const handleVincularOrden = async (orderId: string) => {
    if (!cliente) return;
    setLinkingOrderId(orderId);
    try {
      await ordersApi.completarDatos({
        numeroOrden: orderId,
        clientId: cliente.id,
        contactoNombre: cliente.nombreApellidosDirectorIiee || undefined,
        contactoTelefono: cliente.telefono || undefined,
        contactoEmail: cliente.email || undefined,
        direccionLinea: cliente.direccion || undefined,
        latitud: cliente.latitud ?? undefined,
        longitud: cliente.longitud ?? undefined,
      });
      toast.success(`Orden ${orderId} vinculada correctamente.`);
      // Refrescar las consultas
      await qc.invalidateQueries({ queryKey: ["clientes", decoded, "ordenes"] });
      await qc.invalidateQueries({ queryKey: ["ordenes"] });
      void refetchOrdenes();
      setVincularDialogOpen(false);
    } catch (e) {
      toast.error(errorMessageFromUnknown(e, "Error al vincular la orden."));
    } finally {
      setLinkingOrderId(null);
    }
  };

  const patchMut = useMutation({
    mutationFn: ({ clienteId, activo }: { clienteId: string; activo: boolean }) =>
      clientsApi.patchActivo(clienteId, activo),
    onSuccess: (_, variables) => {
      void qc.invalidateQueries({ queryKey: ["clientes"] });
      void qc.invalidateQueries({ queryKey: ["clientes", "detalle"] });
      toast.success(variables.activo ? "Cliente reactivado." : "Cliente desactivado.");
      void refetch();
    },
    onError: (e: unknown) =>
      toast.error(errorMessageFromUnknown(e, "No se pudo cambiar el estado.")),
  });

  const emptyId = decoded.length === 0;

  if (emptyId) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8">
        <p className="text-muted-foreground">Identificador de cliente no válido.</p>
        <Button asChild variant="outline">
          <Link to="/clientes">Volver</Link>
        </Button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 p-8 text-sm text-muted-foreground">
        Cargando cliente…
      </div>
    );
  }

  if (isError || !cliente) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8">
        <p className="text-destructive">No se encontró el cliente o hubo un error al cargarlo.</p>
        <Button asChild variant="outline">
          <Link to="/clientes">Volver a la lista</Link>
        </Button>
      </div>
    );
  }

  const vistaNombre = nombreInstitucionYNivelCliente(cliente.nombre);
  const nivelEfectivo = nivelPreferidoCliente(cliente);
  const latMap = cliente.latitud;
  const lngMap = cliente.longitud;
  const tieneUbicacionMapa =
    latMap != null && lngMap != null && Number.isFinite(latMap) && Number.isFinite(lngMap);

  return (
    <div className="animate-fade-in">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/50 px-4 py-3 text-xs text-muted-foreground sm:px-6 bg-card/10 backdrop-blur-sm">
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 min-w-0">
          <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0 -ml-1" asChild>
            <Link to="/clientes" aria-label="Volver">
              <ArrowLeft className="size-4" />
            </Link>
          </Button>
          <Link to="/clientes" className="hover:text-primary">
            Lista de clientes
          </Link>
          <ChevronRight className="size-3 shrink-0" />
          <span className="min-w-0 font-semibold text-foreground truncate max-w-[150px] sm:max-w-none">
            {vistaNombre.nombreInstitucion}
          </span>
          {nivelEfectivo ? (
            <Badge variant="outline" className="text-[10px] font-normal uppercase shrink-0">
              {nivelEfectivo}
            </Badge>
          ) : null}

          {/* Badges de estado en el header de la página */}
          <div
            className={cn(
              "inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[10px] font-medium shrink-0",
              cliente.activo
                ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-900 dark:text-emerald-100"
                : "border-border bg-muted/80 text-muted-foreground",
            )}
          >
            {cliente.activo ? (
              <CheckCircle className="size-2.5 shrink-0 text-emerald-600 dark:text-emerald-400" aria-hidden />
            ) : (
              <CircleSlash className="size-2.5 shrink-0 opacity-70" aria-hidden />
            )}
            {cliente.activo ? "Activo" : "Desactivado"}
          </div>
          
          <div className="inline-flex items-center gap-1 rounded-md border border-border/70 bg-transparent px-2 py-0.5 text-[10px] shrink-0">
            <Package className="size-2.5 shrink-0 text-muted-foreground" aria-hidden />
            <span className="tabular-nums font-semibold text-foreground">{cliente.ordenesTotalesRelacionadas}</span>
            <span className="text-muted-foreground">órdenes</span>
          </div>
        </div>

        {/* Acciones principales en el header superior derecho */}
        <div className="flex shrink-0 items-center gap-1.5">
          <Button
            variant="outline"
            size="sm"
            type="button"
            className="h-8 gap-1.5 px-2.5 text-xs bg-background"
            disabled={isFetching}
            onClick={() => {
              void refetch();
              void refetchOrdenes();
            }}
          >
            <RefreshCw className={cn("size-3.5", isFetching && "animate-spin")} aria-hidden />
            Actualizar
          </Button>
          <Button type="button" variant="secondary" size="sm" className="h-8 gap-1.5 px-2.5 text-xs" onClick={() => setFormOpen(true)}>
            <Pencil className="size-3.5" aria-hidden />
            Editar
          </Button>
          <Button
            type="button"
            size="sm"
            variant={cliente.activo ? "destructive" : "default"}
            className={cn(
              "h-8 gap-1.5 px-2.5 text-xs",
              !cliente.activo && "bg-emerald-600 hover:bg-emerald-600/90 dark:bg-emerald-600",
            )}
            disabled={patchMut.isPending}
            onClick={() => patchMut.mutate({ clienteId: cliente.id, activo: !cliente.activo })}
          >
            {patchMut.isPending ? (
              <Loader2 className="size-3.5 animate-spin" aria-hidden />
            ) : cliente.activo ? (
              <>
                <Ban className="size-3.5" aria-hidden /> Desactivar
              </>
            ) : (
              <>
                <CheckCircle className="size-3.5" aria-hidden /> Reactivar
              </>
            )}
          </Button>
        </div>
      </div>

      <ClientFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        editing={formOpen ? cliente : null}
      />

      <div className="flex flex-col gap-5 p-4 sm:p-6">
        {/* Fila 1: Información detallada */}
        <div className="overflow-hidden rounded-xl border border-border/60 bg-card/80 backdrop-blur-md shadow-sm">
          <div className="flex flex-col gap-1 border-b border-border/70 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <div className="flex items-center gap-3">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary shadow-inner">
                <School className="size-5" aria-hidden />
              </span>
              <div>
                <p className="text-sm font-semibold text-foreground">Información institucional</p>
                <p className="text-xs text-muted-foreground">Datos generales y de contacto de la institución educativa</p>
              </div>
            </div>
          </div>
          <div className="p-5 sm:p-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
              <CampoValor
                etiqueta="DEPARTAMENTO"
                icono={<MapPinned className="size-3.5 text-muted-foreground/80" />}
                valor={(cliente.departamento ?? "").trim() || "—"}
                mono={false}
              />
              <CampoValor
                etiqueta="PROVINCIA"
                icono={<MapPinned className="size-3.5 text-muted-foreground/80" />}
                valor={(cliente.provincia ?? "").trim() || "—"}
                mono={false}
              />
              <CampoValor
                etiqueta="DISTRITO"
                icono={<MapPinned className="size-3.5 text-muted-foreground/80" />}
                valor={(cliente.distrito ?? "").trim() || "—"}
                mono={false}
              />
              <CampoValor
                etiqueta="UGEL"
                icono={<MapPinned className="size-3.5 text-muted-foreground/80" />}
                valor={cliente.ugel || "—"}
              />
              <CampoValor
                etiqueta="Centro poblado"
                icono={<MapPinned className="size-3.5 text-muted-foreground/80" />}
                valor={cliente.centroPoblado || "—"}
              />
              <CampoValor
                etiqueta="Director"
                icono={<User className="size-3.5 text-muted-foreground/80" />}
                valor={cliente.nombreApellidosDirectorIiee || "—"}
              />
              <CampoValor
                etiqueta="Teléfono"
                icono={<Phone className="size-3.5 text-muted-foreground/80" />}
                valor={cliente.telefono || "—"}
              />
              <CampoValor
                etiqueta="Correo"
                icono={<Mail className="size-3.5 text-muted-foreground/80" />}
                valor={cliente.email || "—"}
              />
            </div>
          </div>
        </div>

        {/* Fila 2: Ubicación en mapa */}
        <div className="overflow-hidden rounded-xl border border-border/60 bg-card/80 shadow-sm flex flex-col justify-center">
          <ClienteMaplibreUbicacion
            sessionKey={cliente.id}
            mode="view"
            initialLat={latMap}
            initialLng={lngMap}
            containerClassName="h-[320px] sm:h-[350px] w-full border-none rounded-none bg-transparent shadow-none"
          />
        </div>

        <div className="overflow-hidden rounded-xl border border-border/60 bg-card/80 backdrop-blur-md shadow-sm">
          <div className="flex flex-col gap-1 border-b border-border/70 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <div className="flex items-center gap-3">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary shadow-inner">
                <ClipboardList className="size-5" aria-hidden />
              </span>
              <div>
                <p className="text-sm font-semibold text-foreground">Órdenes vinculadas</p>
                <p className="text-xs text-muted-foreground">Mismo nombre de cliente que en este registro</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {!ordenesLoading && ordenes.length > 0 ? (
                <Badge variant="secondary" className="w-fit tabular-nums font-normal mr-1">
                  {ordenes.length} en lista
                </Badge>
              ) : null}
              <Button
                size="sm"
                variant="outline"
                className="h-8 gap-1.5 text-xs font-semibold shadow-sm hover:bg-muted"
                onClick={() => setVincularDialogOpen(true)}
              >
                <Link2 className="size-3.5" />
                Vincular orden
              </Button>
            </div>
          </div>
          {ordenesLoading ? (
            <div className="flex flex-col items-center justify-center gap-3 py-14 text-sm text-muted-foreground">
              <Loader2 className="size-8 animate-spin text-primary/60" aria-hidden />
              <span>Cargando órdenes…</span>
            </div>
          ) : ordenes.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 px-6 py-14 text-center">
              <Package className="size-10 text-muted-foreground/40" aria-hidden />
              <div className="space-y-1">
                <p className="max-w-sm text-sm font-medium text-foreground">
                  No hay órdenes vinculadas
                </p>
                <p className="max-w-sm text-xs text-muted-foreground animate-pulse">
                  Asocia una orden existente en el sistema para que aparezca aquí.
                </p>
              </div>
              <Button
                size="sm"
                variant="outline"
                className="mt-1 gap-1.5 text-xs font-semibold"
                onClick={() => setVincularDialogOpen(true)}
              >
                <Link2 className="size-3.5" />
                Vincular una orden existente
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto p-1 sm:p-2">
              <table className="w-full min-w-[520px] text-left text-sm">
                <thead>
                  <tr className="border-b border-border text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                    <th className="rounded-tl-lg bg-muted/40 px-4 py-3.5">Pedido</th>
                    <th className="bg-muted/40 px-4 py-3.5">Estado</th>
                    <th className="rounded-tr-lg bg-muted/40 px-4 py-3.5">Dirección</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/80">
                  {ordenes.map((o) => (
                    <tr key={o.id} className="transition-colors hover:bg-muted/30">
                      <td className="px-4 py-3.5">
                        <Link
                          to={`/ordenes/detalle/${encodeURIComponent(o.id)}`}
                          className="flex items-center gap-2 text-left transition-all hover:translate-x-0.5 group/id"
                        >
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary-soft text-primary transition-colors group-hover/id:bg-primary group-hover/id:text-white">
                            <Package className="h-3.5 w-3.5" />
                          </div>
                          <span className="font-semibold text-foreground transition-colors group-hover/id:text-primary group-hover/id:underline underline-offset-4">
                            {o.id}
                          </span>
                        </Link>
                      </td>
                      <td className="px-4 py-3.5">
                        <OrderStatusBadge status={o.status} />
                      </td>
                      <td className="max-w-[min(28rem,55vw)] px-4 py-3.5 text-xs leading-relaxed text-muted-foreground">
                        {(o.normalizedAddress || o.addressLine || "—").toString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <Dialog open={vincularDialogOpen} onOpenChange={setVincularDialogOpen}>
        <DialogContent className="max-w-md rounded-2xl bg-white/95 backdrop-blur-md border border-zinc-100 shadow-2xl p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-foreground flex items-center gap-2">
              <Link2 className="size-5 text-primary" />
              Vincular orden
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Busca y selecciona una orden existente en el sistema para asociarla directamente a este cliente ({cliente?.nombre}).
            </DialogDescription>
          </DialogHeader>

          <div className="my-4 relative">
            <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground/70" />
            <Input
              type="text"
              placeholder="Buscar por número de orden o cliente..."
              value={searchOrderQuery}
              onChange={(e) => setSearchOrderQuery(e.target.value)}
              className="pl-9 h-9 text-sm rounded-lg border-zinc-200 bg-zinc-50/50 focus-visible:ring-1 focus-visible:ring-ring placeholder:text-muted-foreground/70"
            />
          </div>

          <div className="max-h-[300px] overflow-y-auto divide-y divide-border/60 custom-scrollbar pr-1">
            {allOrdersLoading ? (
              <div className="flex flex-col items-center justify-center py-8 gap-2 text-xs text-muted-foreground">
                <Loader2 className="size-6 animate-spin text-primary/60" />
                <span>Cargando órdenes operativas...</span>
              </div>
            ) : ordersToSelect.length === 0 ? (
              <div className="py-8 text-center text-xs text-muted-foreground">
                No se encontraron órdenes disponibles para vincular.
              </div>
            ) : (
              ordersToSelect.map((o) => (
                <div key={o.id} className="flex items-center justify-between py-3 gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-foreground flex items-center gap-1.5 truncate">
                      <Package className="size-3.5 text-muted-foreground" />
                      {o.id}
                    </p>
                    <p className="text-[10px] text-muted-foreground truncate">
                      Cliente original: {o.clientName || "Sin nombre"}
                    </p>
                    <p className="text-[10px] text-muted-foreground/80 truncate">
                      Dirección: {o.addressLine || o.normalizedAddress || "—"}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    className="h-7 text-xs font-semibold px-3 shadow-sm hover:scale-[1.02] active:scale-[0.98] transition-all"
                    disabled={linkingOrderId !== null}
                    onClick={() => void handleVincularOrden(o.id)}
                  >
                    {linkingOrderId === o.id ? (
                      <Loader2 className="size-3 animate-spin mr-1" />
                    ) : (
                      <Link2 className="size-3 mr-1" />
                    )}
                    Vincular
                  </Button>
                </div>
              ))
            )}
          </div>

          <DialogFooter className="mt-4 pt-4 border-t border-border/60 flex justify-end">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setVincularDialogOpen(false)}
            >
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

function CampoValor({
  etiqueta,
  icono,
  valor,
  mono,
}: {
  etiqueta: string;
  icono: ReactNode;
  valor: string;
  mono?: boolean;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-1.5 select-none">
        {icono}
        <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{etiqueta}</p>
      </div>
      <p className={cn("text-sm font-semibold text-foreground break-words", mono && "font-mono")}>
        {valor}
      </p>
    </div>
  );
}

export default DetalleCliente;
