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
  AlertCircle,
  Truck,
  Package,
  Download,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useOrdersQuery, useEstadosHijosPorClaveQuery } from "@/hooks/useOperationsQueries";
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
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
const Alertas = () => {
  const [activeTab, setActiveTab] = useState("alertas");
  const { data: orders = [], isLoading } = useOrdersQuery();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [selectedStatus, setSelectedStatus] = useState("todos");
  const [selectedSubstatus, setSelectedSubstatus] = useState("todos");

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
    if (selectedStatus !== "todos") {
      const activeName = statusToName[selectedStatus];
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
  }, [selectedStatus, pendingSubs, inRouteSubs, entregadoSubs, noEntregadoSubs]);

  useEffect(() => {
    if (selectedSubstatus !== "todos" && !substatusOptions.includes(selectedSubstatus)) {
      setSelectedSubstatus("todos");
    }
  }, [selectedStatus, substatusOptions, selectedSubstatus]);

  const totalItems = orders.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentOrders = orders.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Alertas"
        subtitle="Monitorea y gestiona las alertas operativas en tiempo real."
        actions={
          <Button variant="outline" size="sm" className="h-9 gap-2">
            <Download className="size-4" />
            Exportar
          </Button>
        }
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
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="2026-02-02 - 2026-05-02"
                      className="pl-10 bg-background/50"
                    />
                  </div>
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
                    />
                  </div>
                </div>

                <Button className="w-full bg-primary shadow-glow hover:bg-primary-hover mt-2">
                  <Search className="mr-2 size-4" />
                  Buscar
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
                className="mt-0 focus-visible:outline-none focus-visible:ring-0"
              >
                <div className="rounded-xl border border-border bg-card/40 backdrop-blur-lg shadow-sm overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead>
                        <tr className="border-b border-border bg-muted/30">
                          <th className="px-4 py-4 font-semibold text-muted-foreground">
                            Orden
                          </th>
                          <th className="px-4 py-4 font-semibold text-muted-foreground">
                            Vehículo
                          </th>
                          <th className="px-4 py-4 font-semibold text-muted-foreground">
                            Fecha / Hora
                          </th>
                          <th className="px-4 py-4 font-semibold text-muted-foreground text-center">
                            Transición de Estado
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {isLoading ? (
                          <tr>
                            <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">
                              Cargando órdenes...
                            </td>
                          </tr>
                        ) : currentOrders.length === 0 ? (
                          <tr>
                            <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">
                              No hay órdenes registradas.
                            </td>
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
                                className="group hover:bg-muted/20 transition-colors"
                              >
                                <td className="px-4 py-4">
                                  <Link
                                    to={`/ordenes/detalle/${order.id}`}
                                    className="font-bold text-primary hover:underline"
                                  >
                                    #{order.id}
                                  </Link>
                                </td>
                                <td className="px-4 py-4 font-medium">
                                  {order.vehiclePlate || "Sin vehículo"}
                                </td>
                                <td className="px-4 py-4">
                                  <div className="flex flex-col">
                                    <span className="flex items-center gap-1.5 text-foreground">
                                      <Calendar className="size-3 text-muted-foreground" />
                                      {order.routeDate}
                                    </span>
                                    {order.createdAtIso && (
                                      <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                        <Clock className="size-3" />
                                        {new Date(order.createdAtIso).toLocaleTimeString([], {
                                          hour: "2-digit",
                                          minute: "2-digit",
                                        })}
                                      </span>
                                    )}
                                  </div>
                                </td>
                                <td className="px-4 py-4">
                                  <div className="flex items-center justify-center gap-3">
                                    <div className="flex items-center gap-1.5 rounded-full bg-muted/20 px-2.5 py-1 text-[11px] font-medium text-muted-foreground border border-border/50">
                                      Pendiente
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
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                  <div className="flex items-center justify-between border-t border-border p-4 bg-muted/10">
                    <p className="text-xs text-muted-foreground">
                      Mostrando{" "}
                      <span className="font-semibold text-foreground">
                        {totalItems > 0 ? startIndex + 1 : 0} - {Math.min(startIndex + itemsPerPage, totalItems)}
                      </span>{" "}
                      de{" "}
                      <span className="font-semibold text-foreground">
                        {totalItems}
                      </span>{" "}
                      órdenes
                    </p>
                    <div className="flex gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={currentPage === 1 || isLoading}
                        onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                      >
                        Anterior
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={currentPage === totalPages || totalPages === 0 || isLoading}
                        onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                      >
                        Siguiente
                      </Button>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </main>
        </div>
      </div>
    </div>
  );
};

export default Alertas;
