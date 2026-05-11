import { useState, type ReactNode } from "react";
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
  Loader2,
  Mail,
  MapPinned,
  Package,
  Pencil,
  Phone,
  RefreshCw,
  User,
} from "lucide-react";
import ClientFormDialog from "@/components/clients/ClientFormDialog";
import { ClienteMaplibreUbicacion } from "@/components/clients/ClienteMaplibreUbicacion";
import OrderStatusBadge from "@/components/orders/OrderStatusBadge";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useClientDetailQuery, useClientOrdersQuery } from "@/hooks/useOperationsQueries";
import { nombreInstitucionYNivelCliente, nivelPreferidoCliente } from "@/domain/clients";
import { cn, errorMessageFromUnknown } from "@/lib/utils";
import { clientsApi } from "@/services/clients.api";
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
    <div className="flex h-full flex-col animate-fade-in">
      <div className="flex flex-wrap items-center gap-3 border-b border-border/50 px-4 py-3 text-xs text-muted-foreground sm:px-6">
        <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0 -ml-1" asChild>
          <Link to="/clientes" aria-label="Volver">
            <ArrowLeft className="size-4" />
          </Link>
        </Button>
        <Link to="/clientes" className="hover:text-primary">
          Lista de clientes
        </Link>
        <ChevronRight className="size-3 shrink-0" />
        <span className="min-w-0 font-semibold text-foreground">{vistaNombre.nombreInstitucion}</span>
        {nivelEfectivo ? (
          <Badge variant="outline" className="text-[10px] font-normal uppercase">
            {nivelEfectivo}
          </Badge>
        ) : null}
      </div>

      <ClientFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        editing={formOpen ? cliente : null}
      />

      <div className="flex flex-col gap-5 p-4 sm:p-6">
        <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2 border-b border-border/70 bg-muted/30 px-3 py-2 sm:px-4">
            <div className="flex min-w-0 flex-wrap items-center gap-1.5">
              <div
                className={cn(
                  "inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs font-medium",
                  cliente.activo
                    ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-900 dark:text-emerald-100"
                    : "border-border bg-muted/80 text-muted-foreground",
                )}
              >
                {cliente.activo ? (
                  <CheckCircle className="size-3 shrink-0 text-emerald-600 dark:text-emerald-400" aria-hidden />
                ) : (
                  <CircleSlash className="size-3 shrink-0 opacity-70" aria-hidden />
                )}
                {cliente.activo ? "Activo" : "Desactivado"}
              </div>
              <div className="inline-flex items-center gap-1 rounded-md border border-border/70 bg-background px-2 py-0.5 text-xs">
                <Package className="size-3 shrink-0 text-muted-foreground" aria-hidden />
                <span className="tabular-nums font-semibold text-foreground">{cliente.ordenesTotalesRelacionadas}</span>
                <span className="text-muted-foreground">órdenes</span>
              </div>
            </div>
            <div className="flex shrink-0 flex-wrap items-center gap-1.5">
              <Button
                variant="outline"
                size="sm"
                type="button"
                className="h-8 gap-1.5 px-2.5 text-xs"
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

          <div className="p-5 sm:p-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
              <CampoValor
                etiqueta="DEPARTAMENTO"
                icono={<MapPinned className="size-4 text-muted-foreground" />}
                valor={(cliente.departamento ?? "").trim() || "—"}
                mono={false}
              />
              <CampoValor
                etiqueta="PROVINCIA"
                icono={<MapPinned className="size-4 text-muted-foreground" />}
                valor={(cliente.provincia ?? "").trim() || "—"}
                mono={false}
              />
              <CampoValor
                etiqueta="DISTRITO"
                icono={<MapPinned className="size-4 text-muted-foreground" />}
                valor={(cliente.distrito ?? "").trim() || "—"}
                mono={false}
              />
              <CampoValor
                etiqueta="UGEL"
                icono={<MapPinned className="size-4 text-muted-foreground" />}
                valor={cliente.ugel || "—"}
              />
              <CampoValor
                etiqueta="Código regional"
                icono={<Fingerprint className="size-4 text-muted-foreground" />}
                valor={cliente.codigoRegional || "—"}
              />
              <CampoValor
                etiqueta="Centro poblado"
                icono={<MapPinned className="size-4 text-muted-foreground" />}
                valor={cliente.centroPoblado || "—"}
              />
              <CampoValor
                etiqueta="Dirección"
                icono={<MapPinned className="size-4 text-muted-foreground" />}
                valor={cliente.direccion || "—"}
              />
              <CampoValor
                etiqueta="Código modular (IIEE)"
                icono={<Fingerprint className="size-4 text-muted-foreground" />}
                valor={cliente.codigoModularIiee || "—"}
              />
              <CampoValor
                etiqueta="Director IIEE · nombres y apellidos"
                icono={<User className="size-4 text-muted-foreground" />}
                valor={cliente.nombreApellidosDirectorIiee || "—"}
              />
              <CampoValor
                etiqueta="Teléfono"
                icono={<Phone className="size-4 text-muted-foreground" />}
                valor={cliente.telefono || "—"}
              />
              <CampoValor
                etiqueta="Correo"
                icono={<Mail className="size-4 text-muted-foreground" />}
                valor={cliente.email || "—"}
              />
            </div>
          </div>
        </div>

        {tieneUbicacionMapa ? (
          <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
            <div className="border-b border-border/70 bg-muted/30 px-4 py-3 sm:px-6">
              <p className="text-sm font-semibold text-foreground">Ubicación en mapa</p>
              <p className="text-xs text-muted-foreground">Coordenadas guardadas con el cliente (solo lectura)</p>
            </div>
            <div className="p-4 sm:p-5">
              <ClienteMaplibreUbicacion
                sessionKey={cliente.id}
                mode="view"
                initialLat={latMap}
                initialLng={lngMap}
              />
            </div>
          </div>
        ) : null}

        <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
          <div className="flex flex-col gap-1 border-b border-border/70 bg-gradient-to-r from-muted/50 to-muted/20 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <div className="flex items-center gap-3">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary shadow-inner">
                <ClipboardList className="size-5" aria-hidden />
              </span>
              <div>
                <p className="text-sm font-semibold text-foreground">Órdenes vinculadas</p>
                <p className="text-xs text-muted-foreground">Mismo nombre de cliente que en este registro</p>
              </div>
            </div>
            {!ordenesLoading && ordenes.length > 0 ? (
              <Badge variant="secondary" className="w-fit tabular-nums font-normal">
                {ordenes.length} en lista
              </Badge>
            ) : null}
          </div>
          {ordenesLoading ? (
            <div className="flex flex-col items-center justify-center gap-3 py-14 text-sm text-muted-foreground">
              <Loader2 className="size-8 animate-spin text-primary/60" aria-hidden />
              <span>Cargando órdenes…</span>
            </div>
          ) : ordenes.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 px-6 py-14 text-center">
              <Package className="size-10 text-muted-foreground/40" aria-hidden />
              <p className="max-w-sm text-sm text-muted-foreground">
                No hay órdenes con el mismo nombre de cliente. Cuando existan, aparecerán en esta tabla.
              </p>
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
                          className="inline-flex font-mono text-sm font-semibold text-primary underline-offset-2 hover:underline"
                        >
                          {o.id}
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
    <div className="space-y-1">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{etiqueta}</p>
      <div className={`flex items-center gap-2 ${mono ? "font-mono text-sm" : ""}`}>
        {icono}
        <span className="font-medium text-foreground break-words">{valor}</span>
      </div>
    </div>
  );
}

export default DetalleCliente;
