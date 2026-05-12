import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { ClienteListaFiltrosApi } from "@/hooks/useClienteListaFiltros";

type Props = {
  filtros: ClienteListaFiltrosApi;
  totalConFiltros: number;
};

export default function ClienteFilters({ filtros, totalConFiltros }: Props) {
  const f = filtros;
  const hasActive = f.busqueda.trim() !== "";

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center lg:flex-nowrap lg:gap-3">
        <div className="relative min-w-0 flex-1 lg:max-w-xl">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
          <Input
            id="f-busqueda"
            value={f.busqueda}
            onChange={(e) => f.setBusqueda(e.target.value)}
            placeholder="Buscar por nombre, código modular, UGEL, ubicación, correo..."
            className="h-12 rounded-full border-border bg-transparent pl-11 shadow-none transition-colors hover:bg-zinc-50 focus-visible:ring-offset-0"
            autoComplete="off"
          />
        </div>

        <div className="flex shrink-0 items-center gap-3">
          <div className="hidden h-12 items-center rounded-full bg-muted/40 px-4 text-xs tabular-nums text-muted-foreground sm:flex">
            <span className="font-semibold text-foreground mr-1">{totalConFiltros}</span>
            {totalConFiltros === 1 ? "coincidente" : "coincidentes"}
          </div>
        </div>
      </div>

      {hasActive && (
        <div className="flex justify-end">
          <Button
            variant="ghost"
            size="sm"
            onClick={f.limpiarBusqueda}
            className="h-8 text-xs text-muted-foreground hover:text-foreground"
          >
            <X className="mr-1 h-3.5 w-3.5" /> Limpiar búsqueda
          </Button>
        </div>
      )}
    </div>
  );
}
