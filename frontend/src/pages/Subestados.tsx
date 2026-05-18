import { useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { MoreHorizontal, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
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
import { useSubestadosQuery } from "@/hooks/useOperationsQueries";
import { subestadosApi } from "@/services/subestados.api";
import { toast } from "sonner";

const estadoBadge = (estado: string) => {
  const map: Record<string, { label: string; className: string }> = {
    entregado: { label: "Entregado", className: "border-emerald-500 bg-emerald-50 text-emerald-700" },
    no_entregado: { label: "No entregado", className: "border-red-500 bg-red-50 text-red-700" },
    in_route: { label: "En ruta", className: "border-blue-500 bg-blue-50 text-blue-700" },
    pending: { label: "Pendiente", className: "border-amber-500 bg-amber-50 text-amber-700" },
  };
  const m = map[estado] ?? { label: estado, className: "border-slate-300 bg-slate-50 text-slate-700" };
  return (
    <span className={cn("inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium", m.className)}>
      {m.label}
    </span>
  );
};

const Subestados = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [incluirInactivos, setIncluirInactivos] = useState(false);
  const [nombreFilter, setNombreFilter] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const { data: rows = [], isLoading, isError } = useSubestadosQuery(incluirInactivos);

  const setActivoMut = useMutation({
    mutationFn: ({ id, activo }: { id: string; activo: boolean }) => subestadosApi.setActivo(id, activo),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subestados"] });
      toast.success("Estado actualizado.");
    },
    onError: (e: unknown) => toast.error(e instanceof Error ? e.message : "Error al actualizar."),
  });

  const filtered = useMemo(() => {
    if (!nombreFilter) return rows;
    return rows.filter((r) => r.nombre.toLowerCase().includes(nombreFilter.toLowerCase()));
  }, [rows, nombreFilter]);

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

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-transparent animate-fade-in">
      <div className="flex flex-wrap items-center justify-between border-b border-border bg-card/40 backdrop-blur-md px-4 py-3 sm:px-6">
        <h1 className="text-xl font-bold tracking-tight text-foreground">Subestados</h1>
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

      <div className="flex-1 overflow-auto p-4 sm:p-6">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-3">
            <Input
              placeholder="Nombre"
              value={nombreFilter}
              onChange={(e) => setNombreFilter(e.target.value)}
              className="h-10 w-full bg-transparent sm:max-w-xs"
            />
            <div className="flex items-center gap-2">
              <Checkbox
                id="incluir-inactivos-subestados"
                checked={incluirInactivos}
                onCheckedChange={(v) => setIncluirInactivos(v === true)}
              />
              <Label htmlFor="incluir-inactivos-subestados" className="text-xs text-muted-foreground cursor-pointer">
                Mostrar inactivos
              </Label>
            </div>
          </div>

          <div className="overflow-hidden rounded-xl border border-border shadow-sm">
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
                    <TableHead className="w-12" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                        Cargando…
                      </TableCell>
                    </TableRow>
                  ) : isError ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-destructive py-8">
                        Error al cargar.
                      </TableCell>
                    </TableRow>
                  ) : filtered.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                        No hay subestados.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filtered.map((row) => (
                      <TableRow key={row.id} className={cn("hover:bg-muted/30", !row.activo && "opacity-50")}>
                        <TableCell className="text-center">
                          <Checkbox
                            checked={selectedIds.includes(row.id)}
                            onCheckedChange={() => toggleOne(row.id)}
                          />
                        </TableCell>
                        <TableCell className="max-w-[220px] truncate font-medium text-foreground">{row.nombre}</TableCell>
                        <TableCell>{estadoBadge(row.estadoPadre)}</TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                                <MoreHorizontal className="size-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-40 border-border bg-card/40 backdrop-blur-md shadow-md">
                              <DropdownMenuItem
                                className="cursor-pointer"
                                onClick={() => navigate(`/configuracion/subestados/${row.id}/editar`)}
                              >
                                Editar
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="cursor-pointer"
                                onClick={() => setActivoMut.mutate({ id: row.id, activo: !row.activo })}
                              >
                                {row.activo ? "Desactivar" : "Activar"}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Subestados;
