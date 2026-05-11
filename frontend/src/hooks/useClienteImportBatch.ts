import { useCallback, useRef, useState } from "react";
import { useQueryClient, type QueryClient } from "@tanstack/react-query";
import type { Client } from "@/domain/clients";
import {
  CLIENTES_IMPORT_CHUNK_ROWS,
  importPreviewRowToWriteBody,
  parseClienteImportWithPreview,
  type ClientImportPreviewRow,
} from "@/lib/clientsExcel";
import { errorMessageFromUnknown } from "@/lib/utils";
import { clientsApi } from "@/services/clients.api";
import { toast } from "sonner";

/** Actualiza todas las vistas en caché de listas (`['clientes','lista', …]`). Sin esperar refetch completo de la tabla. */
function fusionarClienteEnCaches(qc: QueryClient, chunk: Client[]) {
  if (chunk.length === 0) return;
  qc.setQueriesData<Client[]>({ queryKey: ["clientes", "lista"] }, (previous) =>
    fusionarOrdenNombreCliente(previous ?? [], chunk),
  );
}

function fusionarOrdenNombreCliente(prev: Client[], chunk: Client[]): Client[] {
  const porId = new Map<string, Client>();
  for (const c of prev) porId.set(c.id, c);
  for (const c of chunk) porId.set(c.id, c);
  return [...porId.values()].sort((a, b) =>
    a.nombre.localeCompare(b.nombre, "es", { sensitivity: "base", numeric: true }),
  );
}

export type ClienteImportErrorLine = { filaHojaExcel: number; nombre: string; motivo: string };

export type ClienteImportJobState = {
  archivo: string;
  total: number;
  procesadas: number;
  creados: Client[];
  errores: ClienteImportErrorLine[];
  completo: boolean;
};

export function useClienteImportBatch() {
  const qc = useQueryClient();
  const importFileRef = useRef<HTMLInputElement>(null);
  const [importOpen, setImportOpen] = useState(false);
  const [parsePreviewRows, setParsePreviewRows] = useState<ClientImportPreviewRow[] | null>(null);
  const [importParseSummary, setImportParseSummary] = useState<string | null>(null);
  const [parseFileError, setParseFileError] = useState<string | null>(null);
  const [stagedImportName, setStagedImportName] = useState<string | null>(null);
  const [importJob, setImportJob] = useState<ClienteImportJobState | null>(null);

  const invalidateClientes = useCallback(() => {
    void qc.invalidateQueries({ queryKey: ["clientes"] });
  }, [qc]);

  const resetImportStaging = useCallback(() => {
    setParsePreviewRows(null);
    setImportParseSummary(null);
    setParseFileError(null);
    setStagedImportName(null);
    if (importFileRef.current) importFileRef.current.value = "";
  }, []);

  const importacionEnMarcha = importJob !== null && !importJob.completo;

  const ejecutarImportacionDesdePrevio = useCallback(
    async (rows: ClientImportPreviewRow[], stagedName: string | null) => {
      const archivo = stagedName ?? "(archivo)";
      setImportJob({
        archivo,
        total: rows.length,
        procesadas: 0,
        creados: [],
        errores: [],
        completo: false,
      });
      resetImportStaging();

      let erroresGlobales = 0;
      let exitosGlobales = 0;

      try {
        for (let offset = 0; offset < rows.length; offset += CLIENTES_IMPORT_CHUNK_ROWS) {
          const slice = rows.slice(offset, offset + CLIENTES_IMPORT_CHUNK_ROWS);
          const items = slice.map(importPreviewRowToWriteBody);
          try {
            const res = await clientsApi.importBatch(items);
            exitosGlobales += res.creados.length;
            erroresGlobales += res.fallos.length;

            const filasErr = res.fallos.map((f) => ({
              filaHojaExcel: slice[f.indexInBatch]?.rowIndex ?? offset + f.indexInBatch + 1,
              nombre: f.nombreIntento || slice[f.indexInBatch]?.nombre || "",
              motivo: f.motivo,
            }));

            const procesadasHasta = offset + slice.length;
            fusionarClienteEnCaches(qc, res.creados);

            setImportJob((prev) =>
              prev
                ? {
                    ...prev,
                    procesadas: procesadasHasta,
                    creados: [...prev.creados, ...res.creados],
                    errores: [...prev.errores, ...filasErr],
                  }
                : null,
            );
          } catch (e: unknown) {
            const motivo = errorMessageFromUnknown(e, "Fallo del servidor o red.");
            erroresGlobales += 1;
            setImportJob((prev) =>
              prev
                ? {
                    ...prev,
                    procesadas: offset + slice.length,
                    errores: [
                      ...prev.errores,
                      {
                        filaHojaExcel: offset + 1,
                        nombre: `Lote (filas ${offset + 1}–${offset + slice.length})`,
                        motivo,
                      },
                    ],
                  }
                : null,
            );
            toast.warning("Un lote falló por completo; el resto continúa si aplica.", { description: motivo });
          }
        }

        toast.success(`Importación finalizada: ${exitosGlobales} correcto(s), ${erroresGlobales} error(es).`, {
          description: erroresGlobales ? "Revísalo en el cuadro de incidencias." : undefined,
        });
      } catch (e: unknown) {
        toast.error(errorMessageFromUnknown(e, "No se pudo completar la importación."));
      } finally {
        setImportJob((prev) => (prev ? { ...prev, completo: true } : null));
        invalidateClientes();
      }
    },
    [invalidateClientes, qc, resetImportStaging],
  );

  const handleImportFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setParseFileError(null);
    setParsePreviewRows(null);
    setImportParseSummary(null);
    setStagedImportName(file?.name ?? null);
    if (!file) return;
    void file.arrayBuffer().then((buffer) => {
      try {
        const { rows, summary } = parseClienteImportWithPreview(buffer);
        setParsePreviewRows(rows);
        setImportParseSummary(summary);
      } catch (err: unknown) {
        setParseFileError(errorMessageFromUnknown(err, "No se pudo leer el archivo."));
        setParsePreviewRows(null);
        setImportParseSummary(null);
      }
    });
  }, []);

  return {
    importFileRef,
    importOpen,
    setImportOpen,
    parsePreviewRows,
    importParseSummary,
    parseFileError,
    stagedImportName,
    importJob,
    setImportJob,
    importacionEnMarcha,
    resetImportStaging,
    ejecutarImportacionDesdePrevio,
    handleImportFileChange,
  };
}
