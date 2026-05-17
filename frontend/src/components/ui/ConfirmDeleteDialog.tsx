import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle, X } from "lucide-react";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description: string;
  confirmLabel?: string;
  isPending?: boolean;
  onConfirm: () => void;
};

export default function ConfirmDeleteDialog({
  open,
  onOpenChange,
  title = "Eliminar",
  description,
  confirmLabel = "Eliminar",
  isPending = false,
  onConfirm,
}: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg [&>button]:hidden">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-destructive/10 text-destructive">
                <AlertTriangle className="size-5" />
              </div>
              <DialogTitle>{title}</DialogTitle>
            </div>
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="ml-auto rounded-md p-1.5 text-destructive hover:bg-destructive/10"
              disabled={isPending}
            >
              <X className="size-5" />
            </button>
          </div>
          <DialogDescription className="pt-2">{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter className="sm:justify-center">
          <Button type="button" variant="destructive" disabled={isPending} onClick={onConfirm}>
            {isPending ? "Eliminando…" : confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}