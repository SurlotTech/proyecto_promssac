import { useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ChevronDown, ChevronRight, MoreHorizontal, Plus } from "lucide-react";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type { EstadoDto } from "@/services/estados.api";
import { estadosApi } from "@/services/estados.api";
import { useEstadosPadresQuery } from "@/hooks/useOperationsQueries";
import { toast } from "sonner";

const estadoBadge = (nombre: string, esPadre: boolean) => {
  if (!esPadre) {
    return (
      <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium border-slate-300 bg-slate-50 text-slate-700">
        Subestado
      </span>
    );
  }
  const map: Record<string, { label: string; className: string }> = {
    Entregado: { label: "Entregado", className: "border-emerald-500 bg-emerald-50 text-emerald-700" },
    "No entregado": { label: "No entregado", className: "border-red-500 bg-red-50 text-red-700" },
    "En ruta": { label: "En ruta", className: "border-blue-500 bg-blue-50 text-blue-700" },
    Pendiente: { label: "Pendiente", className: "border-amber-500 bg-amber-50 text-amber-700" },
  };
  const m = map[nombre] ?? { label: nombre, className: "border-slate-300 bg-slate-50 text-slate-700" };
  return (
    <span className={cn("inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium", m.className)}>
      {m.label}
    </span>
  );
};

