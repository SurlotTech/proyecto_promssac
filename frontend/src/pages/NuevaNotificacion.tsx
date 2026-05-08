import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ChevronRight,
  Info,
  Key,
  Image as ImageIcon,
  Palette,
  Eye,
  Save,
  Clock,
  Filter,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";

const NuevaNotificacion = () => {
  return (
    <div className="flex h-full flex-col animate-fade-in">
      {/* Breadcrumb Header */}
      <div className="flex items-center gap-2 px-6 py-4 text-xs font-medium text-muted-foreground border-b border-border/50">
        <Link to="/configuracion/notificaciones" className="hover:text-primary transition-colors">
          Notificaciones
        </Link>
        <ChevronRight className="size-3" />
        <span className="text-foreground font-semibold">Nueva notificación</span>
      </div>

      <div className="flex flex-1 overflow-hidden p-6">
        <div className="flex w-full flex-col gap-6 lg:flex-row overflow-y-auto pr-2 custom-scrollbar">
          {/* Main Content (Left) */}
          <main className="flex-1 space-y-6">
            {/* Name Section */}
            <div className="space-y-2">
              <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Nombre</Label>
              <Input placeholder="Ej: Notificación de entrega" className="bg-card border-border/50 h-11" />
            </div>

            {/* Email Personalization */}
            <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
              <div className="bg-muted/30 px-5 py-3 border-b border-border flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider">PERSONALIZACIÓN DE EMAIL</h3>
                <Button variant="link" className="text-warning text-xs h-auto p-0 font-bold">
                   <Eye className="size-3.5 mr-1.5" />
                   Previsualizar notificación
                </Button>
              </div>
              
              <div className="p-5 space-y-6">
                {/* Format Alert */}
                <div className="rounded-lg border border-warning/30 bg-warning/5 p-4 flex gap-4">
                  <Info className="size-5 text-warning shrink-0 mt-0.5" />
                  <div className="space-y-3">
                    <p className="text-xs leading-relaxed">
                      Hemos creado un nuevo formato de correo. Mientras tanto, puedes seguir usando el formato antiguo o probar con el nuevo cuando quieras. Puedes previsualizar el cambio con el mismo vínculo de 'Previsualizar notificación'. El formato antiguo dejará de estar disponible en el corto plazo.
                    </p>
                    <RadioGroup defaultValue="antiguo" className="flex gap-6">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="antiguo" id="antiguo" className="border-warning text-warning" />
                        <Label htmlFor="antiguo" className="text-[11px] font-medium">Formato antiguo</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="nuevo" id="nuevo" className="border-warning text-warning" />
                        <Label htmlFor="nuevo" className="text-[11px] font-medium">Nuevo formato</Label>
                      </div>
                    </RadioGroup>
                  </div>
                </div>

                {/* Sender and Subject */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <div className="flex items-center gap-1.5">
                      <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Remitente</Label>
                      <Info className="size-3 text-muted-foreground" />
                    </div>
                    <Input value="DYD PROYECTOS MULTIPLES Y SERVICIOS GENERAL" disabled className="bg-muted/50 text-[11px] border-border/50" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Asunto</Label>
                      <button className="text-[10px] text-info font-bold flex items-center gap-1">
                        <Key className="size-3" />
                        Agregar llaves especiales
                      </button>
                    </div>
                    <div className="flex items-center gap-2 border border-border/50 rounded-md bg-background px-3 h-10 overflow-hidden">
                       <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-info/10 text-info border border-info/20">:company_name:</span>
                       <p className="text-[11px] flex-1">Cambio de estado orden #</p>
                       <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-info/10 text-info border border-info/20">:code:</span>
                    </div>
                  </div>
                </div>

                {/* Body / Rich Text Area */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Cuerpo</Label>
                    <button className="text-[10px] text-info font-bold flex items-center gap-1">
                      <Key className="size-3" />
                      Agregar llaves especiales
                    </button>
                  </div>
                  <div className="rounded-md border border-border/50 bg-background overflow-hidden">
                    <div className="flex items-center gap-4 px-3 py-2 border-b border-border/50 bg-muted/10">
                      <span className="font-serif font-bold text-sm">B</span>
                      <span className="italic font-serif text-sm">I</span>
                      <span className="underline font-serif text-sm">U</span>
                      <div className="h-4 w-px bg-border mx-1" />
                      <div className="flex gap-1.5 opacity-50">
                        <div className="h-3 w-3 border border-foreground" />
                        <div className="h-3 w-3 border border-foreground" />
                        <div className="h-3 w-3 border border-foreground" />
                      </div>
                    </div>
                    <div className="p-4 min-h-[120px] space-y-2">
                      <p className="text-[11px]">Estimado <span className="text-info font-bold bg-info/5 px-1 rounded">:contact_name:</span>,</p>
                      <p className="text-[11px]">A continuación se muestra el estado de su despacho.</p>
                    </div>
                  </div>
                </div>

                {/* Footer Text */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Texto pie de página</Label>
                    <button className="text-[10px] text-info font-bold flex items-center gap-1">
                      <Key className="size-3" />
                      Agregar llaves especiales
                    </button>
                  </div>
                  <div className="rounded-md border border-border/50 bg-background overflow-hidden">
                    <div className="flex items-center gap-4 px-3 py-2 border-b border-border/50 bg-muted/10 grayscale">
                      <span className="font-serif font-bold text-sm">B</span>
                      <span className="italic font-serif text-sm">I</span>
                      <div className="h-4 w-px bg-border mx-1" />
                    </div>
                    <div className="p-4 min-h-[60px]" />
                  </div>
                </div>

                {/* Images Upload */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">URL de imagen de la cabecera</Label>
                    <div className="flex overflow-hidden rounded-md border border-border/50">
                      <Input placeholder="URL" className="border-0 focus-visible:ring-0 h-10 text-xs" />
                      <Button variant="info" className="rounded-none h-10 px-6 bg-info text-white hover:bg-info/90">Subir imagen</Button>
                    </div>
                    <button className="text-[10px] text-warning underline font-medium">Eliminar imagen</button>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">URL de imagen del pie de página</Label>
                    <div className="flex overflow-hidden rounded-md border border-border/50">
                      <Input placeholder="URL" className="border-0 focus-visible:ring-0 h-10 text-xs" />
                      <Button variant="info" className="rounded-none h-10 px-6 bg-info text-white hover:bg-info/90">Subir imagen</Button>
                    </div>
                    <button className="text-[10px] text-warning underline font-medium">Eliminar imagen</button>
                  </div>
                </div>

                {/* Color Theme */}
                <div className="space-y-2 max-w-[300px]">
                  <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Color del tema</Label>
                  <div className="flex items-center gap-2">
                    <Input value="#cccccc" className="bg-card border-border/50 text-xs font-mono h-10" />
                    <div className="size-10 rounded border border-border bg-[#cccccc] shrink-0" />
                  </div>
                </div>
              </div>
            </div>

            {/* Email Deployment Options */}
            <div className="rounded-xl border border-border bg-card shadow-sm p-6 space-y-6">
              <h3 className="text-[11px] font-bold uppercase tracking-widest border-b border-border pb-3">DESPLEGAR EN EMAIL</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-4">
                  <CheckboxItem id="logo" label="Logo de empresa" checked />
                  <CheckboxItem id="mapa" label="Mapa" checked />
                  <CheckboxItem id="formularios" label="Formularios" />
                </div>
                <div className="space-y-4">
                  <CheckboxItem id="widget" label="Enlace al widget" checked />
                  <CheckboxItem id="items" label="Ítems" checked />
                  <CheckboxItem id="campos" label="Campos personalizados de ítems" />
                </div>
                <div className="space-y-4">
                  <CheckboxItem id="foto" label="Foto del usuario móvil" />
                  <CheckboxItem id="datos" label="Datos del despacho" checked />
                  <CheckboxItem id="feedback" label="Feedback" checked />
                </div>
              </div>
            </div>
          </main>

          {/* Sidebar (Right) */}
          <aside className="w-full shrink-0 space-y-6 lg:w-80">
            <div className="rounded-xl border border-border bg-card p-5 shadow-sm space-y-6">
              {/* Type and Substatus */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Tipo de notificación</Label>
                  <Select defaultValue="entregado">
                    <SelectTrigger className="bg-muted/30 border-border/50 h-10 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="entregado" className="text-xs">Entregado</SelectItem>
                      <SelectItem value="pendiente" className="text-xs">Pendiente</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Subestados</Label>
                  <Select defaultValue="todos">
                    <SelectTrigger className="bg-muted/30 border-border/50 h-10 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos" className="text-xs">Todos</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Checks */}
              <div className="space-y-4 pt-2 border-t border-border">
                <CheckboxItem id="recogida" label="Enviar sólo a despachos de recogida" />
                <CheckboxItem id="troncales" label="Enviar sólo a despachos troncales" />
              </div>

              {/* Channel */}
              <div className="space-y-3 pt-2 border-t border-border">
                <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Seleccionar canal</Label>
                <RadioGroup defaultValue="email" className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="email" id="c-email" className="border-warning text-warning" />
                    <Label htmlFor="c-email" className="text-xs font-medium">Email</Label>
                  </div>
                  <div className="flex items-center space-x-2 opacity-50 cursor-not-allowed">
                    <RadioGroupItem value="sms" id="c-sms" disabled />
                    <Label htmlFor="c-sms" className="text-xs font-medium">SMS</Label>
                  </div>
                  <div className="flex items-center space-x-2 opacity-50 cursor-not-allowed">
                    <RadioGroupItem value="whatsapp" id="c-whatsapp" disabled />
                    <Label htmlFor="c-whatsapp" className="text-xs font-medium">Whatsapp</Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Notification Targets */}
              <div className="space-y-4 pt-2 border-t border-border">
                <CheckboxItem id="target-cliente" label="Activar notificación a cliente" checked />
                <CheckboxItem id="target-interna" label="Activar notificación interna" />
                <CheckboxItem id="target-campos" label="Activar notificación a campos personalizados" />
              </div>

              {/* Mute Range */}
              <div className="space-y-4 pt-2 border-t border-border">
                <div className="flex items-center justify-between">
                   <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Silenciar notificaciones</Label>
                   <Switch />
                </div>
                <div className="grid grid-cols-2 gap-4 opacity-50 pointer-events-none">
                  <div className="space-y-1">
                    <Label className="text-[9px] uppercase tracking-wider text-muted-foreground">Desde</Label>
                    <div className="relative">
                      <Clock className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                      <Input placeholder="00:00" className="pl-8 h-9 text-xs bg-muted/30 border-border/50" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[9px] uppercase tracking-wider text-muted-foreground">Hasta</Label>
                    <div className="relative">
                      <Clock className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                      <Input placeholder="00:00" className="pl-8 h-9 text-xs bg-muted/30 border-border/50" />
                    </div>
                  </div>
                </div>
              </div>

              <Button className="w-full bg-warning text-warning-foreground hover:bg-warning/90 shadow-glow h-11 font-bold">
                <Save className="size-4 mr-2" />
                Guardar
              </Button>

              {/* Groups and Filters */}
              <div className="space-y-4 pt-2 border-t border-border">
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">GRUPOS</Label>
                  <Input placeholder="Todas las opciones" className="bg-muted/30 border-border/50 h-10 text-xs" />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">FILTROS</Label>
                  <Button className="w-full bg-info text-white hover:bg-info/90 h-10 text-xs font-bold shadow-sm">
                    <Filter className="size-3.5 mr-2" />
                    Agregar filtro
                  </Button>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

const CheckboxItem = ({ id, label, checked }: { id: string; label: string; checked?: boolean }) => (
  <div className="flex items-center space-x-2.5">
    <Checkbox id={id} defaultChecked={checked} className="border-warning data-[state=checked]:bg-warning data-[state=checked]:text-warning-foreground" />
    <Label htmlFor={id} className="text-xs font-medium cursor-pointer">{label}</Label>
  </div>
);

export default NuevaNotificacion;
