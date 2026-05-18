import { CheckCircle2, FileSpreadsheet } from "lucide-react";
import type { ReactNode } from "react";
import ClienteImportJobBody from "@/components/clients/ClienteImportJobBody";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { downloadPlantillaImportacionClientes, type ClientImportPreviewRow } from "@/lib/clientsExcel";
import type { ClienteImportJobState } from "@/hooks/useClienteImportBatch";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  importacionEnMarcha: boolean;
  importJob: ClienteImportJobState | null;
  stagedFileName: string | null;
  parseFileError: string | null;
  previewRows: ClientImportPreviewRow[] | null;
  parseSummary: string | null;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onConfirmImport: () => void;
};

/** Celda truncada + tooltip para que la tabla no se rompa por correos largos o nombres compuestos. */
function PrevCell({
  title,
  className,
  children,
}: {
  title?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={cn("min-w-0 truncate", className)} title={title}>
      {children}
    </div>
  );
}

export default function ClienteImportDialog({
  open,
  onOpenChange,
  fileInputRef,
  importacionEnMarcha,
  importJob,
  stagedFileName,
  parseFileError,
  previewRows,
  parseSummary,
  onFileChange,
  onConfirmImport,
}: Props) {
  const tituloVentana =
    importJob?.completo === true ? "Importación lista" : importJob ? "Importando clientes" : "Importar clientes";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="flex max-h-[90vh] max-w-[min(96vw,58rem)] flex-col gap-3 p-6 sm:p-6"
        onPointerDownOutside={(e) => importacionEnMarcha && e.preventDefault()}
        onEscapeKeyDown={(e) => importacionEnMarcha && e.preventDefault()}
      >
        <DialogHeader className="shrink-0 space-y-2 text-left">
          <DialogTitle>{tituloVentana}</DialogTitle>
          {importJob ? (
            <DialogDescription className="text-sm leading-relaxed text-muted-foreground">
              Seguí el avance aquí mientras trabajamos en segundo plano. Podés mover el modal si te tapa algo.
            </DialogDescription>
          ) : (
            <>
              <DialogDescription className="text-sm leading-relaxed text-muted-foreground">
                Sube el Excel que ya usas en tu trabajo o nuestra plantilla (<span className="font-medium text-foreground">columna NOMBRE</span>{" "}
                obligatoria en ese caso). No tienes que preparar el archivo de un modo especial: si las columnas son las típicas, lo leemos bien.
              </DialogDescription>
              <p className="rounded-md border border-dashed border-border/80 bg-muted/25 px-3 py-2 text-[13px] leading-snug text-muted-foreground">
                Cuando cargues un archivo verás aquí abajo cómo va a entrar cada fila. Si falta texto en una celda cortada, pasa el ratón por encima.
              </p>
            </>
          )}
        </DialogHeader>
        {importJob ? (
          <ClienteImportJobBody job={importJob} />
        ) : (
          <>
            <div className="flex shrink-0 flex-wrap gap-2">
              <Button type="button" variant="outline" size="sm" className="gap-2" onClick={() => downloadPlantillaImportacionClientes()}>
                <FileSpreadsheet className="size-4" />
                Descargar plantilla
              </Button>
            </div>
            <div className="shrink-0 space-y-2">
              <Label htmlFor="import-clientes-xlsx" className="text-xs uppercase tracking-wider text-muted-foreground">
                Archivo Excel
              </Label>
              <Input
                id="import-clientes-xlsx"
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                className="cursor-pointer file:mr-2"
                onChange={onFileChange}
              />
            </div>
            {stagedFileName ? (
              <div className="flex shrink-0 flex-wrap items-baseline gap-x-2 gap-y-1 text-xs text-muted-foreground">
                <span className="font-medium uppercase tracking-wide text-muted-foreground/80">Seleccionado</span>
                <span className="break-all rounded bg-muted/50 px-1.5 py-0.5 font-medium text-foreground">{stagedFileName}</span>
              </div>
            ) : null}
          </>
        )}
        {!importJob && parseFileError ? (
          <p className="shrink-0 text-sm text-destructive">{parseFileError}</p>
        ) : !importJob && previewRows ? (
          <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-hidden">
            {parseSummary ? (
              <div
                role="status"
                className="flex shrink-0 gap-3 rounded-xl border border-border bg-card/40 backdrop-blur-lg px-3.5 py-3 shadow-sm dark:bg-card/40 backdrop-blur-lg"
              >
                <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="size-5" aria-hidden />
                </span>
                <div className="min-w-0 pt-0.5">
                  <p className="text-sm font-semibold leading-tight text-foreground">Ya leímos el archivo</p>
                  <p className="mt-1 text-sm leading-snug text-muted-foreground">{parseSummary}</p>
                </div>
              </div>
            ) : (
              <div
                role="status"
                className="flex shrink-0 gap-3 rounded-xl border border-border bg-card/40 backdrop-blur-lg px-3.5 py-3 shadow-sm"
              >
                <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="size-5" aria-hidden />
                </span>
                <div className="min-w-0 pt-0.5">
                  <p className="text-sm font-semibold leading-tight text-foreground">Listo para revisar</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Vas a agregar{" "}
                    <span className="font-semibold tabular-nums text-foreground">{previewRows.length}</span>{" "}
                    {previewRows.length === 1 ? "fila nueva" : "filas nuevas"}.
                  </p>
                </div>
              </div>
            )}
            <div className="min-h-[200px] flex-1 overflow-auto rounded-md border border-border shadow-inner">
              <table className="w-max min-w-full table-fixed border-collapse text-left text-xs">
                <thead>
                  <tr className="border-b border-border bg-muted/50 text-muted-foreground">
                    <th className="sticky top-0 z-10 w-8 whitespace-nowrap bg-muted/95 px-2 py-2 text-left font-semibold shadow-[inset_0_-1px_0_hsl(var(--border))]">
                      #
                    </th>
                    <th
                      className="sticky top-0 z-10 w-[14rem] min-w-[11rem] bg-muted/95 px-2 py-2 text-left font-semibold shadow-[inset_0_-1px_0_hsl(var(--border))]"
                      title="Nombre como quedará en el sistema (puede venir muy largo del Excel)"
                    >
                      Nombre
                    </th>
                    <th className="sticky top-0 z-10 w-[4.75rem] whitespace-nowrap bg-muted/95 px-2 py-2 text-center font-semibold shadow-[inset_0_-1px_0_hsl(var(--border))]">
                      Nivel
                    </th>
                    <th className="sticky top-0 z-10 w-[11rem] min-w-[9rem] bg-muted/95 px-2 py-2 text-left font-semibold shadow-[inset_0_-1px_0_hsl(var(--border))]">
                      Ubicación
                    </th>
                    <th
                      className="sticky top-0 z-10 w-[10rem] min-w-[8rem] bg-muted/95 px-2 py-2 text-left font-semibold shadow-[inset_0_-1px_0_hsl(var(--border))]"
                      title="Nombres y apellidos del director (columna regional)"
                    >
                      Director IIEE
                    </th>
                    <th className="sticky top-0 z-10 w-[9.5rem] min-w-[8rem] bg-muted/95 px-2 py-2 text-left font-semibold shadow-[inset_0_-1px_0_hsl(var(--border))]">
                      Email
                    </th>
                    <th className="sticky top-0 z-10 w-[6rem] bg-muted/95 px-2 py-2 text-left font-semibold shadow-[inset_0_-1px_0_hsl(var(--border))]">
                      Tel.
                    </th>
                    <th className="sticky top-0 z-10 w-[6.25rem] min-w-[5rem] bg-muted/95 px-2 py-2 text-left font-semibold shadow-[inset_0_-1px_0_hsl(var(--border))]">
                      UGEL
                    </th>
                    <th
                      className="sticky top-0 z-10 w-[4.25rem] whitespace-nowrap bg-muted/95 px-2 py-2 text-center font-semibold shadow-[inset_0_-1px_0_hsl(var(--border))]"
                      title="Código de la institución en el libro (columna IIEE)"
                    >
                      Cód.
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {previewRows.map((row, idx) => {
                    const ubicacion = [row.departamento, row.provincia, row.distrito].filter(Boolean).join(" · ") || "—";
                    const mail = row.email?.trim();
                    const mailShow = mail || "—";
                    return (
                      <tr key={`${row.nombre}-${idx}`} className="align-top bg-card/70">
                        <td className="px-2 py-1.5 tabular-nums text-muted-foreground">{idx + 1}</td>
                        <td className="max-w-0 px-2 py-1.5 align-top">
                          <PrevCell title={row.nombre} className="font-medium">
                            {row.nombre}
                          </PrevCell>
                        </td>
                        <td className="px-2 py-1.5 text-center">
                          <Badge variant="secondary" className="inline-flex max-w-full truncate px-1.5 py-0 text-[10px] font-normal uppercase">
                            {row.nivel ?? "—"}
                          </Badge>
                        </td>
                        <td className="max-w-0 px-2 py-1.5 text-muted-foreground">
                          <PrevCell title={ubicacion !== "—" ? ubicacion : undefined}>{ubicacion}</PrevCell>
                        </td>
                        <td className="max-w-0 px-2 py-1.5 align-top">
                          <PrevCell title={row.nombreApellidosDirectorIiee?.trim() || undefined}>
                            {row.nombreApellidosDirectorIiee?.trim() || "—"}
                          </PrevCell>
                        </td>
                        <td className="max-w-0 px-2 py-1.5 align-middle">
                          <PrevCell title={mail ? mail : undefined} className="text-[11px]">
                            {mailShow}
                          </PrevCell>
                        </td>
                        <td className="max-w-0 px-2 py-1.5">
                          <PrevCell title={row.telefono || undefined}>{row.telefono || "—"}</PrevCell>
                        </td>
                        <td className="max-w-0 px-2 py-1.5">
                          <PrevCell title={row.ugel || undefined}>{row.ugel ?? "—"}</PrevCell>
                        </td>
                        <td className="max-w-0 px-2 py-1.5 text-center tabular-nums text-muted-foreground">
                          <PrevCell className="text-center">{row.codigoModularIiee ?? "—"}</PrevCell>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : null}
        <DialogFooter
          className={cn(
            "shrink-0 gap-2 sm:gap-0",
            importJob && !importJob.completo ? "sm:justify-center" : "",
          )}
        >
          {importJob ? (
            importJob.completo ? (
              <Button type="button" className="w-full sm:w-auto" onClick={() => onOpenChange(false)}>
                Cerrar
              </Button>
            ) : (
              <p className="text-center text-xs text-muted-foreground sm:text-left">
                Importando por tandas… la tabla detrás ya muestra cada lote apenas se guarda.
              </p>
            )
          ) : (
            <>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button
                type="button"
                disabled={importacionEnMarcha || !previewRows?.length || Boolean(parseFileError)}
                onClick={onConfirmImport}
              >
                Confirmar importación
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
