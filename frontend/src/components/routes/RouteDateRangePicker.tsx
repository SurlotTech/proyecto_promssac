import { useMemo, useState } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import type { DateRange } from "react-day-picker";
import { Calendar as CalendarIcon, ChevronDown, X } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

function parseLocalYmd(s: string): Date | undefined {
  if (!s?.trim()) return undefined;
  const parts = s.split("-").map(Number);
  if (parts.length !== 3 || parts.some(Number.isNaN)) return undefined;
  const [y, m, d] = parts;
  return new Date(y, m - 1, d);
}

function toYmd(d: Date): string {
  return format(d, "yyyy-MM-dd");
}

/** Texto compacto para el disparador (filtros siguen guardando ISO). */
function formatDisplayRange(dateFrom: string, dateTo: string): string {
  const from = parseLocalYmd(dateFrom);
  const to = parseLocalYmd(dateTo);
  const fmt = (d: Date) => format(d, "dd/MM/yyyy");
  if (from && to) return `${fmt(from)} — ${fmt(to)}`;
  if (from) return `${fmt(from)} —`;
  return "";
}

interface Props {
  dateFrom: string;
  dateTo: string;
  onRangeChange: (dateFrom: string, dateTo: string) => void;
  className?: string;
}

const RouteDateRangePicker = ({ dateFrom, dateTo, onRangeChange, className }: Props) => {
  const [open, setOpen] = useState(false);

  const selected = useMemo((): DateRange | undefined => {
    const from = parseLocalYmd(dateFrom);
    const to = parseLocalYmd(dateTo);
    if (!from && !to) return undefined;
    return { from, to };
  }, [dateFrom, dateTo]);

  const displayText = useMemo(
    () => formatDisplayRange(dateFrom, dateTo),
    [dateFrom, dateTo],
  );

  const hasValue = Boolean(dateFrom || dateTo);

  const clear = () => {
    onRangeChange("", "");
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      {hasValue ? (
        <div
          className={cn(
            "flex !w-fit max-w-full items-center overflow-hidden border-none bg-transparent text-sm shadow-none transition-colors focus-within:ring-0 focus-within:ring-offset-0",
            className,
          )}
        >
          <PopoverTrigger asChild>
            <button
              type="button"
              aria-label={displayText ? `Rango de fechas: ${displayText}` : "Abrir calendario"}
              className={cn(
                "inline-flex h-9 w-max min-w-0 max-w-full shrink-0 items-center gap-2 border-0 bg-transparent py-0 px-2 text-left outline-none transition-colors hover:text-foreground/80",
              )}
            >
              <CalendarIcon
                className="size-4 shrink-0 text-foreground/80"
                strokeWidth={1.75}
                aria-hidden
              />
              <span className="min-w-0 max-w-[min(100vw-3rem,24rem)] shrink-0 truncate whitespace-nowrap text-sm font-semibold tabular-nums text-foreground">
                {displayText}
              </span>
            </button>
          </PopoverTrigger>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              clear();
            }}
            className="flex h-9 shrink-0 items-center px-1.5 text-muted-foreground transition-colors hover:text-foreground"
            aria-label="Limpiar fechas"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ) : (
        <div className={cn("min-w-0 w-full", className)}>
          <PopoverTrigger asChild>
            <button
              type="button"
              className={cn(
                "flex h-9 w-full min-w-0 max-w-full items-center gap-2 border-none bg-transparent py-0 px-2 shadow-none transition-colors sm:max-w-[min(100%,17rem)]",
                "hover:bg-transparent focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0",
              )}
            >
              <CalendarIcon
                className="size-4 shrink-0 text-foreground/80"
                strokeWidth={1.75}
                aria-hidden
              />
              <span className="min-w-0 flex-1 truncate text-left text-sm font-semibold text-foreground hover:text-foreground/80">
                Seleccionar fecha
              </span>
              <ChevronDown className="ml-auto h-4 w-4 shrink-0 opacity-50" aria-hidden />
            </button>
          </PopoverTrigger>
        </div>
      )}

      <PopoverContent
        className="w-auto max-w-[calc(100vw-1.5rem)] border-border bg-popover p-0 shadow-lg"
        align="start"
        sideOffset={8}
      >
        <Calendar
          mode="range"
          locale={es}
          numberOfMonths={2}
          defaultMonth={selected?.from ?? selected?.to ?? new Date()}
          selected={selected}
          onSelect={(range) => {
            const from = range?.from ? toYmd(range.from) : "";
            const to = range?.to ? toYmd(range.to) : "";
            onRangeChange(from, to);
            if (range?.from && range?.to) {
              setOpen(false);
            }
          }}
          showOutsideDays={true}
          formatters={{
            formatWeekdayName: (date) => {
              const d = date.getDay();
              const idx = d === 0 ? 6 : d - 1;
              const letters = ["L", "M", "M", "J", "V", "S", "D"];
              return letters[idx];
            },
          }}
          classNames={{
            months: "flex flex-col gap-5 space-y-0 sm:flex-row sm:gap-6 sm:space-x-0 sm:space-y-0",
            day_selected:
              "!bg-info !text-info-foreground hover:!bg-info hover:!text-info-foreground focus:!bg-info focus:!text-info-foreground",
            day_range_start:
              "!rounded-full !bg-info !text-info-foreground hover:!bg-info hover:!text-info-foreground",
            day_range_end:
              "!rounded-full !bg-info !text-info-foreground hover:!bg-info hover:!text-info-foreground",
            day_range_middle:
              "aria-selected:!bg-info-soft aria-selected:!text-foreground !rounded-none",
          }}
        />
      </PopoverContent>
    </Popover>
  );
};

export default RouteDateRangePicker;
