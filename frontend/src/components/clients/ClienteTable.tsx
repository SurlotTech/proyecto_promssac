import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import type { LucideIcon } from "lucide-react";
import { Ban, CheckCircle, ChevronLeft, ChevronRight, Eye, Pencil, SearchX, School, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  type Client,
  nombreInstitucionYNivelCliente,
  nivelPreferidoCliente,
  ubicacionDepartamentalCliente,
} from "@/domain/clients";
import { cn } from "@/lib/utils";

type Props = {
  filasPagina: Client[];
  totalFiltradas: number;
  totalEnCarga: number;
  pagina: number;
  totalPaginas: number;
  tamañoPagina: number;
  onPaginaChange: (p: number) => void;
  onTamañoPaginaChange: (n: number) => void;
  isLoading: boolean;
  isError: boolean;
  onEditar: (c: Client) => void;
  onToggleActivo: (c: Client) => void;
};

const TAMAÑOS_PAGINA = [10, 25, 50, 100];

export default function ClienteTable({
  filasPagina,
  totalFiltradas,
  totalEnCarga,
  pagina,
  totalPaginas,
  tamañoPagina,
  onPaginaChange,
  onTamañoPaginaChange,
  isLoading,
  isError,
  onEditar,
  onToggleActivo,
}: Props) {
  const desde = totalFiltradas === 0 ? 0 : (pagina - 1) * tamañoPagina + 1;
  const hasta = Math.min(pagina * tamañoPagina, totalFiltradas);

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-border bg-card/40 backdrop-blur-md shadow-sm">
      {isLoading ? (
        <p className="p-12 text-center text-sm text-muted-foreground">Cargando clientes…</p>
      ) : isError ? (
        <p className="p-12 text-center text-sm text-destructive">
          No se pudieron cargar los clientes. ¿El backend está en marcha?
        </p>
      ) : (
        <>
          <div className="min-h-0 flex-1 overflow-auto scrollbar-thin">
            <table className="w-full text-left text-sm">
              <thead className="sticky top-0 z-10 bg-muted/95 shadow-[0_1px_0_hsl(var(--border))] backdrop-blur-sm">
                <tr className="text-[11px] uppercase tracking-wider text-muted-foreground">
                  <th className="whitespace-nowrap px-4 py-3 font-semibold">Institución</th>
                  <th className="whitespace-nowrap px-4 py-3 text-center font-semibold">Nivel</th>
                  <th className="max-w-[200px] px-4 py-3 font-semibold">Ubicación</th>
                  <th className="max-w-[140px] px-4 py-3 font-semibold">UGEL</th>
                  <th className="whitespace-nowrap px-4 py-3 text-center font-semibold">Mod. IIEE</th>
                  <th className="whitespace-nowrap px-4 py-3 font-semibold">Cód. reg.</th>
                  <th className="max-w-[140px] px-4 py-3 font-semibold">Correo</th>
                  <th className="whitespace-nowrap px-4 py-3 font-semibold">Teléfono</th>
                  <th className="whitespace-nowrap px-4 py-3 text-center font-semibold">Órdenes</th>
                  <th className="whitespace-nowrap px-4 py-3 text-center font-semibold">Estado</th>
                  <th className="whitespace-nowrap px-4 py-3 pr-5 text-right font-semibold">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {totalFiltradas === 0 ? (
                  <tr>
                    <td colSpan={11} className="align-top">
                      {totalEnCarga === 0 ? (
                        <TablaClientesEstadoVacio
                          icon={School}
                          titulo="No hay clientes en el catálogo"
                          descripcion={
                            <p className="text-sm leading-relaxed text-muted-foreground">
                              Importá el Excel regional con <span className="text-foreground/90">Importar</span>, bajá la{" "}
                              <span className="text-foreground/90">Plantilla</span> si la necesitás, o creá el primero con{" "}
                              <span className="text-foreground/90">Nuevo cliente</span>.
                            </p>
                          }
                        />
                      ) : (
                        <TablaClientesEstadoVacio
                          icon={SearchX}
                          titulo="Ningún cliente coincide con los filtros"
                          descripcion={
                            <p className="text-sm leading-relaxed text-muted-foreground">
                              Cambiá el texto del buscador o usá <span className="text-foreground/90">Limpiar búsqueda</span> en el panel
                              izquierdo para ver toda la base (
                              <span className="tabular-nums font-medium text-foreground">{totalEnCarga}</span>{" "}
                              {totalEnCarga === 1 ? "registro" : "registros"}).
                            </p>
                          }
                        />
                      )}
                    </td>
                  </tr>
                ) : (
                  filasPagina.map((cliente) => (
                    <ClienteTableRow
                      key={cliente.id}
                      cliente={cliente}
                      onEditar={onEditar}
                      onToggleActivo={onToggleActivo}
                    />
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="flex shrink-0 flex-col gap-3 border-t border-border bg-muted/10 px-4 py-3">
            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
              <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <span className="tabular-nums">
                  Filas <strong className="text-foreground">{desde}</strong>–
                  <strong className="text-foreground">{hasta}</strong>
                  {" de "}
                  <strong className="text-foreground">{totalFiltradas}</strong> visibles
                </span>
                <span className="hidden text-muted-foreground/70 sm:inline">·</span>
                <span className="text-muted-foreground">
                  Base: <span className="tabular-nums font-medium text-foreground">{totalEnCarga}</span>
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs text-muted-foreground">Por página</span>
                <Select value={String(tamañoPagina)} onValueChange={(v) => onTamañoPaginaChange(Number(v))}>
                  <SelectTrigger className="h-8 w-[4.25rem] text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TAMAÑOS_PAGINA.map((n) => (
                      <SelectItem key={n} value={String(n)}>
                        {n}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="flex items-center gap-1">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="size-8"
                    disabled={pagina <= 1}
                    aria-label="Anterior"
                    onClick={() => onPaginaChange(pagina - 1)}
                  >
                    <ChevronLeft className="size-4" />
                  </Button>
                  <span className="min-w-[5.5rem] text-center text-xs tabular-nums text-muted-foreground">
                    <span className="font-medium text-foreground">{pagina}</span>
                    {" / "}
                    {totalPaginas}
                  </span>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="size-8"
                    disabled={pagina >= totalPaginas}
                    aria-label="Siguiente"
                    onClick={() => onPaginaChange(pagina + 1)}
                  >
                    <ChevronRight className="size-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function TablaClientesEstadoVacio({
  icon: Icon,
  titulo,
  descripcion,
}: {
  icon: LucideIcon;
  titulo: string;
  descripcion: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
      <div className="flex size-14 items-center justify-center rounded-2xl border border-border/80 bg-muted/30 text-muted-foreground">
        <Icon className="size-7 stroke-[1.35]" aria-hidden />
      </div>
      <div className="max-w-md space-y-1.5">
        <p className="text-base font-medium text-foreground">{titulo}</p>
        {descripcion}
      </div>
    </div>
  );
}

function ClienteTableRow({
  cliente,
  onEditar,
  onToggleActivo,
}: {
  cliente: Client;
  onEditar: (c: Client) => void;
  onToggleActivo: (c: Client) => void;
}) {
  const vista = nombreInstitucionYNivelCliente(cliente.nombre);
  const nivelTxt = nivelPreferidoCliente(cliente);
  const ubi = ubicacionDepartamentalCliente(cliente);

  return (
    <tr
      className={cn("group transition-colors hover:bg-muted/20", !cliente.activo && "opacity-[0.72]")}
    >
      <td className="max-w-[min(320px,40vw)] px-4 py-3.5">
        <Link
          to={`/clientes/detalle/${encodeURIComponent(cliente.id)}`}
          className="flex items-center gap-3 transition-all hover:translate-x-0.5 group/client"
          title={cliente.nombre}
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-soft text-primary transition-colors group-hover/client:bg-primary group-hover/client:text-white">
            <School className="size-4" strokeWidth={1.75} />
          </div>
          <div className="min-w-0">
            <span className="block truncate font-semibold text-foreground transition-colors group-hover/client:text-primary group-hover/client:underline underline-offset-4">
              {vista.nombreInstitucion}
            </span>
          </div>
        </Link>
      </td>
      <td className="px-4 py-3.5 text-center">
        {nivelTxt ? (
          <Badge variant="outline" className="max-w-[120px] truncate font-normal text-[10px] uppercase" title={nivelTxt}>
            {nivelTxt}
          </Badge>
        ) : (
          <span className="tabular-nums text-muted-foreground">—</span>
        )}
      </td>
      <td className="max-w-[200px] px-4 py-3.5 text-muted-foreground">
        <span className="line-clamp-2 text-xs leading-snug" title={ubi || undefined}>
          {ubi || "—"}
        </span>
      </td>
      <td className="max-w-[140px] px-4 py-3.5 text-muted-foreground">
        <span className="line-clamp-2 text-xs leading-snug" title={cliente.ugel || undefined}>
          {cliente.ugel || "—"}
        </span>
      </td>
      <td className="px-4 py-3.5 text-center text-xs tabular-nums text-muted-foreground">
        {cliente.codigoModularIiee || "—"}
      </td>
      <td
        className="max-w-[108px] truncate px-4 py-3.5 text-xs tabular-nums whitespace-nowrap text-muted-foreground"
        title={cliente.codigoRegional || undefined}
      >
        {cliente.codigoRegional || "—"}
      </td>
      <td className="max-w-[140px] break-all px-4 py-3.5 text-xs text-muted-foreground">{cliente.email || "—"}</td>
      <td className="px-4 py-3.5 tabular-nums text-muted-foreground">{cliente.telefono || "—"}</td>
      <td className="px-4 py-3.5 text-center tabular-nums text-muted-foreground">{cliente.ordenesTotalesRelacionadas}</td>
      <td className="px-4 py-3.5 text-center">
        <Badge variant={cliente.activo ? "default" : "secondary"} className="text-[10px] font-normal">
          {cliente.activo ? "Activo" : "Desactiv."}
        </Badge>
      </td>
      <td className="px-4 py-3.5 text-right">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:bg-muted hover:text-foreground">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem asChild className="cursor-pointer">
              <Link to={`/clientes/detalle/${encodeURIComponent(cliente.id)}`}>
                <Eye className="mr-2 h-4 w-4" /> Ver detalle
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer" onClick={() => onEditar(cliente)}>
              <Pencil className="mr-2 h-4 w-4" /> Editar cliente
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              className={cn(
                "cursor-pointer",
                cliente.activo ? "text-destructive focus:text-destructive" : "text-primary focus:text-primary"
              )}
              onClick={() => onToggleActivo(cliente)}
            >
              {cliente.activo ? (
                <>
                  <Ban className="mr-2 h-4 w-4" /> Desactivar
                </>
              ) : (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" /> Reactivar
                </>
              )}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </td>
    </tr>
  );
}
