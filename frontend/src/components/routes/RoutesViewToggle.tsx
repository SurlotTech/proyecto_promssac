import { LayoutGrid, List } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  view: "table" | "grid";
  onViewChange: (v: "table" | "grid") => void;
}

const RoutesViewToggle = ({ view, onViewChange }: Props) => (
  <div className="hidden shrink-0 items-center gap-1 rounded-lg border border-border/70 bg-white p-1 sm:inline-flex">
    <button
      type="button"
      onClick={() => onViewChange("table")}
      className={cn(
        "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
        view === "table"
          ? "bg-primary text-primary-foreground shadow-sm"
          : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
      )}
    >
      <List className="size-4 shrink-0" /> Tabla
    </button>
    <button
      type="button"
      onClick={() => onViewChange("grid")}
      className={cn(
        "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
        view === "grid"
          ? "bg-primary text-primary-foreground shadow-sm"
          : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
      )}
    >
      <LayoutGrid className="size-4 shrink-0" /> Tarjetas
    </button>
  </div>
);

export default RoutesViewToggle;
