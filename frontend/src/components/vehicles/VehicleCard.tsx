import { ChevronRight, Truck } from "lucide-react";
import type { Vehicle } from "@/domain/vehicles";
import StatusBadge from "./StatusBadge";
import { vehicleTypeIcon } from "./vehicleTypeIcon";

const VehicleCard = ({ v, onClick }: { v: Vehicle; onClick: () => void }) => {
  const Icon = vehicleTypeIcon[v.type] ?? Truck;
  return (
    <div
      className="group w-full rounded-xl border border-border bg-card/40 backdrop-blur-lg p-4 text-left shadow-sm transition-all"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary-soft text-primary">
            <Icon className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <button 
              onClick={onClick}
              className="text-left font-semibold text-foreground transition-colors hover:text-primary hover:underline underline-offset-4"
            >
              {v.plate}
            </button>
            <p className="text-xs text-muted-foreground">{v.type}</p>
          </div>
        </div>
        <ChevronRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
      </div>

      <div className="mt-3 flex items-center justify-between">
        <StatusBadge status={v.status} />
        <span className="text-xs text-muted-foreground">
          {v.driver ?? "Sin asignar"}
        </span>
      </div>
    </div>
  );
};

export default VehicleCard;
