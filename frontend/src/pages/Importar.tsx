import { useState } from "react";
import { Link } from "react-router-dom";
import { Upload, Download, Calendar as CalendarIcon, FileSpreadsheet, Filter } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import * as XLSX from "xlsx-js-style";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import PageHeader from "@/components/PageHeader";

const mockImports = [
  { id: "225615", status: "Importado", filename: "CAYLLOMA.xlsx", user: "Rosa Gonzales Esquivel", date: "2026-03-23", time: "11:59:11" },
  { id: "225614", status: "Importado", filename: "UNION.xlsx", user: "Rosa Gonzales Esquivel", date: "2026-03-23", time: "11:58:08" },
  { id: "225599", status: "Importado", filename: "CASTILLA.xlsx", user: "Rosa Gonzales Esquivel", date: "2026-03-23", time: "11:27:34" },
  { id: "225598", status: "Finalizado con errores", filename: "CASTILLA.xlsx", user: "Rosa Gonzales Esquivel", date: "2026-03-23", time: "11:24:48" },
  { id: "223597", status: "Importado", filename: "RUTA CARAVELI - LASTMILE.xlsx", user: "Rosa Gonzales Esquivel", date: "2026-03-18", time: "12:50:49" },
  { id: "191256", status: "Importado", filename: "18.12.2025 ULTIMA MILLA 1.xlsx", user: "JESUS FELICITA VELASQUEZ VASQUEZ", date: "2025-12-19", time: "12:45:43" },
  { id: "190321", status: "Importado", filename: "17.12.2025 ULTIMA MILLA 1.xlsx", user: "JESUS FELICITA VELASQUEZ VASQUEZ", date: "2025-12-17", time: "15:29:23" },
  { id: "190239", status: "Importado", filename: "16.12.2025 ULTIMA MILLA 1.xlsx", user: "JESUS FELICITA VELASQUEZ VASQUEZ", date: "2025-12-17", time: "12:54:26" },
  { id: "189809", status: "Importado", filename: "15.12.2025 ULTIMA MILLA 1.xlsx", user: "JESUS FELICITA VELASQUEZ VASQUEZ", date: "2025-12-16", time: "15:22:27" },
  { id: "189808", status: "Finalizado con errores", filename: "15.12.2025 ULTIMA MILLA 1.xlsx", user: "JESUS FELICITA VELASQUEZ VASQUEZ", date: "2025-12-16", time: "15:20:36" },
  { id: "189806", status: "Finalizado con errores", filename: "15.12.2025 ULTIMA MILLA 1.xlsx", user: "JESUS FELICITA VELASQUEZ VASQUEZ", date: "2025-12-16", time: "15:18:22" },
];

