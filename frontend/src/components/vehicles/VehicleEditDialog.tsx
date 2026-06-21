import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { type Vehicle, type VehicleStatus } from "@/domain/vehicles";
import { vehiclesApi } from "@/services";
import { User } from "lucide-react";
import { VehicleDriverSelect } from "@/components/vehicles/VehicleDriverSelect";

interface Props {
  vehicle: Vehicle | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdated?: () => void;
}

const DEFAULT_VEHICLE_GROUP = "General";

const VehicleEditDialog = ({ vehicle, open, onOpenChange, onUpdated }: Props) => {
  const [plate, setPlate] = useState("");
  const [type, setType] = useState("");
  const [driverId, setDriverId] = useState("");
  const [status, setStatus] = useState<VehicleStatus>("active");
  const [capacityKg, setCapacityKg] = useState("1200");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (vehicle) {
      setPlate(vehicle.plate);
      setType(vehicle.type);
      setStatus(vehicle.status);
      setCapacityKg(vehicle.capacityKg.toString());
    }
  }, [vehicle, open]);

  useEffect(() => {
    if (!vehicle || !open) return;
    setDriverId(vehicle.driverId?.trim() ?? "");
  }, [vehicle, open]);

  const handleSave = async () => {
    if (!vehicle || !plate || !type) return;
    setSaving(true);
    try {
      await vehiclesApi.update(vehicle.id, {
        plate: plate.trim().toUpperCase(),
        type,
        group: DEFAULT_VEHICLE_GROUP,
        driver: null,
        ...(driverId.trim() ? { driverId: driverId.trim() } : {}),
        status,
        capacityKg: parseInt(capacityKg) || 0,
        loadPct: vehicle.loadPct,
        autoManaged: false,
      });
      toast.success(`Vehículo ${plate.trim().toUpperCase()} actualizado.`);
      onUpdated?.();
      onOpenChange(false);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Error al guardar");
    } finally {
      setSaving(false);
    }
  };

  if (!vehicle) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 sm:max-w-lg overflow-hidden border-none shadow-2xl" aria-describedby={undefined}>
        <div className="flex flex-col h-full bg-white">
          <DialogHeader className="p-6 pb-4 border-b border-border bg-white">
            <div className="text-left">
              <DialogTitle className="text-xl text-foreground">
                Editar Vehículo: {vehicle.plate}
              </DialogTitle>
            </div>
          </DialogHeader>

          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="edit-plate" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Placa / Identificador
                </Label>
                <Input
                  id="edit-plate"
                  value={plate}
                  onChange={(e) => setPlate(e.target.value.toUpperCase())}
                  className="h-10 border-border/80 focus-visible:ring-primary/20"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Tipo de vehículo
                </Label>
                <Select value={type} onValueChange={setType}>
                  <SelectTrigger className="h-10 border-border/80">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Furgón">Furgón</SelectItem>
                    <SelectItem value="Camión">Camión</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Conductor asignado
              </Label>
              <div className="flex items-start gap-2">
                <User className="mt-2.5 h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
                <VehicleDriverSelect
                  value={driverId}
                  onChange={setDriverId}
                  triggerClassName="border-border/80"
                  placeholder="Sin asignar"
                />
              </div>
            </div>
          </div>

          <DialogFooter className=" bg-zinc-50/50 p-6 pt-1 sm:justify-end shrink-0">
            <Button 
              variant="outline" 
              onClick={() => onOpenChange(false)} 
              disabled={saving}
              className="h-10 font-medium"
            >
              Cancelar
            </Button>
            <Button
              onClick={() => void handleSave()}
              disabled={!plate || !type || saving}
              className="h-10 bg-primary text-primary-foreground shadow-sm hover:bg-primary-hover px-8 font-semibold"
            >
              {saving ? "Guardando..." : "Guardar cambios"}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default VehicleEditDialog;
