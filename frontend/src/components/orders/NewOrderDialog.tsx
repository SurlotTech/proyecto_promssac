import { X } from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
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
          "max-h-[min(90vh,740px)] gap-0 overflow-y-auto p-8 sm:max-w-[600px] bg-white border-0 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] rounded-[1.5rem]",
          "[&>button]:hidden",
        )}
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <button
          onClick={() => onOpenChange(false)}
          className="absolute right-6 top-6 rounded-full bg-red-50 p-2 text-red-500 hover:bg-red-100 transition-colors"
          aria-label="Cerrar"
        >
          <X className="h-4 w-4" strokeWidth={2.5} />
        </button>

        <div className="flex flex-col">
          <header className="mb-6">
            <DialogTitle className="text-[1.35rem] font-bold tracking-tight text-slate-900">
              Nueva orden
            </DialogTitle>
            <DialogDescription className="mt-1.5 text-sm text-slate-500 font-normal">
              Agrega una nueva orden
            </DialogDescription>
          </header>

          <div className="">
            <NewOrderDialogForm form={form} setForm={setForm} routeOptions={routeOptions} />
          </div>

          <footer className="mt-9 mb-2 flex items-center justify-center">
            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                className="h-10 border-primary/40 text-primary hover:bg-primary-soft rounded-full px-5 font-semibold transition-colors"
                onClick={() => void saveAndGoToContact(routeOptions, () => onOpenChange(false))}
                disabled={!canSubmit || isPending}
              >
                Ingresar contacto
              </Button>
              <Button
                type="button"
                className="h-10 bg-primary hover:bg-primary-hover text-primary-foreground rounded-full px-6 font-semibold shadow-sm transition-colors"
                onClick={() => void saveOnly(() => onOpenChange(false))}
                disabled={!canSubmit || isPending}
              >
                {isPending ? "Guardando…" : "Guardar orden"}
              </Button>
            </div>
          </footer>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NewOrderDialog;
