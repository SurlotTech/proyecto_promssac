import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import type { LucideIcon } from "lucide-react";
import { Ban, CheckCircle, Eye, Pencil, SearchX, School, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
  selectedIds: Set<string>;
  onSelectionChange: (ids: Set<string>) => void;
  visibleColumns: string[];
};

export default function ClienteTable({
  filasPagina,
  totalFiltradas,
  totalEnCarga,
  isLoading,
  isError,
  onEditar,
  onToggleActivo,
  selectedIds,
  onSelectionChange,
  visibleColumns,
}: Props) {
  const toggleSelect = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    onSelectionChange(next);
  };

  const toggleAll = () => {
    if (selectedIds.size === filasPagina.length) {
      onSelectionChange(new Set());
    } else {
      onSelectionChange(new Set(filasPagina.map((c) => c.id)));
    }
  };

  return (
    <div>
      {isLoading ? (
        <p className="p-12 text-center text-sm text-[#52677a]">Cargando clientes…</p>
      ) : isError ? (
        <p className="p-12 text-center text-sm text-destructive">
          No se pudieron cargar los clientes. ¿El backend está en marcha?
        </p>
      ) : (
        <>
          <div className="overflow-x-auto scrollbar-thin">
            <table className="w-full">
              <thead>
                <tr className="h-11 bg-[#eef1f5] text-left text-xs font-bold text-[#647789]">
                  <th className="w-10 px-5">
                    <div className="inline-flex items-center justify-center rounded-full p-1.5 transition-colors hover:bg-primary/10 -ml-1.5">
                      <Checkbox
                        checked={filasPagina.length > 0 && selectedIds.size === filasPagina.length}
                        onCheckedChange={toggleAll}
                        className="h-4 w-4 border-2 border-gray-400 data-[state=checked]:bg-primary data-[state=checked]:border-primary rounded"
                      />
                    </div>
                  </th>
                  <th className={cn("px-5", !visibleColumns.includes("institucion") && "hidden")}>Institución</th>
                  <th className={cn("px-3 text-center", !visibleColumns.includes("nivel") && "hidden")}>Nivel</th>
                  <th className={cn("px-3 max-w-[140px]", !visibleColumns.includes("ugel") && "hidden")}>UGEL</th>
                  <th className={cn("px-3 max-w-[140px]", !visibleColumns.includes("correo") && "hidden")}>Correo</th>
                  <th className={cn("px-3", !visibleColumns.includes("telefono") && "hidden")}>Teléfono</th>
                  <th className={cn("px-3 text-center", !visibleColumns.includes("ordenes") && "hidden")}>Órdenes</th>
                  <th className={cn("px-3 text-center", !visibleColumns.includes("estado") && "hidden")}>Estado</th>
                  <th className="w-14 px-3"></th>
                </tr>
              </thead>
              <tbody>
                {totalFiltradas === 0 ? (
                  <tr>
                    <td colSpan={9} className="align-top">
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
                      selectedIds={selectedIds}
                      toggleSelect={toggleSelect}
                      visibleColumns={visibleColumns}
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
  selectedIds,
  toggleSelect,
  visibleColumns,
}: {
  cliente: Client;
  onEditar: (c: Client) => void;
  onToggleActivo: (c: Client) => void;
  selectedIds: Set<string>;
  toggleSelect: (id: string) => void;
  visibleColumns: string[];
}) {
  const vista = nombreInstitucionYNivelCliente(cliente.nombre);
  const nivelTxt = nivelPreferidoCliente(cliente);
  const ubi = ubicacionDepartamentalCliente(cliente);

  return (
    <tr
      className={cn(
        "h-[60px] border-b border-dashed border-[#e3e8ee] transition-colors hover:bg-surface-muted",
        !cliente.activo && "opacity-[0.72]",
        selectedIds.has(cliente.id) && "bg-red-50",
      )}
    >
      <td className="px-5">
        <div className="inline-flex items-center justify-center rounded-full p-1.5 transition-colors hover:bg-primary/10 -ml-1.5">
          <Checkbox
            checked={selectedIds.has(cliente.id)}
            onCheckedChange={() => toggleSelect(cliente.id)}
            className="h-4 w-4 border-2 border-gray-400 data-[state=checked]:bg-primary data-[state=checked]:border-primary rounded"
          />
        </div>
      </td>
      <td className={cn("px-5", !visibleColumns.includes("institucion") && "hidden")}>
        <Link
          to={`/clientes/detalle/${encodeURIComponent(cliente.id)}`}
          className="flex items-center gap-4 transition-all group"
          title={cliente.nombre}
        >
          <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[#dfe4ea] text-sm font-bold text-[#5f7282] transition-colors group-hover:bg-primary group-hover:text-white">
            <School className="size-4" />
          </div>
          <div>
            <span className="text-sm font-medium text-[#1f2933] transition-colors group-hover:text-primary group-hover:underline underline-offset-4">
              {vista.nombreInstitucion}
            </span>
          </div>
        </Link>
      </td>
      <td className={cn("px-3 text-center", !visibleColumns.includes("nivel") && "hidden")}>
        {nivelTxt ? (
          <span className="inline-flex items-center rounded-md bg-[#e9eef2] px-2 py-1 text-xs font-bold text-[#5f7282]">{nivelTxt}</span>
        ) : (
          <span className="text-sm text-[#8a9aab]">—</span>
        )}
      </td>
      <td className={cn("max-w-[140px] px-3", !visibleColumns.includes("ugel") && "hidden")}>
        <span className="line-clamp-2 text-sm text-[#52677a]" title={cliente.ugel || undefined}>
          {cliente.ugel || <span className="text-[#8a9aab]">—</span>}
        </span>
      </td>
      <td className={cn("max-w-[140px] break-all px-3 text-sm text-[#52677a]", !visibleColumns.includes("correo") && "hidden")}>{cliente.email || <span className="text-[#8a9aab]">—</span>}</td>
      <td className={cn("px-3 text-sm tabular-nums text-[#52677a]", !visibleColumns.includes("telefono") && "hidden")}>{cliente.telefono || <span className="text-[#8a9aab]">—</span>}</td>
      <td className={cn("px-3 text-center text-sm tabular-nums text-[#52677a]", !visibleColumns.includes("ordenes") && "hidden")}>{cliente.ordenesTotalesRelacionadas}</td>
      <td className={cn("px-3 text-center", !visibleColumns.includes("estado") && "hidden")}>
        <span className={cn(
          "inline-flex items-center rounded-md px-2 py-1.5 text-xs font-bold",
          cliente.activo
            ? "bg-success-soft text-success"
            : "bg-muted text-muted-foreground",
        )}>
          {cliente.activo ? "Activo" : "Desactiv."}
        </span>
      </td>
      <td className="px-3 text-right" onClick={(e) => e.stopPropagation()}>
        <DropdownMenu>
          <DropdownMenuTrigger className="rounded-md p-1.5 text-[#8a9aab] hover:bg-[#e9eef2] hover:text-[#1f2933] transition-colors">
            <MoreVertical className="h-4 w-4" />
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
