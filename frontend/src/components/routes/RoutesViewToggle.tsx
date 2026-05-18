import { LayoutGrid, List } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  view: "table" | "grid";
  onViewChange: (v: "table" | "grid") => void;
}

const RoutesViewToggle = ({ view, onViewChange }: Props) => (
  <div className="hidden shrink-0 items-center gap-1 rounded-xl border border-border/70 bg-white p-1 sm:inline-flex h-10 shadow-sm animate-fade-in">
    <button
      type="button"
      onClick={() => onViewChange("table")}
      title="Vista de Tabla"
      className={cn(
        "flex h-8 w-8 items-center justify-center rounded-lg transition-colors",
        view === "table"
          ? "bg-primary text-primary-foreground shadow-sm"
          : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
      )}
    >
      <List className="size-[18px] shrink-0" />
    </button>
    <button
      type="button"
      onClick={() => onViewChange("grid")}
      title="Vista de Tarjetas"
      className={cn(
        "flex h-8 w-8 items-center justify-center rounded-lg transition-colors",
        view === "grid"
          ? "bg-primary text-primary-foreground shadow-sm"
          : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
      )}
    >
      <LayoutGrid className="size-[18px] shrink-0" />
    </button>
  </div>
);

export default RoutesViewToggle;
