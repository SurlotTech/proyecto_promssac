import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { MobileUserRouteOption } from "@/domain/mobileUsers";
import { mobileUserRouteSelectLabel } from "@/domain/mobileUsers";
import type { VehicleOption } from "@/domain/vehicles";
import { vehicleRouteSelectLabel } from "@/domain/vehicles";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vehicles: VehicleOption[];
  mobileUsers: MobileUserRouteOption[];
}

/** Select compacto: texto elegido en semibold; placeholder más suave */
const selectTriggerClass =
  "h-9 w-full border-border/80 bg-background px-3 text-sm shadow-sm transition-colors hover:bg-muted/50 focus:ring-2 focus:ring-ring focus:ring-offset-0 [&>span]:line-clamp-1 [&>span]:w-full [&>span]:truncate [&>span]:text-left [&>span]:font-semibold [&>span]:text-foreground [&>span[data-placeholder]]:font-normal [&>span[data-placeholder]]:text-muted-foreground";

/** Inputs fecha/hora en bloque despacho (ligero contraste, sin caja gigante) */
const dispatchInputClass =
  "h-9 border-border/80 bg-muted/50 text-sm font-medium text-foreground shadow-sm focus-visible:ring-2 focus-visible:ring-ring";

function emptyForm() {
  return {
    routeName: "",
    mobileUserId: "",
    vehicleId: "",
    dispatchDate: "",
    startTime: "",
    maxDeliveryDate: "",
    maxDeliveryTime: "",
    minGapMinutes: "20",
  };
}

function resolveVehicleIdForMobile(
  mobileId: string,
  mobileUsers: MobileUserRouteOption[],
  vehicles: VehicleOption[],
): string {
  const u = mobileUsers.find((m) => m.id === mobileId);
  if (!u?.vehiculoId) return "";
  return vehicles.some((v) => v.id === u.vehiculoId) ? u.vehiculoId : "";
}

