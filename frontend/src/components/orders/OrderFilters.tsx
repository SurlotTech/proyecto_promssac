import { useEffect, type ReactNode } from "react";
import { Calendar, CircleGauge, Flag, ListFilter, RotateCcw, Search, Truck } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import RouteDateRangePicker from "@/components/routes/RouteDateRangePicker";
import { cn } from "@/lib/utils";

export interface OrderFiltersState {
  dateFilterType: "route" | "created";
  dateFrom: string;
  dateTo: string;
  status: string;
  substatus: string;
  lastDispatchOnly: boolean;
  contactName: string;
  vehiclePlate: string;
}

export const defaultOrderFilters: OrderFiltersState = {
  dateFilterType: "route",
  dateFrom: "",
  dateTo: "",
  status: "all",
  substatus: "all",
  lastDispatchOnly: false,
  contactName: "",
  vehiclePlate: "all",
};

const pillSelect =
  "h-12 w-full min-w-0 rounded-full border-border bg-transparent text-sm shadow-none transition-colors hover:bg-zinc-50 focus:ring-2 focus:ring-ring focus:ring-offset-2";

/** Ancho cómodo para selects de la primera fila (el rango de fechas va aparte, sin este tope) */
const filterFieldMax = "xl:max-w-[min(100%,18rem)]";

interface Props {
  filters: OrderFiltersState;
  onChange: (next: OrderFiltersState) => void;
  onReset: () => void;
  onApply?: () => void;
  substatusOptions: string[];
  vehiclePlates: string[];
  toolbarRight?: ReactNode;
}

function nonEmptyStrings(values: string[]): string[] {
  return values.filter((v) => v.trim().length > 0);
}

const OrderFilters = ({
  filters,
  onChange,
  onReset,
  onApply,
  substatusOptions,
  vehiclePlates,
  toolbarRight,
}: Props) => {
  /** Radix Select: ningún SelectItem puede usar value="". */
  const safeSubstatusOptions = nonEmptyStrings(substatusOptions);
  const safeVehiclePlates = nonEmptyStrings(vehiclePlates);

  const substatusSelectValue =
    filters.substatus === "all" || safeSubstatusOptions.includes(filters.substatus)
      ? filters.substatus
      : "all";
  const vehiclePlateSelectValue =
    filters.vehiclePlate === "all" || safeVehiclePlates.includes(filters.vehiclePlate)
      ? filters.vehiclePlate
      : "all";

  useEffect(() => {
    onChange({
      ...filters,
      substatus: substatusSelectValue,
      vehiclePlate: vehiclePlateSelectValue,
    });
  }, [filters, onChange, substatusSelectValue, vehiclePlateSelectValue]);

  const hasActive =
    filters.dateFrom ||
    filters.dateTo ||
    filters.status !== "all" ||
    filters.substatus !== "all" ||
    filters.lastDispatchOnly ||
    filters.contactName.trim() !== "" ||
    filters.vehiclePlate !== "all";

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 xl:flex-row xl:flex-wrap xl:items-end xl:gap-x-4 xl:gap-y-4">
        <div className="min-w-0 space-y-1.5 xl:w-auto xl:flex-1 xl:max-w-[20rem]">
          <Label className="sr-only">Nombre del Cliente</Label>
          <div className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="contact-name"
              value={filters.contactName}
              onChange={(e) => onChange({ ...filters, contactName: e.target.value })}
              placeholder="Nombre del Cliente…"
              className="h-12 rounded-full border-border bg-transparent pl-10 text-sm shadow-none transition-colors hover:bg-zinc-50 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            />
          </div>
        </div>

        <div className={cn("min-w-0 space-y-1.5 xl:w-auto", filterFieldMax)}>
          <Label className="sr-only">Tipo de fecha para filtrar</Label>
          <Select
            value={filters.dateFilterType}
            onValueChange={(v) =>
              onChange({ ...filters, dateFilterType: v as OrderFiltersState["dateFilterType"] })
            }
          >
            <SelectTrigger className={pillSelect}>
              <Calendar className="mr-2 h-4 w-4 shrink-0 text-muted-foreground" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="route">Fecha de ruta</SelectItem>
              <SelectItem value="created">Fecha de creación</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="min-w-0 space-y-1.5 xl:w-auto">
          <Label className="sr-only">Rango de fechas</Label>
          <RouteDateRangePicker
            dateFrom={filters.dateFrom}
            dateTo={filters.dateTo}
            onRangeChange={(dateFrom, dateTo) => onChange({ ...filters, dateFrom, dateTo })}
            className="w-full min-w-0 xl:w-max xl:max-w-none xl:shrink-0"
          />
        </div>

        <div className={cn("min-w-0 space-y-1.5 xl:w-auto", filterFieldMax)}>
          <Label className="sr-only">Estado</Label>
          <Select
            value={filters.status}
            onValueChange={(v) => onChange({ ...filters, status: v })}
          >
            <SelectTrigger className={pillSelect}>
              <CircleGauge className="mr-2 h-4 w-4 shrink-0 text-muted-foreground" />
              <SelectValue placeholder="Estado: Todos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Estado: Todos</SelectItem>
              <SelectItem value="pending">Pendiente</SelectItem>
              <SelectItem value="in_route">En ruta</SelectItem>
              <SelectItem value="entregado">Entregado</SelectItem>
              <SelectItem value="no_entregado">No entregado</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="min-w-0 space-y-1.5 xl:w-auto xl:max-w-[15rem]">
          <Label className="sr-only">Subestado</Label>
          <Select
            value={substatusSelectValue}
            onValueChange={(v) => onChange({ ...filters, substatus: v })}
          >
            <SelectTrigger className={pillSelect}>
              <Flag className="mr-2 h-4 w-4 shrink-0 text-muted-foreground" />
              <SelectValue placeholder="Subestado: Todos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Subestado: Todos</SelectItem>
              {safeSubstatusOptions.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="min-w-0 space-y-1.5 xl:w-auto xl:max-w-[12rem]">
          <Label className="sr-only">Vehículo</Label>
          <Select
            value={vehiclePlateSelectValue}
            onValueChange={(v) => onChange({ ...filters, vehiclePlate: v })}
          >
            <SelectTrigger className={pillSelect}>
              <Truck className="mr-2 h-4 w-4 shrink-0 text-muted-foreground" />
              <SelectValue placeholder="Vehículo: Todos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Vehículo: Todos</SelectItem>
              {safeVehiclePlates.map((p) => (
                <SelectItem key={p} value={p}>
                  {p}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

    </div>
  );
};

export default OrderFilters;
