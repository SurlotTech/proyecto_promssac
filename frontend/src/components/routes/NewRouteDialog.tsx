import { useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { X } from "lucide-react";
import { 
  Dialog, 
  DialogContent, 
  DialogTitle, 
  DialogDescription, 
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

const selectTriggerClass =
  "h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-900 shadow-sm transition-all hover:border-slate-300 focus:border-ring focus:ring-4 focus:ring-ring/20 focus:ring-offset-0 focus-visible:ring-offset-0 [&>span]:line-clamp-1 [&>span]:w-full [&>span]:truncate [&>span]:text-left [&>span[data-placeholder]]:font-normal [&>span[data-placeholder]]:text-slate-400";

const inputClass =
  "h-11 rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-900 shadow-sm transition-all placeholder:text-slate-400 hover:border-slate-300 focus-visible:border-ring focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/20 focus-visible:ring-offset-0";

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
        form.maxDeliveryDate,
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
              {isEdit ? "Editar Ruta" : "Nueva Ruta"}
            </DialogTitle>
            <DialogDescription className="mt-1.5 text-sm text-slate-500 font-normal">
              {isEdit ? "Modifica los datos de la ruta" : "Agrega una nueva ruta"}
            </DialogDescription>
          </header>

          <div className="space-y-8">
            <section className="space-y-5">
              <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                Información de usuario
              </h3>
              
              <div className="space-y-2">
                <Label htmlFor="route-name" className="text-[0.8rem] font-medium text-slate-700">
                  Nombre de la ruta <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="route-name"
                  value={form.routeName}
                  onChange={(e) => patchForm({ routeName: e.target.value })}
                  placeholder="Ej: Ruta Centro — Mañana"
                  className={cn(inputClass, "w-full shadow-none")}
                  autoComplete="off"
                />
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label className="text-[0.8rem] font-medium text-slate-700">
                    Usuario móvil <span className="text-red-500">*</span>
                  </Label>
                  <Select value={form.mobileUserId} onValueChange={handleMobileChange}>
                    <SelectTrigger className={`${selectTriggerClass} shadow-none`}>
                      <SelectValue placeholder="Seleccionar" />
                    </SelectTrigger>
                    <SelectContent align="start" className="rounded-xl border-slate-200 shadow-lg max-h-[min(50vh,280px)]">
                      {mobileUsers.map((u) => (
                        <SelectItem key={u.id} value={u.id} className="text-sm font-medium text-slate-700 focus:bg-slate-50">
                          {u.nombreCompleto}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-[0.8rem] font-medium text-slate-700">
                    Vehículo <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={form.vehicleId}
                    onValueChange={(v) => patchForm({ vehicleId: v })}
                  >
                    <SelectTrigger className={`${selectTriggerClass} shadow-none`}>
                      <SelectValue placeholder="Seleccionar" />
                    </SelectTrigger>
                    <SelectContent align="start" className="rounded-xl border-slate-200 shadow-lg max-h-[min(50vh,280px)]">
                      {vehicles.map((v) => (
                        <SelectItem key={v.id} value={v.id} className="text-sm font-medium text-slate-700 focus:bg-slate-50">
                          {v.plate} - {v.type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </section>

            <section className="space-y-5">
              <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                Información de despacho
              </h3>

              <div className="grid gap-5 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="dispatch-date" className="text-[0.8rem] font-medium text-slate-700">
                    Fecha de inicio <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="dispatch-date"
                    type="date"
                    value={form.dispatchDate}
                    onChange={(e) => patchForm({ dispatchDate: e.target.value })}
                    className={cn(inputClass, "w-full tabular-nums block shadow-none")}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="end-date" className="text-[0.8rem] font-medium text-slate-700">
                    Fecha de fin <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="end-date"
                    type="date"
                    value={form.maxDeliveryDate}
                    onChange={(e) => patchForm({ maxDeliveryDate: e.target.value })}
                    className={cn(inputClass, "w-full tabular-nums block shadow-none")}
                  />
                </div>
              </div>
            </section>
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
                onClick={handleSave}
                disabled={!requiredOk || saving}
              >
                {saving ? "Guardando…" : isEdit ? "Actualizar ruta" : "Guardar ruta"}
              </Button>
            </div>
          </footer>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NewRouteDialog;

