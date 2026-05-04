import { ArrowLeft } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { OrderRouteOption } from "@/domain/orders";
import { cn } from "@/lib/utils";
import { useNewOrderDialog } from "@/hooks/useNewOrderDialog";
import NewOrderDialogForm from "@/components/orders/NewOrderDialogForm";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  routeOptions: OrderRouteOption[];
}

const NewOrderDialog = ({ open, onOpenChange, routeOptions }: Props) => {
  const { form, setForm, canSubmit, isPending, saveOnly, saveAndGoToContact } = useNewOrderDialog(open);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          "max-h-[min(90vh,640px)] gap-0 overflow-hidden p-0 sm:max-w-xl",
          "[&>button]:hidden",
        )}
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <div className="flex max-h-[inherit] flex-col">
          <header className="flex shrink-0 items-center gap-2 border-b border-border px-4 py-3 sm:px-5">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-9 w-9 shrink-0 rounded-lg text-foreground hover:bg-muted"
              onClick={() => onOpenChange(false)}
              aria-label="Volver"
            >
              <ArrowLeft className="h-4 w-4" strokeWidth={2} />
            </Button>
            <DialogTitle className="text-lg font-semibold tracking-tight text-foreground">
              Nueva orden
            </DialogTitle>
          </header>

          <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-5">
            <NewOrderDialogForm form={form} setForm={setForm} routeOptions={routeOptions} />
          </div>

          <footer className="shrink-0 border-t border-border bg-muted/30 px-4 py-3 sm:px-5">
            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:flex-wrap sm:justify-end sm:gap-3">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-9 w-full sm:w-auto sm:min-w-[120px]"
                disabled={isPending}
                onClick={() => onOpenChange(false)}
              >
                Cancelar
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-9 w-full border-primary/40 text-primary hover:bg-primary-soft sm:w-auto sm:min-w-[200px]"
                onClick={() => void saveAndGoToContact(routeOptions, () => onOpenChange(false))}
                disabled={!canSubmit || isPending}
              >
                Ingresar datos de contacto
              </Button>
              <Button
                type="button"
                size="sm"
                className="h-9 w-full bg-primary text-primary-foreground hover:bg-primary-hover sm:w-auto sm:min-w-[140px]"
                onClick={() => void saveOnly(() => onOpenChange(false))}
                disabled={!canSubmit || isPending}
              >
                {isPending ? "Guardando…" : "Guardar"}
              </Button>
            </div>
          </footer>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NewOrderDialog;
