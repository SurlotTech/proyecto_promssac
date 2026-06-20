import { useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ChevronDown, ChevronRight, MoreHorizontal, Plus, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import PageHeader from "@/components/PageHeader";
import { Input } from "@/components/ui/input";
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
  Card,
  CardHeader,
  CardContent,
} from "@/components/ui/card";
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
  const [estadoFiltro, setEstadoFiltro] = useState<"activos" | "inactivos">("activos");
  const [nombreFilter, setNombreFilter] = useState("");
  const [expandedCards, setExpandedCards] = useState<Record<string, boolean>>({});
  const [hijosCache, setHijosCache] = useState<Record<string, EstadoDto[]>>({});
  const [loadingCards, setLoadingCards] = useState<Record<string, boolean>>({});
  const [createOpen, setCreateOpen] = useState(false);
  const [editRow, setEditRow] = useState<EstadoDto | null>(null);
  const [form, setForm] = useState({ nombre: "", parentId: "" });

  const { data: padres = [], isLoading, isError } = useEstadosPadresQuery(true);

  const activeCount = useMemo(() => padres.filter((e) => e.activo).length, [padres]);
  const inactiveCount = useMemo(() => padres.filter((e) => !e.activo).length, [padres]);

  const filtered = useMemo(() => {
    let list = estadoFiltro === "inactivos" ? padres.filter((e) => !e.activo) : padres.filter((e) => e.activo);
    if (nombreFilter) {
      const q = nombreFilter.toLowerCase();
      list = list.filter((e) => e.nombre.toLowerCase().includes(q));
    }
    return list;
  }, [padres, nombreFilter, estadoFiltro]);

  const toggleExpand = async (padre: EstadoDto) => {
    if (expandedCards[padre.id]) {
      setExpandedCards((prev) => ({ ...prev, [padre.id]: false }));
      return;
    }
    setExpandedCards((prev) => ({ ...prev, [padre.id]: true }));
    if (!hijosCache[padre.id]) {
      setLoadingCards((prev) => ({ ...prev, [padre.id]: true }));
      try {
        const hijos = await estadosApi.listarHijos(padre.id);
        setHijosCache((prev) => ({ ...prev, [padre.id]: hijos }));
      } catch { toast.error("Error al cargar subestados."); }
      finally { setLoadingCards((prev) => ({ ...prev, [padre.id]: false })); }
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
    <div className="animate-fade-in">
      <PageHeader
        title="Estados"
        subtitle={
          <>
            Estados activos:{" "}
            <span className="text-foreground">{isLoading ? "…" : activeCount}</span>
            <span className="mx-2 text-border">|</span>
            Estados inactivos:{" "}
            <span className="text-foreground">{isLoading ? "…" : inactiveCount}</span>
          </>
        }
        actions={
          <Button size="sm" className="h-9 gap-2 bg-primary shadow-glow hover:bg-primary-hover" onClick={() => openCreate()}>
            <Plus className="size-4 shrink-0" /> Nuevo estado
          </Button>
        }
      />

      <div className="space-y-2 p-4 pt-1 sm:p-6 sm:pt-2 lg:p-8 lg:pt-2">
        <div className="flex flex-col gap-3 rounded-xl bg-muted/20 py-3 sm:flex-row sm:flex-wrap sm:items-center">
          <div className="relative min-w-0 flex-1 sm:max-w-xs">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" strokeWidth={1.75} />
            <Input
              placeholder="Buscar por nombre"
              value={nombreFilter}
              onChange={(e) => setNombreFilter(e.target.value)}
              className="h-9 w-full bg-zinc-50 pl-9 transition-all hover:border-zinc-300 hover:bg-zinc-100 hover:shadow-sm focus-visible:ring-offset-0"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1 rounded-lg border bg-zinc-50 p-0.5">
              <button
                type="button"
                onClick={() => setEstadoFiltro("activos")}
                className={cn(
                  "flex h-8 items-center gap-1.5 rounded-md px-3 text-xs font-medium transition-all",
                  estadoFiltro === "activos"
                    ? "bg-white text-emerald-600 shadow-sm"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                Activos
              </button>
              <button
                type="button"
                onClick={() => setEstadoFiltro("inactivos")}
                className={cn(
                  "flex h-8 items-center gap-1.5 rounded-md px-3 text-xs font-medium transition-all",
                  estadoFiltro === "inactivos"
                    ? "bg-white text-destructive shadow-sm"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                Inactivos
              </button>
            </div>
          </div>
        </div>

        {nombreFilter && (
          <div className="flex justify-end">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setNombreFilter("")}
              className="h-8 text-xs text-muted-foreground hover:text-foreground"
            >
              <X className="mr-1 h-3.5 w-3.5" /> Limpiar filtros
            </Button>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 items-start">
          {isLoading ? (
            <p className="col-span-full p-8 text-center text-muted-foreground">Cargando…</p>
          ) : isError ? (
            <p className="col-span-full p-8 text-center text-destructive">Error al cargar.</p>
          ) : filtered.length === 0 ? (
            <p className="col-span-full p-8 text-center text-muted-foreground">No hay estados.</p>
          ) : (
            filtered.map((padre) => (
              <Card key={padre.id} className={cn("flex flex-col shadow-sm border-border/60 bg-card/40 backdrop-blur-md overflow-hidden transition-all", !padre.activo && "opacity-50 grayscale-[0.5]")}>
                <CardHeader className="flex flex-row items-center justify-between pb-3 pt-4 px-4 border-b border-border/40 space-y-0">
                  <div className="flex flex-col gap-1.5">
                    <span className="font-semibold text-base text-foreground leading-none">{padre.nombre}</span>
                    <div>{estadoBadge(padre.nombre, padre.esPadre)}</div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 -mr-2"><MoreHorizontal className="size-4 text-muted-foreground" /></Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => openEdit(padre)}>Editar</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setActivoMut.mutate({ id: padre.id, activo: !padre.activo })}>
                        {padre.activo ? "Desactivar" : "Activar"}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </CardHeader>
                
                <CardContent className="flex-1 p-0 flex flex-col bg-background/30">
                  <div className="flex items-center justify-between px-4 py-2 bg-muted/10 border-b border-border/30">
                    <button type="button" onClick={() => toggleExpand(padre)} className="flex items-center text-xs font-medium text-muted-foreground hover:text-foreground transition-colors">
                      {expandedCards[padre.id] ? <ChevronDown className="size-3.5 mr-1" /> : <ChevronRight className="size-3.5 mr-1" />}
                      {expandedCards[padre.id] ? "Ocultar subestados" : "Ver subestados"}
                    </button>
                    <Button size="sm" variant="ghost" className="h-7 text-xs px-2 text-primary hover:text-primary/80 hover:bg-primary/10" onClick={() => openCreate(padre.id)}>
                      <Plus className="size-3 mr-1" /> Nuevo
                    </Button>
                  </div>
                  
                  {expandedCards[padre.id] && (
                    <div className="flex-1 p-2 space-y-1 animate-in fade-in slide-in-from-top-2 duration-200">
                      {loadingCards[padre.id] ? (
                        <p className="p-4 text-xs text-center text-muted-foreground">Cargando subestados…</p>
                      ) : !hijosCache[padre.id] || hijosCache[padre.id].length === 0 ? (
                        <div className="p-4 text-center">
                          <p className="text-xs text-muted-foreground mb-1">Sin subestados.</p>
                          <button type="button" className="text-xs font-medium text-primary hover:underline" onClick={() => openCreate(padre.id)}>Crear el primero</button>
                        </div>
                      ) : (
                        hijosCache[padre.id].map((hijo) => (
                          <div key={hijo.id} className={cn("group flex items-center justify-between px-3 py-2 rounded-md hover:bg-muted/40 transition-colors", !hijo.activo && "opacity-50")}>
                            <span className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">{hijo.nombre}</span>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"><MoreHorizontal className="size-3.5 text-muted-foreground" /></Button>
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
                </CardContent>
              </Card>
            ))
          )}
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
