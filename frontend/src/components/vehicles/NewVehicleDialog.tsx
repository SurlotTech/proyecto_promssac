import { useState } from "react";
import { X } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { statusMeta, type VehicleStatus } from "@/domain/vehicles";
import { vehiclesApi } from "@/services";
import { VehicleDriverSelect } from "@/components/vehicles/VehicleDriverSelect";
import { cn } from "@/lib/utils";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated?: () => void;
}

const DEFAULT_VEHICLE_GROUP = "General";

const inputClass = "h-11 rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-900 shadow-sm transition-all placeholder:text-slate-400 hover:border-slate-300 focus-visible:border-ring focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/20 focus-visible:ring-offset-0";

const selectTriggerClass = "h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-900 shadow-sm transition-all hover:border-slate-300 focus:border-ring focus:ring-4 focus:ring-ring/20 focus:ring-offset-0 focus-visible:ring-offset-0 [&>span]:line-clamp-1 [&>span]:w-full [&>span]:truncate [&>span]:text-left [&>span[data-placeholder]]:font-normal [&>span[data-placeholder]]:text-slate-400";

const NewVehicleDialog = ({ open, onOpenChange, onCreated }: Props) => {
  const [plate, setPlate] = useState("");
  const [type, setType] = useState("");
  const [driverId, setDriverId] = useState("");
  const [status, setStatus] = useState<VehicleStatus>("active");
  const [saving, setSaving] = useState(false);

  const reset = () => {
    setPlate("");
    setType("");
    setDriverId("");
    setStatus("active");
  };

  const canSubmit = plate.trim().length > 0 && type.trim().length > 0;

  const handleSave = async () => {
    if (!canSubmit) return;
    setSaving(true);
    try {
      await vehiclesApi.create({
        plate: plate.trim().toUpperCase(),
        type,
        group: DEFAULT_VEHICLE_GROUP,
        driver: null,
        ...(driverId.trim() ? { driverId: driverId.trim() } : {}),
        status,
        capacityKg: 1200,
        loadPct: 0,
        autoManaged: false,
      });
      toast.success(`Vehículo ${plate.trim().toUpperCase()} registrado.`);
      reset();
      onCreated?.();
      onOpenChange(false);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Error al guardar");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          "max-h-[min(90vh,740px)] gap-0 overflow-y-auto p-8 sm:max-w-[600px] bg-white border-0 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] rounded-[1.5rem]",
          "[&>button]:hidden",
        )}
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <button
          onClick={() => onOpenChange(false)}
          className="absolute right-6 top-6 rounded-full bg-red-50 p-2 text-red-500 hover:bg-red-100 transition-colors"
          aria-label="Cerrar"
        >
          <X className="h-4 w-4" strokeWidth={2.5} />
        </button>

        <div className="flex flex-col">
          <header className="mb-6">
            <DialogTitle className="text-[1.35rem] font-bold tracking-tight text-slate-900">
              Nuevo vehículo
            </DialogTitle>
            <p className="mt-1.5 text-sm text-slate-500 font-normal">
              Registra un vehículo en tu flota
            </p>
          </header>

          <div className="">
            <div className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="plate" className="text-[0.8rem] font-medium text-slate-700">
                  Placa o identificador <span className="text-primary">*</span>
                </Label>
                <Input
                  id="plate"
                  value={plate}
                  onChange={(e) => setPlate(e.target.value.toUpperCase())}
                  placeholder="Ej: BFS-748"
                  className={cn(inputClass, "w-full")}
                />
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label className="text-[0.8rem] font-medium text-slate-700">
                    Tipo de vehículo <span className="text-primary">*</span>
                  </Label>
                  <Select value={type} onValueChange={setType}>
                    <SelectTrigger className={selectTriggerClass}>
                      <SelectValue placeholder="Selecciona" />
                    </SelectTrigger>
                    <SelectContent align="start" className="rounded-xl border-slate-200 shadow-lg">
                      <SelectItem value="Furgón">Furgón</SelectItem>
                      <SelectItem value="Camión">Camión</SelectItem>
                      <SelectItem value="Moto">Moto</SelectItem>
                      <SelectItem value="Camioneta">Camioneta</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-[0.8rem] font-medium text-slate-700">Estado</Label>
                  <Select value={status} onValueChange={(v) => setStatus(v as VehicleStatus)}>
                    <SelectTrigger className={selectTriggerClass}>
                      <SelectValue placeholder="Selecciona estado" />
                    </SelectTrigger>
                    <SelectContent align="start" className="rounded-xl border-slate-200 shadow-lg">
                      {(Object.keys(statusMeta) as VehicleStatus[]).map((key) => (
                        <SelectItem key={key} value={key}>
                          {statusMeta[key].label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-[0.8rem] font-medium text-slate-700">Conductor asociado</Label>
                <VehicleDriverSelect value={driverId} onChange={setDriverId} triggerClassName={selectTriggerClass} />
              </div>
            </div>
          </div>

          <footer className="mt-9 mb-2 flex items-center justify-center">
            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                className="h-10 border-primary/40 text-primary hover:bg-primary-soft rounded-full px-5 font-semibold transition-colors"
                onClick={() => onOpenChange(false)}
                disabled={saving}
              >
                Cancelar
              </Button>
              <Button
                type="button"
                className="h-10 bg-primary hover:bg-primary-hover text-primary-foreground rounded-full px-6 font-semibold shadow-sm transition-colors"
                onClick={() => void handleSave()}
                disabled={!canSubmit || saving}
              >
                {saving ? "Guardando…" : "Guardar vehículo"}
              </Button>
            </div>
          </footer>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NewVehicleDialog;