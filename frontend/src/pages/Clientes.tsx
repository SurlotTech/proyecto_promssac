import { useEffect, useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Columns3,
  FileDown,
  FileSpreadsheet,
  MoreVertical,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  Upload,
} from "lucide-react";
import PageHeader from "@/components/PageHeader";
import StatusTabs from "@/components/routes/StatusTabs";
import type { StatusTab } from "@/components/routes/StatusTabs";
import ClientFormDialog from "@/components/clients/ClientFormDialog";
import ClienteActivoConfirmDialog from "@/components/clients/ClienteActivoConfirmDialog";
import ClienteImportDialog from "@/components/clients/ClienteImportDialog";
import ClienteTable from "@/components/clients/ClienteTable";
import RoutesPaginationBar from "@/components/routes/RoutesPaginationBar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Client } from "@/domain/clients";
import { useClienteImportBatch } from "@/hooks/useClienteImportBatch";
import { useClienteListaFiltros } from "@/hooks/useClienteListaFiltros";
import { useClientsQuery } from "@/hooks/useOperationsQueries";
import { exportClientesVistaXlsx, downloadPlantillaImportacionClientes as descargarPlantillaClientes } from "@/lib/clientsExcel";
import { cn, errorMessageFromUnknown } from "@/lib/utils";
import { clientsApi } from "@/services/clients.api";
import { toast } from "sonner";