const Estados = () => {
  const queryClient = useQueryClient();
  const [incluirInactivos, setIncluirInactivos] = useState(false);
  const [nombreFilter, setNombreFilter] = useState("");
  const [expandedPadre, setExpandedPadre] = useState<string | null>(null);
  const [hijosCache, setHijosCache] = useState<Record<string, EstadoDto[]>>({});
  const [loadingHijos, setLoadingHijos] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [editRow, setEditRow] = useState<EstadoDto | null>(null);
  const [form, setForm] = useState({ nombre: "", parentId: "" });

  const { data: padres = [], isLoading, isError } = useEstadosPadresQuery(incluirInactivos);

  const filtered = useMemo(() => {
    if (!nombreFilter) return padres;
    return padres.filter((e) => e.nombre.toLowerCase().includes(nombreFilter.toLowerCase()));
  }, [padres, nombreFilter]);

  const toggleExpand = async (padre: EstadoDto) => {
    if (expandedPadre === padre.id) {
      setExpandedPadre(null);
      return;
    }
    setExpandedPadre(padre.id);
    if (!hijosCache[padre.id]) {
      setLoadingHijos(true);
      try {
        const hijos = await estadosApi.listarHijos(padre.id);
        setHijosCache((prev) => ({ ...prev, [padre.id]: hijos }));
      } catch { toast.error("Error al cargar subestados."); }
      finally { setLoadingHijos(false); }
    }
  };

  const setActivoMut = useMutation({
    mutationFn: ({ id, activo }: { id: string; activo: boolean }) => estadosApi.setActivo(id, activo),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["estados"] });
      setHijosCache((prev) => {
        const next = { ...prev };
        for (const [parentId, hijos] of Object.entries(prev)) {
          next[parentId] = hijos.map((h) =>
            h.id === variables.id ? { ...h, activo: variables.activo } : h
          );
        }
        return next;
      });
    },
    onError: (e: unknown) => toast.error(e instanceof Error ? e.message : "Error."),
  });

  const createMut = useMutation({
    mutationFn: () => estadosApi.create({
      nombre: form.nombre.trim(),
      parentId: form.parentId || null,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["estados"] });
      setHijosCache({});
      setCreateOpen(false);
      setExpandedPadre(null);
      toast.success("Creado.");
    },
    onError: (e: unknown) => toast.error(e instanceof Error ? e.message : "Error al crear."),
  });

  const updateMut = useMutation({
    mutationFn: () => estadosApi.update(editRow!.id, {
      nombre: form.nombre.trim(),
      parentId: form.parentId || null,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["estados"] });
      setHijosCache({});
      setEditRow(null);
      setExpandedPadre(null);
      toast.success("Actualizado.");
    },
    onError: (e: unknown) => toast.error(e instanceof Error ? e.message : "Error al actualizar."),
  });

  const openCreate = (parentId?: string) => {
    setForm({ nombre: "", parentId: parentId || "" });
    setEditRow(null);
    setCreateOpen(true);
  };

  const openEdit = (row: EstadoDto) => {
    setForm({ nombre: row.nombre, parentId: "" });
    setEditRow(row);
    setCreateOpen(true);
  };

  const handleSave = () => {
    if (!form.nombre.trim()) {
      toast.error("El nombre es obligatorio.");
      return;
    }
    if (editRow) updateMut.mutate();
    else createMut.mutate();
  };

  const saving = createMut.isPending || updateMut.isPending;

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-transparent animate-fade-in">
      <div className="flex flex-wrap items-center justify-between border-b border-border bg-card/40 backdrop-blur-md px-4 py-3 sm:px-6">
        <h1 className="text-xl font-bold tracking-tight text-foreground">Estados</h1>
        <div className="flex flex-wrap items-center gap-2">
          <Button size="sm" className="h-9 gap-1.5 font-medium shadow-glow" onClick={() => openCreate()}>
            <Plus className="size-4" /> Nuevo estado
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4 sm:p-6">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-3">
            <Input
              placeholder="Buscar por nombre"
              value={nombreFilter}
              onChange={(e) => setNombreFilter(e.target.value)}
              className="h-10 w-full bg-transparent sm:max-w-xs"
            />
            <div className="flex items-center gap-2">
              <Checkbox id="incluir-inactivos" checked={incluirInactivos} onCheckedChange={(v) => setIncluirInactivos(v === true)} />
              <Label htmlFor="incluir-inactivos" className="text-xs text-muted-foreground cursor-pointer">Mostrar inactivos</Label>
            </div>
          </div>

          <div className="overflow-hidden rounded-xl border border-border shadow-sm">
            <div className="overflow-x-auto bg-card/40 backdrop-blur-md">
              {isLoading ? (
                <p className="p-8 text-center text-muted-foreground">Cargando…</p>
              ) : isError ? (
                <p className="p-8 text-center text-destructive">Error al cargar.</p>
              ) : filtered.length === 0 ? (
                <p className="p-8 text-center text-muted-foreground">No hay estados.</p>
              ) : (
                <div className="divide-y divide-border">
                  {filtered.map((padre) => (
                    <div key={padre.id}>
                      <div className={cn("flex items-center gap-3 px-4 py-3 hover:bg-muted/20", !padre.activo && "opacity-50")}>
                        <button type="button" onClick={() => toggleExpand(padre)} className="text-muted-foreground hover:text-foreground">
                          {expandedPadre === padre.id ? <ChevronDown className="size-4" /> : <ChevronRight className="size-4" />}
                        </button>
                        <span className="flex-1 font-medium text-foreground">{padre.nombre}</span>
                        {estadoBadge(padre.nombre, padre.esPadre)}
                        <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => openCreate(padre.id)}>
                          <Plus className="size-3 mr-1" /> Subestado
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="size-4" /></Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => openEdit(padre)}>Editar</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setActivoMut.mutate({ id: padre.id, activo: !padre.activo })}>
                              {padre.activo ? "Desactivar" : "Activar"}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      {expandedPadre === padre.id && (
                        <div className="bg-muted/10 border-t border-border">
                          {loadingHijos ? (
                            <p className="px-12 py-4 text-sm text-muted-foreground">Cargando subestados…</p>
                          ) : !hijosCache[padre.id] || hijosCache[padre.id].length === 0 ? (
                            <p className="px-12 py-4 text-sm text-muted-foreground">Sin subestados. <button type="button" className="text-primary underline" onClick={() => openCreate(padre.id)}>Crear uno</button></p>
                          ) : (
                            hijosCache[padre.id].map((hijo) => (
                              <div key={hijo.id} className={cn("flex items-center gap-3 px-4 py-2.5 pl-12 hover:bg-muted/10", !hijo.activo && "opacity-50")}>
                                <span className="flex-1 text-sm text-muted-foreground">{hijo.nombre}</span>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-7 w-7"><MoreHorizontal className="size-3.5" /></Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => openEdit(hijo)}>Editar</DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => setActivoMut.mutate({ id: hijo.id, activo: !hijo.activo })}>
                                      {hijo.activo ? "Desactivar" : "Activar"}
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            ))
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <Dialog open={createOpen} onOpenChange={(o) => { setCreateOpen(o); if (!o) { setEditRow(null); setForm({ nombre: "", parentId: "" }); } }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editRow ? "Editar" : form.parentId ? "Nuevo subestado" : "Nuevo estado"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {!form.parentId && !editRow ? (
              <div>
                <Label className="text-xs">Tipo</Label>
                <Select value="root" disabled>
                  <SelectTrigger className="h-10 bg-transparent"><SelectValue placeholder="Estado padre (raíz)" /></SelectTrigger>
                  <SelectContent><SelectItem value="root">Estado padre (raíz)</SelectItem></SelectContent>
                </Select>
              </div>
            ) : null}
            <div>
              <Label htmlFor="ef-nombre" className="text-xs">Nombre</Label>
              <Input id="ef-nombre" value={form.nombre} onChange={(e) => setForm((f) => ({ ...f, nombre: e.target.value }))} placeholder="ej. Entregado" className="h-10" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setCreateOpen(false); setEditRow(null); }}>Cancelar</Button>
            <Button onClick={handleSave} disabled={saving}>{saving ? "Guardando…" : "Guardar"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Estados;
