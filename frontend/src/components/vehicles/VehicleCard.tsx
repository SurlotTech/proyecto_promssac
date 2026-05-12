import { ChevronRight } from "lucide-react";
import type { Vehicle } from "@/domain/vehicles";
import StatusBadge from "./StatusBadge";
import { vehicleTypeIcon } from "./vehicleTypeIcon";

const VehicleCard = ({ v, onClick }: { v: Vehicle; onClick: () => void }) => {
  const Icon = vehicleTypeIcon[v.type];
  return (
    <button
      onClick={onClick}
      className="group w-full rounded-xl border border-border bg-card/40 backdrop-blur-md p-4 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary-soft text-primary">
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <p className="font-semibold text-foreground">{v.plate}</p>
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
    </button>
  );
};

export default VehicleCard;
