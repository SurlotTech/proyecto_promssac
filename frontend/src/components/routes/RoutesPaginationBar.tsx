import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { paginationItems } from "@/lib/pagination";
import { cn } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Props {
  currentPage: number;
  totalPages: number;
  totalFiltered: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  label: string;
  onPageSizeChange?: (size: number) => void;
}

const RoutesPaginationBar = ({
  currentPage,
  totalPages,
  totalFiltered,
  pageSize,
  onPageChange,
  label,
  onPageSizeChange,
}: Props) => (
  <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
    <p className="text-sm text-muted-foreground font-normal animate-fade-in">
      Mostrando {(currentPage - 1) * pageSize + 1}–{Math.min(currentPage * pageSize, totalFiltered)} de {totalFiltered} {label}
    </p>

    <div className="flex flex-wrap items-center gap-4">
      {/* Selector de filas por página Shadcn UI */}
      {onPageSizeChange && (
        <div className="flex items-center gap-2 animate-fade-in">
          <span className="text-xs font-semibold text-primary/70">Por página</span>
          <Select value={String(pageSize)} onValueChange={(v) => onPageSizeChange(Number(v))}>
            <SelectTrigger className="h-8 w-[4.25rem] text-xs bg-transparent border-2 border-primary/70 text-primary font-bold hover:bg-primary-soft/10 hover:border-primary transition-colors">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[10, 25, 50, 100].map((n) => (
                <SelectItem key={n} value={String(n)}>
                  {n}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <nav className="flex flex-wrap items-center justify-end gap-1" aria-label={`Paginación de ${label}`}>
        {/* << Primera página */}
        <button
          type="button"
          disabled={currentPage <= 1}
          onClick={() => onPageChange(1)}
          aria-label="Primera página"
          className={cn(
            "flex size-[30px] shrink-0 items-center justify-center rounded-full border-2 bg-transparent transition-colors",
            currentPage <= 1
              ? "cursor-not-allowed border-primary/20 text-primary/20"
              : "border-primary/70 text-primary/70 hover:border-primary hover:text-primary hover:bg-primary-soft",
          )}
        >
          <ChevronsLeft className="size-4" strokeWidth={2.25} />
        </button>

        {/* < Página anterior */}
        <button
          type="button"
          disabled={currentPage <= 1}
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          aria-label="Página anterior"
          className={cn(
            "flex size-[30px] shrink-0 items-center justify-center rounded-full border-2 bg-transparent transition-colors",
            currentPage <= 1
              ? "cursor-not-allowed border-primary/20 text-primary/20"
              : "border-primary/70 text-primary/70 hover:border-primary hover:text-primary hover:bg-primary-soft",
          )}
        >
          <ChevronLeft className="size-4" strokeWidth={2.25} />
        </button>

        {/* Números de página */}
        {paginationItems(currentPage, totalPages).map((item, idx) =>
          item === "ellipsis" ? (
            <span
              key={`e-${idx}`}
              className="flex size-[30px] shrink-0 items-center justify-center text-sm font-medium text-muted-foreground animate-fade-in"
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
                "flex size-[30px] shrink-0 items-center justify-center rounded-full text-xs font-bold transition-colors",
                currentPage === item
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "border-2 border-primary/70 bg-transparent text-primary/70 hover:border-primary hover:text-primary hover:bg-primary-soft",
              )}
            >
              {item}
            </button>
          ),
        )}

        {/* > Página siguiente */}
        <button
          type="button"
          disabled={currentPage >= totalPages}
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          aria-label="Página siguiente"
          className={cn(
            "flex size-[30px] shrink-0 items-center justify-center rounded-full border-2 bg-transparent transition-colors",
            currentPage >= totalPages
              ? "cursor-not-allowed border-primary/20 text-primary/20"
              : "border-primary/70 text-primary/70 hover:border-primary hover:text-primary hover:bg-primary-soft",
          )}
        >
          <ChevronRight className="size-4" strokeWidth={2.25} />
        </button>

        {/* >> Última página */}
        <button
          type="button"
          disabled={currentPage >= totalPages}
          onClick={() => onPageChange(totalPages)}
          aria-label="Última página"
          className={cn(
            "flex size-[30px] shrink-0 items-center justify-center rounded-full border-2 bg-transparent transition-colors",
            currentPage >= totalPages
              ? "cursor-not-allowed border-primary/20 text-primary/20"
              : "border-primary/70 text-primary/70 hover:border-primary hover:text-primary hover:bg-primary-soft",
          )}
        >
          <ChevronsRight className="size-4" strokeWidth={2.25} />
        </button>
      </nav>
    </div>
  </div>
);

export default RoutesPaginationBar;
