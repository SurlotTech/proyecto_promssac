import { MoreHorizontal, Pencil, Trash2, Truck } from "lucide-react";
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
  onDelete?: (v: Vehicle) => void;
}

const VehicleTable = ({ vehicles, onSelect, onDelete }: Props) => {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card/40 backdrop-blur-lg shadow-sm">
      <div className="overflow-x-auto scrollbar-thin">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-surface-muted text-left text-xs font-medium tracking-wider text-muted-foreground/80">
              <th className="whitespace-nowrap px-3.5 py-2.5 font-medium">Vehículo</th>
              <th className="whitespace-nowrap px-3.5 py-2.5 font-medium">Tipo</th>
              <th className="whitespace-nowrap px-3.5 py-2.5 font-medium">Conductor</th>
              <th className="whitespace-nowrap px-3.5 py-2.5 font-medium">Estado</th>
              <th className="whitespace-nowrap px-3.5 py-2.5 font-medium">Último servicio</th>
              <th className="whitespace-nowrap px-3.5 py-2.5 pr-5 text-right font-medium">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {vehicles.map((v) => {
              const TypeIcon = vehicleTypeIcon[v.type] ?? Truck;
              return (
                <tr
                  key={v.id}
                  className="group transition-colors hover:bg-surface-muted"
                >
                  <td className="px-3.5 py-2.5">
                    <button
                      onClick={() => onSelect(v)}
                      className="flex items-center gap-2 text-left transition-all hover:translate-x-0.5 group/plate"
                    >
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-soft text-primary transition-colors group-hover/plate:bg-primary group-hover/plate:text-white">
                        <TypeIcon className="size-4" aria-hidden />
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-foreground transition-colors group-hover/plate:text-primary group-hover/plate:underline underline-offset-4">{v.plate}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {v.capacityKg.toLocaleString()} kg cap.
                        </p>
                      </div>
                    </button>
                  </td>
                  <td className="px-3.5 py-2.5 text-foreground">{v.type}</td>
                  <td className="px-3.5 py-2.5 text-foreground">
                    {v.driver ?? <span className="text-muted-foreground">— Sin asignar</span>}
                  </td>
                  <td className="px-3.5 py-2.5">
                    <StatusBadge status={v.status} />
                  </td>
                  <td className="px-3.5 py-2.5 text-muted-foreground">{v.lastService}</td>
                  <td className="px-3.5 py-2.5 text-right" onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground">
                        <MoreHorizontal className="h-4 w-4" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-40">
                        <DropdownMenuItem onClick={() => onSelect(v)}>
                          <Pencil className="mr-2 h-4 w-4" /> Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem className="cursor-pointer text-destructive focus:text-destructive" onClick={() => onDelete?.(v)}>
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