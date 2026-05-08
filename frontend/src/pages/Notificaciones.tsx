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
  Edit2,
  Trash2,
} from "lucide-react";
import PageHeader from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

const Notificaciones = () => {
  const mockNotifications = [
    {
      id: "1",
      titulo: "Notificación de próxima entrega",
      descripcion: "Avisa al cliente que su pedido está pronto a ser gestionado.",
      estado: "PRE-ENTREGA",
      estadoColor: "bg-warning/10 text-warning border-warning/20",
      canal: "Email",
      activa: true,
      ultimaActualizacion: "02 May 2026",
    },
    {
      id: "2",
      titulo: "Despacho en camino",
      descripcion: "Informa al cliente que su despacho ha salido a ruta.",
      estado: "EN RUTA",
      estadoColor: "bg-info/10 text-info border-info/20",
      canal: "Email",
      activa: true,
      ultimaActualizacion: "01 May 2026",
    },
    {
      id: "3",
      titulo: "Confirmación de entrega",
      descripcion: "Confirma al cliente la entrega exitosa de su pedido.",
      estado: "ENTREGADO",
      estadoColor: "bg-success/10 text-success border-success/20",
      canal: "Email",
      activa: false,
      ultimaActualizacion: "28 Abr 2026",
    },
  ];

  return (
    <div className="flex h-full flex-col animate-fade-in">
      <PageHeader
        title="Notificaciones"
        subtitle="Agrega notificaciones para cada uno de los estados de tus despachos y para tus clientes finales."
        actions={
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              className="gap-2 border-primary/20 hover:bg-primary/5 text-primary font-semibold"
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
            <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/30 text-[10px] uppercase tracking-wider text-muted-foreground">
                      <th className="px-6 py-4 font-bold">NOTIFICACIÓN</th>
                      <th className="px-4 py-4 font-bold text-center">ESTADO</th>
                      <th className="px-4 py-4 font-bold text-center">CANAL</th>
                      <th className="px-4 py-4 font-bold text-center">ACTIVA</th>
                      <th className="px-4 py-4 font-bold">ÚLTIMA ACTUALIZACIÓN</th>
                      <th className="px-4 py-4 font-bold text-right"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {mockNotifications.map((n) => (
                      <tr key={n.id} className="group hover:bg-muted/20 transition-colors">
                        <td className="px-6 py-5">
                          <div className="space-y-1">
                            <p className="font-bold text-foreground leading-tight">{n.titulo}</p>
                            <p className="text-[11px] text-muted-foreground">{n.descripcion}</p>
                          </div>
                        </td>
                        <td className="px-4 py-5 text-center">
                          <span className={cn("inline-flex items-center rounded px-2 py-0.5 text-[9px] font-black uppercase tracking-tighter border", n.estadoColor)}>
                            {n.estado}
                          </span>
                        </td>
                        <td className="px-4 py-5 text-center">
                          <div className="flex items-center justify-center gap-2 text-muted-foreground">
                            <Mail className="size-3.5" />
                            <span className="text-xs font-medium">{n.canal}</span>
                          </div>
                        </td>
                        <td className="px-4 py-5 text-center">
                          <span className={cn(
                            "inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold",
                            n.activa 
                              ? "bg-success/10 text-success border border-success/20" 
                              : "bg-muted text-muted-foreground border border-border"
                          )}>
                            {n.activa ? "Activa" : "Inactiva"}
                          </span>
                        </td>
                        <td className="px-4 py-5 text-xs text-muted-foreground font-medium">
                          {n.ultimaActualizacion}
                        </td>
                        <td className="px-6 py-5 text-right">
                          <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button variant="ghost" size="icon" className="size-8 text-muted-foreground hover:text-primary">
                              <Edit2 className="size-3.5" />
                            </Button>
                            <Button variant="ghost" size="icon" className="size-8 text-muted-foreground hover:text-destructive">
                              <Trash2 className="size-3.5" />
                            </Button>
                            <Button variant="ghost" size="icon" className="size-8 text-muted-foreground">
                               <Plus className="size-3.5 rotate-45" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="flex items-center justify-between border-t border-border p-4 bg-muted/10">
                <p className="text-[11px] text-muted-foreground">
                  Mostrando <span className="font-bold text-foreground">1 - 3</span> de <span className="font-bold text-foreground">3</span> notificaciones
                </p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="h-8 text-[11px] font-bold px-4" disabled>
                    Anterior
                  </Button>
                  <Button variant="outline" size="sm" className="h-8 text-[11px] font-bold px-4" disabled>
                    Siguiente
                  </Button>
                </div>
              </div>
            </div>
          </main>

          {/* Sidebar (Right) */}
          <aside className="w-full shrink-0 space-y-6 lg:w-96">

            <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-6">
              <div className="space-y-4">
                <div className="border-b border-border pb-4">
                  <h3 className="text-xs font-bold uppercase tracking-widest">
                    SUSCRIPCIONES AUTOMÁTICAS
                  </h3>
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Tus clientes recibirán notificaciones automáticamente sin tener que suscribirse en el widget.
                </p>
                <div className="flex items-center space-x-3 rounded-lg border border-border/50 bg-background/50 p-3">
                  <Checkbox id="email" checked />
                  <label htmlFor="email" className="text-xs font-medium cursor-pointer">
                    Email
                  </label>
                </div>
                <div className="flex items-start gap-3 rounded-lg border border-warning/30 bg-warning/5 p-4">
                  <Info className="size-4 text-warning shrink-0 mt-0.5" />
                  <p className="text-[10px] leading-relaxed text-warning/90">
                    En este momento su cuenta no tiene habilitado el envío de notificaciones vía SMS o Whatsapp. 
                    Contáctese con <span className="font-bold underline">soporte@dispatchtrack.com</span> para más información.
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="border-b border-border pb-4">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                    NOTIFICACIONES ENVIADAS
                  </h3>
                </div>
                <p className="text-[10px] text-muted-foreground italic">
                  Notificaciones enviadas a partir del primer día del mes hasta la fecha.
                </p>
                <div className="grid grid-cols-2 gap-4 border-b border-border pb-6">
                  <div className="text-center space-y-1">
                    <p className="text-2xl font-black">0</p>
                    <p className="text-[10px] font-semibold uppercase text-muted-foreground tracking-tighter">Emails enviados</p>
                  </div>
                  <div className="text-center space-y-1 border-l border-border">
                    <p className="text-2xl font-black text-muted-foreground/50">0</p>
                    <p className="text-[10px] font-semibold uppercase text-muted-foreground tracking-tighter">SMS enviados</p>
                  </div>
                </div>
                <div className="text-center pt-2">
                   <p className="text-2xl font-black text-muted-foreground/50">0</p>
                   <p className="text-[10px] font-semibold uppercase text-muted-foreground tracking-tighter">Whatsapp enviados</p>
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
