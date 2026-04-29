import { useEffect, useMemo, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Download,
  FileUp,
  LayoutGrid,
  List,
  Plus,
  Route,
  Send,
  TrendingUp,
  Truck,
  Users,
} from "lucide-react";
import PageHeader from "@/components/PageHeader";
import StatCard from "@/components/StatCard";
import RouteFilters, { RouteFilters as Filters } from "@/components/routes/RouteFilters";
import RouteTable from "@/components/routes/RouteTable";
import RouteCard from "@/components/routes/RouteCard";
import NewRouteDialog from "@/components/routes/NewRouteDialog";
import { Button } from "@/components/ui/button";
import { routes as allRoutes, Route as RouteData, vehicles, places, drivers } from "@/data/routes";
import { cn } from "@/lib/utils";

const defaultFilters: Filters = {
  search: "",
  vehicle: "all",
  place: "all",
  driver: "all",
  dateFrom: "",
  dateTo: "",
};

function paginationItems(current: number, total: number): (number | "ellipsis")[] {
  if (total <= 9) return Array.from({ length: total }, (_, i) => i + 1);
  const set = new Set<number>([1, total, current, current - 1, current + 1]);
  const sorted = [...set].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b);
  const out: (number | "ellipsis")[] = [];
  for (let i = 0; i < sorted.length; i++) {
    if (i > 0 && sorted[i] - sorted[i - 1] > 1) out.push("ellipsis");
    out.push(sorted[i]);
  }
  return out;
}

const PAGE_SIZE = 6;

