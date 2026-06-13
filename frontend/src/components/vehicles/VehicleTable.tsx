import { MoreVertical, Pencil, Trash2 } from "lucide-react";
import type { Vehicle } from "@/domain/vehicles";
import StatusBadge from "./StatusBadge";
import { vehicleTypeIcon } from "./vehicleTypeIcon";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

interface Props {
  vehicles: Vehicle[];
  onSelect: (v: Vehicle) => void;
  onDelete?: (v: Vehicle) => void;
  selectedIds: Set<string>;
  onSelectionChange: (ids: Set<string>) => void;
  visibleColumns: string[];
}

const VehicleTable = ({ vehicles, onSelect, onDelete, selectedIds, onSelectionChange, visibleColumns }: Props) => {
  const toggleSelect = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    onSelectionChange(next);
  };

  const toggleAll = () => {
    if (selectedIds.size === vehicles.length) {
      onSelectionChange(new Set());
    } else {
      onSelectionChange(new Set(vehicles.map((v) => v.id)));
    }
  };

  return (
    <div className="overflow-x-auto scrollbar-thin">
      <table className="w-full">
        <thead>
          <tr className="h-11 bg-[#eef1f5] text-left text-xs font-bold text-[#647789]">
            <th className="w-10 px-5">
              <div className="inline-flex items-center justify-center rounded-full p-1.5 transition-colors hover:bg-primary/10 -ml-1.5">
                <Checkbox
                  checked={vehicles.length > 0 && selectedIds.size === vehicles.length}
                  onCheckedChange={toggleAll}
                  className="h-4 w-4 border-2 border-gray-400 data-[state=checked]:bg-primary data-[state=checked]:border-primary rounded"
                />
              </div>
            </th>
            <th className={cn("px-5", !visibleColumns.includes("vehiculo") && "hidden")}>Vehículo</th>
            <th className={cn("px-3", !visibleColumns.includes("tipo") && "hidden")}>Tipo</th>
            <th className={cn("px-3", !visibleColumns.includes("conductor") && "hidden")}>Conductor</th>
            <th className={cn("px-3", !visibleColumns.includes("estado") && "hidden")}>Estado</th>
            <th className={cn("px-3", !visibleColumns.includes("servicio") && "hidden")}>Último servicio</th>
            <th className="w-14 px-3"></th>
          </tr>
        </thead>
        <tbody>
          {vehicles.map((v) => {
            const TypeIcon = vehicleTypeIcon[v.type];
            return (
              <tr
                key={v.id}
                className={cn(
                  "h-[60px] border-b border-dashed border-[#e3e8ee] transition-colors hover:bg-surface-muted",
                  selectedIds.has(v.id) ? "bg-red-50" : "bg-white/30",
                )}
              >
                <td className="px-5">
                  <div className="inline-flex items-center justify-center rounded-full p-1.5 transition-colors hover:bg-primary/10 -ml-1.5">
                    <Checkbox
                      checked={selectedIds.has(v.id)}
                      onCheckedChange={() => toggleSelect(v.id)}
                      className="h-4 w-4 border-2 border-gray-400 data-[state=checked]:bg-primary data-[state=checked]:border-primary rounded"
                    />
                  </div>
                </td>
                <td className={cn("px-5", !visibleColumns.includes("vehiculo") && "hidden")}>
                  <button
                    onClick={() => onSelect(v)}
                    className="flex items-center gap-4 text-left group"
                  >
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[#dfe4ea] text-sm font-bold text-[#5f7282] transition-colors group-hover:bg-primary group-hover:text-white">
                      <TypeIcon className="size-4" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[#1f2933] transition-colors group-hover:text-primary group-hover:underline underline-offset-4">{v.plate}</p>
                      <p className="mt-1 text-xs text-[#52677a]">{v.capacityKg.toLocaleString()} kg cap.</p>
                    </div>
                  </button>
                </td>
                <td className={cn("px-3 text-sm font-medium text-[#1f2933]", !visibleColumns.includes("tipo") && "hidden")}>{v.type}</td>
                <td className={cn("px-3", !visibleColumns.includes("conductor") && "hidden")}>
                  {v.driver
                    ? <p className="text-sm font-medium text-[#1f2933]">{v.driver}</p>
                    : <span className="text-sm text-[#8a9aab]">— Sin asignar</span>
                  }
                </td>
                <td className={cn("px-3", !visibleColumns.includes("estado") && "hidden")}>
                  <StatusBadge status={v.status} />
                </td>
                <td className={cn("px-3 text-sm text-[#52677a]", !visibleColumns.includes("servicio") && "hidden")}>{v.lastService}</td>
                <td className="px-3 text-right" onClick={(e) => e.stopPropagation()}>
                  <DropdownMenu>
                    <DropdownMenuTrigger className="rounded-md p-1.5 text-[#8a9aab] hover:bg-[#e9eef2] hover:text-[#1f2933] transition-colors">
                      <MoreVertical className="h-4 w-4" />
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
      {vehicles.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
          <p className="text-sm font-medium">No se encontraron vehículos</p>
        </div>
      )}
    </div>
  );
};

export default VehicleTable;