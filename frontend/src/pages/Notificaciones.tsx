import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Bell,
  Mail,
  Plus,
  History,
  Send,
  UserX,
  Info,
  ChevronRight,
  ChevronLeft,
  Edit2,
  Trash2,
  CheckCircle2,
  Activity,
  Filter,
  Search,
  Calendar,
  Contact,
  FileText,
  MoreHorizontal,
  Eye,
  Pencil
} from "lucide-react";
import PageHeader from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

const mockNotificationsSent = [
  {
    id: "1",
    codigoOrden: "ORD-2026-001",
    estado: "Enviado",
    tipoNotificacion: "Confirmación de entrega",
    contacto: "cliente@ejemplo.com",
    fechaEnvio: "08 May 2026",
  },
  {
    id: "2",
    codigoOrden: "ORD-2026-002",
    estado: "Entregado",
    tipoNotificacion: "Despacho en camino",
    contacto: "+56912345678",
    fechaEnvio: "07 May 2026",
  },
  {
    id: "3",
    codigoOrden: "ORD-2026-003",
    estado: "Enviado",
    tipoNotificación: "Notificación de próxima entrega",
    contacto: "cliente2@ejemplo.com",
    fechaEnvio: "06 May 2026",
  },
  {
    id: "4",
    codigoOrden: "ORD-2026-004",
    estado: "Fallido",
    tipoNotificacion: "Confirmación de entrega",
    contacto: "cliente3@ejemplo.com",
    fechaEnvio: "05 May 2026",
  },
  {
    id: "5",
    codigoOrden: "ORD-2026-005",
    estado: "Entregado",
    tipoNotificacion: "Despacho en camino",
    contacto: "+56987654321",
    fechaEnvio: "04 May 2026",
  },
];

