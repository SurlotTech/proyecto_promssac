import { useState } from "react";
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
} from "lucide-react";
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
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const alertTypes = [
  { id: "alertas", label: "Alertas", count: 12 },
  { id: "reseñas", label: "Alertas de reseñas", count: 5 },
  { id: "gps", label: "Alertas GPS", count: 8 },
  { id: "tiempo", label: "Alertas por exceso de tiempo", count: 3 },
  { id: "retraso", label: "Alertas por retraso en la entrega", count: 15 },
];

const mockAlerts = [
  {
    id: "10969",
    vehicle: "V-2024-001",
    date: "2026-04-09",
    time: "15:34:17",
    statusFrom: "Recepcionado Conforme",
    statusTo: "Recepcionado Conforme",
    type: "retraso",
  },
  {
    id: "10955",
    vehicle: "V-2024-005",
    date: "2026-04-08",
    time: "11:27:12",
    statusFrom: "Recepcionado Conforme",
    statusTo: "Recepcionado Conforme",
    type: "tiempo",
  },
  {
    id: "10954",
    vehicle: "V-2024-002",
    date: "2026-04-08",
    time: "09:41:07",
    statusFrom: "Recepcionado Conforme",
    statusTo: "Recepcionado Conforme",
    type: "gps",
  },
  {
    id: "10967",
    vehicle: "V-2024-008",
    date: "2026-04-07",
    time: "16:01:21",
    statusFrom: "Recepcionado Conforme",
    statusTo: "Recepcionado Conforme",
    type: "alertas",
  },
];

const Alertas = () => {
  const [activeTab, setActiveTab] = useState("alertas");

  return (
    <div className="flex h-full flex-col animate-fade-in">
      <PageHeader
        title="Alertas"
        subtitle="Monitorea y gestiona las alertas operativas en tiempo real."
        actions={
          <Button className="bg-primary shadow-glow hover:bg-primary-hover">
            Exportar reporte
          </Button>
        }
      />

      <div className="flex flex-1 overflow-hidden p-4 sm:p-6 lg:p-8">
        <div className="flex w-full flex-col gap-6 lg:flex-row">
          {/* Sidebar Filters */}
          <aside className="w-full shrink-0 space-y-6 lg:w-80">
            <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
              <div className="mb-4 flex items-center gap-2 border-b border-border pb-4">
                <Filter className="size-4 text-primary" />
                <h3 className="text-sm font-semibold uppercase tracking-wider">Filtros</h3>
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
                    Gestión
                  </label>
                  <Select defaultValue="todos">
                    <SelectTrigger className="bg-background/50">
                      <SelectValue placeholder="Seleccionar" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todos</SelectItem>
                      <SelectItem value="gestion1">Gestión A</SelectItem>
                      <SelectItem value="gestion2">Gestión B</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Estado actual
                  </label>
                  <Select defaultValue="todos">
                    <SelectTrigger className="bg-background/50">
                      <SelectValue placeholder="Seleccionar" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todos</SelectItem>
                      <SelectItem value="ok">Ok</SelectItem>
                      <SelectItem value="error">Error</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Identificador vehículo
                  </label>
                  <div className="relative">
                    <Truck className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input placeholder="Ej: V-2024" className="pl-10 bg-background/50" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Número de orden
                  </label>
                  <div className="relative">
                    <Package className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input placeholder="Ej: 10969" className="pl-10 bg-background/50" />
                  </div>
                </div>

                <Button className="w-full bg-warning text-warning-foreground hover:bg-warning/90 shadow-sm mt-2">
                  <Search className="mr-2 size-4" />
                  Buscar
                </Button>
              </div>
            </div>
          </aside>

          {/* Main Content Area */}
          <main className="flex-1 space-y-6 overflow-hidden">
            <Tabs defaultValue="alertas" value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="w-full justify-start overflow-x-auto bg-transparent p-0 h-auto border-b border-border rounded-none gap-2 pb-px mb-6">
                {alertTypes.map((tab) => (
                  <TabsTrigger
                    key={tab.id}
                    value={tab.id}
                    className={cn(
                      "relative h-12 rounded-none border-b-2 border-transparent px-4 py-2 text-sm font-medium text-muted-foreground transition-all hover:text-foreground data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:bg-transparent",
                    )}
                  >
                    {tab.label}
                    {tab.count > 0 && (
                      <Badge variant="secondary" className="ml-2 bg-primary/10 text-primary border-none text-[10px]">
                        {tab.count}
                      </Badge>
                    )}
                  </TabsTrigger>
                ))}
              </TabsList>

              <TabsContent value={activeTab} className="mt-0 focus-visible:outline-none focus-visible:ring-0">
                <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead>
                        <tr className="border-b border-border bg-muted/30">
                          <th className="px-4 py-4 font-semibold text-muted-foreground">Orden</th>
                          <th className="px-4 py-4 font-semibold text-muted-foreground">Vehículo</th>
                          <th className="px-4 py-4 font-semibold text-muted-foreground">Fecha / Hora</th>
                          <th className="px-4 py-4 font-semibold text-muted-foreground">Transición de Estado</th>
                          <th className="px-4 py-4 font-semibold text-muted-foreground text-right">Acciones</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {mockAlerts.map((alert) => (
                          <tr key={alert.id} className="group hover:bg-muted/20 transition-colors">
                            <td className="px-4 py-4">
                              <span className="font-mono font-bold text-primary">#{alert.id}</span>
                            </td>
                            <td className="px-4 py-4 font-medium">{alert.vehicle}</td>
                            <td className="px-4 py-4">
                              <div className="flex flex-col">
                                <span className="flex items-center gap-1.5 text-foreground">
                                  <Calendar className="size-3 text-muted-foreground" />
                                  {alert.date}
                                </span>
                                <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                  <Clock className="size-3" />
                                  {alert.time}
                                </span>
                              </div>
                            </td>
                            <td className="px-4 py-4">
                              <div className="flex items-center gap-3">
                                <div className="flex items-center gap-1.5 rounded-full bg-success/10 px-2.5 py-1 text-[11px] font-medium text-success border border-success/20">
                                  <CheckCircle2 className="size-3" />
                                  {alert.statusFrom}
                                </div>
                                <div className="flex flex-1 min-w-[60px] items-center">
                                  <div className="h-px flex-1 bg-gradient-to-r from-success/50 to-success" />
                                  <ChevronRight className="size-3 text-success -ml-1" />
                                </div>
                                <div className="flex items-center gap-1.5 rounded-full bg-success px-2.5 py-1 text-[11px] font-medium text-success-foreground shadow-sm">
                                  <CheckCircle2 className="size-3" />
                                  {alert.statusTo}
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-4 text-right">
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <AlertCircle className="size-4 text-muted-foreground" />
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="flex items-center justify-between border-t border-border p-4 bg-muted/10">
                    <p className="text-xs text-muted-foreground">
                      Mostrando <span className="font-semibold text-foreground">4</span> alertas de <span className="font-semibold text-foreground">12</span>
                    </p>
                    <div className="flex gap-1">
                      <Button variant="outline" size="sm" disabled>Anterior</Button>
                      <Button variant="outline" size="sm">Siguiente</Button>
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
