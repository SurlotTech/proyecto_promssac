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
import { statusMeta, type VehicleStatus } from "@/data/vehicles";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const NewVehicleDialog = ({ open, onOpenChange }: Props) => {
  const [plate, setPlate] = useState("");
  const [type, setType] = useState("");
  const [driver, setDriver] = useState("");
  const [status, setStatus] = useState<VehicleStatus>("active");

  const handleSave = () => {
    if (!plate || !type) return;
    toast.success(`Vehículo ${plate} creado correctamente`);
    setPlate("");
    setType("");
    setDriver("");
    setStatus("active");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
            <Label>Conductor asociado</Label>
            <Select value={driver || undefined} onValueChange={setDriver}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar conductor (opcional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cm">Carlos Mendoza</SelectItem>
                <SelectItem value="et">Emerson Tineo</SelectItem>
                <SelectItem value="ji">Jorge Ilizarbe</SelectItem>
                <SelectItem value="ms">María Sánchez</SelectItem>
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
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            disabled={!plate || !type}
            className="bg-primary hover:bg-primary-hover"
          >
            Guardar vehículo
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default NewVehicleDialog;
