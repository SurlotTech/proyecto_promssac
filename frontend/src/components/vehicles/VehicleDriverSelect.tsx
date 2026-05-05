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
      <SelectTrigger className={cn("h-10", triggerClassName)}>
        <SelectValue
          placeholder={
            isLoading ? "Cargando conductores…" : placeholder ?? "Seleccionar conductor (opcional)"
          }
        />
      </SelectTrigger>
      <SelectContent align="start">
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
