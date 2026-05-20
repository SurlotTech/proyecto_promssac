import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Bell, Clock, Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import PageHeader from "@/components/PageHeader";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import type { AlertaConfig } from "@/services/alertas.api";
import { alertasApi } from "@/services/alertas.api";
import { toast } from "sonner";

const ConfiguracionAlertas = () => {
  const [config, setConfig] = useState<AlertaConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    alertasApi.getConfig()
      .then(setConfig)
      .catch(() => toast.error("No se pudo cargar la configuración de alertas."))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    if (!config) return;
    setSaving(true);
    try {
      const updated = await alertasApi.updateConfig({
        alertaEntregado: config.alertaEntregado,
        alertaDemora: config.alertaDemora,
        demoraMinutos: config.demoraMinutos,
      });
      setConfig(updated);
      toast.success("Configuración de alertas guardada.");
    } catch {
      toast.error("No se pudo guardar la configuración.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center p-12 text-sm text-muted-foreground">
        <Loader2 className="mr-2 size-4 animate-spin" />
        Cargando configuración…
      </div>
    );
  }

  if (!config) {
    return (
      <div className="flex flex-1 items-center justify-center p-12 text-sm text-muted-foreground">
        No se pudo cargar la configuración.
      </div>
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-transparent animate-fade-in">
      <PageHeader
        title="Configuración de alertas"
        subtitle="Define qué eventos generan alertas y sus parámetros."
        actions={
          <Button
            variant="outline"
            className="h-9 gap-2 font-medium"
            asChild
          >
            <Link to="/configuracion/alertas" aria-label="Volver">
              <ArrowLeft className="size-4" />
              Volver
            </Link>
          </Button>
        }
      />

      <div className="flex-1 overflow-y-auto p-4 sm:p-6">
        <div className="mx-auto max-w-2xl space-y-4">
          <div className={cn(
            "flex items-center justify-between rounded-xl border border-border/60 bg-card/80 backdrop-blur-md p-5 shadow-sm",
          )}>
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-full bg-success-soft text-success">
                <Bell className="size-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">Alerta por estado Entregado</p>
                <p className="text-xs text-muted-foreground">Notifica cuando una orden pasa a estado entregado.</p>
              </div>
            </div>
            <Switch
              checked={config.alertaEntregado}
              onCheckedChange={(v) => setConfig((prev) => prev ? { ...prev, alertaEntregado: v } : prev)}
            />
          </div>

          <div className="space-y-4 rounded-xl border border-border/60 bg-card/80 backdrop-blur-md p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-full bg-warning-soft text-warning">
                  <Clock className="size-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">Alerta por Demora</p>
                  <p className="text-xs text-muted-foreground">Notifica cuando una orden excede el tiempo estimado de entrega.</p>
                </div>
              </div>
              <Switch
                checked={config.alertaDemora}
                onCheckedChange={(v) => setConfig((prev) => prev ? { ...prev, alertaDemora: v } : prev)}
              />
            </div>

            {config.alertaDemora && (
              <div className="ml-[52px] space-y-1.5">
                <Label htmlFor="demora-minutos" className="text-xs text-muted-foreground">
                  Minutos de tolerancia
                </Label>
                <Input
                  id="demora-minutos"
                  type="number"
                  min={1}
                  max={1440}
                  value={config.demoraMinutos}
                  onChange={(e) => {
                    const v = parseInt(e.target.value, 10);
                    if (!isNaN(v) && v >= 1 && v <= 1440) {
                      setConfig((prev) => prev ? { ...prev, demoraMinutos: v } : prev);
                    }
                  }}
                  className="h-10 w-32 bg-transparent"
                />
              </div>
            )}
          </div>

          <div className="flex justify-end pt-2">
            <Button
              className="h-10 gap-2 bg-primary px-6 text-primary-foreground hover:bg-primary-hover"
              onClick={() => void handleSave()}
              disabled={saving}
            >
              {saving ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Save className="size-4" />
              )}
              {saving ? "Guardando…" : "Guardar configuración"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfiguracionAlertas;