const Rutas = () => {
  const [filters, setFilters] = useState<Filters>(defaultFilters);
  const [selected, setSelected] = useState<RouteData | null>(null);
  const [view, setView] = useState<"table" | "grid">("table");
  const [page, setPage] = useState(1);
  const [createRouteOpen, setCreateRouteOpen] = useState(false);

  const filteredRoutes = useMemo(() => {
    return allRoutes.filter((r) => {
      if (filters.search) {
        const search = filters.search.toLowerCase();
        if (
          !r.id.toLowerCase().includes(search) &&
          !r.name.toLowerCase().includes(search) &&
          !r.vehiclePlate.toLowerCase().includes(search)
        ) {
          return false;
        }
      }
      if (filters.vehicle !== "all" && r.vehicleId !== filters.vehicle) {
        return false;
      }
      if (filters.place !== "all" && r.place !== filters.place) {
        return false;
      }
      if (filters.driver !== "all" && r.mobileUser !== filters.driver) {
        return false;
      }
      if (filters.dateFrom) {
        const routeDate = new Date(r.deliveryDate.split("/").reverse().join("-"));
        const fromDate = new Date(filters.dateFrom);
        if (routeDate < fromDate) return false;
      }
      if (filters.dateTo) {
        const routeDate = new Date(r.deliveryDate.split("/").reverse().join("-"));
        const toDate = new Date(filters.dateTo);
        if (routeDate > toDate) return false;
      }
      return true;
    });
  }, [filters]);

  const totalFiltered = filteredRoutes.length;
  const totalPages = Math.max(1, Math.ceil(totalFiltered / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);

  const paginatedRoutes = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredRoutes.slice(start, start + PAGE_SIZE);
  }, [filteredRoutes, currentPage]);

  useEffect(() => {
    setPage(1);
  }, [filters]);

  useEffect(() => {
    setPage((p) => Math.min(p, totalPages));
  }, [totalPages]);

  const stats = useMemo(() => {
    const total = allRoutes.length;
    const active = allRoutes.filter((r) => r.status === "in_progress").length;
    const completed = allRoutes.filter((r) => r.status === "completed").length;
    const totalCollection = allRoutes.reduce((acc, r) => acc + r.totalCollection, 0);
    return { total, active, completed, totalCollection };
  }, []);

  const handleReset = () => {
    setFilters(defaultFilters);
  };

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Rutas"
        subtitle="Planifica y monitorea las rutas de entrega."
        actions={
          <>
            <Button variant="outline" size="sm" className="h-9 gap-2">
              <FileUp className="size-4 shrink-0" />
              <span className="hidden sm:inline">Importar</span>
            </Button>
            <Button variant="outline" size="sm" className="h-9 gap-2">
              <Send className="size-4 shrink-0" />
              <span className="hidden sm:inline">Asignar ruta</span>
            </Button>
            <Button variant="outline" size="sm" className="h-9 gap-2">
              <Download className="size-4 shrink-0" />
              <span className="hidden sm:inline">Exportar</span>
            </Button>
            <Button
              size="sm"
              type="button"
              className="h-9 gap-2 bg-primary shadow-glow hover:bg-primary-hover"
              onClick={() => setCreateRouteOpen(true)}
            >
              <Plus className="size-4 shrink-0" />
              <span className="hidden sm:inline">Nueva ruta</span>
            </Button>
          </>
        }
      />
      <div className="space-y-5 p-4 sm:p-6 lg:p-8">
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          <StatCard
            label="Total de rutas"
            value={stats.total}
            icon={Route}
            tone="primary"
          />
          <StatCard label="Rutas activas" value={stats.active} icon={TrendingUp} tone="info" />
          <StatCard label="Rutas completadas" value={stats.completed} icon={Truck} tone="success" />
          <StatCard
            label="Recaudación total"
            value={`S/ ${stats.totalCollection.toLocaleString("es-PE", { minimumFractionDigits: 2 })}`}
            icon={Users}
            tone="warning"
          />
        </div>

        <RouteFilters
          filters={filters}
          onChange={setFilters}
          onReset={handleReset}
          vehicles={vehicles}
          places={places}
          drivers={drivers}
          toolbarRight={
            <div className="hidden shrink-0 items-center gap-1 rounded-lg border border-border/70 bg-white p-1 sm:inline-flex">
              <button
                type="button"
                onClick={() => setView("table")}
                className={cn(
                  "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                  view === "table"
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
                )}
              >
                <List className="size-4 shrink-0" /> Tabla
              </button>
              <button
                type="button"
                onClick={() => setView("grid")}
                className={cn(
                  "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                  view === "grid"
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
                )}
              >
                <LayoutGrid className="size-4 shrink-0" /> Tarjetas
              </button>
            </div>
          }
        />

        {filteredRoutes.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card py-16 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
              <Route className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="mt-4 text-base font-semibold text-foreground">No se encontraron rutas</p>
            <p className="mt-1 text-sm text-muted-foreground">Ajusta los filtros o crea una nueva ruta.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-3 sm:hidden">
              {paginatedRoutes.map((r) => (
                <RouteCard key={r.id} route={r} onSelect={setSelected} />
              ))}
            </div>

            <div className="hidden sm:block">
              {view === "table" ? (
                <RouteTable routes={paginatedRoutes} onSelect={setSelected} />
              ) : (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {paginatedRoutes.map((r) => (
                    <RouteCard key={r.id} route={r} onSelect={setSelected} />
                  ))}
                </div>
              )}
            </div>

            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-muted-foreground">
                Mostrando{" "}
                <span className="font-semibold text-foreground">
                  {(currentPage - 1) * PAGE_SIZE + 1}
                </span>
                –
                <span className="font-semibold text-foreground">
                  {Math.min(currentPage * PAGE_SIZE, totalFiltered)}
                </span>{" "}
                de <span className="font-semibold text-foreground">{totalFiltered}</span> rutas
              </p>

              <nav
                className="flex flex-wrap items-center justify-end gap-2"
                aria-label="Paginación de rutas"
              >
                <button
                  type="button"
                  disabled={currentPage <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  aria-label="Página anterior"
                  className={cn(
                    "flex size-9 shrink-0 items-center justify-center rounded-full border-2 bg-white transition-colors",
                    currentPage <= 1
                      ? "cursor-not-allowed border-primary/25 text-primary/35"
                      : "border-primary text-primary hover:bg-primary-soft",
                  )}
                >
                  <ChevronLeft className="size-4" strokeWidth={2.25} />
                </button>

                {paginationItems(currentPage, totalPages).map((item, idx) =>
                  item === "ellipsis" ? (
                    <span
                      key={`e-${idx}`}
                      className="flex size-9 shrink-0 items-center justify-center text-sm font-medium text-muted-foreground"
                      aria-hidden
                    >
                      …
                    </span>
                  ) : (
                    <button
                      key={item}
                      type="button"
                      onClick={() => setPage(item)}
                      aria-label={`Ir a página ${item}`}
                      aria-current={currentPage === item ? "page" : undefined}
                      className={cn(
                        "flex size-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold transition-colors",
                        currentPage === item
                          ? "bg-primary text-primary-foreground shadow-sm"
                          : "border-2 border-primary bg-white text-foreground hover:bg-primary-soft",
                      )}
                    >
                      {item}
                    </button>
                  ),
                )}

                <button
                  type="button"
                  disabled={currentPage >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  aria-label="Página siguiente"
                  className={cn(
                    "flex size-9 shrink-0 items-center justify-center rounded-full border-2 bg-white transition-colors",
                    currentPage >= totalPages
                      ? "cursor-not-allowed border-primary/25 text-primary/35"
                      : "border-primary text-primary hover:bg-primary-soft",
                  )}
                >
                  <ChevronRight className="size-4" strokeWidth={2.25} />
                </button>
              </nav>
            </div>
          </>
        )}
      </div>

      <NewRouteDialog
        open={createRouteOpen}
        onOpenChange={setCreateRouteOpen}
        vehicles={vehicles}
        drivers={drivers}
      />
    </div>
  );
};

export default Rutas;
