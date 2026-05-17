import { useState } from "react";
import {
  Save,
  Clock,
  CheckCircle,
} from "lucide-react";
import PageHeader from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const ConfiguracionAlertas = () => {
  const [alerts, setAlerts] = useState({
    entregado: true,
    demora: true,
  });

  const [demoraMinutos, setDemoraMinutos] = useState("20");

  const toggleAlert = (key: keyof typeof alerts) => {
    setAlerts((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="flex h-full flex-col animate-fade-in">
      <PageHeader
        title="Configuración de Alertas"
        subtitle="Define los parámetros para las notificaciones del sistema."
      />

      <div className="flex-1 overflow-y-auto scrollbar-thin p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-4xl space-y-6">
          <Card className={cn(
            "overflow-hidden transition-all duration-300 border-border bg-card/40 backdrop-blur-md shadow-sm",
            alerts.entregado ? "ring-1 ring-primary/20" : "opacity-70 grayscale-[0.5]"
          )}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 border-b border-border/50 pb-4">
              <div className="flex items-center gap-3">
                <div className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-lg transition-colors",
                  alerts.entregado ? "bg-emerald-500 text-white shadow-glow" : "bg-muted text-muted-foreground"
                )}>
                  <CheckCircle className="size-5" />
                </div>
                <CardTitle className="text-base font-bold uppercase tracking-wider">Alerta por estado Entregado</CardTitle>
              </div>
              <Switch checked={alerts.entregado} onCheckedChange={() => toggleAlert("entregado")} />
            </CardHeader>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">
                Se envía una notificación cuando una orden cambia al estado "Entregado".
              </p>
            </CardContent>
          </Card>

          <Card className={cn(
            "overflow-hidden transition-all duration-300 border-border bg-card/40 backdrop-blur-md shadow-sm",
            alerts.demora ? "ring-1 ring-primary/20" : "opacity-70 grayscale-[0.5]"
          )}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 border-b border-border/50 pb-4">
              <div className="flex items-center gap-3">
                <div className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-lg transition-colors",
                  alerts.demora ? "bg-amber-500 text-white shadow-glow" : "bg-muted text-muted-foreground"
                )}>
                  <Clock className="size-5" />
                </div>
                <CardTitle className="text-base font-bold uppercase tracking-wider">Alerta por Demora</CardTitle>
              </div>
              <Switch checked={alerts.demora} onCheckedChange={() => toggleAlert("demora")} />
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-2 max-w-sm">
                <Label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Minutos de tolerancia</Label>
                <div className="relative">
                  <Input
                    type="number"
                    disabled={!alerts.demora}
                    value={demoraMinutos}
                    onChange={(e) => setDemoraMinutos(e.target.value)}
                    className="h-11 rounded-xl border-border/60 bg-background/30 pr-12 transition-all focus:ring-2 focus:ring-primary/20"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-muted-foreground">Min</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-center pt-4 pb-12">
            <Button className="h-12 w-full max-w-xs gap-2 bg-primary hover:bg-primary-hover shadow-lg transition-all hover:scale-105 active:scale-95 font-bold">
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