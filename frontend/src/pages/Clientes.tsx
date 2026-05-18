import { useEffect, useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  FileDown,
  FileSpreadsheet,
  Plus,
  RefreshCw,
  Upload,
} from "lucide-react";
import PageHeader from "@/components/PageHeader";
import ClientFormDialog from "@/components/clients/ClientFormDialog";
import ClienteActivoConfirmDialog from "@/components/clients/ClienteActivoConfirmDialog";
import ClienteFilters from "@/components/clients/ClienteFilters";
import ClienteImportDialog from "@/components/clients/ClienteImportDialog";
import ClienteTable from "@/components/clients/ClienteTable";
import RoutesPaginationBar from "@/components/routes/RoutesPaginationBar";
import { Button } from "@/components/ui/button";
import type { Client } from "@/domain/clients";
import { useClienteImportBatch } from "@/hooks/useClienteImportBatch";
import { useClienteListaFiltros } from "@/hooks/useClienteListaFiltros";
import { useClientsQuery } from "@/hooks/useOperationsQueries";
import { exportClientesVistaXlsx, downloadPlantillaImportacionClientes as descargarPlantillaClientes } from "@/lib/clientsExcel";
import { errorMessageFromUnknown } from "@/lib/utils";
import { clientsApi } from "@/services/clients.api";
import { toast } from "sonner";

const Clientes = () => {
  const qc = useQueryClient();
  const filtros = useClienteListaFiltros();
  const { data: clientesRaw = [], isLoading, isError, refetch, isFetching } = useClientsQuery(true);

  const listaFiltrada = useMemo(() => {
    const list = filtros.aplicarFiltroLista(clientesRaw);
    return list.filter((c) => (filtros.estadoFiltro === "activos" ? c.activo : !c.activo));
  }, [clientesRaw, filtros.aplicarFiltroLista, filtros.estadoFiltro]);

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
              <Button variant="outline" size="sm" type="button" className="gap-2" onClick={() => descargarPlantillaClientes()} title="Descargar plantilla">
                <FileSpreadsheet className="size-4" />
                Plantilla
              </Button>
              <Button
                variant="outline"
                size="sm"
                type="button"
                className="gap-2"
                disabled={listaFiltrada.length === 0}
                onClick={exportarListaActual}
              >
                <FileDown className="size-4" />
                Exportar
              </Button>
              <Button
                variant="outline"
                size="sm"
                type="button"
                className="gap-2 border-primary/25 bg-background/80"
                disabled={imp.importacionEnMarcha}
                onClick={() => imp.setImportOpen(true)}
              >
                <Upload className="size-4" />
                Importar
              </Button>
            </div>
            <Button
              size="sm"
              type="button"
              className="gap-2 self-center whitespace-nowrap bg-primary px-5 shadow-glow lg:self-auto"
              onClick={() => {
                setEditing(null);
                setFormOpen(true);
              }}
            >
              <Plus className="size-4" />
              Nuevo cliente
            </Button>
          </div>
        }
      />

      <div className="space-y-4 p-4 pt-1 sm:p-6 sm:pt-2 lg:p-8 lg:pt-2">
        <ClienteFilters filtros={filtros} />
        
        <main className="space-y-4">
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
          </main>
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
