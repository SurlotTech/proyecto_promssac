import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ChevronRight,
  CheckCircle2,
  Clock,
  Download,
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

const CalendarIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M6.96006 2C7.37758 2 7.71605 2.30996 7.71605 2.69231V4.08883C8.38663 4.07692 9.13829 4.07692 9.98402 4.07692H14.016C14.8617 4.07692 15.6134 4.07692 16.284 4.08883V2.69231C16.284 2.30996 16.6224 2 17.0399 2C17.4575 2 17.7959 2.30996 17.7959 2.69231V4.15008C19.2468 4.25647 20.1992 4.51758 20.899 5.15838C21.5987 5.79917 21.8838 6.67139 22 8V9H2V8C2.11618 6.67139 2.4013 5.79917 3.10104 5.15838C3.80079 4.51758 4.75323 4.25647 6.20406 4.15008V2.69231C6.20406 2.30996 6.54253 2 6.96006 2Z" fill="#6e737c" />
    <path opacity="0.5" d="M22 14V12C22 11.161 21.9873 9.66527 21.9744 9H2.00586C1.99296 9.66527 2.00564 11.161 2.00564 12V14C2.00564 17.7712 2.00564 19.6569 3.17688 20.8284C4.34813 22 6.23321 22 10.0034 22H14.0023C17.7724 22 19.6575 22 20.8288 20.8284C22 19.6569 22 17.7712 22 14Z" fill="#6e737c" />
    <path d="M18 16.5C18 17.3284 17.3284 18 16.5 18C15.6716 18 15 17.3284 15 16.5C15 15.6716 15.6716 15 16.5 15C17.3284 15 18 15.6716 18 16.5Z" fill="#6e737c" />
  </svg>
);



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
      list = list.filter((o) => (o.routeDateIso ?? "") >= fromStr);
    }
    if (dateRange.to) {
      const toStr = format(dateRange.to, "yyyy-MM-dd");
      list = list.filter((o) => (o.routeDateIso ?? "") <= toStr);
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
                  <button
                    type="button"
                    className={cn(
                      "relative flex h-14 w-[240px] items-center rounded-lg border bg-white/60 transition-colors hover:border-primary text-left",
                      dateRange.from ? "border-primary" : "border-[#e1e7ee]",
                    )}
                  >
                    <span className={cn(
                      "absolute left-2.5 transition-all pointer-events-none bg-white px-1.5 z-10",
                      dateRange.from
                        ? "-top-2.5 text-[11px] text-primary"
                        : "top-1/2 -translate-y-1/2 text-sm text-[#8a9aab]",
                    )}>
                      Fecha
                    </span>
                    <span className="h-full w-full rounded-lg border-0 bg-transparent px-3 text-[15px] text-[#1f2933] flex items-center">
                      {dateRange.from ? (
                        <>
                          {format(dateRange.from, "d MMM", { locale: es })}
                          {dateRange.to && dateRange.to.getTime() !== dateRange.from.getTime()
                            ? ` — ${format(dateRange.to, "d MMM yyyy", { locale: es })}`
                            : ` ${format(dateRange.from, "yyyy", { locale: es })}`}
                        </>
                      ) : null}
                    </span>
                    <CalendarIcon className="mr-3 size-5 shrink-0 text-[#52677a]" />
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start" sideOffset={4}>
                  <Calendar
                    mode="range"
                    selected={dateRange.from ? { from: dateRange.from, to: dateRange.to } : undefined}
                    onSelect={(range) => setDateRange(range ?? { from: undefined, to: undefined })}
                    locale={es}
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
                            <span className="text-sm text-[#1f2933]">{order.routeDateIso ? format(new Date(order.routeDateIso + "T12:00:00"), "d MMM yyyy", { locale: es }) : order.routeDate}</span>
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
