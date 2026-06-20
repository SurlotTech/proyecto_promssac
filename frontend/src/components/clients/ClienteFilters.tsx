import { Search, X, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { ClienteListaFiltrosApi } from "@/hooks/useClienteListaFiltros";
import { cn } from "@/lib/utils";

type Props = {
  filtros: ClienteListaFiltrosApi;
};

const pillActive =
  "h-9 rounded-lg border bg-zinc-50 px-3 shadow-none transition-all hover:border-zinc-300 hover:bg-zinc-100 hover:shadow-sm";
const pillInactive =
  "h-9 rounded-lg border border-transparent bg-transparent px-3 shadow-none transition-all hover:border-zinc-300 hover:bg-zinc-100 hover:shadow-sm text-muted-foreground hover:text-foreground";

export default function ClienteFilters({ filtros }: Props) {
  const f = filtros;
  const hasActive = f.busqueda.trim() !== "";

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-3 rounded-xl bg-muted/20 py-3 sm:flex-row sm:flex-wrap sm:items-center">
        <div className="relative min-w-0 flex-1 sm:max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" strokeWidth={1.75} />
          <Input
            id="f-busqueda"
            value={f.busqueda}
            onChange={(e) => f.setBusqueda(e.target.value)}
            placeholder="Buscar por nombre, código modular, UGEL, ubicación, correo..."
            className="h-9 w-full bg-zinc-50 pl-9 transition-all hover:border-zinc-300 hover:bg-zinc-100 hover:shadow-sm focus-visible:ring-offset-0"
            autoComplete="off"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 rounded-lg border bg-zinc-50 p-0.5">
            <button
              type="button"
              onClick={() => f.setEstadoFiltro("activos")}
              className={cn(
                "flex h-8 items-center gap-1.5 rounded-md px-3 text-xs font-medium transition-all",
                f.estadoFiltro === "activos"
                  ? "bg-white text-emerald-600 shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Users className="size-3.5" strokeWidth={1.75} />
              Activos
            </button>
            <button
              type="button"
              onClick={() => f.setEstadoFiltro("inactivos")}
              className={cn(
                "flex h-8 items-center gap-1.5 rounded-md px-3 text-xs font-medium transition-all",
                f.estadoFiltro === "inactivos"
                  ? "bg-white text-destructive shadow-sm"
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
