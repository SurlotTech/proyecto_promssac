import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import type { LucideIcon } from "lucide-react";
import { Ban, CheckCircle, Eye, Pencil, SearchX, School, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import RoutesPaginationBar from "@/components/routes/RoutesPaginationBar";
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
  isLoading: boolean;
  isError: boolean;
  onEditar: (c: Client) => void;
  onToggleActivo: (c: Client) => void;
};

export default function ClienteTable({
  filasPagina,
  totalFiltradas,
  totalEnCarga,
  isLoading,
  isError,
  onEditar,
  onToggleActivo,
}: Props) {
  return (
    <div className="overflow-hidden rounded-xl border border-border/60 bg-card/80 backdrop-blur-md shadow-sm">
      {isLoading ? (
        <p className="p-12 text-center text-sm text-muted-foreground">Cargando clientes…</p>
      ) : isError ? (
        <p className="p-12 text-center text-sm text-destructive">
          No se pudieron cargar los clientes. ¿El backend está en marcha?
        </p>
      ) : (
        <>
          <div className="overflow-x-auto scrollbar-thin">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border bg-surface-muted text-left text-xs font-medium tracking-wider text-muted-foreground/80">
                  <th className="whitespace-nowrap px-3.5 py-2.5 font-medium">Institución</th>
                  <th className="whitespace-nowrap px-3.5 py-2.5 text-center font-medium">Nivel</th>
                  <th className="max-w-[140px] px-3.5 py-2.5 font-medium">UGEL</th>
                  <th className="max-w-[140px] px-3.5 py-2.5 font-medium">Correo</th>
                  <th className="whitespace-nowrap px-3.5 py-2.5 font-medium">Teléfono</th>
                  <th className="whitespace-nowrap px-3.5 py-2.5 text-center font-medium">Órdenes</th>
                  <th className="whitespace-nowrap px-3.5 py-2.5 text-center font-medium">Estado</th>
                  <th className="whitespace-nowrap px-3.5 py-2.5 pr-5 text-right font-medium">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {totalFiltradas === 0 ? (
                  <tr>
                    <td colSpan={8} className="align-top">
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
      className={cn("group transition-colors hover:bg-surface-muted", !cliente.activo && "opacity-[0.72]")}
    >
      <td className="max-w-[min(320px,40vw)] px-3.5 py-2.5">
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
      <td className="px-3.5 py-2.5 text-center">
        {nivelTxt ? (
          <Badge variant="outline" className="max-w-[120px] truncate font-normal text-[10px] uppercase" title={nivelTxt}>
            {nivelTxt}
          </Badge>
        ) : (
          <span className="tabular-nums text-muted-foreground">—</span>
        )}
      </td>
      <td className="max-w-[140px] px-3.5 py-2.5 text-muted-foreground">
        <span className="line-clamp-2 text-xs leading-snug" title={cliente.ugel || undefined}>
          {cliente.ugel || "—"}
        </span>
      </td>
      <td className="max-w-[140px] break-all px-3.5 py-2.5 text-xs text-muted-foreground">{cliente.email || "—"}</td>
      <td className="px-3.5 py-2.5 tabular-nums text-muted-foreground">{cliente.telefono || "—"}</td>
      <td className="px-3.5 py-2.5 text-center tabular-nums text-muted-foreground">{cliente.ordenesTotalesRelacionadas}</td>
      <td className="px-3.5 py-2.5 text-center">
        <Badge variant={cliente.activo ? "default" : "secondary"} className="text-[10px] font-normal">
          {cliente.activo ? "Activo" : "Desactiv."}
        </Badge>
      </td>
      <td className="px-3.5 py-2.5 text-right">
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
