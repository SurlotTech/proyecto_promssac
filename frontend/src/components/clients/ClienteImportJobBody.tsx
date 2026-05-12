import { Link } from "react-router-dom";
import { CheckCircle, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { ClienteImportJobState } from "@/hooks/useClienteImportBatch";

type Props = { job: ClienteImportJobState };

export default function ClienteImportJobBody({ job }: Props) {
  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-hidden">
      <div className="flex shrink-0 flex-wrap items-center gap-2 text-sm">
        {!job.completo ? (
          <Loader2 className="size-4 shrink-0 animate-spin text-primary" aria-hidden />
        ) : null}
        <span className="text-muted-foreground">
          Archivo <span className="font-medium text-foreground">{job.archivo}</span>
        </span>
        <Badge variant="outline">
          Procesadas {job.procesadas}/{job.total}
        </Badge>
        {job.creados.length > 0 ? (
          <Badge variant="secondary">{job.creados.length} insertado(s)</Badge>
        ) : null}
        {job.errores.length > 0 ? (
          <Badge variant="destructive">{job.errores.length} error(es)</Badge>
        ) : null}
      </div>
      <Progress
        value={job.total === 0 ? 0 : Math.min(100, (job.procesadas / job.total) * 100)}
        className="h-2 shrink-0"
      />
      <p className="shrink-0 text-xs leading-relaxed text-muted-foreground">
        Cada vez que termina una tanda, los registros nuevos ya aparecen en la tabla detrás sin esperar a que acabe todo el archivo.
      </p>
      <div className="grid min-h-0 flex-1 gap-3 sm:grid-cols-2">
        <div className="flex min-h-0 flex-col rounded-lg border border-border bg-card/40 backdrop-blur-md p-3 shadow-sm">
          <h4 className="mb-2 shrink-0 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Recién insertados (recientes arriba)
          </h4>
          <ScrollArea className="max-h-[200px] min-h-[120px] sm:max-h-[220px]">
            <ul className="space-y-1.5 pr-3 text-sm">
              {job.creados.length === 0 ? (
                <li className="text-xs text-muted-foreground">{job.completo ? "Sin insertos exitosos." : "Cuando llegue el primer lote, aparecerán aquí."}</li>
              ) : (
                job.creados
                  .slice(-150)
                  .reverse()
                  .map((c) => (
                    <li key={c.id} className="flex items-start justify-between gap-2 rounded-md bg-muted/40 px-2 py-1.5">
                      <Link
                        to={`/clientes/detalle/${encodeURIComponent(c.id)}`}
                        className="line-clamp-2 break-words leading-snug text-primary hover:underline"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {c.nombre}
                      </Link>
                      <CheckCircle className="size-4 shrink-0 text-emerald-600" aria-hidden />
                    </li>
                  ))
              )}
            </ul>
          </ScrollArea>
        </div>
        <div
          className={
            job.errores.length > 0
              ? "flex min-h-0 flex-col rounded-lg border border-destructive/35 bg-destructive/5 p-3 shadow-sm"
              : "flex min-h-0 flex-col rounded-lg border border-border bg-card/80 p-3 shadow-sm"
          }
        >
          <h4 className="mb-2 shrink-0 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Incidencias</h4>
          {job.errores.length > 0 ? (
            <ScrollArea className="max-h-[200px] min-h-[120px] sm:max-h-[220px]">
              <ul className="space-y-1.5 pr-3 text-xs">
                {job.errores.map((err, i) => (
                  <li key={`${err.filaHojaExcel}-${i}`} className="rounded-md bg-background/80 px-2 py-1.5">
                    <span className="font-semibold">Fila Excel {err.filaHojaExcel}</span>
                    {err.nombre ? (
                      <>
                        {": "}
                        <span className="text-foreground">{err.nombre}</span>
                      </>
                    ) : null}
                    <div className="mt-0.5 text-muted-foreground">{err.motivo}</div>
                  </li>
                ))}
              </ul>
            </ScrollArea>
          ) : (
            <p className="text-xs text-muted-foreground">Sin incidencias en esta corrida.</p>
          )}
        </div>
      </div>
    </div>
  );
}
