import { Filter, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { ClienteListaFiltrosApi } from "@/hooks/useClienteListaFiltros";

type Props = {
  filtros: ClienteListaFiltrosApi;
  totalConFiltros: number;
};

export default function ClienteFiltersSidebar({ filtros, totalConFiltros }: Props) {
  const f = filtros;

  return (
    <aside className="flex w-full shrink-0 flex-col lg:h-full lg:max-h-full lg:w-[min(100%,20rem)] lg:min-w-[18rem]">
      <div className="flex max-h-[min(72vh,520px)] flex-col overflow-hidden rounded-xl border border-border bg-card/40 backdrop-blur-md shadow-sm lg:max-h-none lg:flex-1 lg:min-h-0">
        <div className="shrink-0 space-y-3 border-b border-border p-4">
          <div className="flex items-center gap-2">
            <Filter className="size-4 shrink-0 text-primary" aria-hidden />
            <h3 className="text-sm font-semibold tracking-tight">Filtrar lista</h3>
          </div>
          <p className="rounded-md bg-muted/40 px-2.5 py-1.5 text-center text-xs tabular-nums text-muted-foreground">
            <span className="font-semibold text-foreground">{totalConFiltros}</span>{" "}
            {totalConFiltros === 1 ? "coincidente con" : "que coinciden con"} los filtros
          </p>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-4">
          <div className="space-y-5">
            <div className="flex items-start gap-2.5 rounded-lg border border-border/80 bg-muted/15 px-3 py-2.5">
              <Checkbox id="inactivos" checked={f.incluirInactivos} onCheckedChange={(v) => f.setIncluirInactivos(Boolean(v))} className="mt-0.5" />
              <Label htmlFor="inactivos" className="cursor-pointer text-xs font-normal leading-snug text-foreground/90">
                Incluir registros desactivados (grises en la tabla)
              </Label>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="f-busqueda" className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                Buscar
              </Label>
              <div className="relative">
                <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground/80" aria-hidden />
                <Input
                  id="f-busqueda"
                  value={f.busqueda}
                  onChange={(e) => f.setBusqueda(e.target.value)}
                  placeholder="Nombre del cliente, código modular IIEE, código regional, UGEL, ubicación, correo, teléfono o director…"
                  className="h-9 bg-background pl-9 text-sm"
                  autoComplete="off"
                />
              </div>
            </div>

            <Button type="button" variant="secondary" className="mt-1 w-full" onClick={f.limpiarBusqueda} disabled={!f.busqueda.trim()}>
              Limpiar búsqueda
            </Button>
          </div>
        </div>
      </div>
    </aside>
  );
}
