import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { ClienteListaFiltrosApi } from "@/hooks/useClienteListaFiltros";
import { cn } from "@/lib/utils";

type Props = {
  filtros: ClienteListaFiltrosApi;
};

export default function ClienteFilters({ filtros }: Props) {
  const f = filtros;
  const hasActive = f.busqueda.trim() !== "";

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center justify-start">
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

        <div className="flex items-center bg-transparent p-1 rounded-full border border-border h-12 px-1 shrink-0 transition-colors hover:bg-zinc-50/50">
          <div className="flex gap-1">
            <button
              type="button"
              onClick={() => f.setEstadoFiltro("activos")}
              className={cn(
                "rounded-full px-5 py-1.5 text-xs font-semibold transition-all h-8 flex items-center justify-center",
                f.estadoFiltro === "activos"
                  ? "bg-background text-emerald-600 dark:text-emerald-400 shadow-sm border border-border/40"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Activos
            </button>
            <button
              type="button"
              onClick={() => f.setEstadoFiltro("inactivos")}
              className={cn(
                "rounded-full px-5 py-1.5 text-xs font-semibold transition-all h-8 flex items-center justify-center",
                f.estadoFiltro === "inactivos"
                  ? "bg-background text-destructive shadow-sm border border-border/40"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Inactivos
            </button>
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