const Notificaciones = () => {
  const [showSentNotifications, setShowSentNotifications] = useState(false);

  const mockNotifications = [
    {
      id: "1",
      titulo: "Notificación de próxima entrega",
      descripcion: "Avisa al cliente que su pedido está pronto a ser gestionado.",
      ultimaActualizacion: "02 May 2026",
    },
    {
      id: "2",
      titulo: "Despacho en camino",
      descripcion: "Informa al cliente que su despacho ha salido a ruta.",
      ultimaActualizacion: "01 May 2026",
    },
    {
      id: "3",
      titulo: "Confirmación de entrega",
      descripcion: "Confirma al cliente la entrega exitosa de su pedido.",
      ultimaActualizacion: "28 Abr 2026",
    },
  ];

  if (showSentNotifications) {
    return (
      <div className="animate-fade-in">
        <PageHeader
          title="Notificaciones Enviadas"
          subtitle="Historial de todas las notificaciones enviadas a tus clientes."
          actions={
            <Button
              variant="outline"
              className="gap-2 border-primary/20 hover:bg-primary/5 text-primary"
              onClick={() => setShowSentNotifications(false)}
            >
              <ChevronLeft className="size-4" />
              Volver
            </Button>
          }
        />

        <div className="flex flex-1 overflow-hidden p-4 sm:p-6 lg:p-8">
          <div className="flex w-full flex-col gap-6 lg:flex-row">
            {/* Sidebar Filters */}
            <aside className="w-full shrink-0 space-y-6 lg:w-80">
              <div className="rounded-xl border border-border bg-card/40 backdrop-blur-lg p-5 shadow-sm">
                <div className="mb-4 flex items-center gap-2 border-b border-border pb-4">
                  <Filter className="size-4 text-primary" />
                  <h3 className="text-sm font-semibold uppercase tracking-wider">
                    Filtros
                  </h3>
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
              <div className="rounded-xl border border-border bg-card/40 backdrop-blur-lg shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-border bg-muted/30 text-[11px] uppercase tracking-wider text-muted-foreground">
                        <th className="px-4 py-4 font-semibold">Código de orden</th>
                        <th className="px-4 py-4 font-semibold">Estado</th>
                        <th className="px-4 py-4 font-semibold">Tipo de notificación</th>
                        <th className="px-4 py-4 font-semibold">Contacto</th>
                        <th className="px-4 py-4 font-semibold">Fecha de envío</th>
                        <th className="px-4 py-4 font-semibold w-10"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {mockNotificationsSent.map((notif) => (
                        <tr
                          key={notif.id}
                          className="group hover:bg-muted/20 transition-colors"
                        >
                          <td className="px-4 py-4">
                            <Link
                              to={`/ordenes/detalle/${notif.codigoOrden}`}
                              className="font-medium text-primary hover:underline"
                            >
                              {notif.codigoOrden}
                            </Link>
                          </td>
                          <td className="px-4 py-4">
                            <span
                              className={cn(
                                "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium border",
                                notif.estado === "Entregado" &&
                                  "bg-success/10 text-success border-success/20",
                                notif.estado === "Enviado" &&
                                  "bg-info/10 text-info border-info/20",
                                notif.estado === "Fallido" &&
                                  "bg-destructive/10 text-destructive border-destructive/20"
                              )}
                            >
                              {notif.estado}
                            </span>
                          </td>
                          <td className="px-4 py-4 text-muted-foreground">
                            {notif.tipoNotificacion}
                          </td>
                          <td className="px-4 py-4 text-muted-foreground">
                            {notif.contacto}
                          </td>
                          <td className="px-4 py-4 text-muted-foreground">
                            {notif.fechaEnvio}
                          </td>
                           <td className="px-4 py-4 text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:bg-muted hover:text-foreground">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-40 border-border bg-card/40 backdrop-blur-lg shadow-md">
                                <DropdownMenuItem className="cursor-pointer">
                                  <Mail className="mr-2 h-4 w-4" /> Ver mensaje
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="flex items-center justify-between border-t border-border p-4 bg-muted/10">
                  <p className="text-xs text-muted-foreground">
                    Mostrando <span className="font-semibold text-foreground">1-5</span> de <span className="font-semibold text-foreground">5</span> notificaciones
                  </p>
                  <div className="flex gap-1">
                    <Button variant="outline" size="sm" disabled>
                      Anterior
                    </Button>
                    <Button variant="outline" size="sm" disabled>
                      Siguiente
                    </Button>
                  </div>
                </div>
              </div>
            </main>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Notificaciones"
        subtitle="Agrega notificaciones para cada uno de los estados de tus despachos y para tus clientes finales."
        actions={
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              className="gap-2 border-primary/20 hover:bg-primary/5 text-primary font-semibold"
              onClick={() => setShowSentNotifications(true)}
            >
              <Send className="size-4" />
              Notificaciones enviadas
            </Button>
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
          </div>
        }
      />

      <div className="flex flex-1 overflow-hidden p-4 sm:p-6 lg:p-8">
        <div className="flex w-full flex-col gap-6 lg:flex-row">
          {/* Main Content (Left) */}
          <main className="flex-1 space-y-6">
            <div className="rounded-xl border border-border bg-card/40 backdrop-blur-lg shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/30 text-xs uppercase tracking-wider text-muted-foreground">
                      <th className="px-4 py-4 font-semibold">Notificación</th>
                      <th className="px-4 py-4 font-semibold">Última actualización</th>
                      <th className="px-4 py-4 font-semibold text-right"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {mockNotifications.map((n) => (
                      <tr key={n.id} className="group hover:bg-muted/20 transition-colors">
                        <td className="px-4 py-4">
                          <div className="space-y-1">
                            <p className="text-base font-semibold text-primary">{n.titulo}</p>
                            <p className="text-sm text-muted-foreground">{n.descripcion}</p>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-muted-foreground text-sm">
                          {n.ultimaActualizacion}
                        </td>
                        <td className="px-4 py-4 text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:bg-muted hover:text-foreground">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-40 border-border bg-card/40 backdrop-blur-lg shadow-md">
                              <DropdownMenuItem className="cursor-pointer">
                                <Edit2 className="mr-2 h-4 w-4" /> Editar
                              </DropdownMenuItem>
                              <DropdownMenuItem className="cursor-pointer text-destructive focus:text-destructive">
                                <Trash2 className="mr-2 h-4 w-4" /> Eliminar
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="flex items-center justify-between border-t border-border p-4 bg-muted/10">
                <p className="text-sm text-muted-foreground">
                  Mostrando <span className="font-semibold text-foreground">1-3</span> de <span className="font-semibold text-foreground">3</span> notificaciones
                </p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" disabled>
                    Anterior
                  </Button>
                  <Button variant="outline" size="sm" disabled>
                    Siguiente
                  </Button>
                </div>
              </div>
            </div>
          </main>

          {/* Sidebar (Right) - Dashboard Indicators */}
          <aside className="w-full shrink-0 space-y-4 lg:w-80">
            
            {/* Card 1: Email Activo */}
            <div className="rounded-xl border border-border bg-card/40 backdrop-blur-lg p-5 shadow-sm flex flex-col gap-4">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                  Estado del Servicio
                </h3>
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-success/10 text-success">
                  <CheckCircle2 className="size-4" />
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="relative flex h-4 w-4">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-75"></span>
                  <span className="relative inline-flex h-4 w-4 rounded-full bg-success"></span>
                </div>
                <div>
                  <p className="text-base font-semibold text-foreground">Email Activo</p>
                  <p className="text-sm text-muted-foreground">Servicio funcionando correctamente</p>
                </div>
              </div>
            </div>

            {/* Card 2: Total de Notificaciones */}
            <div className="rounded-xl border border-border bg-card/40 backdrop-blur-lg p-5 shadow-sm flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                  Total Configurado
                </h3>
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Bell className="size-4" />
                </div>
              </div>
              <div>
                <p className="text-4xl font-bold text-foreground">3</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Notificaciones disponibles en el sistema
                </p>
              </div>
            </div>

            {/* Card 3: Notificaciones Enviadas */}
            <div className="rounded-xl border border-border bg-card/40 backdrop-blur-lg p-5 shadow-sm flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                  Enviadas (Este mes)
                </h3>
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-info/10 text-info">
                  <Send className="size-4" />
                </div>
              </div>
              <div>
                <p className="text-4xl font-bold text-foreground">1,248</p>
                <div className="mt-3 flex items-center gap-2 text-sm text-success font-medium bg-success/10 w-fit px-2 py-1 rounded-md">
                  <Activity className="size-4" />
                  <span>+12.5% vs mes anterior</span>
                </div>
              </div>
            </div>

          </aside>
        </div>
      </div>
    </div>
  );
};

export default Notificaciones;
