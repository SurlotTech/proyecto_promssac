import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Bell,
  Search,
  Filter,
  Calendar,
  Clock,
  ChevronRight,
  CheckCircle2,
  Truck,
  Package,
} from "lucide-react";
import { useAlertOrdersQuery } from "@/hooks/useOperationsQueries";
import { orderStatusMeta } from "@/domain/orders";
import PageHeader from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import RoutesPaginationBar from "@/components/routes/RoutesPaginationBar";
import RouteDateRangePicker from "@/components/routes/RouteDateRangePicker";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
const Alertas = () => {
  const [activeTab, setActiveTab] = useState("alertas");
  const { data: orders = [], isLoading } = useAlertOrdersQuery();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [selectedStatus, setSelectedStatus] = useState("todos");
  const [selectedSubstatus, setSelectedSubstatus] = useState("todos");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [vehicleFilter, setVehicleFilter] = useState("");
  const [orderSearch, setOrderSearch] = useState("");

  const substatusOptions = useMemo(
    () => {
      const subs = new Set<string>();
      for (const o of orders) {
        if (o.substatus) subs.add(o.substatus);
      }
      return Array.from(subs).sort();
    },
    [orders],
  );

  useEffect(() => {
    if (selectedSubstatus !== "todos" && !substatusOptions.includes(selectedSubstatus)) {
      setSelectedSubstatus("todos");
    }
  }, [selectedStatus, substatusOptions, selectedSubstatus]);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedStatus, selectedSubstatus, dateFrom, dateTo, vehicleFilter, orderSearch]);

  const filteredOrders = useMemo(() => {
    let list = orders;
    if (selectedStatus !== "todos") {
      list = list.filter((o) => o.status === selectedStatus);
    }
    if (selectedSubstatus !== "todos") {
      list = list.filter((o) => o.substatus === selectedSubstatus);
    }
    if (dateFrom) {
      list = list.filter((o) => {
        const iso = o.routeDate.split("/").reverse().join("-");
        return iso >= dateFrom;
      });
    }
    if (dateTo) {
      list = list.filter((o) => {
        const iso = o.routeDate.split("/").reverse().join("-");
        return iso <= dateTo;
      });
    }
    const vf = vehicleFilter.trim().toLowerCase();
    if (vf) {
      list = list.filter((o) => o.vehiclePlate.toLowerCase().includes(vf));
    }
    const os = orderSearch.trim().toLowerCase();
    if (os) {
      list = list.filter((o) => o.id.toLowerCase().includes(os));
    }
    return list;
  }, [orders, selectedStatus, selectedSubstatus, dateFrom, dateTo, vehicleFilter, orderSearch]);

  const totalItems = filteredOrders.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentOrders = filteredOrders.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Alertas"
        subtitle="Monitorea y gestiona las alertas operativas en tiempo real."
      />

      <div className="flex flex-1 p-4 sm:p-6 lg:p-8">
        <div className="flex w-full flex-col gap-6 lg:flex-row">
          {/* Sidebar Filters */}
          <aside className="w-full shrink-0 space-y-6 lg:w-80">
            <div className="rounded-xl border border-border bg-card/40 backdrop-blur-lg p-5 shadow-sm">
              <div className="mb-4 flex items-center gap-2 border-b border-border pb-4">
                <Filter className="size-4 text-primary" />
                <h3 className="text-sm font-semibold uppercase tracking-wider">
                  Filtros
                </h3>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Filtro de fecha
                  </label>
                  <RouteDateRangePicker
                    dateFrom={dateFrom}
                    dateTo={dateTo}
                    onRangeChange={(from, to) => { setDateFrom(from); setDateTo(to); }}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Estado actual
                  </label>
                  <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                    <SelectTrigger className="bg-background/50">
                      <SelectValue placeholder="Seleccionar" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todos</SelectItem>
                      <SelectItem value="pending">Pendiente</SelectItem>
                      <SelectItem value="in_route">En ruta</SelectItem>
                      <SelectItem value="entregado">Entregado</SelectItem>
                      <SelectItem value="no_entregado">No entregado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Subestado actual
                  </label>
                  <Select value={selectedSubstatus} onValueChange={setSelectedSubstatus}>
                    <SelectTrigger className="bg-background/50">
                      <SelectValue placeholder="Seleccionar" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todos</SelectItem>
                      {substatusOptions.map((s) => (
                        <SelectItem key={s} value={s}>
                          {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Identificador vehículo
                  </label>
                  <div className="relative">
                    <Truck className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Ej: V-2024"
                      className="pl-10 bg-background/50"
                      value={vehicleFilter}
                      onChange={(e) => setVehicleFilter(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Número de orden
                  </label>
                  <div className="relative">
                    <Package className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Ej: 10969"
                      className="pl-10 bg-background/50"
                      value={orderSearch}
                      onChange={(e) => setOrderSearch(e.target.value)}
                    />
                  </div>
                </div>

                <Button className="w-full bg-primary shadow-glow hover:bg-primary-hover mt-2">
                  <Search className="mr-2 size-4" />
                  {filteredOrders.length} resultado{filteredOrders.length !== 1 ? "s" : ""}
                </Button>
              </div>
            </div>
          </aside>

          {/* Main Content Area */}
          <main className="flex-1 space-y-6">
            <Tabs
              defaultValue="alertas"
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <TabsContent
                value={activeTab}
                className="mt-0 space-y-4 focus-visible:outline-none focus-visible:ring-0"
              >
                <div className="rounded-xl border border-border bg-card/40 backdrop-blur-lg shadow-sm overflow-hidden">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader className="bg-muted/40">
                        <TableRow className="hover:bg-transparent">
                          <TableHead className="font-semibold text-foreground uppercase text-xs">Orden</TableHead>
                          <TableHead className="font-semibold text-foreground uppercase text-xs">Vehículo</TableHead>
                          <TableHead className="font-semibold text-foreground uppercase text-xs">Fecha / Hora</TableHead>
                          <TableHead className="font-semibold text-foreground uppercase text-xs text-center">Transición de Estado</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {isLoading ? (
                          <TableRow>
                            <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">Cargando órdenes...</TableCell>
                          </TableRow>
                        ) : currentOrders.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">No hay órdenes registradas.</TableCell>
                          </TableRow>
                        ) : (
                           currentOrders.map((order) => {
                             const statusInfo = orderStatusMeta[order.status] || {
                               label: order.status,
                               className: "bg-muted text-muted-foreground",
                             };
                             const prevInfo = orderStatusMeta[order.previousStatus] || {
                               label: order.previousStatus,
                               className: "bg-muted text-muted-foreground",
                             };
                             return (
                              <TableRow
                                key={order.id}
                                className="hover:bg-muted/30"
                              >
                                <TableCell>
                                  <Link
                                    to={`/ordenes/detalle/${order.id}`}
                                    className="font-bold text-primary hover:underline"
                                  >
                                    #{order.id}
                                  </Link>
                                </TableCell>
                                <TableCell className="font-medium">
                                  {order.vehiclePlate || "Sin vehículo"}
                                </TableCell>
                                <TableCell>
                                   <div className="flex flex-col">
                                     <span className="flex items-center gap-1.5 text-foreground">
                                       <Calendar className="size-3 text-muted-foreground" />
                                       {order.routeDate}
                                     </span>
                                     <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                       <Clock className="size-3" />
                                       {order.lastUpdatedAt || "—"}
                                     </span>
                                   </div>
                                 </TableCell>
                                <TableCell>
                                   <div className="flex items-center justify-center gap-3">
                                     <div className={cn(
                                       "flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium border border-border/50",
                                       prevInfo.className,
                                     )}>
                                       {prevInfo.label}
                                     </div>
                                    <div className="flex w-16 items-center">
                                      <div className="h-px flex-1 bg-gradient-to-r from-muted-foreground/30 to-primary/50" />
                                      <ChevronRight className="size-3 text-primary/50 -ml-1" />
                                    </div>
                                    <div
                                      className={cn(
                                        "flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium shadow-sm",
                                        statusInfo.className,
                                      )}
                                    >
                                      <CheckCircle2 className="size-3" />
                                      {statusInfo.label}
                                    </div>
                                  </div>
                                </TableCell>
                              </TableRow>
                            );
                          })
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </div>
                <RoutesPaginationBar
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalFiltered={totalItems}
                  pageSize={itemsPerPage}
                  onPageChange={setCurrentPage}
                  label="alertas"
                />
              </TabsContent>
            </Tabs>
          </main>
        </div>
      </div>
    </div>
  );
};

export default Alertas;