export default function Importar() {
  const [date, setDate] = useState<Date>();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleDownloadTemplate = () => {
    const columns = [
      "NÚMERO ORDEN",
      "VEHÍCULO",
      "NOMBRE ITEM",
      "CANTIDAD",
      "CODIGO ITEM",
      "NOMBRE CONTACTO",
      "TELÉFONO",
      "EMAIL CONTACTO",
      "DIRECCIÓN",
      "LATITUD",
      "LONGITUD",
      "FECHA MIN ENTREGA",
      "FECHA MAX ENTREGA"
    ];

    const sampleData = [
      [
        "ORD-001", "V-2024", "Caja de herramientas", 2, "ITEM-100", 
        "Juan Pérez", "987654321", "juan@ejemplo.com", "Av. Principal 123, Lima", 
        "-12.046374", "-77.042793", "2026-06-01 08:00", "2026-06-01 18:00"
      ],
      [
        "ORD-002", "V-2025", "Silla ergonómica", 1, "ITEM-101", 
        "Ana García", "912345678", "ana@ejemplo.com", "Calle Secundaria 456, Arequipa", 
        "-16.409047", "-71.537451", "2026-06-02 09:00", "2026-06-02 14:00"
      ]
    ];

    const wsData = [columns, ...sampleData];
    const ws = XLSX.utils.aoa_to_sheet(wsData);

    const headerStyle = {
      font: { bold: true, sz: 12, color: { rgb: "FFFFFF" } },
      fill: { fgColor: { rgb: "4B5563" } }, // Gris oscuro/azulado
      alignment: { horizontal: "center", vertical: "center", wrapText: true }
    };
    
    const dataStyle = {
      font: { sz: 12 },
      alignment: { vertical: "center", wrapText: true }
    };

    const range = XLSX.utils.decode_range(ws["!ref"] || "A1:M3");
    
    for (let R = range.s.r; R <= range.e.r; ++R) {
      for (let C = range.s.c; C <= range.e.c; ++C) {
        const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
        if (!ws[cellAddress]) continue;
        
        if (R === 0) {
          ws[cellAddress].s = headerStyle;
        } else {
          ws[cellAddress].s = dataStyle;
        }
      }
    }

    // Aplicamos la altura de 1.03 cm (29.2 puntos) a las primeras 1000 filas
    ws["!rows"] = Array(1000).fill({ hpt: 29.2 });

    ws["!cols"] = columns.map(() => ({ wch: 22 }));
    ws["!cols"][8] = { wch: 40 }; // Dirección más ancha

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Plantilla");
    XLSX.writeFile(wb, "plantilla_importacion.xlsx");
  };

  return (
    <div className="flex h-full flex-col animate-fade-in">
      <PageHeader
        title="Importar"
        subtitle="Sube archivos para actualizar o importar nuevas rutas y órdenes al sistema."
        actions={
          <Button 
            variant="outline" 
            className="gap-2 border-primary/20 hover:bg-primary/5 text-primary"
            onClick={handleDownloadTemplate}
          >
            <Download className="mr-2 h-4 w-4" />
            Descargar plantilla
          </Button>
        }
      />

      <div className="flex flex-1 p-4 sm:p-6 lg:p-8">
        <div className="flex w-full flex-col gap-6 lg:flex-row">
          
          {/* Sidebar Form */}
          <aside className="w-full shrink-0 space-y-6 lg:w-80">

            <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
              <div className="mb-4 flex items-center gap-2 border-b border-border pb-4">
                <Upload className="size-4 text-primary" />
                <h3 className="text-sm font-semibold uppercase tracking-wider">
                  Carga de archivo
                </h3>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Fecha para cargar ruta
                  </label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full justify-start text-left font-normal bg-background/50 h-10",
                          !date && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date ? format(date, "yyyy-MM-dd") : <span>Seleccionar fecha</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={date}
                        onSelect={setDate}
                        initialFocus
                        locale={es}
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Escoja el archivo deseado
                  </label>
                  <label className="flex items-center w-full border border-border rounded-md bg-background/50 px-3 h-10 cursor-pointer hover:bg-muted/50 transition-colors overflow-hidden">
                    <span className={cn(
                      "text-sm truncate",
                      selectedFile ? "text-foreground font-medium" : "text-muted-foreground"
                    )}>
                      {selectedFile ? selectedFile.name : "Ningún archivo"}
                    </span>
                    <input 
                      type="file" 
                      className="hidden" 
                      accept=".xlsx,.xls,.csv"
                      onChange={handleFileChange}
                    />
                  </label>
                </div>

                <Button className="w-full bg-primary shadow-glow hover:bg-primary-hover shadow-sm mt-2 font-bold h-10 text-white">
                  <Upload className="mr-2 size-4" />
                  Importar
                </Button>
              </div>
            </div>
          </aside>

          {/* Main Content Area */}
          <main className="flex-1 space-y-6">
            <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden flex flex-col h-full max-h-[calc(100vh-12rem)]">
              <div className="px-6 py-4 border-b border-border bg-muted/30">
                <h2 className="text-lg font-semibold text-foreground tracking-tight">Últimas importaciones</h2>
              </div>

              <div className="flex-1 overflow-auto">
                <table className="w-full text-left text-sm">
                  <thead className="sticky top-0 z-10 bg-muted/50 border-b border-border shadow-sm">
                    <tr>
                      <th className="px-6 py-4 font-semibold text-muted-foreground">Identificador</th>
                      <th className="px-6 py-4 font-semibold text-muted-foreground">Estado</th>
                      <th className="px-6 py-4 font-semibold text-muted-foreground">Nombre archivo</th>
                      <th className="px-6 py-4 font-semibold text-muted-foreground">Usuario</th>
                      <th className="px-6 py-4 font-semibold text-muted-foreground text-right">Fecha solicitud</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border bg-card">
                    {mockImports.map((item, index) => (
                      <tr key={index} className="group hover:bg-muted/20 transition-colors">
                        <td className="px-6 py-4 font-mono font-medium text-primary hover:underline">
                          <Link to={`/importar/${item.id}`}>
                            {item.id}
                          </Link>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div 
                              className={cn(
                                "h-2.5 w-2.5 rounded-full shrink-0",
                                item.status === "Importado" ? "bg-emerald-500" : "bg-warning"
                              )} 
                            />
                            <span className={cn(
                              "font-medium",
                              item.status === "Importado" ? "text-emerald-600 dark:text-emerald-500" : "text-warning"
                            )}>
                              {item.status}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-muted-foreground flex items-center gap-2">
                          <FileSpreadsheet className="h-4 w-4 shrink-0 opacity-50" />
                          <span className="truncate max-w-[200px] block" title={item.filename}>
                            {item.filename}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-medium">
                          {item.user}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex flex-col items-end">
                            <span className="font-medium text-foreground">{item.time}</span>
                            <span className="text-xs text-muted-foreground">{item.date}</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </main>

        </div>
      </div>
    </div>
  );
}
