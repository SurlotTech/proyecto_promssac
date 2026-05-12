import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Filter, FilterX, MoreHorizontal, Plus, ScrollText, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

type EstadoEntrega = "entregado" | "no_entregado" | "parcial";

type SubestadoRow = {
  id: string;
  nombre: string;
  estado: EstadoEntrega;
  orden: number;
  codigo: string;
  tipo: string;
  fechaCreacion: string;
  privado: boolean;
};

const mockRows: SubestadoRow[] = [
  {
    id: "1",
    nombre: "Recepcionado Confo…",
    estado: "entregado",
    orden: 1,
    codigo: "",
    tipo: "Móvil",
    fechaCreacion: "06/11/2025 11:02",
    privado: false,
  },
  {
    id: "2",
    nombre: "Dirección no encontr…",
    estado: "no_entregado",
    orden: 2,
    codigo: "",
    tipo: "Móvil",
    fechaCreacion: "06/11/2025 11:05",
    privado: false,
  },
  {
    id: "3",
    nombre: "Sin personal para rec…",
    estado: "parcial",
    orden: 3,
    codigo: "",
    tipo: "Móvil",
    fechaCreacion: "07/11/2025 09:12",
    privado: false,
  },
  {
    id: "4",
    nombre: "Cliente ausente",
    estado: "no_entregado",
    orden: 4,
    codigo: "",
    tipo: "Móvil",
    fechaCreacion: "08/11/2025 14:30",
    privado: false,
  },
];

const estadoBadge = (estado: EstadoEntrega) => {
  const map = {
    entregado: { label: "Entregado", className: "border-emerald-500 bg-emerald-50 text-emerald-700" },
    no_entregado: { label: "No entregado", className: "border-red-500 bg-red-50 text-red-700" },
    parcial: { label: "Entrega parcial", className: "border-amber-500 bg-amber-50 text-amber-700" },
  } as const;
  const m = map[estado];
  return (
    <span className={cn("inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium", m.className)}>
      {m.label}
    </span>
  );
};

