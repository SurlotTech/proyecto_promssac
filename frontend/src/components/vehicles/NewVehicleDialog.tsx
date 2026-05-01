import { useState } from "react";
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
import { statusMeta, type VehicleStatus } from "@/domain/vehicles";
import { vehiclesApi } from "@/services";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated?: () => void;
}

const NewVehicleDialog = ({ open, onOpenChange, onCreated }: Props) => {
  const [plate, setPlate] = useState("");
  const [type, setType] = useState("");
  const [group, setGroup] = useState("Lima Norte");
  const [driver, setDriver] = useState("");
  const [status, setStatus] = useState<VehicleStatus>("active");
  const [saving, setSaving] = useState(false);

  const reset = () => {
    setPlate("");
    setType("");
    setGroup("Lima Norte");
    setDriver("");
    setStatus("active");
  };

  const handleSave = async () => {
    if (!plate || !type) return;
    setSaving(true);
    try {
      await vehiclesApi.create({
        plate: plate.trim().toUpperCase(),
        type,
        group,
        driver: driver.trim() === "" ? null : driver.trim(),
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
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) reset();
        onOpenChange(o);
      }}
    >
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Nuevo vehículo</DialogTitle>
          <DialogDescription>
            Registra un vehículo en tu flota. Los campos con * son obligatorios.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="plate">
                Placa o identificador <span className="text-primary">*</span>
              </Label>
              <Input
                id="plate"
                value={plate}
                onChange={(e) => setPlate(e.target.value.toUpperCase())}
                placeholder="Ej: BFS-748"
              />
            </div>

            <div className="grid gap-2">
              <Label>
                Tipo de vehículo <span className="text-primary">*</span>
              </Label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Furgón">Furgón</SelectItem>
                  <SelectItem value="Camión">Camión</SelectItem>
                  <SelectItem value="Moto">Moto</SelectItem>
                  <SelectItem value="Camioneta">Camioneta</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-2">
            <Label>Grupo operativo</Label>
            <Select value={group} onValueChange={setGroup}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Lima Norte">Lima Norte</SelectItem>
                <SelectItem value="Lima Sur">Lima Sur</SelectItem>
                <SelectItem value="Lima Centro">Lima Centro</SelectItem>
                <SelectItem value="Callao">Callao</SelectItem>
                <SelectItem value="Lima Este">Lima Este</SelectItem>
                <SelectItem value="Lima Oeste">Lima Oeste</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label>Conductor asociado</Label>
            <Select value={driver || undefined} onValueChange={setDriver}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar conductor (opcional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Carlos Mendoza">Carlos Mendoza</SelectItem>
                <SelectItem value="Emerson Tineo">Emerson Tineo</SelectItem>
                <SelectItem value="Jorge Ilizarbe">Jorge Ilizarbe</SelectItem>
                <SelectItem value="María Sánchez">María Sánchez</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label>Estado</Label>
            <Select value={status} onValueChange={(v) => setStatus(v as VehicleStatus)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona estado" />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(statusMeta) as VehicleStatus[]).map((key) => (
                  <SelectItem key={key} value={key}>
                    {statusMeta[key].label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
            Cancelar
          </Button>
          <Button
            onClick={() => void handleSave()}
            disabled={!plate || !type || saving}
            className="bg-primary hover:bg-primary-hover"
          >
            {saving ? "Guardando…" : "Guardar vehículo"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default NewVehicleDialog;
