import { type ReactNode } from "react";
import { Calendar, CircleGauge, Flag, Search, Truck } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import RouteDateRangePicker from "@/components/routes/RouteDateRangePicker";

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
  "h-9 w-full min-w-0 shrink-0 rounded-lg border bg-zinc-50 px-3 py-0 shadow-none transition-all hover:border-zinc-300 hover:bg-zinc-100 hover:shadow-sm focus:ring-2 focus:ring-ring focus:ring-offset-0 data-[state=open]:bg-zinc-100 sm:w-fit sm:max-w-[min(100%,18rem)] [&>div]:mr-2 [&>svg]:hidden";

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

  const hasActive =
    filters.dateFrom ||
    filters.dateTo ||
    filters.status !== "all" ||
    filters.substatus !== "all" ||
    filters.lastDispatchOnly ||
    filters.contactName.trim() !== "" ||
    filters.vehiclePlate !== "all";

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-3 rounded-xl bg-muted/20 py-3 sm:flex-row sm:flex-wrap sm:items-center">
        <div className="relative min-w-0 flex-1 sm:max-w-xs">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" strokeWidth={1.75} />
            <Input
              id="contact-name"
              value={filters.contactName}
              onChange={(e) => onChange({ ...filters, contactName: e.target.value })}
              placeholder="Nombre del Cliente…"
              className="h-9 w-full bg-zinc-50 pl-9 transition-all hover:border-zinc-300 hover:bg-zinc-100 hover:shadow-sm focus-visible:ring-offset-0"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Select
            value={filters.dateFilterType}
            onValueChange={(v) =>
              onChange({ ...filters, dateFilterType: v as OrderFiltersState["dateFilterType"] })
            }
          >
            <SelectTrigger className={pillSelect}>
              <div className="flex w-full items-center gap-2">
                <Calendar className="size-3.5 shrink-0 text-muted-foreground" strokeWidth={1.75} />
                <span className="min-w-0 truncate text-left text-sm text-muted-foreground">
                  <SelectValue />
                </span>
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="route">Fecha de ruta</SelectItem>
              <SelectItem value="created">Fecha de creación</SelectItem>
            </SelectContent>
          </Select>

          <RouteDateRangePicker
            dateFrom={filters.dateFrom}
            dateTo={filters.dateTo}
            onRangeChange={(dateFrom, dateTo) => onChange({ ...filters, dateFrom, dateTo })}
            className="w-full min-w-0 max-w-full sm:w-max sm:max-w-none sm:shrink-0"
          />

          <Select
            value={filters.status}
            onValueChange={(v) => onChange({ ...filters, status: v })}
          >
            <SelectTrigger className={pillSelect}>
              <div className="flex w-full items-center gap-2">
                <CircleGauge className="size-3.5 shrink-0 text-muted-foreground" strokeWidth={1.75} />
                <span className="min-w-0 truncate text-left text-sm text-muted-foreground">
                  <SelectValue placeholder="Estado: Todos" />
                </span>
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Estado: Todos</SelectItem>
              <SelectItem value="pending">Pendiente</SelectItem>
              <SelectItem value="in_route">En ruta</SelectItem>
              <SelectItem value="entregado">Entregado</SelectItem>
              <SelectItem value="no_entregado">No entregado</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={substatusSelectValue}
            onValueChange={(v) => onChange({ ...filters, substatus: v })}
          >
            <SelectTrigger className={pillSelect}>
              <div className="flex w-full items-center gap-2">
                <Flag className="size-3.5 shrink-0 text-muted-foreground" strokeWidth={1.75} />
                <span className="min-w-0 truncate text-left text-sm text-muted-foreground">
                  <SelectValue placeholder="Subestado: Todos" />
                </span>
              </div>
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

          <Select
            value={vehiclePlateSelectValue}
            onValueChange={(v) => onChange({ ...filters, vehiclePlate: v })}
          >
            <SelectTrigger className={pillSelect}>
              <div className="flex w-full items-center gap-2">
                <Truck className="size-3.5 shrink-0 text-muted-foreground" strokeWidth={1.75} />
                <span className="min-w-0 truncate text-left text-sm text-muted-foreground">
                  <SelectValue placeholder="Vehículo: Todos" />
                </span>
              </div>
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

        {toolbarRight ? (
          <div className="flex shrink-0 items-center ml-auto">
            {toolbarRight}
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default OrderFilters;