const NewRouteDialog = ({ open, onOpenChange, vehicles, mobileUsers }: Props) => {
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    if (!open) {
      setForm(emptyForm());
    }
  }, [open]);

  const requiredOk =
    form.routeName.trim() &&
    form.mobileUserId &&
    form.vehicleId &&
    form.dispatchDate &&
    form.startTime;

  const handleMobileChange = (mobileId: string) => {
    const vehicleId = resolveVehicleIdForMobile(mobileId, mobileUsers, vehicles);
    setForm((f) => ({
      ...f,
      mobileUserId: mobileId,
      vehicleId,
    }));
  };

  const handleSave = () => {
    if (!requiredOk) {
      toast.error("Completa los campos obligatorios marcados con *.");
      return;
    }
    toast.success("Ruta registrada correctamente.");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          "max-h-[min(90vh,720px)] gap-0 overflow-hidden p-0 sm:max-w-xl",
          "[&>button]:hidden",
        )}
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <div className="flex max-h-[inherit] flex-col">
          <header className="flex shrink-0 items-center gap-2 border-b border-border px-4 py-3 sm:px-5">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-9 w-9 shrink-0 rounded-lg text-foreground hover:bg-muted"
              onClick={() => onOpenChange(false)}
              aria-label="Volver"
            >
              <ArrowLeft className="h-4 w-4" strokeWidth={2} />
            </Button>
            <DialogTitle className="text-lg font-semibold tracking-tight text-foreground">
              Nueva ruta
            </DialogTitle>
          </header>

          <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-5">
            <p className="mb-4 text-[11px] leading-snug text-muted-foreground">
              <span className="font-semibold text-primary">*</span> Indica que el campo es obligatorio
            </p>

            <section className="space-y-3">
              <div className="flex items-center gap-2">
                <h3 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Información de usuario
                </h3>
                <Separator className="flex-1" />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="route-name" className="text-xs text-muted-foreground">
                  Nombre de la ruta / ID de ruta <span className="text-primary">*</span>
                </Label>
                <Input
                  id="route-name"
                  value={form.routeName}
                  onChange={(e) => setForm((f) => ({ ...f, routeName: e.target.value }))}
                  placeholder="Ej: Ruta Centro — Mañana"
                  className="h-9 border-border/80 text-sm font-medium shadow-sm focus-visible:ring-2 focus-visible:ring-ring"
                  autoComplete="off"
                />
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">
                    Usuario móvil (conductor) <span className="text-primary">*</span>
                  </Label>
                  <Select value={form.mobileUserId || undefined} onValueChange={handleMobileChange}>
                    <SelectTrigger className={selectTriggerClass}>
                      <SelectValue placeholder="Seleccionar conductor" />
                    </SelectTrigger>
                    <SelectContent align="start" className="max-h-[min(50vh,280px)]">
                      {mobileUsers.length === 0 ? (
                        <div className="px-2 py-3 text-xs text-muted-foreground">No hay usuarios móviles activos.</div>
                      ) : (
                        mobileUsers.map((u) => (
                          <SelectItem key={u.id} value={u.id} className="text-sm" title={u.nombreCompleto}>
                            {mobileUserRouteSelectLabel(u)}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">
                    Vehículo (placa y tipo) <span className="text-primary">*</span>
                  </Label>
                  <Select
                    value={form.vehicleId || undefined}
                    onValueChange={(v) => setForm((f) => ({ ...f, vehicleId: v }))}
                  >
                    <SelectTrigger className={selectTriggerClass}>
                      <SelectValue placeholder="Seleccionar placa y tipo" />
                    </SelectTrigger>
                    <SelectContent align="start" className="max-h-[min(50vh,280px)]">
                      {vehicles.length === 0 ? (
                        <div className="px-2 py-3 text-xs text-muted-foreground">No hay vehículos cargados.</div>
                      ) : (
                        vehicles.map((v) => (
                          <SelectItem key={v.id} value={v.id} className="text-sm" title={vehicleRouteSelectLabel(v)}>
                            {vehicleRouteSelectLabel(v)}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </section>

            <section className="mt-6 space-y-3">
              <div className="flex items-center gap-2">
                <h3 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Información de despacho
                </h3>
                <Separator className="flex-1" />
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="dispatch-date" className="text-xs text-muted-foreground">
                    Fecha despacho <span className="text-primary">*</span>
                  </Label>
                  <Input
                    id="dispatch-date"
                    type="date"
                    value={form.dispatchDate}
                    onChange={(e) => setForm((f) => ({ ...f, dispatchDate: e.target.value }))}
                    className={cn(dispatchInputClass, "tabular-nums")}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="start-time" className="text-xs text-muted-foreground">
                    Hora inicio <span className="text-primary">*</span>
                  </Label>
                  <Input
                    id="start-time"
                    type="time"
                    value={form.startTime}
                    onChange={(e) => setForm((f) => ({ ...f, startTime: e.target.value }))}
                    className={cn(dispatchInputClass, "tabular-nums")}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="max-delivery-date" className="text-xs text-muted-foreground">
                    Fecha máxima de entrega
                  </Label>
                  <Input
                    id="max-delivery-date"
                    type="date"
                    value={form.maxDeliveryDate}
                    onChange={(e) => setForm((f) => ({ ...f, maxDeliveryDate: e.target.value }))}
                    className={cn(dispatchInputClass, "tabular-nums")}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="max-delivery-time" className="text-xs text-muted-foreground">
                    Hora máxima de entrega
                  </Label>
                  <Input
                    id="max-delivery-time"
                    type="time"
                    value={form.maxDeliveryTime}
                    onChange={(e) => setForm((f) => ({ ...f, maxDeliveryTime: e.target.value }))}
                    className={cn(dispatchInputClass, "tabular-nums")}
                  />
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <Label htmlFor="min-gap" className="text-xs text-muted-foreground">
                    Tiempo mínimo entre entregas (minutos)
                  </Label>
                  <Input
                    id="min-gap"
                    type="number"
                    min={0}
                    step={1}
                    value={form.minGapMinutes}
                    onChange={(e) => setForm((f) => ({ ...f, minGapMinutes: e.target.value }))}
                    placeholder="20"
                    className={cn(dispatchInputClass, "max-w-[10rem] tabular-nums")}
                  />
                </div>
              </div>
            </section>
          </div>

          <footer className="shrink-0 border-t border-border bg-muted/30 px-4 py-3 sm:px-5">
            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end sm:gap-3">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-9 w-full sm:w-auto sm:min-w-[120px]"
                onClick={() => onOpenChange(false)}
              >
                Cancelar
              </Button>
              <Button
                type="button"
                size="sm"
                className="h-9 w-full bg-primary text-primary-foreground hover:bg-primary-hover sm:w-auto sm:min-w-[140px]"
                onClick={handleSave}
                disabled={!requiredOk}
              >
                Guardar ruta
              </Button>
            </div>
          </footer>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NewRouteDialog;