const Subestados = () => {
  const navigate = useNavigate();
  const [tab, setTab] = useState("subestados");
  const [nombreFilter, setNombreFilter] = useState("");
  const [appliedFilter, setAppliedFilter] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const filtered = useMemo(() => {
    const q = appliedFilter.trim().toLowerCase();
    if (!q) return mockRows;
    return mockRows.filter((r) => r.nombre.toLowerCase().includes(q));
  }, [appliedFilter]);

  const toggleAll = () => {
    if (selectedIds.length === filtered.length && filtered.length > 0) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filtered.map((r) => r.id));
    }
  };

  const toggleOne = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
  };

  const applyFilter = () => setAppliedFilter(nombreFilter);
  const clearFilter = () => {
    setNombreFilter("");
    setAppliedFilter("");
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-transparent animate-fade-in">
      <Tabs value={tab} onValueChange={setTab} className="flex min-h-0 flex-1 flex-col">
        {/* Pestañas + acciones (misma fila que en la referencia) */}
        <div className="sticky top-0 z-10 border-b border-border bg-card/40 backdrop-blur-md">
          <div className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <TabsList className="h-auto w-full justify-start gap-1 rounded-lg bg-muted/60 p-1 sm:w-auto">
              <TabsTrigger
                value="subestados"
                className="rounded-md px-4 py-2 text-sm data-[state=active]:bg-transparent data-[state=active]:font-semibold data-[state=active]:text-foreground data-[state=active]:shadow-sm"
              >
                Subestados
              </TabsTrigger>
              <TabsTrigger
                value="items"
                className="rounded-md px-4 py-2 text-sm data-[state=active]:bg-transparent data-[state=active]:font-semibold data-[state=active]:text-foreground data-[state=active]:shadow-sm"
              >
                Subestados de ítems
              </TabsTrigger>
            </TabsList>
            <div className="flex flex-wrap items-center gap-2">
              <Button
                size="sm"
                className="h-9 gap-1.5 font-medium shadow-glow"
                onClick={() => navigate("/configuracion/subestados/nuevo")}
              >
                <Plus className="size-4" />
                Crear subestado
              </Button>
            </div>
          </div>
        </div>

        <TabsContent value="subestados" className="mt-0 flex min-h-0 flex-1 flex-col focus-visible:outline-none">
          <div className="flex-1 overflow-auto p-4 sm:p-6">
            <div className="overflow-hidden rounded-xl border border-border shadow-sm">
{/* Barra de filtros */}
          <div className="flex flex-wrap items-center gap-3 border-b border-border bg-muted/20 px-4 py-3">
            <Input
              placeholder="Nombre"
              value={nombreFilter}
              onChange={(e) => setNombreFilter(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && applyFilter()}
              className="h-9 w-full bg-transparent sm:max-w-xs"
            />
            <div className="flex flex-wrap items-center gap-2">
              <Button
                type="button"
                size="sm"
                className="h-9 gap-2"
                onClick={applyFilter}
              >
                <Filter className="size-4" />
                Filtrar
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-9 gap-2"
                onClick={clearFilter}
              >
                <FilterX className="size-4" />
                Limpiar filtro
              </Button>
            </div>
          </div>

          {/* Tabla */}
          <div className="overflow-x-auto bg-card/40 backdrop-blur-md">
            <Table>
              <TableHeader className="bg-muted/40">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-12 text-center">
                    <Checkbox
                      checked={filtered.length > 0 && selectedIds.length === filtered.length}
                      onCheckedChange={toggleAll}
                    />
                  </TableHead>
                  <TableHead className="font-semibold text-foreground">Nombre</TableHead>
                  <TableHead className="font-semibold text-foreground">Estado</TableHead>
                  <TableHead className="font-semibold text-foreground">Orden</TableHead>
                  <TableHead className="font-semibold text-foreground">Código</TableHead>
                  <TableHead className="font-semibold text-foreground">Tipo</TableHead>
                  <TableHead className="font-semibold text-foreground">Fecha de creación</TableHead>
                  <TableHead className="font-semibold text-foreground">Privado</TableHead>
                  <TableHead className="w-12" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((row) => (
                  <TableRow key={row.id} className="hover:bg-muted/30">
                    <TableCell className="text-center">
                      <Checkbox
                        checked={selectedIds.includes(row.id)}
                        onCheckedChange={() => toggleOne(row.id)}
                      />
                    </TableCell>
                    <TableCell className="max-w-[220px] truncate font-medium text-foreground">{row.nombre}</TableCell>
                    <TableCell>{estadoBadge(row.estado)}</TableCell>
                    <TableCell className="text-muted-foreground">{row.orden}</TableCell>
                    <TableCell className="text-muted-foreground">{row.codigo || "—"}</TableCell>
                    <TableCell className="text-muted-foreground">{row.tipo}</TableCell>
                    <TableCell className="whitespace-nowrap text-muted-foreground text-sm">{row.fechaCreacion}</TableCell>
                    <TableCell>
                      <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
                        <Lock className="size-3.5" aria-hidden />
                        {row.privado ? "Sí" : "No"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                            <MoreHorizontal className="size-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40 border-border bg-card/40 backdrop-blur-md shadow-md">
                          <DropdownMenuItem className="cursor-pointer">Editar</DropdownMenuItem>
                          <DropdownMenuItem className="cursor-pointer text-destructive focus:text-destructive">Eliminar</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="items" className="mt-0 flex-1 p-4 sm:p-6 focus-visible:outline-none">
          <div className="rounded-xl border border-dashed border-border bg-muted/20 px-6 py-16 text-center">
            <p className="text-sm font-medium text-foreground">Subestados de ítems</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Vista en preparación. Aquí podrás gestionar subestados asociados a ítems de pedido.
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Subestados;
