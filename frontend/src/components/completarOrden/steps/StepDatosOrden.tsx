import { Info, Truck } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import RouteDateRangePicker from "@/components/routes/RouteDateRangePicker";
import { routePriorityMeta, type RoutePriority } from "@/domain/routes";
import type { Vehicle } from "@/domain/vehicles";
import { useVehiclesQuery } from "@/hooks/useOperationsQueries";
import type { OrderCreationDraft } from "@/lib/orderCreationDraft";
import { fieldInputClass, selectTriggerClass } from "@/lib/completarOrden/constants";
import { cn } from "@/lib/utils";

const SIN_VEHICULO = "__sin_vehiculo__";

function labelVehiculo(v: Vehicle): string {
  const d = v.driver?.trim();
  return d ? `${v.plate} · ${v.type} — ${d}` : `${v.plate} · ${v.type}`;
}

interface Props {
  draft: OrderCreationDraft;
  /** UUID del vehículo o "" si no hay asignación. */
  vehicleId: string;
  onVehicleChange: (id: string) => void;
  deliveryFrom: string;
  deliveryTo: string;
  onDeliveryRangeChange: (from: string, to: string) => void;
  mode: string;
  onModeChange: (v: string) => void;
  priority: RoutePriority;
  onPriorityChange: (v: RoutePriority) => void;
  cod: boolean;
  onCodChange: (v: boolean) => void;
}

const StepDatosOrden = ({
  draft,
  vehicleId,
  onVehicleChange,
  deliveryFrom,
  deliveryTo,
  onDeliveryRangeChange,
  mode,
  onModeChange,
  priority,
  onPriorityChange,
  cod,
  onCodChange,
}: Props) => {
  const { data: vehicles = [], isLoading: cargandoVehiculos } = useVehiclesQuery();
  const vehiculosOrdenados = [...vehicles].sort((a, b) => a.plate.localeCompare(b.plate));
  const vid = vehicleId.trim();
  const existeEnCatalogo = Boolean(vid && vehiculosOrdenados.some((v) => v.id === vid));
  const selectValue = vid ? vid : SIN_VEHICULO;

  return (
  <div className="space-y-6">
    <div className="rounded-lg border border-border/80 bg-muted/20 px-3 py-3 sm:px-4">
      <div className="flex items-start gap-2">
        <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Truck className="size-4" strokeWidth={2} aria-hidden />
        </div>
        <div className="min-w-0 flex-1 space-y-2">
          <div>
            <Label className="text-xs font-medium text-foreground">Vehículo y conductor</Label>
            <p className="mt-0.5 text-[11px] leading-snug text-muted-foreground">
              Placa y chofer provienen del registro de vehículos. Si no asignas uno, la orden queda sin
              vehículo hasta que lo enlaces aquí o por ruta.
            </p>
          </div>
          <Select
            value={selectValue}
            onValueChange={(v) => onVehicleChange(v === SIN_VEHICULO ? "" : v)}
            disabled={cargandoVehiculos}
          >
            <SelectTrigger className={cn(selectTriggerClass, "h-10")}>
              <SelectValue
                placeholder={cargandoVehiculos ? "Cargando vehículos…" : "Seleccionar vehículo"}
              />
            </SelectTrigger>
            <SelectContent align="start">
              <SelectItem value={SIN_VEHICULO} className="text-sm">
                Sin vehículo asignado
              </SelectItem>
              {vid && !existeEnCatalogo ? (
                <SelectItem value={vid} className="text-sm text-amber-800 dark:text-amber-400">
                  Vehículo guardado (no aparece en catálogo actual)
                </SelectItem>
              ) : null}
              {vehiculosOrdenados.map((v) => (
                <SelectItem key={v.id} value={v.id} className="text-sm">
                  {labelVehiculo(v)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>

    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:items-end">
      <div className="space-y-1.5">
        <Label htmlFor="co-order-id" className="text-xs text-muted-foreground">
          Número de la orden <span className="text-primary">*</span>
        </Label>
        <Input
          id="co-order-id"
          readOnly
          value={draft.displayOrderId}
          className={cn(fieldInputClass, "bg-muted/40 tabular-nums")}
        />
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs text-muted-foreground">
          Fecha de entrega <span className="text-primary">*</span>
        </Label>
        <RouteDateRangePicker
          dateFrom={deliveryFrom}
          dateTo={deliveryTo}
          onRangeChange={onDeliveryRangeChange}
          className="w-full min-w-0 lg:max-w-none"
        />
      </div>
    </div>

    <div className="grid max-w-2xl grid-cols-2 gap-3 sm:gap-4">
      <div className="min-w-0 space-y-1.5">
        <Label className="text-xs text-muted-foreground">
          Modo <span className="text-primary">*</span>
        </Label>
        <Select value={mode} onValueChange={onModeChange}>
          <SelectTrigger className={selectTriggerClass}>
            <SelectValue placeholder="Seleccionar modo" />
          </SelectTrigger>
          <SelectContent align="start">
            <SelectItem value="default" className="text-sm">
              Por defecto
            </SelectItem>
            <SelectItem value="express" className="text-sm">
              Express
            </SelectItem>
            <SelectItem value="consolidated" className="text-sm">
              Consolidado
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="min-w-0 space-y-1.5">
        <Label className="text-xs text-muted-foreground">Prioridad</Label>
        <Select value={priority} onValueChange={(v) => onPriorityChange(v as RoutePriority)}>
          <SelectTrigger className={selectTriggerClass}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent align="start">
            {(Object.keys(routePriorityMeta) as (keyof typeof routePriorityMeta)[]).map((k) => (
              <SelectItem key={k} value={k} className="text-sm">
                {routePriorityMeta[k].label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>

    <div className="flex flex-wrap items-center gap-2 rounded-lg border border-border/80 bg-muted/30 px-3 py-2.5 sm:gap-3">
      <Checkbox id="co-cod" checked={cod} onCheckedChange={(c) => onCodChange(c === true)} />
      <Label htmlFor="co-cod" className="cursor-pointer text-sm font-medium text-foreground">
        Pago contra entrega
      </Label>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            className="inline-flex size-8 shrink-0 items-center justify-center rounded-full text-info hover:bg-info-soft"
            aria-label="Información sobre pago contra entrega"
          >
            <Info className="size-4" strokeWidth={2} />
          </button>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-[240px] text-xs leading-snug">
          Indica si el receptor debe pagar el monto de la mercadería al momento de la entrega.
        </TooltipContent>
      </Tooltip>
    </div>
  </div>
  );
};

export default StepDatosOrden;
