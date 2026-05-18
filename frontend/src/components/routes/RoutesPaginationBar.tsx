import { ChevronLeft, ChevronRight } from "lucide-react";
import { paginationItems } from "@/lib/pagination";
import { cn } from "@/lib/utils";

interface Props {
  currentPage: number;
  totalPages: number;
  totalFiltered: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  label: string;
}

const RoutesPaginationBar = ({
  currentPage,
  totalPages,
  totalFiltered,
  pageSize,
  onPageChange,
  label,
}: Props) => (
  <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
    <p className="text-sm text-muted-foreground">
      Mostrando{" "}
      <span className="font-semibold text-foreground">{(currentPage - 1) * pageSize + 1}</span>–
      <span className="font-semibold text-foreground">
        {Math.min(currentPage * pageSize, totalFiltered)}
      </span>{" "}
      de <span className="font-semibold text-foreground">{totalFiltered}</span> {label}
    </p>

    <nav className="flex flex-wrap items-center justify-end gap-2" aria-label={`Paginación de ${label}`}>
      <button
        type="button"
        disabled={currentPage <= 1}
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        aria-label="Página anterior"
        className={cn(
          "flex size-9 shrink-0 items-center justify-center rounded-full border-2 bg-white transition-colors",
          currentPage <= 1
            ? "cursor-not-allowed border-primary/25 text-primary/35"
            : "border-primary text-primary hover:bg-primary-soft",
        )}
      >
        <ChevronLeft className="size-4" strokeWidth={2.25} />
      </button>

      {paginationItems(currentPage, totalPages).map((item, idx) =>
        item === "ellipsis" ? (
          <span
            key={`e-${idx}`}
            className="flex size-9 shrink-0 items-center justify-center text-sm font-medium text-muted-foreground"
            aria-hidden
          >
            …
          </span>
        ) : (
          <button
            key={item}
            type="button"
            onClick={() => onPageChange(item)}
            aria-label={`Ir a página ${item}`}
            aria-current={currentPage === item ? "page" : undefined}
            className={cn(
              "flex size-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold transition-colors",
              currentPage === item
                ? "bg-primary text-primary-foreground shadow-sm"
                : "border-2 border-primary bg-white text-foreground hover:bg-primary-soft",
            )}
          >
            {item}
          </button>
        ),
      )}

      <button
        type="button"
        disabled={currentPage >= totalPages}
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        aria-label="Página siguiente"
        className={cn(
          "flex size-9 shrink-0 items-center justify-center rounded-full border-2 bg-white transition-colors",
          currentPage >= totalPages
            ? "cursor-not-allowed border-primary/25 text-primary/35"
            : "border-primary text-primary hover:bg-primary-soft",
        )}
      >
        <ChevronRight className="size-4" strokeWidth={2.25} />
      </button>
    </nav>
  </div>
);

export default RoutesPaginationBar;
