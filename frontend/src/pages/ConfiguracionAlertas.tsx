import { useState } from "react";
import {
  BellRing,
  Download,
  Save,
  MapPin,
  Clock,
  MessageSquare,
  Activity,
  Timer,
} from "lucide-react";
import PageHeader from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const ConfiguracionAlertas = () => {
  const [alerts, setAlerts] = useState({
    estados: true,
    feedback: true,
    rango: true,
    tiempo: false,
    cliente: false,
  });

  const toggleAlert = (key: keyof typeof alerts) => {
    setAlerts((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="flex h-full flex-col animate-fade-in">
      <PageHeader
        title="Configuración de Alertas"
        subtitle="Define los parámetros y umbrales para las notificaciones del sistema."
        actions={
          <Button variant="outline" className="h-9 gap-2 border-primary/20 text-primary hover:bg-primary-soft">
            <Download className="size-4" />
            Exportar a Excel
          </Button>
        }
      />

      <div className="flex-1 overflow-y-auto scrollbar-thin p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-4xl space-y-6">
          {/* ALERTA POR ESTADOS */}
          <Card className={cn(
            "overflow-hidden transition-all duration-300 border-border bg-card/40 backdrop-blur-md shadow-sm",
            alerts.estados ? "ring-1 ring-primary/20" : "opacity-70 grayscale-[0.5]"
          )}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 border-b border-border/50 pb-4">
              <div className="flex items-center gap-3">
                <div className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-lg transition-colors",
                  alerts.estados ? "bg-[#f43f3e] text-white shadow-glow" : "bg-muted text-muted-foreground"
                )}>
                  <Activity className="size-5" />
                </div>
                <CardTitle className="text-base font-bold uppercase tracking-wider">Alerta por Estados</CardTitle>
              </div>
              <Switch checked={alerts.estados} onCheckedChange={() => toggleAlert("estados")} />
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Estado</Label>
                  <Select disabled={!alerts.estados} defaultValue="item1">
                    <SelectTrigger className="h-11 rounded-xl border-border/60 bg-background/30 transition-all focus:ring-2 focus:ring-primary/20">
                      <SelectValue placeholder="Seleccione un elemento" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="item1">En camino</SelectItem>
                      <SelectItem value="item2">Entregado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Subestado</Label>
                  <Select disabled={!alerts.estados} defaultValue="sub1">
                    <SelectTrigger className="h-11 rounded-xl border-border/60 bg-background/30 transition-all focus:ring-2 focus:ring-primary/20">
                      <SelectValue placeholder="Seleccione un elemento" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sub1">Tráfico intenso</SelectItem>
                      <SelectItem value="sub2">Dirección no encontrada</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* ALERTA POR ENTREGA FUERA DE TIEMPO */}
          <Card className={cn(
            "overflow-hidden transition-all duration-300 border-border bg-card/40 backdrop-blur-md shadow-sm",
            alerts.tiempo ? "ring-1 ring-primary/20" : "opacity-70 grayscale-[0.5]"
          )}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 border-b border-border/50 pb-4">
              <div className="flex items-center gap-3">
                <div className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-lg transition-colors",
                  alerts.tiempo ? "bg-[#f43f3e] text-white shadow-glow" : "bg-muted text-muted-foreground"
                )}>
                  <Clock className="size-5" />
                </div>
                <CardTitle className="text-base font-bold uppercase tracking-wider">Entrega fuera de tiempo</CardTitle>
              </div>
              <Switch checked={alerts.tiempo} onCheckedChange={() => toggleAlert("tiempo")} />
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-2 max-w-sm">
                <Label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Minutos de tolerancia</Label>
                <div className="relative">
                  <Input 
                    type="number" 
                    disabled={!alerts.tiempo} 
                    defaultValue="20" 
                    className="h-11 rounded-xl border-border/60 bg-background/30 pr-12 transition-all focus:ring-2 focus:ring-primary/20"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-muted-foreground">Min</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* ALERTA POR EXCESO DE TIEMPO EN CLIENTE */}
          <Card className={cn(
            "overflow-hidden transition-all duration-300 border-border bg-card/40 backdrop-blur-md shadow-sm",
            alerts.cliente ? "ring-1 ring-primary/20" : "opacity-70 grayscale-[0.5]"
          )}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 border-b border-border/50 pb-4">
              <div className="flex items-center gap-3">
                <div className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-lg transition-colors",
                  alerts.cliente ? "bg-[#f43f3e] text-white shadow-glow" : "bg-muted text-muted-foreground"
                )}>
                  <Timer className="size-5" />
                </div>
                <CardTitle className="text-base font-bold uppercase tracking-wider">Exceso de tiempo en cliente</CardTitle>
              </div>
              <Switch checked={alerts.cliente} onCheckedChange={() => toggleAlert("cliente")} />
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Radio de geocerca</Label>
                  <div className="relative">
                    <Input 
                      type="number" 
                      disabled={!alerts.cliente} 
                      defaultValue="500" 
                      className="h-11 rounded-xl border-border/60 bg-background/30 pr-12 transition-all focus:ring-2 focus:ring-primary/20"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-muted-foreground">Mts</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Tiempo de estadía</Label>
                  <div className="relative">
                    <Input 
                      type="number" 
                      disabled={!alerts.cliente} 
                      defaultValue="30" 
                      className="h-11 rounded-xl border-border/60 bg-background/30 pr-12 transition-all focus:ring-2 focus:ring-primary/20"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-muted-foreground">Min</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-center pt-4 pb-12">
            <Button className="h-12 w-full max-w-xs gap-2 bg-[#f43f3e] hover:bg-[#d93534] text-white shadow-lg shadow-red-500/20 transition-all hover:scale-105 active:scale-95 font-bold">
              <Save className="size-5" />
              Guardar configuración
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfiguracionAlertas;
