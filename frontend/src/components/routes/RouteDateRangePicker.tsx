import { useMemo, useState } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import type { DateRange } from "react-day-picker";
import { Calendar as CalendarIcon, X } from "lucide-react";
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
  minDate?: string;
  maxDate?: string;
}

const RouteDateRangePicker = ({ dateFrom, dateTo, onRangeChange, className, minDate, maxDate }: Props) => {
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
            "flex !w-fit max-w-full items-center shrink-0 rounded-lg border bg-zinc-50 overflow-hidden text-sm shadow-none transition-all hover:border-zinc-300 hover:shadow-sm focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-0",
            className,
          )}
        >
          <PopoverTrigger asChild>
            <button
              type="button"
              aria-label={displayText ? `Rango de fechas: ${displayText}` : "Abrir calendario"}
              className={cn(
                "group inline-flex h-9 w-max min-w-0 max-w-full shrink-0 items-center gap-2 border-0 bg-transparent py-0 pl-3 pr-2 text-left outline-none transition-all hover:bg-zinc-100",
              )}
            >
              <CalendarIcon
                className="size-3.5 shrink-0 text-muted-foreground"
                strokeWidth={1.75}
                aria-hidden
              />
              <span className="min-w-0 max-w-[min(100vw-3rem,24rem)] shrink-0 truncate whitespace-nowrap text-sm tabular-nums text-muted-foreground">
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
            className="flex h-9 shrink-0 items-center px-2 text-muted-foreground/60 transition-all hover:bg-zinc-100 hover:text-muted-foreground"
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
                "group flex h-9 w-full min-w-0 max-w-full shrink-0 items-center gap-2 rounded-lg border bg-zinc-50 px-3 py-0 shadow-none transition-all hover:border-zinc-300 hover:bg-zinc-100 hover:shadow-sm sm:max-w-[min(100%,18rem)]",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-0",
              )}
            >
              <CalendarIcon
                className="size-3.5 shrink-0 text-muted-foreground"
                strokeWidth={1.75}
                aria-hidden
              />
              <span className="min-w-0 flex-1 truncate text-left text-sm text-muted-foreground">
                Seleccionar fecha
              </span>
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
          fromDate={minDate ? parseLocalYmd(minDate) : undefined}
          toDate={maxDate ? parseLocalYmd(maxDate) : undefined}
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
              "aria-selected:!bg-info-soft aria-selected:!text-muted-foreground !rounded-none",
          }}
        />
      </PopoverContent>
    </Popover>
  );
};

export default RouteDateRangePicker;
