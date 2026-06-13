import { useState } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  Columns3,
  Download,
  FileSpreadsheet,
  Filter,
  MoreVertical,
  Search,
  Send,
  Trash2,
  Truck,
  Upload,
  User,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

export const ALL_ROUTE_COLUMNS = [
  { key: "ruta", label: "Ruta" },
  { key: "vehiculo", label: "Vehículo" },
  { key: "conductor", label: "Conductor" },
  { key: "despachos", label: "Despachos" },
  { key: "creacion", label: "Creación" },
  { key: "programada", label: "Programada" },
  { key: "importe", label: "Importe" },
  { key: "estado", label: "Estado" },
] as const;

export type RouteColumnKey = (typeof ALL_ROUTE_COLUMNS)[number]["key"];

const CalendarIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path
      d="M6.96006 2C7.37758 2 7.71605 2.30996 7.71605 2.69231V4.08883C8.38663 4.07692 9.13829 4.07692 9.98402 4.07692H14.016C14.8617 4.07692 15.6134 4.07692 16.284 4.08883V2.69231C16.284 2.30996 16.6224 2 17.0399 2C17.4575 2 17.7959 2.30996 17.7959 2.69231V4.15008C19.2468 4.25647 20.1992 4.51758 20.899 5.15838C21.5987 5.79917 21.8838 6.67139 22 8V9H2V8C2.11618 6.67139 2.4013 5.79917 3.10104 5.15838C3.80079 4.51758 4.75323 4.25647 6.20406 4.15008V2.69231C6.20406 2.30996 6.54253 2 6.96006 2Z"
      fill="#6e737c"
    />
    <path
      opacity="0.5"
      d="M22 14V12C22 11.161 21.9873 9.66527 21.9744 9H2.00586C1.99296 9.66527 2.00564 11.161 2.00564 12V14C2.00564 17.7712 2.00564 19.6569 3.17688 20.8284C4.34813 22 6.23321 22 10.0034 22H14.0023C17.7724 22 19.6575 22 20.8288 20.8284C22 19.6569 22 17.7712 22 14Z"
      fill="#6e737c"
    />
    <path
      d="M18 16.5C18 17.3284 17.3284 18 16.5 18C15.6716 18 15 17.3284 15 16.5C15 15.6716 15.6716 15 16.5 15C17.3284 15 18 15.6716 18 16.5Z"
      fill="#6e737c"
    />
  </svg>
);

function parseYmd(ymd: string): Date | undefined {
  if (!ymd) return undefined;
  const parts = ymd.split("-");
  if (parts.length !== 3) return undefined;
  return new Date(+parts[0], +parts[1] - 1, +parts[2]);
}

function toYmd(d: Date): string {
  return format(d, "yyyy-MM-dd");
}

function formatDisplay(ymd: string): string {
  if (!ymd) return "";
  const d = parseYmd(ymd);
  if (!d) return ymd;
  return format(d, "d MMM yyyy", { locale: es });
}

interface DateFilterProps {
  value: string;
  onChange: (val: string) => void;
  label: string;
  noAutoFocus?: boolean;
}

