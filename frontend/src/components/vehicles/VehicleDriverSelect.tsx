import { useMemo } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { mobileUserRouteSelectLabel } from "@/domain/mobileUsers";
import { useMobileUserRouteOptionsQuery } from "@/hooks/useOperationsQueries";
import { cn } from "@/lib/utils";

const NONE = "__driver_none__";

interface Props {
  value: string;
  onChange: (usuarioMovilId: string) => void;
  disabled?: boolean;
  /** Clases del trigger (ej. borde en modal de edición). */
  triggerClassName?: string;
  placeholder?: string;
}

/**
 * Conductores activos desde GET /usuarios-movil/opciones/ruta (id + nombre + vehículo enlazado).
 */
export function VehicleDriverSelect({
  value,
  onChange,
  disabled,
  triggerClassName,
  placeholder,
}: Props) {
  const { data: raw = [], isLoading } = useMobileUserRouteOptionsQuery();
  const options = useMemo(
    () => [...raw].sort((a, b) => a.nombreCompleto.localeCompare(b.nombreCompleto, "es")),
    [raw],
  );

  const vid = value.trim();
  const exists = Boolean(vid && options.some((o) => o.id === vid));
  const selectValue = vid ? vid : NONE;

  return (
    <Select
      value={selectValue}
      onValueChange={(v) => onChange(v === NONE ? "" : v)}
      disabled={disabled || isLoading}
    >
      <SelectTrigger className={cn("h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-900 shadow-sm transition-all hover:border-slate-300 focus:border-ring focus:ring-4 focus:ring-ring/20 focus:ring-offset-0 focus-visible:ring-offset-0 [&>span]:line-clamp-1 [&>span]:w-full [&>span]:truncate [&>span]:text-left [&>span[data-placeholder]]:font-normal [&>span[data-placeholder]]:text-slate-400", triggerClassName)}>
        <SelectValue
          placeholder={
            isLoading ? "Cargando conductores…" : placeholder ?? "Seleccionar conductor (opcional)"
          }
        />
      </SelectTrigger>
      <SelectContent align="start" className="rounded-xl border-slate-200 shadow-lg">
        <SelectItem value={NONE} className="text-sm">
          Sin asignar
        </SelectItem>
        {vid && !exists ? (
          <SelectItem value={vid} className="text-sm text-amber-800 dark:text-amber-400">
            Conductor guardado (no en lista actual)
          </SelectItem>
        ) : null}
        {options.map((o) => (
          <SelectItem key={o.id} value={o.id} className="text-sm">
            {mobileUserRouteSelectLabel(o)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
