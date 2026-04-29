import { Check, Circle } from "lucide-react";
import { cn } from "@/lib/utils";

interface Step {
  id: string;
  title: string;
  description?: string;
}

interface StepperProps {
  steps: Step[];
  currentStep: number;
  onStepChange?: (step: number) => void;
  completedSteps?: number[];
  orientation?: "horizontal" | "vertical";
}

const Stepper = ({
  steps,
  currentStep,
  onStepChange,
  completedSteps = [],
  orientation = "horizontal",
}: StepperProps) => {
  const isCompleted = (index: number) => completedSteps.includes(index);
  const isCurrent = (index: number) => index === currentStep;
  const isClickable = (index: number) => onStepChange && (isCompleted(index) || index < currentStep);

  const handleStepClick = (index: number) => {
    if (isClickable(index)) {
      onStepChange(index);
    }
  };

  return (
    <div
      className={cn(
        "flex gap-2",
        orientation === "horizontal" && "w-full overflow-x-auto pb-2",
        orientation === "vertical" && "flex-col gap-0"
      )}
    >
      {steps.map((step, index) => {
        const completed = isCompleted(index);
        const current = isCurrent(index);
        const clickable = isClickable(index);

        return (
          <div
            key={step.id}
            className={cn(
              "flex items-center gap-3",
              orientation === "horizontal" && "shrink-0",
              orientation === "vertical" && "relative pb-6 last:pb-0"
            )}
          >
            <button
              type="button"
              onClick={() => handleStepClick(index)}
              disabled={!clickable}
              className={cn(
                "flex items-center gap-2.5 transition-colors",
                clickable && "cursor-pointer hover:opacity-80",
                !clickable && "cursor-default"
              )}
            >
              <div
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full border-2 text-sm font-semibold transition-all",
                  completed && "border-primary bg-primary text-primary-foreground",
                  current && "border-primary bg-primary-soft text-primary",
                  !completed && !current && "border-muted-foreground/30 bg-muted text-muted-foreground"
                )}
              >
                {completed ? (
                  <Check className="h-4 w-4" strokeWidth={2.5} />
                ) : (
                  <span>{index + 1}</span>
                )}
              </div>
              <div
                className={cn(
                  "text-left",
                  orientation === "vertical" && "min-w-[140px]"
                )}
              >
                <p
                  className={cn(
                    "text-sm font-medium transition-colors",
                    (completed || current) && "text-foreground",
                    !completed && !current && "text-muted-foreground"
                  )}
                >
                  {step.title}
                </p>
                {step.description && (
                  <p className="text-xs text-muted-foreground hidden sm:block">
                    {step.description}
                  </p>
                )}
              </div>
            </button>
            {orientation === "horizontal" && index < steps.length - 1 && (
              <div
                className={cn(
                  "h-0.5 w-8 shrink-0 transition-colors sm:w-12",
                  completed ? "bg-primary" : "bg-muted-foreground/20"
                )}
              />
            )}
            {orientation === "vertical" && index < steps.length - 1 && (
              <div
                className={cn(
                  "absolute left-[15px] top-10 h-6 w-0.5 transition-colors",
                  completed ? "bg-primary" : "bg-muted-foreground/20"
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
};

export { Stepper };
export type { StepperProps, Step };