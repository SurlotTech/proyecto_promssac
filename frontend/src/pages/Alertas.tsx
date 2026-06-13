import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Bell,
  Calendar,
  ChevronRight,
  CheckCircle2,
  Clock,
  Download,
  Filter,
  MoreVertical,
  Search,
  Truck,
} from "lucide-react";
import { useOrdersQuery, useEstadosHijosPorClaveQuery } from "@/hooks/useOperationsQueries";
import { orderStatusMeta } from "@/domain/orders";
import PageHeader from "@/components/PageHeader";
import StatusTabs from "@/components/routes/StatusTabs";
import type { StatusTab } from "@/components/routes/StatusTabs";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import RoutesPaginationBar from "@/components/routes/RoutesPaginationBar";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { es } from "date-fns/locale";

const Alertas = () => {
  const { data: orders = [], isLoading } = useOrdersQuery();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [activeStatus, setActiveStatus] = useState("all");
  const [selectedSubstatus, setSelectedSubstatus] = useState("todos");
  const [searchText, setSearchText] = useState("");
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({ from: undefined, to: undefined });

  const statusToName: Record<string, string> = {
    entregado: "Entregado",
    no_entregado: "No entregado",
    in_route: "En ruta",
    pending: "Pendiente",
  };

  const { data: pendingSubs = [] } = useEstadosHijosPorClaveQuery("Pendiente");
  const { data: inRouteSubs = [] } = useEstadosHijosPorClaveQuery("En ruta");
  const { data: entregadoSubs = [] } = useEstadosHijosPorClaveQuery("Entregado");
  const { data: noEntregadoSubs = [] } = useEstadosHijosPorClaveQuery("No entregado");

  const substatusOptions = useMemo(() => {
    if (activeStatus !== "all") {
      const activeName = statusToName[activeStatus];
      if (activeName === "Pendiente") return pendingSubs.map((s) => s.nombre);
      if (activeName === "En ruta") return inRouteSubs.map((s) => s.nombre);
      if (activeName === "Entregado") return entregadoSubs.map((s) => s.nombre);
      if (activeName === "No entregado") return noEntregadoSubs.map((s) => s.nombre);
      return [];
    }
    return [
      ...pendingSubs.map((s) => s.nombre),
      ...inRouteSubs.map((s) => s.nombre),
      ...entregadoSubs.map((s) => s.nombre),
      ...noEntregadoSubs.map((s) => s.nombre),
    ];
  }, [activeStatus, pendingSubs, inRouteSubs, entregadoSubs, noEntregadoSubs]);

  useEffect(() => {
    if (selectedSubstatus !== "todos" && !substatusOptions.includes(selectedSubstatus)) {
      setSelectedSubstatus("todos");
    }
  }, [activeStatus, substatusOptions, selectedSubstatus]);

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const o of orders) {
      counts[o.status] = (counts[o.status] || 0) + 1;
    }
    return counts;
  }, [orders]);

  const statusTabs: StatusTab[] = useMemo(() => [
    { status: "all", label: "Todas", count: orders.length, variant: "all" },
    { status: "pending", label: "Pendiente", count: statusCounts.pending || 0, variant: "warning" },
    { status: "in_route", label: "En ruta", count: statusCounts.in_route || 0, variant: "info" },
    { status: "entregado", label: "Entregado", count: statusCounts.entregado || 0, variant: "success" },
    { status: "no_entregado", label: "No entregado", count: statusCounts.no_entregado || 0, variant: "danger" },
  ], [orders, statusCounts]);

  const filteredOrders = useMemo(() => {
    let list = activeStatus === "all" ? orders : orders.filter((o) => o.status === activeStatus);
    if (selectedSubstatus !== "todos") {
      list = list.filter((o) => o.substatus === selectedSubstatus);
    }
    if (searchText.trim()) {
      const q = searchText.toLowerCase().trim();
      list = list.filter(
        (o) => o.id.toLowerCase().includes(q) || (o.vehiclePlate ?? "").toLowerCase().includes(q),
      );
    }
    if (dateRange.from) {
      const fromStr = format(dateRange.from, "yyyy-MM-dd");
      list = list.filter((o) => (o.routeDate ?? "") >= fromStr);
    }
    if (dateRange.to) {
      const toStr = format(dateRange.to, "yyyy-MM-dd");
      list = list.filter((o) => (o.routeDate ?? "") <= toStr);
    }
    return list;
  }, [orders, activeStatus, selectedSubstatus, searchText, dateRange]);

  const totalItems = filteredOrders.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * itemsPerPage;
  const currentOrders = filteredOrders.slice(startIndex, startIndex + itemsPerPage);

  useEffect(() => { setCurrentPage(1); }, [activeStatus, selectedSubstatus, searchText]);
  useEffect(() => { setCurrentPage((p) => Math.min(p, totalPages)); }, [totalPages]);

  const hasActiveFilters = searchText.trim() !== "" || selectedSubstatus !== "todos" || dateRange.from !== undefined || dateRange.to !== undefined;

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Alertas"
        subtitle="Monitorea y gestiona las alertas operativas en tiempo real."
        actions={
          <Button
            size="sm"
            type="button"
            className="h-12 gap-1.5 text-base font-normal bg-primary hover:bg-primary text-white px-6 shadow-md transition-all hover:scale-105 active:scale-95"
          >
            <Bell className="size-5" />
            Alertas
          </Button>
        }
      />

      <div className="space-y-10 p-4 pb-2 pt-1 sm:p-6 sm:pb-3 sm:pt-2 lg:p-8 lg:pb-4 lg:pt-2">
        <div className="rounded-[14px] border border-border/40 bg-white/30 shadow-md overflow-hidden">
          <StatusTabs tabs={statusTabs} activeStatus={activeStatus} onChange={setActiveStatus} />

          <div className="bg-white/30">
            <div className="flex items-center gap-4 px-5 py-5">
              <div className="relative flex-1 max-w-[380px]">
                <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-[#8a9aab]" />
                <Input
                  placeholder="Buscar orden o vehículo..."
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  className="h-14 rounded-lg border border-[#e1e7ee] bg-white/60 pl-10 text-[15px] text-[#1f2933] placeholder:text-[#8a9aab] transition-colors hover:border-primary focus-visible:ring-1"
                />
              </div>

              <div className="relative group">
                <span className={cn(
                  "absolute left-3 z-10 transition-all pointer-events-none bg-white px-1.5",
                  selectedSubstatus !== "todos"
                    ? "-top-1.5 text-[11px] text-primary"
                    : "top-1/2 -translate-y-1/2 text-sm text-[#8a9aab] group-has-[[data-state=open]]:-top-1.5 group-has-[[data-state=open]]:text-[11px] group-has-[[data-state=open]]:text-primary",
                )}>
                  Subestado
                </span>
                <Select value={selectedSubstatus} onValueChange={setSelectedSubstatus}>
                  <SelectTrigger className={cn(
                    "h-14 w-[180px] rounded-lg border bg-white/60 px-3.5 text-[15px] text-[#8a9aab] focus:ring-0 focus:ring-offset-0 data-[state=open]:border-primary transition-colors hover:border-primary [&_svg]:text-[#52677a] [&_svg]:opacity-100",
                    selectedSubstatus !== "todos" ? "pt-4 border-primary" : "border-[#e1e7ee]",
                  )}>
                    {selectedSubstatus !== "todos" ? (
                      <div className="flex items-center gap-2">
                        <SelectValue />
                      </div>
                    ) : (
                      <span />
                    )}
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos</SelectItem>
                    {substatusOptions.map((s) => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="ghost" className="ml-auto h-14 gap-2 px-3 text-[15px] text-black hover:text-[#1f2933]">
                    <Filter className="size-4" />
                    Filtros
                  </Button>
                </PopoverTrigger>
                <PopoverContent align="end" className="w-auto p-0">
                  <Calendar
                    mode="range"
                    selected={dateRange}
                    onSelect={(range) => setDateRange(range ?? { from: undefined, to: undefined })}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-14 gap-2 px-3 text-[15px] text-black hover:text-[#1f2933]">
                    <MoreVertical className="size-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-44">
                  <DropdownMenuItem onClick={() => {}}>
                    <Download className="mr-2 size-4" /> Exportar
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {hasActiveFilters && (
              <div className="px-5 pb-3 flex flex-col gap-2">
                <span className="text-sm font-semibold text-[#1f2933]">{totalItems} resultado{totalItems !== 1 ? "s" : ""}</span>
                <div className="flex items-center gap-2 flex-wrap">
                  {searchText.trim() !== "" && (
                    <span className="inline-flex items-center gap-1.5 rounded-md bg-[#eef1f5] px-2.5 py-1 text-xs font-medium text-[#52677a]">
                      Búsqueda: {searchText}
                      <button onClick={() => setSearchText("")} className="ml-0.5 text-[#8a9aab] hover:text-[#1f2933]">✕</button>
                    </span>
                  )}
                  {selectedSubstatus !== "todos" && (
                    <span className="inline-flex items-center gap-1.5 rounded-md bg-[#eef1f5] px-2.5 py-1 text-xs font-medium text-[#52677a]">
                      Subestado: {selectedSubstatus}
                      <button onClick={() => setSelectedSubstatus("todos")} className="ml-0.5 text-[#8a9aab] hover:text-[#1f2933]">✕</button>
                    </span>
                  )}
                  {(dateRange.from || dateRange.to) && (
                    <span className="inline-flex items-center gap-1.5 rounded-md bg-[#eef1f5] px-2.5 py-1 text-xs font-medium text-[#52677a]">
                      Fechas: {dateRange.from ? format(dateRange.from, "d MMM", { locale: es }) : "..."} — {dateRange.to ? format(dateRange.to, "d MMM yyyy", { locale: es }) : "..."}
                      <button onClick={() => setDateRange({ from: undefined, to: undefined })} className="ml-0.5 text-[#8a9aab] hover:text-[#1f2933]">✕</button>
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="overflow-x-auto scrollbar-thin">
            <table className="w-full">
              <thead>
                <tr className="h-11 bg-[#eef1f5] text-left text-xs font-bold text-[#647789]">
                  <th className="px-5">Orden</th>
                  <th className="px-3">Vehículo</th>
                  <th className="px-3">Fecha</th>
                  <th className="px-3 text-center">Transición de Estado</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={4} className="h-[60px] text-center text-sm text-[#52677a]">Cargando órdenes...</td>
                  </tr>
                ) : currentOrders.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="h-[60px] text-center text-sm text-[#52677a]">No hay órdenes registradas.</td>
                  </tr>
                ) : (
                  currentOrders.map((order) => {
                    const statusInfo = orderStatusMeta[order.status] || {
                      label: order.status,
                      className: "bg-muted text-muted-foreground",
                    };
                    return (
                      <tr
                        key={order.id}
                        className="h-[60px] border-b border-dashed border-[#e3e8ee] bg-white/30 transition-colors hover:bg-surface-muted"
                      >
                        <td className="px-5">
                          <Link
                            to={`/ordenes/detalle/${order.id}`}
                            className="text-sm font-medium text-[#1f2933] hover:text-primary hover:underline underline-offset-4 transition-colors"
                          >
                            #{order.id}
                          </Link>
                        </td>
                        <td className="px-3 text-sm font-medium text-[#1f2933]">
                          {order.vehiclePlate || <span className="text-[#8a9aab]">Sin vehículo</span>}
                        </td>
                        <td className="px-3">
                          <div className="flex flex-col">
                            <span className="text-sm text-[#1f2933]">{order.routeDate}</span>
                            {order.createdAtIso && (
                              <span className="text-xs text-[#52677a]">
                                {new Date(order.createdAtIso).toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-3">
                          <div className="flex items-center justify-center gap-3">
                            <span className="inline-flex items-center rounded-md bg-[#e9eef2] px-2 py-1 text-xs font-bold text-[#5f7282]">
                              Pendiente
                            </span>
                            <div className="flex items-center">
                              <div className="h-px w-8 bg-gradient-to-r from-[#8a9aab]/30 to-primary/50" />
                              <ChevronRight className="size-3 text-primary/50 -ml-1" />
                            </div>
                            <span className={cn(
                              "inline-flex items-center rounded-md px-2 py-1 text-xs font-bold",
                              statusInfo.className,
                            )}>
                              <CheckCircle2 className="mr-1 size-3" />
                              {statusInfo.label}
                            </span>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          <RoutesPaginationBar
            currentPage={safePage}
            totalPages={totalPages}
            totalFiltered={totalItems}
            pageSize={itemsPerPage}
            onPageChange={setCurrentPage}
            label="alertas"
          />
        </div>
      </div>
    </div>
  );
};

export default Alertas;
