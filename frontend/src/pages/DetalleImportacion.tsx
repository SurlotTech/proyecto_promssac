import { Link, useParams } from "react-router-dom";
import { Download, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const mockOrders = [
  { order: "10952", name: "40318", address: "PLAZA PRINCIPAL,LLANCA,CHOCO,CASTILLA,AREQUIPA", vehicle: "BKT760", items: "1" },
  { order: "10953", name: "40319", address: "CALLE PROLONGACION PROGRESO S/N,CHOCO,CHOCO,CASTILLA -AREQUIPA", vehicle: "BKT760", items: "1" },
  { order: "10954", name: "40355", address: "MIÑA, MIÑA, CHOCO, CASTILLA-AREQUIPA", vehicle: "BKT760", items: "1" },
  { order: "10955", name: "40569", address: "PACHAUMA, PACHAUMA, CHOCO, CASTILLA-AREQUIPA", vehicle: "BKT760", items: "1" },
  { order: "10956", name: "40579", address: "PAMPUYO,PAMPUYO,CHOCO,CASTILLA AREQUIPA", vehicle: "BKT760", items: "1" },
  { order: "10957", name: "40581", address: "PLAZA PRINCIPAL,HUIJUYO,CHOCO,CASTILLA AREQUIPA", vehicle: "BKT760", items: "1" },
  { order: "10958", name: "CHOCO", address: "CHOCO,CHOCO,CHOCO,CASTILLA AREQUIPA", vehicle: "BKT760", items: "1" },
  { order: "10959", name: "40030 - COLEGIO SAN FRANCISCO DE ASIS - PRIMARIA", address: "JACHAÑA, JACHAÑA, CAYLLOMA, CAYLLOMA - AREQUIPA", vehicle: "BKT760", items: "1" },
  { order: "10960", name: "40030 - COLEGIO SAN FRANCISCO DE ASIS - SECUNDARIA", address: "JACHAÑA, JACHAÑA, CAYLLOMA, CAYLLOMA-AREQUIPA", vehicle: "BKT760", items: "1" },
  { order: "10961", name: "40381-SANTA ROSA DE LIMA", address: "JIRON TAPIA S/N, CAYLLOMA ,CAYLLOMA,CAYLLOMA -AREQUIPA", vehicle: "BKT760", items: "1" },
];

export default function DetalleImportacion() {
  const { id } = useParams();

  return (
    <div className="animate-fade-in bg-muted/20">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 px-6 py-4 text-sm font-medium text-muted-foreground bg-card/80 backdrop-blur-md border-b border-border/50">
        <Link to="/importar" className="hover:text-primary transition-colors">
          Últimas Importaciones
        </Link>
        <ChevronRight className="size-4" />
        <span className="text-foreground font-bold">Detalles de la importación</span>
      </div>

      <div className="p-4 sm:p-6 lg:p-8">
        <div className="w-full space-y-6">
          {/* Summary Card */}
          <div className="bg-card/80 backdrop-blur-md border border-border shadow-sm rounded-xl p-8 relative">
            <div className="absolute right-8 top-8">
              <Button variant="link" className="text-warning text-sm h-auto p-0 font-bold hover:text-warning/80 hover:no-underline">
                <Download className="mr-1.5 h-4 w-4" />
                Descargar Archivo
              </Button>
            </div>

            <div className="flex items-center gap-3 mb-8">
              <span className="text-2xl font-bold text-foreground">{id || "225615"}</span>
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider bg-muted/50 px-2.5 py-1 rounded-md border border-border">Importado</span>
            </div>

            <div className="grid grid-cols-3 gap-6 text-center max-w-4xl mx-auto">
              <div className="space-y-1">
                <p className="text-[40px] leading-none font-bold text-emerald-500">49</p>
                <p className="text-sm text-muted-foreground font-medium mt-2">Órdenes agregadas</p>
              </div>
              <div className="space-y-1">
                <p className="text-[40px] leading-none font-bold text-emerald-500">49</p>
                <p className="text-sm text-muted-foreground font-medium mt-2">Órdenes totales</p>
              </div>
              <div className="space-y-1">
                <p className="text-[40px] leading-none font-bold text-destructive">0</p>
                <p className="text-sm text-muted-foreground font-medium mt-2">Errores</p>
              </div>
            </div>
          </div>

          {/* Table Card */}
          <div className="bg-card/80 backdrop-blur-md border border-border shadow-sm rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/30 text-[11px] uppercase tracking-wider text-muted-foreground">
                    <th className="px-6 py-4 font-semibold">Número de orden</th>
                    <th className="px-6 py-4 font-semibold">Nombre</th>
                    <th className="px-6 py-4 font-semibold">Dirección</th>
                    <th className="px-6 py-4 font-semibold">Identificador vehículo</th>
                    <th className="px-6 py-4 font-semibold text-center"># Items</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {mockOrders.map((order, i) => (
                    <tr key={i} className="group hover:bg-muted/20 transition-colors">
                      <td className="px-6 py-4 font-bold text-foreground">{order.order}</td>
                      <td className="px-6 py-4 text-muted-foreground font-medium">{order.name}</td>
                      <td className="px-6 py-4 text-muted-foreground">{order.address}</td>
                      <td className="px-6 py-4 text-muted-foreground">{order.vehicle}</td>
                      <td className="px-6 py-4 text-center text-muted-foreground font-medium">{order.items}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
