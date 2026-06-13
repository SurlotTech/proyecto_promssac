import { ChevronLeft, ChevronRight } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

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
  onPageSizeChange,
}: Props) => {
  const from = (currentPage - 1) * pageSize + 1;
  const to = Math.min(currentPage * pageSize, totalFiltered);

  return (
    <div className="flex h-16 items-center justify-between bg-white/30 px-5">
      <div></div>
      <div className="flex items-center gap-7">
        <div className="flex items-center gap-2 text-sm text-[#52677a]">
          <span>Filas por página:</span>
          <Select
            value={String(pageSize)}
            onValueChange={(v) => onPageSizeChange?.(Number(v))}
          >
            <SelectTrigger className="h-9 w-16 border border-[#e1e7ee] bg-white/30 px-2 text-sm text-[#1f2933]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="5">5</SelectItem>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="20">20</SelectItem>
              <SelectItem value="50">50</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <span className="text-sm text-[#52677a]">
          {from}–{to} de {totalFiltered}
        </span>

        <div className="flex items-center gap-1">
          <button
            type="button"
            disabled={currentPage <= 1}
            onClick={() => onPageChange(currentPage - 1)}
            className={cn(
              "flex size-9 items-center justify-center rounded-lg border text-sm font-medium transition-colors",
              currentPage <= 1
                ? "border-[#e1e7ee] text-[#c8d0d9] cursor-not-allowed"
                : "border-[#e1e7ee] text-[#52677a] hover:border-[#1f2933] hover:text-[#1f2933]",
            )}
          >
            <ChevronLeft className="size-4" />
          </button>
          <button
            type="button"
            disabled={currentPage >= totalPages}
            onClick={() => onPageChange(currentPage + 1)}
            className={cn(
              "flex size-9 items-center justify-center rounded-lg border text-sm font-medium transition-colors",
              currentPage >= totalPages
                ? "border-[#e1e7ee] text-[#c8d0d9] cursor-not-allowed"
                : "border-[#e1e7ee] text-[#52677a] hover:border-[#1f2933] hover:text-[#1f2933]",
            )}
          >
            <ChevronRight className="size-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default RoutesPaginationBar;
