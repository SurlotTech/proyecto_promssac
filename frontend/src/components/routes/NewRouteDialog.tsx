import { useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { User, Truck, Calendar, Clock, Timer } from "lucide-react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
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
import { cn } from "@/lib/utils";
import type { MobileUserRouteOption } from "@/domain/mobileUsers";
import type { Route } from "@/domain/routes";
import {
  buildRouteWriteBody,
  emptyRouteForm,
  routeToFormState,
  vehicleIdForMobileUser,
  type RouteFormState,
} from "@/lib/routeForm";
import { useInvalidateRoutesQuery } from "@/hooks/useRoutesQueryInvalidation";
import type { VehicleOption } from "@/domain/vehicles";
import { routesApi, type RouteWriteBody } from "@/services/routes.api";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vehicles: VehicleOption[];
  mobileUsers: MobileUserRouteOption[];
  editingRoute?: Route | null;
}

const selectMaxHeightClass = "max-h-[min(50vh,280px)]";

const NewRouteDialog = ({ open, onOpenChange, vehicles, mobileUsers, editingRoute }: Props) => {
  const invalidateRoutes = useInvalidateRoutesQuery();
  const [form, setForm] = useState<RouteFormState>(emptyRouteForm);
  const isEdit = Boolean(editingRoute);

  useEffect(() => {
    if (!open) {
      setForm(emptyRouteForm());
      return;
    }
    setForm(editingRoute ? routeToFormState(editingRoute, mobileUsers) : emptyRouteForm());
  }, [open, editingRoute, mobileUsers]);

  const finishSuccess = (msg: string) => {
    invalidateRoutes();
    toast.success(msg);
    onOpenChange(false);
  };

  const createMut = useMutation({
    mutationFn: (body: RouteWriteBody) => routesApi.create(body),
    onSuccess: () => finishSuccess("Ruta creada correctamente."),
    onError: (e: Error) => toast.error(e.message),
  });

  const updateMut = useMutation({
    mutationFn: ({ id, body }: { id: string; body: RouteWriteBody }) => routesApi.update(id, body),
    onSuccess: () => finishSuccess("Ruta actualizada."),
    onError: (e: Error) => toast.error(e.message),
  });

  const saving = createMut.isPending || updateMut.isPending;

  const requiredOk =
    Boolean(
      form.routeName.trim() &&
        form.mobileUserId &&
        form.vehicleId &&
        form.dispatchDate &&
        form.startTime,
    );

  const patchForm = (partial: Partial<RouteFormState>) =>
    setForm((f) => ({ ...f, ...partial }));

  const handleMobileChange = (mobileId: string) => {
    patchForm({
      mobileUserId: mobileId,
      vehicleId: vehicleIdForMobileUser(mobileId, mobileUsers, vehicles),
    });
  };

  const handleSave = () => {
    if (!requiredOk) {
      toast.error("Completa los campos obligatorios marcados con *.");
      return;
    }
    const body = buildRouteWriteBody(form, editingRoute ?? null);
    if (editingRoute) {
      updateMut.mutate({ id: editingRoute.id, body });
    } else {
      createMut.mutate(body);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 sm:max-w-2xl overflow-hidden border-none shadow-2xl">
        <div className="flex flex-col h-full bg-white">
          <DialogHeader className="p-6 pb-4 border-b border-border bg-white">
            <div className="text-left">
              <DialogTitle className="text-xl text-foreground font-bold">
                {isEdit ? "Editar Ruta" : "Nueva Ruta"}
              </DialogTitle>
            </div>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto px-8 py-6 space-y-8 scrollbar-thin max-h-[min(80vh,600px)]">
            <p className="text-[11px] text-muted-foreground italic">
              <span className="text-primary font-bold">*</span> Indica que el campo es obligatorio
            </p>

            {/* SECCIÓN: INFORMACIÓN DE USUARIO */}
            <div className="space-y-6">
              <h3 className="text-sm font-bold text-[#3f4254]">
                Información de usuario
              </h3>
              
              <div className="space-y-2">
                <Label htmlFor="route-name" className="text-xs font-semibold text-muted-foreground">
                  Nombre de la ruta <span className="text-primary">*</span>
                </Label>
                <Input
                  id="route-name"
                  value={form.routeName}
                  onChange={(e) => patchForm({ routeName: e.target.value })}
                  placeholder="Ej: Ruta Centro — Mañana"
                  className="h-11 bg-zinc-50 border-zinc-200 focus:ring-1 focus:ring-primary/20 font-medium"
                />
              </div>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-muted-foreground">
                    Usuario móvil <span className="text-primary">*</span>
                  </Label>
                  <Select value={form.mobileUserId || undefined} onValueChange={handleMobileChange}>
                    <SelectTrigger className="h-11 bg-zinc-50 border-zinc-200">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <SelectValue placeholder="Seleccionar" />
                      </div>
                    </SelectTrigger>
                    <SelectContent align="start" className={selectMaxHeightClass}>
                      {mobileUsers.map((u) => (
                        <SelectItem key={u.id} value={u.id}>
                          {u.nombreCompleto}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-muted-foreground">
                    Vehículo <span className="text-primary">*</span>
                  </Label>
                  <Select
                    value={form.vehicleId || undefined}
                    onValueChange={(v) => patchForm({ vehicleId: v })}
                  >
                    <SelectTrigger className="h-11 bg-zinc-50 border-zinc-200">
                      <div className="flex items-center gap-2">
                        <Truck className="h-4 w-4 text-muted-foreground" />
                        <SelectValue placeholder="Seleccionar" />
                      </div>
                    </SelectTrigger>
                    <SelectContent align="start" className={selectMaxHeightClass}>
                      {vehicles.map((v) => (
                        <SelectItem key={v.id} value={v.id}>
                          {v.plate} - {v.type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* SECCIÓN: INFORMACIÓN DE DESPACHO */}
            <div className="space-y-6">
              <h3 className="text-sm font-bold text-[#3f4254]">
                Información de despacho
              </h3>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="dispatch-date" className="text-xs font-semibold text-muted-foreground">
                    Fecha despacho <span className="text-primary">*</span>
                  </Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
                    <Input
                      id="dispatch-date"
                      type="date"
                      value={form.dispatchDate}
                      onChange={(e) => patchForm({ dispatchDate: e.target.value })}
                      className="h-11 bg-white border-zinc-200 pl-10 focus:ring-1 focus:ring-primary/20"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="start-time" className="text-xs font-semibold text-muted-foreground">
                    Hora inicio <span className="text-primary">*</span>
                  </Label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
                    <Input
                      id="start-time"
                      type="time"
                      value={form.startTime}
                      onChange={(e) => patchForm({ startTime: e.target.value })}
                      className="h-11 bg-white border-zinc-200 pl-10 focus:ring-1 focus:ring-primary/20"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="max-delivery-time" className="text-xs font-semibold text-muted-foreground">
                    Fecha máxima de entrega
                  </Label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
                    <Input
                      id="max-delivery-time"
                      type="time"
                      value={form.maxDeliveryTime}
                      onChange={(e) => patchForm({ maxDeliveryTime: e.target.value })}
                      className="h-11 bg-white border-zinc-200 pl-10 focus:ring-1 focus:ring-primary/20"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="min-gap" className="text-xs font-semibold text-muted-foreground">
                    Tiempo mínimo entre entregas
                  </Label>
                  <div className="relative">
                    <Timer className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
                    <Input
                      id="min-gap"
                      type="number"
                      min={0}
                      value={form.minGapMinutes}
                      onChange={(e) => patchForm({ minGapMinutes: e.target.value })}
                      placeholder="20"
                      className="h-11 bg-zinc-50 border-zinc-200 pl-10 focus:ring-1 focus:ring-primary/20"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="border-t border-border bg-zinc-50/50 p-6 sm:justify-end shrink-0">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={saving}
              className="h-11 px-8 font-medium"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSave}
              disabled={!requiredOk || saving}
              className="h-11 bg-primary hover:bg-primary-hover text-white px-10 font-bold shadow-lg shadow-primary/20 transition-all"
            >
              {saving ? "Guardando…" : isEdit ? "Update" : "Guardar ruta"}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NewRouteDialog;
