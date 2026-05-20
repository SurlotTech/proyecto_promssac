import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Mail,
  Plus,
  Send,
  CheckCircle2,
  Filter,
  Search,
  Calendar,
  Contact,
  FileText,
  MoreHorizontal,
  Loader2,
} from "lucide-react";
import PageHeader from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import RoutesPaginationBar from "@/components/routes/RoutesPaginationBar";
import { cn } from "@/lib/utils";
import { notificacionesApi, type NotificacionEnviadaListResponse, type NotificacionPage } from "@/services/notifications.api";
import { useEmailStatus } from "@/hooks/useEmailStatus";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const PAGE_SIZE = 20;

const Notificaciones = () => {
  const [notificaciones, setNotificaciones] = useState<NotificacionEnviadaListResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalEnviadas, setTotalEnviadas] = useState<number | null>(null);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [selectedNotif, setSelectedNotif] = useState<NotificacionEnviadaListResponse | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const { activo: emailActivo, conectado, error: wsError } = useEmailStatus();

  useEffect(() => {
    setLoading(true);
    notificacionesApi.listar(page, PAGE_SIZE)
      .then((data: NotificacionPage) => {
        setNotificaciones(data.content);
        setTotalEnviadas(data.totalElements);
        setTotalPages(data.totalPages);
      })
      .catch(() => setNotificaciones([]))
      .finally(() => setLoading(false));
  }, [page]);

  const handleVerMensaje = async (notif: NotificacionEnviadaListResponse) => {
    if (notif.contenido) {
      setSelectedNotif(notif);
      return;
    }
    setLoadingDetail(true);
    try {
      const detalle = await notificacionesApi.detalle(notif.id);
      setSelectedNotif(detalle);
    } catch {
      setSelectedNotif(notif);
    } finally {
      setLoadingDetail(false);
    }
  };

  const formatFecha = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString("es-PE", { day: "2-digit", month: "short", year: "numeric" });
  };

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Notificaciones Enviadas"
        subtitle="Historial de todas las notificaciones enviadas a tus clientes."
        actions={
          <Button
            size="sm"
            className="gap-2 bg-[#f43f3e] hover:bg-[#d93534] text-white px-6 shadow-md transition-all hover:scale-105 active:scale-95"
            asChild
          >
            <Link to="/configuracion/notificaciones/nueva">
              <Plus className="size-4" />
              Nueva notificación
            </Link>
          </Button>
        }
      />

      <div className="flex flex-1 overflow-hidden p-4 sm:p-6 lg:p-8">
        <div className="flex w-full flex-col gap-6 lg:flex-row">
          {/* Sidebar */}
          <aside className="w-full shrink-0 space-y-5 lg:w-80">

            {/* Card 1: Estado del Servicio */}
            <div className="rounded-xl border border-border bg-card/40 backdrop-blur-lg p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Estado del Servicio
                </h3>
                <div className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full",
                  wsError ? "bg-destructive/10 text-destructive"
                    : conectado ? (emailActivo ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive")
                    : "bg-muted/30 text-muted-foreground"
                )}>
                  <CheckCircle2 className="size-4" />
                </div>
              </div>
              <div className="flex items-center gap-3 mt-3">
                <div className="relative flex h-3 w-3">
                  {conectado && emailActivo && (
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-75"></span>
                  )}
                  <span className={cn(
                    "relative inline-flex h-3 w-3 rounded-full",
                    wsError ? "bg-destructive"
                      : conectado ? (emailActivo ? "bg-success" : "bg-destructive")
                      : "bg-muted-foreground animate-pulse"
                  )}></span>
                </div>
                <p className="font-semibold text-sm">
                  {wsError ? "Error de autenticación"
                    : conectado ? (emailActivo ? "Email Activo" : "Email Inactivo")
                    : "Conectando..."}
                </p>
              </div>
            </div>

            {/* Card 2: Total Enviadas */}
            <div className="rounded-xl border border-border bg-card/40 backdrop-blur-lg p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Total Enviadas
                </h3>
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-info/10 text-info">
                  <Send className="size-4" />
                </div>
              </div>
              <p className="text-3xl font-bold mt-2">{totalEnviadas !== null ? totalEnviadas : "—"}</p>
              <p className="text-xs text-muted-foreground mt-1">Notificaciones en el historial</p>
            </div>

            {/* Filtros */}
            <div className="rounded-xl border border-border bg-card/40 backdrop-blur-lg p-4 shadow-sm">
              <div className="mb-4 flex items-center gap-2 border-b border-border pb-3">
                <Filter className="size-4 text-primary" />
                <h3 className="text-xs font-semibold uppercase tracking-wider">Filtros</h3>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Fecha de envío
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Seleccionar fecha"
                      className="pl-10 bg-background/50"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Código de orden
                  </label>
                  <div className="relative">
                    <FileText className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="ORD-2026-XXX"
                      className="pl-10 bg-background/50"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Contacto
                  </label>
                  <div className="relative">
                    <Contact className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Email o teléfono"
                      className="pl-10 bg-background/50"
                    />
                  </div>
                </div>

                <Button className="w-full bg-primary shadow-glow hover:bg-primary-hover mt-2">
                  <Search className="mr-2 size-4" />
                  Buscar
                </Button>
              </div>
            </div>
          </aside>

          {/* Main Table */}
          <main className="flex-1 space-y-6">
            <div className="overflow-hidden rounded-xl border border-border bg-card/40 backdrop-blur-lg shadow-sm">
              {loading ? (
                <div className="flex items-center justify-center py-16">
                  <Loader2 className="size-6 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <div className="overflow-x-auto scrollbar-thin">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-border bg-surface-muted text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        <th className="px-5 py-3.5">Código de orden</th>
                        <th className="px-5 py-3.5">Estado</th>
                        <th className="px-5 py-3.5">Asunto</th>
                        <th className="px-5 py-3.5">Contacto</th>
                        <th className="px-5 py-3.5">Fecha de envío</th>
                        <th className="px-5 py-3.5 text-right"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {notificaciones.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="px-5 py-12 text-center text-muted-foreground">
                            No hay notificaciones enviadas aún.
                          </td>
                        </tr>
                      ) : (
                        notificaciones.map((notif) => (
                          <tr
                            key={notif.id}
                            className="group transition-colors hover:bg-surface-muted"
                          >
                            <td className="px-5 py-4">
                              {notif.ordenCodigo ? (
                                <Link
                                  to={`/ordenes/detalle/${notif.ordenCodigo}`}
                                  className="font-medium text-foreground hover:text-primary transition-colors underline-offset-4 group-hover:underline"
                                >
                                  {notif.ordenCodigo}
                                </Link>
                              ) : (
                                <span className="text-muted-foreground">—</span>
                              )}
                            </td>
                            <td className="px-5 py-4">
                              <span
                                className={cn(
                                  "inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold tracking-wide border",
                                  notif.estado === "ENVIADO" &&
                                    "bg-success/10 text-success border-success/20",
                                  notif.estado === "FALLIDO" &&
                                    "bg-destructive/10 text-destructive border-destructive/20"
                                )}
                              >
                                {notif.estado}
                              </span>
                            </td>
                            <td className="px-5 py-4 text-foreground">
                              {notif.asunto}
                            </td>
                            <td className="px-5 py-4 text-muted-foreground">
                              {notif.destinatarioEmail}
                            </td>
                            <td className="px-5 py-4 text-muted-foreground">
                              {formatFecha(notif.enviadoEn)}
                            </td>
                            <td className="px-5 py-4 text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-8 w-8 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-40 border-border bg-card/40 backdrop-blur-lg shadow-md">
                                  <DropdownMenuItem className="cursor-pointer" onClick={() => handleVerMensaje(notif)}>
                                    <Mail className="mr-2 h-4 w-4" /> Ver mensaje
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <RoutesPaginationBar
              currentPage={page + 1}
              totalPages={totalPages || 1}
              totalFiltered={totalEnviadas ?? 0}
              pageSize={PAGE_SIZE}
              onPageChange={(p) => setPage(p - 1)}
              label="notificaciones"
            />
          </main>
        </div>
      </div>

      <Dialog open={selectedNotif !== null} onOpenChange={(open) => { if (!open) setSelectedNotif(null); }}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg">{selectedNotif?.asunto}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 text-sm">
            <div className="flex gap-4 text-muted-foreground">
              <span><strong>Para:</strong> {selectedNotif?.destinatarioEmail}</span>
              <span><strong>Estado:</strong> {selectedNotif?.estado}</span>
              <span><strong>Fecha:</strong> {selectedNotif ? formatFecha(selectedNotif.enviadoEn) : ""}</span>
            </div>
            {selectedNotif?.ordenCodigo && (
              <div className="text-muted-foreground">
                <strong>Orden:</strong>{" "}
                <Link to={`/ordenes/detalle/${selectedNotif.ordenCodigo}`} className="text-primary hover:underline">
                  {selectedNotif.ordenCodigo}
                </Link>
              </div>
            )}
            <hr className="border-border" />
            {loadingDetail ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="size-5 animate-spin text-muted-foreground" />
              </div>
            ) : selectedNotif?.contenido ? (
              <div
                className="prose prose-sm max-w-none dark:prose-invert [&_img]:max-w-full"
                dangerouslySetInnerHTML={{ __html: selectedNotif.contenido }}
              />
            ) : (
              <p className="text-muted-foreground italic">Sin contenido disponible.</p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Notificaciones;
