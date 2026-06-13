import { cn } from "@/lib/utils";

export interface StatusTab {
  status: string;
  label: string;
  count: number;
  variant: "all" | "success" | "warning" | "danger" | "neutral";
}

interface Props {
  tabs: StatusTab[];
  activeStatus: string;
  onChange: (status: string) => void;
}

const badgeVariant: Record<StatusTab["variant"], string> = {
  all: "bg-[#1f2933] text-white",
  success: "bg-[#d8f7e5] text-[#009f5b]",
  warning: "bg-[#fff0d2] text-[#c97900]",
  danger: "bg-[#ffe1dc] text-[#d92316]",
  neutral: "bg-[#e9eef2] text-[#5f7282]",
};

const StatusTabs = ({ tabs, activeStatus, onChange }: Props) => {
  return (
    <div className="flex h-12 items-center gap-9 border-b border-[#eef0f3] bg-white/30 px-5">
      {tabs.map((tab) => {
        const isActive = tab.status === activeStatus;
        return (
          <button
            key={tab.status}
            onClick={() => onChange(tab.status)}
            className={cn(
              "inline-flex h-12 items-center gap-2 border-b-2 text-sm font-medium transition-colors",
              isActive
                ? "border-[#111827] text-[#1f2933] font-bold"
                : "border-transparent text-[#52677a] hover:text-[#1f2933]",
            )}
          >
            {tab.label}
            <span
              className={cn(
                "rounded-md px-2 py-0.5 text-xs font-bold",
                badgeVariant[tab.variant],
              )}
            >
              {tab.count}
            </span>
          </button>
        );
      })}
    </div>
  );
};

export default StatusTabs;
