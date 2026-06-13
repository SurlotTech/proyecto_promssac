import { Eye, MoreVertical, Pencil, Trash2 } from "lucide-react";
import type { Route } from "@/domain/routes";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Props {
  route: Route;
  onSelect: (r: Route) => void;
  onEdit?: (r: Route) => void;
  onDelete?: (r: Route) => void;
  /** Clases del botón que abre el menú */
  triggerClassName?: string;
  /** Etiqueta accesible del disparador (p. ej. tarjetas móviles) */
  triggerAriaLabel?: string;
}

const RouteActionsMenu = ({
  route: r,
  onSelect,
  onEdit,
  onDelete,
  triggerClassName = "rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground",
  triggerAriaLabel,
}: Props) => (
  <DropdownMenu>
    <DropdownMenuTrigger className={triggerClassName} aria-label={triggerAriaLabel}>
      <MoreVertical className="h-4 w-4" />
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end" className="w-40">
      <DropdownMenuItem onClick={() => onSelect(r)}>
        <Eye className="mr-2 h-4 w-4" /> Ver detalle
      </DropdownMenuItem>
      <DropdownMenuItem onClick={() => onEdit?.(r)}>
        <Pencil className="mr-2 h-4 w-4" /> Editar
      </DropdownMenuItem>
      <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => onDelete?.(r)}>
        <Trash2 className="mr-2 h-4 w-4" /> Eliminar
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
);

export default RouteActionsMenu;
