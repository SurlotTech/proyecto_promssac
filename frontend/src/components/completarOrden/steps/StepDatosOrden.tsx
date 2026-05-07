import { Info } from "lucide-react";
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
import type { OrderCreationDraft } from "@/lib/orderCreationDraft";
import { fieldInputClass, selectTriggerClass } from "@/lib/completarOrden/constants";
import { cn } from "@/lib/utils";

interface Props {
  draft: OrderCreationDraft;
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
  return (
    <div className="space-y-6">
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
    </div>
  );
};

export default StepDatosOrden;
