import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatsBarItem {
  label: string;
  value: string | number;
  subtext?: string;
  icon: LucideIcon;
  tone: "primary" | "success" | "warning" | "info";
}

interface StatsBarProps {
  items: StatsBarItem[];
}

const circleBorder: Record<StatsBarItem["tone"], string> = {
  primary: "border-primary/30 bg-primary/5 text-primary",
  success: "border-success/30 bg-success/5 text-success",
  warning: "border-warning/30 bg-warning/5 text-warning",
  info: "border-info/30 bg-info/5 text-info",
};

const StatsBar = ({ items }: StatsBarProps) => {
  return (
    <div className="flex h-[110px] items-center rounded-[14px] border border-border/40 bg-white/30 shadow-md divide-x divide-border/60">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <div
            key={item.label}
            className="flex flex-1 items-center justify-center gap-4 pl-4 pr-10"
          >
            <div
              className={cn(
                "flex size-14 shrink-0 items-center justify-center rounded-full border-2",
                circleBorder[item.tone],
              )}
            >
              <Icon className="size-7" strokeWidth={1.5} />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-900">
                {item.label}
              </p>
              {item.subtext && (
                <p className="text-xs text-muted-foreground">{item.subtext}</p>
              )}
              <p className="text-lg font-bold text-gray-900">{item.value}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default StatsBar;
