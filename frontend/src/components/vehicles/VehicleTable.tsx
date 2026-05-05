import { MoreHorizontal, Eye, Pencil, Trash2 } from "lucide-react";
import type { Vehicle } from "@/domain/vehicles";
import StatusBadge from "./StatusBadge";
import { vehicleTypeIcon } from "./vehicleTypeIcon";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Props {
  vehicles: Vehicle[];
  onSelect: (v: Vehicle) => void;
}

const VehicleTable = ({ vehicles, onSelect }: Props) => {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
      <div className="overflow-x-auto scrollbar-thin">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-surface-muted text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <th className="px-5 py-3.5">Vehículo</th>
              <th className="px-5 py-3.5">Tipo</th>
              <th className="px-5 py-3.5">Conductor</th>
              <th className="px-5 py-3.5">Estado</th>
              <th className="px-5 py-3.5">Último servicio</th>
              <th className="px-5 py-3.5 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {vehicles.map((v) => {
              const TypeIcon = vehicleTypeIcon[v.type];
              return (
                <tr
                  key={v.id}
                  onClick={() => onSelect(v)}
                  className="group cursor-pointer transition-colors hover:bg-surface-muted"
                >
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-soft text-primary">
                        <TypeIcon className="h-5 w-5" aria-hidden />
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-foreground">{v.plate}</p>
                        <p className="text-xs text-muted-foreground">
                          {v.capacityKg.toLocaleString()} kg cap.
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-foreground">{v.type}</td>
                  <td className="px-5 py-4 text-foreground">
                    {v.driver ?? <span className="text-muted-foreground">— Sin asignar</span>}
                  </td>
                  <td className="px-5 py-4">
                    <StatusBadge status={v.status} />
                  </td>
                  <td className="px-5 py-4 text-muted-foreground">{v.lastService}</td>
                  <td className="px-5 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground">
                        <MoreHorizontal className="h-4 w-4" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-40">
                        <DropdownMenuItem onClick={() => onSelect(v)}>
                          <Eye className="mr-2 h-4 w-4" /> Ver detalle
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onSelect(v)}>
                          <Pencil className="mr-2 h-4 w-4" /> Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive focus:text-destructive">
                          <Trash2 className="mr-2 h-4 w-4" /> Eliminar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default VehicleTable;