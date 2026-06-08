import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string | number;
  delta?: string;
  icon: LucideIcon;
  tone?: "primary" | "success" | "warning" | "info" | "neutral";
}

const tones: Record<NonNullable<StatCardProps["tone"]>, string> = {
  primary: "bg-primary-soft text-primary",
  success: "bg-success-soft text-success",
  warning: "bg-warning-soft text-warning",
  info: "bg-info-soft text-info",
  neutral: "bg-muted text-tertiary",
};

const StatCard = ({ label, value, delta, icon: Icon, tone = "neutral" }: StatCardProps) => {
  return (
    <div className="group rounded-xl border border-border/60 bg-card/80 backdrop-blur-md p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-center gap-3">
        <div
          className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-transform duration-200 group-hover:scale-105",
            tones[tone]
          )}
        >
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-muted-foreground/90">
            {label}
          </p>
          <p className="text-xl font-bold text-foreground tracking-tight mt-2">
            {value}
          </p>
          {delta && (
            <p className="mt-0.5 text-xs font-medium text-success">{delta}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default StatCard;