const Clientes = () => {
  const qc = useQueryClient();
  const filtros = useClienteListaFiltros();
  const { data: clientesRaw = [], isLoading, isError, refetch, isFetching } = useClientsQuery(true);
  const [activeTab, setActiveTab] = useState("todos");
  const [nivelFiltro, setNivelFiltro] = useState("todos");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const ALL_CLIENTE_COLUMNS = [
    { key: "institucion", label: "Institución" },
    { key: "nivel", label: "Nivel" },
    { key: "ugel", label: "UGEL" },
    { key: "correo", label: "Correo" },
    { key: "telefono", label: "Teléfono" },
    { key: "ordenes", label: "Órdenes" },
    { key: "estado", label: "Estado" },
  ] as const;

  type ClienteColumnKey = (typeof ALL_CLIENTE_COLUMNS)[number]["key"];

  const [visibleColumns, setVisibleColumns] = useState<ClienteColumnKey[]>(
    ALL_CLIENTE_COLUMNS.map((c) => c.key),
  );

  const nivelesUnicos = useMemo(() => {
    const niveles = new Set<string>();
    for (const c of clientesRaw) {
      const n = c.nivelEducacion?.trim();
      if (n) niveles.add(n);
    }
    return Array.from(niveles).sort();
  }, [clientesRaw]);

  const statusCounts = useMemo(() => ({
    todos: clientesRaw.length,
    activos: clientesRaw.filter((c) => c.activo).length,
    inactivos: clientesRaw.filter((c) => !c.activo).length,
  }), [clientesRaw]);

  const statusTabs: StatusTab[] = useMemo(() => [
    { status: "todos", label: "Todos", count: statusCounts.todos, variant: "all" },
    { status: "activos", label: "Activos", count: statusCounts.activos, variant: "success" },
    { status: "inactivos", label: "Inactivos", count: statusCounts.inactivos, variant: "neutral" },
  ], [statusCounts]);

  const listaFiltrada = useMemo(() => {
    const list = filtros.aplicarFiltroLista(clientesRaw);
    const conEstado = activeTab === "todos" ? list : list.filter((c) => (activeTab === "activos" ? c.activo : !c.activo));
    if (nivelFiltro === "todos") return conEstado;
    return conEstado.filter((c) => (c.nivelEducacion ?? "").trim() === nivelFiltro);
  }, [clientesRaw, filtros.aplicarFiltroLista, activeTab, nivelFiltro]);

  const [pagina, setPagina] = useState(1);
  const [tamañoPagina, setTamañoPagina] = useState(10);

  useEffect(() => {
    setPagina(1);
  }, [filtros.busqueda, filtros.estadoFiltro]);

  const totalPaginas = Math.max(1, Math.ceil(listaFiltrada.length / tamañoPagina));

  /** Si la lista se achica por filtros o se reduce el tamaño de página. */
  useEffect(() => {
    const tp = Math.max(1, Math.ceil(listaFiltrada.length / tamañoPagina));
    setPagina((cur) => (cur > tp ? tp : cur));
  }, [listaFiltrada.length, tamañoPagina]);

  const paginaSafe = Math.min(Math.max(1, pagina), totalPaginas);
  const filasPagina = useMemo(() => {
    const start = (paginaSafe - 1) * tamañoPagina;
    return listaFiltrada.slice(start, start + tamañoPagina);
  }, [listaFiltrada, paginaSafe, tamañoPagina]);

  const irAPagina = (p: number) => {
    const tp = Math.max(1, Math.ceil(listaFiltrada.length / tamañoPagina));
    setPagina(Math.min(Math.max(1, p), tp));
  };

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Client | null>(null);
  const [pendingActivoToggle, setPendingActivoToggle] = useState<Client | null>(null);

  const imp = useClienteImportBatch();

  const invalidate = () => {
    void qc.invalidateQueries({ queryKey: ["clientes"] });
  };

  const patchActivoMut = useMutation({
    mutationFn: ({ id, activo }: { id: string; activo: boolean }) => clientsApi.patchActivo(id, activo),
    onSuccess: (_, variables) => {
      invalidate();
      toast.success(variables.activo ? "Cliente reactivado." : "Cliente desactivado.");
      setPendingActivoToggle(null);
    },
    onError: (e: unknown) =>
      toast.error(errorMessageFromUnknown(e, "No se pudo actualizar el estado del cliente.")),
  });

  const exportarListaActual = () => {
    exportClientesVistaXlsx(listaFiltrada, `export_clientes_filtradas_${new Date().toISOString().slice(0, 10)}.xlsx`);
    toast.success("Se descargó el Excel con la vista actual.");
  };

  const deactivateSelectedClientes = () => {
    if (selectedIds.size === 0) return;
    const ids = Array.from(selectedIds);
    Promise.all(ids.map((id) => clientsApi.patchActivo(id, false)))
      .then(() => {
        qc.invalidateQueries({ queryKey: ["clientes"] });
        setSelectedIds(new Set());
        toast.success(`${ids.length} cliente${ids.length !== 1 ? "s" : ""} desactivado${ids.length !== 1 ? "s" : ""}.`);
      })
      .catch((e: Error) => toast.error(e.message));
  };

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Clientes"
        subtitle="Carga tus colegios o centros, edítalos o desactiva los que ya no uses."
        actions={
          <div className="flex w-full flex-col gap-3 lg:flex-row lg:flex-wrap lg:items-center lg:justify-end lg:gap-4">
            <div className="flex flex-wrap items-center justify-center gap-2 rounded-xl border border-border/70 bg-muted/25 p-2 sm:justify-end">
              <Button
                variant="outline"
                size="sm"
                type="button"
                className="gap-2"
                disabled={isFetching}
                onClick={() => void refetch()}
              >
                <RefreshCw className={`size-4 ${isFetching ? "animate-spin" : ""}`} />
                Actualizar
              </Button>

            </div>
            <Button
              size="sm"
              type="button"
              className="h-12 gap-1.5 text-base font-normal self-center whitespace-nowrap bg-primary hover:bg-primary text-white px-6 shadow-md transition-all hover:scale-105 active:scale-95 lg:self-auto"
              onClick={() => {
                setEditing(null);
                setFormOpen(true);
              }}
            >
              <Plus className="size-5" />
              Nuevo
            </Button>
          </div>
        }
      />

      <div className="space-y-10 p-4 pb-2 pt-1 sm:p-6 sm:pb-3 sm:pt-2 lg:p-8 lg:pb-4 lg:pt-2">
        <div className="rounded-[14px] border border-border/40 bg-white/30 shadow-md overflow-hidden">
          <StatusTabs tabs={statusTabs} activeStatus={activeTab} onChange={setActiveTab} />
          <div className="bg-white/30">
            <div className="flex items-center gap-4 px-5 py-5">
              <div className="relative flex-1 max-w-[380px]">
                <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-[#8a9aab]" />
                <Input
                  placeholder="Buscar por nombre, UGEL, ubicación, correo..."
                  value={filtros.busqueda}
                  onChange={(e) => filtros.setBusqueda(e.target.value)}
                  className="h-14 rounded-lg border border-[#e1e7ee] bg-white/60 pl-10 text-[15px] text-[#1f2933] placeholder:text-[#8a9aab] transition-colors hover:border-primary focus-visible:ring-1"
                />
              </div>

              <div className="relative group">
                <span className={cn(
                  "absolute left-3 z-10 transition-all pointer-events-none bg-white px-1.5",
                  nivelFiltro !== "todos"
                    ? "-top-1.5 text-[11px] text-primary"
                    : "top-1/2 -translate-y-1/2 text-sm text-[#8a9aab] group-has-[[data-state=open]]:-top-1.5 group-has-[[data-state=open]]:text-[11px] group-has-[[data-state=open]]:text-primary",
                )}>
                  Nivel
                </span>
                <Select value={nivelFiltro} onValueChange={setNivelFiltro}>
                  <SelectTrigger className={cn(
                    "h-14 w-[160px] rounded-lg border bg-white/60 px-3.5 text-[15px] text-[#8a9aab] focus:ring-0 focus:ring-offset-0 data-[state=open]:border-primary transition-colors hover:border-primary [&_svg]:text-[#52677a] [&_svg]:opacity-100",
                    nivelFiltro !== "todos" ? "pt-4 border-primary" : "border-[#e1e7ee]",
                  )}>
                    {nivelFiltro !== "todos" ? (
                      <div className="flex items-center gap-2">
                        <SelectValue />
                      </div>
                    ) : (
                      <span />
                    )}
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos</SelectItem>
                    {nivelesUnicos.map((n) => (
                      <SelectItem key={n} value={n}>{n}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedIds.size > 0 && (
                <Button
                  variant="ghost"
                  className="ml-auto h-14 gap-2 px-3 text-[15px] text-red-600 hover:text-red-700 hover:bg-red-50"
                  onClick={deactivateSelectedClientes}
                >
                  <Trash2 className="size-4" />
                  Desactivar ({selectedIds.size})
                </Button>
              )}

              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="ghost" className={selectedIds.size > 0 ? "h-14 gap-2 px-3 text-[15px] text-black hover:text-[#1f2933]" : "ml-auto h-14 gap-2 px-3 text-[15px] text-black hover:text-[#1f2933]"}>
                    <Columns3 className="size-4" />
                    Columnas
                  </Button>
                </PopoverTrigger>
                <PopoverContent align="end" className="w-48 p-3">
                  <div className="space-y-2">
                    {ALL_CLIENTE_COLUMNS.map((col) => (
                      <label
                        key={col.key}
                        className="flex items-center gap-2 cursor-pointer text-sm text-[#1f2933] hover:text-primary transition-colors"
                      >
                        <Checkbox
                          checked={visibleColumns.includes(col.key)}
                          onCheckedChange={() => {
                            if (visibleColumns.includes(col.key)) {
                              setVisibleColumns(visibleColumns.filter((c) => c !== col.key));
                            } else {
                              setVisibleColumns([...visibleColumns, col.key]);
                            }
                          }}
                          className="h-4 w-4 border-2 border-gray-400 data-[state=checked]:bg-primary data-[state=checked]:border-primary rounded mt-px"
                        />
                        {col.label}
                      </label>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-14 gap-2 px-3 text-[15px] text-black hover:text-[#1f2933]">
                    <MoreVertical className="size-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-44">
                  <DropdownMenuItem onClick={() => descargarPlantillaClientes()}>
                    <FileSpreadsheet className="mr-2 size-4" />
                    Plantilla
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={exportarListaActual} disabled={listaFiltrada.length === 0}>
                    <FileDown className="mr-2 size-4" />
                    Exportar
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => imp.setImportOpen(true)} disabled={imp.importacionEnMarcha}>
                    <Upload className="mr-2 size-4" />
                    Importar
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {(filtros.busqueda.trim() !== "" || nivelFiltro !== "todos") && (
              <div className="px-5 pb-3 flex flex-col gap-2">
                <span className="text-sm font-semibold text-[#1f2933]">{listaFiltrada.length} resultado{listaFiltrada.length !== 1 ? "s" : ""}</span>
                <div className="flex items-center gap-2 flex-wrap">
                  {filtros.busqueda.trim() !== "" && (
                    <span className="inline-flex items-center gap-1.5 rounded-md bg-[#eef1f5] px-2.5 py-1 text-xs font-medium text-[#52677a]">
                      Búsqueda: {filtros.busqueda}
                      <button onClick={() => filtros.setBusqueda("")} className="ml-0.5 text-[#8a9aab] hover:text-[#1f2933]">✕</button>
                    </span>
                  )}
                  {nivelFiltro !== "todos" && (
                    <span className="inline-flex items-center gap-1.5 rounded-md bg-[#eef1f5] px-2.5 py-1 text-xs font-medium text-[#52677a]">
                      Nivel: {nivelFiltro}
                      <button onClick={() => setNivelFiltro("todos")} className="ml-0.5 text-[#8a9aab] hover:text-[#1f2933]">✕</button>
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>

          <ClienteTable
              filasPagina={filasPagina}
              totalFiltradas={listaFiltrada.length}
              totalEnCarga={clientesRaw.length}
              isLoading={isLoading}
              isError={isError}
              onEditar={(c) => {
                void clientsApi
                  .get(c.id)
                  .then((fresh) => {
                    setEditing(fresh);
                    setFormOpen(true);
                  })
                  .catch((e: unknown) =>
                    toast.error(errorMessageFromUnknown(e, "No se pudo cargar el cliente para editar.")),
                  );
              }}
              onToggleActivo={setPendingActivoToggle}
              selectedIds={selectedIds}
              onSelectionChange={setSelectedIds}
              visibleColumns={visibleColumns}
            />

            {!isLoading && !isError && listaFiltrada.length > 0 && (
              <RoutesPaginationBar
                currentPage={paginaSafe}
                totalPages={totalPaginas}
                totalFiltered={listaFiltrada.length}
                pageSize={tamañoPagina}
                onPageChange={irAPagina}
                label="clientes"
                onPageSizeChange={(n) => {
                  setTamañoPagina(n);
                  setPagina(1);
                }}
              />
            )}
        </div>
      </div>

      <ClientFormDialog
        open={formOpen}
        onOpenChange={(o) => {
          setFormOpen(o);
          if (!o) setEditing(null);
        }}
        editing={editing}
      />

      <ClienteImportDialog
        open={imp.importOpen}
        onOpenChange={(o) => {
          if (!o && imp.importJob && !imp.importJob.completo) return;
          imp.setImportOpen(o);
          if (!o) {
            imp.resetImportStaging();
            imp.setImportJob(null);
          }
        }}
        fileInputRef={imp.importFileRef}
        importacionEnMarcha={imp.importacionEnMarcha}
        importJob={imp.importJob}
        stagedFileName={imp.stagedImportName}
        parseFileError={imp.parseFileError}
        previewRows={imp.parsePreviewRows}
        parseSummary={imp.importParseSummary}
        onFileChange={imp.handleImportFileChange}
        onConfirmImport={() => {
          if (!imp.parsePreviewRows?.length) return;
          void imp.ejecutarImportacionDesdePrevio(imp.parsePreviewRows, imp.stagedImportName);
        }}
      />

      <ClienteActivoConfirmDialog
        cliente={pendingActivoToggle}
        onOpenChange={(open) => {
          if (!open) setPendingActivoToggle(null);
        }}
        isPending={patchActivoMut.isPending}
        onConfirm={() => {
          const c = pendingActivoToggle;
          if (!c) return;
          patchActivoMut.mutate({ id: c.id, activo: !c.activo });
        }}
      />
    </div>
  );
};

export default Clientes;