export const DateFilter = ({ value, onChange, label, noAutoFocus }: DateFilterProps) => {
  const [open, setOpen] = useState(false);
  const [focused, setFocused] = useState(false);
  const selected = parseYmd(value);

  return (
    <div className="relative flex h-14 w-[200px] items-center rounded-lg border border-[#e1e7ee] bg-white/60 transition-colors hover:border-primary has-[:focus]:border-primary">
      <span
        className={cn(
          "absolute left-2.5 transition-all pointer-events-none bg-white px-1.5 z-10",
          focused || value
            ? "-top-2.5 text-[11px] text-primary"
            : "top-1/2 -translate-y-1/2 text-sm text-[#8a9aab]",
        )}
      >
        {label}
      </span>
      <Input
        type="text"
        placeholder={focused || value ? "dd/mm/aaaa" : ""}
        value={value ? formatDisplay(value) : ""}
        tabIndex={noAutoFocus ? -1 : undefined}
        onChange={(e) => {
          onChange(e.target.value);
        }}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className={cn(
          "h-full w-full rounded-lg border-0 bg-transparent px-3 text-[15px] text-[#1f2933] placeholder:text-[#8a9aab] focus-visible:ring-0",
          (focused || value) && "pt-3",
        )}
      />
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            tabIndex={noAutoFocus ? -1 : undefined}
            className="flex size-9 shrink-0 items-center justify-center rounded-full transition-colors hover:bg-muted mr-1"
          >
            <CalendarIcon className="size-6" />
          </button>
        </PopoverTrigger>
        <PopoverContent
          className="w-auto p-0"
          align="start"
          sideOffset={4}
          alignOffset={-160}
        >
          <Calendar
            mode="single"
            selected={selected}
            onSelect={(d) => {
              onChange(d ? toYmd(d) : "");
              setOpen(false);
            }}
            locale={es}
            {...(noAutoFocus ? {} : { initialFocus: true })}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
};

export interface RouteFiltersData {
  search: string;
  vehicle: string;
  driver: string;
  dateFrom: string;
  dateTo: string;
}

interface Props {
  filters: RouteFiltersData;
  onChange: (next: RouteFiltersData) => void;
  onAssignRoute: () => void;
  vehicles: { id: string; plate: string }[];
  drivers: string[];
  visibleColumns: RouteColumnKey[];
  onVisibleColumnsChange: (cols: RouteColumnKey[]) => void;
  totalFiltered: number;
  selectedCount: number;
  onDeleteSelected: () => void;
}

const RouteFiltersBar = ({
  filters,
  onChange,
  onAssignRoute,
  vehicles,
  drivers,
  visibleColumns,
  onVisibleColumnsChange,
  totalFiltered,
  selectedCount,
  onDeleteSelected,
}: Props) => {
  const toggleColumn = (key: RouteColumnKey) => {
    if (visibleColumns.includes(key)) {
      onVisibleColumnsChange(visibleColumns.filter((c) => c !== key));
    } else {
      onVisibleColumnsChange([...visibleColumns, key]);
    }
  };

  return (
    <div className="bg-white/30">
      <div className="flex items-center gap-4 px-5 py-5">
      <div className="relative flex-1 max-w-[380px]">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-[#8a9aab]" />
        <Input
          placeholder="Buscar ruta, cliente, conductor o código..."
          value={filters.search}
          onChange={(e) => onChange({ ...filters, search: e.target.value })}
          className="h-14 rounded-lg border border-[#e1e7ee] bg-white/60 pl-10 text-[15px] text-[#1f2933] placeholder:text-[#8a9aab] transition-colors hover:border-primary focus-visible:ring-1"
        />
      </div>

      <div className="flex items-center gap-3">
        <DateFilter
          label="Fecha inicio"
          value={filters.dateFrom}
          onChange={(val) => onChange({ ...filters, dateFrom: val })}
        />
        <DateFilter
          label="Fecha fin"
          value={filters.dateTo}
          onChange={(val) => onChange({ ...filters, dateTo: val })}
        />
      </div>

      {selectedCount > 0 && (
        <Button
          variant="ghost"
          className="ml-auto h-14 gap-2 px-3 text-[15px] text-red-600 hover:text-red-700 hover:bg-red-50"
          onClick={onDeleteSelected}
        >
          <Trash2 className="size-4" />
          Eliminar ({selectedCount})
        </Button>
      )}

      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            className={selectedCount > 0 ? "h-14 gap-2 px-3 text-[15px] text-black hover:text-[#1f2933]" : "ml-auto h-14 gap-2 px-3 text-[15px] text-black hover:text-[#1f2933]"}
          >
            <Columns3 className="size-4" />
            Columnas
          </Button>
        </PopoverTrigger>
        <PopoverContent align="end" className="w-48 p-3">
          <div className="space-y-2">
            {ALL_ROUTE_COLUMNS.map((col) => (
              <label
                key={col.key}
                className="flex items-center gap-2 cursor-pointer text-sm text-[#1f2933] hover:text-primary transition-colors"
              >
                <Checkbox
                  checked={visibleColumns.includes(col.key)}
                  onCheckedChange={() => toggleColumn(col.key)}
                  className="h-4 w-4 border-2 border-gray-400 data-[state=checked]:bg-primary data-[state=checked]:border-primary rounded mt-px"
                />
                {col.label}
              </label>
            ))}
          </div>
        </PopoverContent>
      </Popover>

      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            className="h-14 gap-2 px-3 text-[15px] text-black hover:text-[#1f2933]"
          >
            <Filter className="size-4 fill-black stroke-black" />
            Filtros
          </Button>
        </PopoverTrigger>
        <PopoverContent align="end" className="w-[500px] p-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="relative group">
              <span
                className={cn(
                  "absolute -top-2.5 left-3 z-10 bg-white px-1.5 text-[11px] group-has-[[data-state=open]]:text-primary",
                  filters.vehicle !== "all" ? "text-primary" : "text-[#8a9aab]",
                )}
              >
                Vehículo
              </span>
              <Select
                value={filters.vehicle}
                onValueChange={(v) => onChange({ ...filters, vehicle: v })}
              >
                <SelectTrigger className="h-12 w-full rounded-lg border bg-white/60 px-3.5 pt-4 text-[15px] text-[#8a9aab] focus:ring-0 focus:ring-offset-0 border-[#e1e7ee] data-[state=open]:border-primary">
                  <div className="flex items-center gap-2">
                    <Truck className="size-4 shrink-0" strokeWidth={1.75} />
                    <SelectValue placeholder="Todos" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  {vehicles.map((v) => (
                    <SelectItem key={v.id} value={v.id}>
                      {v.plate}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="relative group">
              <span
                className={cn(
                  "absolute -top-2.5 left-3 z-10 bg-white px-1.5 text-[11px] group-has-[[data-state=open]]:text-primary",
                  filters.driver !== "all" ? "text-primary" : "text-[#8a9aab]",
                )}
              >
                Conductor
              </span>
              <Select
                value={filters.driver}
                onValueChange={(d) => onChange({ ...filters, driver: d })}
              >
                <SelectTrigger className="h-12 w-full rounded-lg border bg-white/60 px-3.5 pt-4 text-[15px] text-[#8a9aab] focus:ring-0 focus:ring-offset-0 border-[#e1e7ee] data-[state=open]:border-primary">
                  <div className="flex items-center gap-2">
                    <User className="size-4 shrink-0" strokeWidth={1.75} />
                    <SelectValue placeholder="Todos" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  {drivers.map((d) => (
                    <SelectItem key={d} value={d}>
                      {d}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </PopoverContent>
      </Popover>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="h-14 gap-2 px-3 text-[15px] text-black hover:text-[#1f2933] [&_svg]:size-6"
          >
            <MoreVertical />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-44">
          <DropdownMenuItem onClick={() => {}}>
            <FileSpreadsheet className="mr-2 size-4" /> Plantilla
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => {}}>
            <Upload className="mr-2 size-4" /> Importar
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => {}}>
            <Download className="mr-2 size-4" /> Exportar
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onAssignRoute}>
            <Send className="mr-2 size-4" /> Asignar ruta
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>

    {(filters.search || filters.dateFrom || filters.dateTo || filters.vehicle !== "all" || filters.driver !== "all") && (
    <div className="px-5 pb-3 flex flex-col gap-2">
      <span className="text-sm font-semibold text-[#1f2933]">{totalFiltered} resultado{totalFiltered !== 1 ? "s" : ""}</span>
      <div className="flex items-center gap-2 flex-wrap">
        {filters.dateFrom && (
          <span className="inline-flex items-center gap-1.5 rounded-md bg-[#eef1f5] px-2.5 py-1 text-xs font-medium text-[#52677a]">
            <span className="text-[10px] uppercase tracking-wide">Fechas</span>
            {filters.dateFrom && filters.dateTo
              ? `${format(new Date(filters.dateFrom + "T12:00:00"), "d MMM", { locale: es })} — ${format(new Date(filters.dateTo + "T12:00:00"), "d MMM yyyy", { locale: es })}`
              : filters.dateFrom
                ? `desde ${format(new Date(filters.dateFrom + "T12:00:00"), "d MMM yyyy", { locale: es })}`
                : `hasta ${format(new Date(filters.dateTo + "T12:00:00"), "d MMM yyyy", { locale: es })}`}
            <button onClick={() => onChange({ ...filters, dateFrom: "", dateTo: "" })} className="ml-0.5 text-[#8a9aab] hover:text-[#1f2933]">✕</button>
          </span>
        )}
        {filters.vehicle !== "all" && (
          <span className="inline-flex items-center gap-1.5 rounded-md bg-[#eef1f5] px-2.5 py-1 text-xs font-medium text-[#52677a]">
            Vehículo: {vehicles.find((v) => v.id === filters.vehicle)?.plate || filters.vehicle}
            <button onClick={() => onChange({ ...filters, vehicle: "all" })} className="ml-0.5 text-[#8a9aab] hover:text-[#1f2933]">✕</button>
          </span>
        )}
        {filters.driver !== "all" && (
          <span className="inline-flex items-center gap-1.5 rounded-md bg-[#eef1f5] px-2.5 py-1 text-xs font-medium text-[#52677a]">
            Conductor: {filters.driver}
            <button onClick={() => onChange({ ...filters, driver: "all" })} className="ml-0.5 text-[#8a9aab] hover:text-[#1f2933]">✕</button>
          </span>
        )}
        {filters.search && (
          <span className="inline-flex items-center gap-1.5 rounded-md bg-[#eef1f5] px-2.5 py-1 text-xs font-medium text-[#52677a]">
            Búsqueda: {filters.search}
            <button onClick={() => onChange({ ...filters, search: "" })} className="ml-0.5 text-[#8a9aab] hover:text-[#1f2933]">✕</button>
          </span>
        )}
      </div>
    </div>
    )}
  </div>
  );
};

export default RouteFiltersBar;
