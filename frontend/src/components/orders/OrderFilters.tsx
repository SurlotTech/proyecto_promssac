import { useEffect, type ReactNode } from "react";
import { Filter, Info, ListFilter, RotateCcw, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import { cn } from "@/lib/utils";

export interface OrderFiltersState {
  orderCode: string;
  dateFilterType: "route" | "created";
  dateFrom: string;
  dateTo: string;
  status: string;
  substatus: string;
  lastDispatchOnly: boolean;
  contactName: string;
  contactIdentifier: string;
  vehiclePlate: string;
}

export const defaultOrderFilters: OrderFiltersState = {
  orderCode: "all",
  dateFilterType: "route",
  dateFrom: "",
  dateTo: "",
  status: "all",
  substatus: "all",
  lastDispatchOnly: false,
  contactName: "",
  contactIdentifier: "all",
  vehiclePlate: "all",
};

const pillSelect =
  "h-9 w-full min-w-0 rounded-lg border-border/80 bg-card/40 backdrop-blur-md text-sm shadow-sm transition-colors hover:bg-muted/40 focus:ring-2 focus:ring-ring";

/** Ancho cómodo para selects de la primera fila (el rango de fechas va aparte, sin este tope) */
const filterFieldMax = "xl:max-w-[min(100%,17rem)]";

interface Props {
  filters: OrderFiltersState;
  onChange: (next: OrderFiltersState) => void;
  onReset: () => void;
  onApply?: () => void;
  orderIds: string[];
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
  orderIds,
  substatusOptions,
  vehiclePlates,
  toolbarRight,
}: Props) => {
  /** Radix Select: ningún SelectItem puede usar value="". */
  const safeOrderIds = nonEmptyStrings(orderIds);
  const safeSubstatusOptions = nonEmptyStrings(substatusOptions);
  const safeVehiclePlates = nonEmptyStrings(vehiclePlates);

  const orderCodeSelectValue =
    filters.orderCode === "all" || safeOrderIds.includes(filters.orderCode)
      ? filters.orderCode
      : "all";
  const substatusSelectValue =
    filters.substatus === "all" || safeSubstatusOptions.includes(filters.substatus)
      ? filters.substatus
      : "all";
  const vehiclePlateSelectValue =
    filters.vehiclePlate === "all" || safeVehiclePlates.includes(filters.vehiclePlate)
      ? filters.vehiclePlate
      : "all";

  useEffect(() => {
    if (
      orderCodeSelectValue === filters.orderCode &&
      substatusSelectValue === filters.substatus &&
      vehiclePlateSelectValue === filters.vehiclePlate
    ) {
      return;
    }
    onChange({
      ...filters,
      orderCode: orderCodeSelectValue,
      substatus: substatusSelectValue,
      vehiclePlate: vehiclePlateSelectValue,
    });
  }, [
    filters,
    onChange,
    orderCodeSelectValue,
    substatusSelectValue,
    vehiclePlateSelectValue,
  ]);

  const hasActive =
    filters.orderCode !== "all" ||
    filters.dateFrom ||
    filters.dateTo ||
    filters.status !== "all" ||
    filters.substatus !== "all" ||
    filters.lastDispatchOnly ||
    filters.contactName.trim() !== "" ||
    filters.contactIdentifier !== "all" ||
    filters.vehiclePlate !== "all";

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-border/80 bg-card/40 backdrop-blur-md p-4 shadow-sm">
        {/* Flex en lugar de grid en xl: evita huecos enormes cuando el rango de fechas es estrecho pero ocupaba 2/6 del ancho */}
        <div className="flex flex-col gap-4 xl:flex-row xl:flex-wrap xl:items-end xl:gap-x-4 xl:gap-y-4">
          <div className={cn("min-w-0 space-y-1.5 xl:w-auto", filterFieldMax)}>
            <Label className="text-xs text-muted-foreground">Código de orden</Label>
            <Select
              value={orderCodeSelectValue}
              onValueChange={(v) => onChange({ ...filters, orderCode: v })}
            >
              <SelectTrigger className={pillSelect}>
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                {safeOrderIds.map((id) => (
                  <SelectItem key={id} value={id}>
                    {id}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className={cn("min-w-0 space-y-1.5 xl:w-auto", filterFieldMax)}>
            <Label className="text-xs text-muted-foreground">Tipo de fecha para filtrar</Label>
            <Select
              value={filters.dateFilterType}
              onValueChange={(v) =>
                onChange({ ...filters, dateFilterType: v as OrderFiltersState["dateFilterType"] })
              }
            >
              <SelectTrigger className={pillSelect}>
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
            <Label className="text-xs text-muted-foreground">Estado</Label>
            <Select
              value={filters.status}
              onValueChange={(v) => onChange({ ...filters, status: v })}
            >
              <SelectTrigger className={pillSelect}>
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="pending">Pendiente</SelectItem>
                <SelectItem value="preparing">En preparación</SelectItem>
                <SelectItem value="in_route">En ruta</SelectItem>
                <SelectItem value="delivered">Entregado</SelectItem>
                <SelectItem value="cancelled">Devolución</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex min-w-0 flex-col justify-end gap-2 pb-0.5 sm:flex-row sm:items-center xl:w-auto xl:flex-none">
            <div className="flex items-center gap-2 rounded-lg border border-transparent px-1 py-1">
              <Checkbox
                id="last-dispatch"
                checked={filters.lastDispatchOnly}
                onCheckedChange={(c) =>
                  onChange({ ...filters, lastDispatchOnly: c === true })
                }
              />
              <Label
                htmlFor="last-dispatch"
                className="cursor-pointer text-xs font-normal leading-snug text-foreground"
              >
                Filtrar por último despacho
              </Label>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    className="rounded-full p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                    aria-label="Ayuda"
                  >
                    <Info className="h-3.5 w-3.5" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-xs text-xs">
                  Muestra solo órdenes marcadas como último despacho en la ruta actual.
                </TooltipContent>
              </Tooltip>
            </div>
          </div>
        </div>

        <div className="mt-4 grid gap-3 border-t border-border/60 pt-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-12 xl:items-end">
          <div className="space-y-1.5 xl:col-span-2">
            <Label className="text-xs text-muted-foreground">Subestado</Label>
            <Select
              value={substatusSelectValue}
              onValueChange={(v) => onChange({ ...filters, substatus: v })}
            >
              <SelectTrigger className={pillSelect}>
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                {safeSubstatusOptions.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5 xl:col-span-3">
            <Label htmlFor="contact-name" className="text-xs text-muted-foreground">
              Nombre del contacto
            </Label>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="contact-name"
                value={filters.contactName}
                onChange={(e) => onChange({ ...filters, contactName: e.target.value })}
                placeholder="Buscar por nombre…"
                className="h-9 border-border/80 bg-background pl-9 text-sm shadow-sm"
              />
            </div>
          </div>

          <div className="space-y-1.5 xl:col-span-2">
            <Label className="text-xs text-muted-foreground">Identificador de contacto</Label>
            <Select
              value={filters.contactIdentifier}
              onValueChange={(v) => onChange({ ...filters, contactIdentifier: v })}
            >
              <SelectTrigger className={pillSelect}>
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="dni">DNI</SelectItem>
                <SelectItem value="ruc">RUC</SelectItem>
                <SelectItem value="tel">Teléfono</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5 xl:col-span-2">
            <Label className="text-xs text-muted-foreground">Vehículo</Label>
            <Select
              value={vehiclePlateSelectValue}
              onValueChange={(v) => onChange({ ...filters, vehiclePlate: v })}
            >
              <SelectTrigger className={pillSelect}>
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                {safeVehiclePlates.map((p) => (
                  <SelectItem key={p} value={p}>
                    {p}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-wrap items-center gap-2 xl:col-span-3 xl:justify-end">
            <Button
              type="button"
              size="sm"
              className="h-9 gap-2 bg-primary text-primary-foreground hover:bg-primary-hover"
              onClick={() => onApply?.()}
            >
              <Filter className="h-4 w-4" />
              Filtrar
            </Button>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button type="button" variant="outline" size="icon" className="h-9 w-9 shrink-0">
                  <ListFilter className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Vista de filtros guardados (próximamente)</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="h-9 w-9 shrink-0 border-primary/30 text-primary hover:bg-primary-soft"
                  onClick={onReset}
                  disabled={!hasActive}
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Limpiar filtros</TooltipContent>
            </Tooltip>
            {toolbarRight ? <div className="ml-auto flex items-center gap-2">{toolbarRight}</div> : null}
          </div>
        </div>
      </div>

      {hasActive && (
        <div className="flex justify-end">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 text-xs text-muted-foreground hover:text-foreground"
            onClick={onReset}
          >
            Limpiar todos los filtros
          </Button>
        </div>
      )}
    </div>
  );
};

export default OrderFilters;
