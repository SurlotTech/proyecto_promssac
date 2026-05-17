import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import type { Client } from "@/domain/clients";
import { cn } from "@/lib/utils";

type Props = {
  cliente: Client | null;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  isPending: boolean;
};

export default function ClienteActivoConfirmDialog({ cliente, onOpenChange, onConfirm, isPending }: Props) {
  return (
    <Dialog open={cliente != null} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          "sm:max-w-lg min-h-[200px] p-6 bg-white border-0 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] rounded-[1.5rem] flex flex-col items-center",
          "[&>button]:hidden",
        )}
      >
        <button
          onClick={() => onOpenChange(false)}
          className="absolute right-6 top-6 rounded-full bg-red-50 p-2 text-red-500 hover:bg-red-100 transition-colors"
          aria-label="Cerrar"
        >
          <X className="h-4 w-4" strokeWidth={2.5} />
        </button>

        <DialogHeader className="text-center">
          <DialogTitle className="text-[1.35rem] font-bold tracking-tight text-slate-900">{cliente?.activo ? "Desactivar cliente" : "Reactivar cliente"}</DialogTitle>
          <DialogDescription className="text-slate-500">
            La desactivación no borra el registro: deja de mostrarse en listas estándar y puede reactivarse después.
            {cliente?.nombre ? (
              <>
                {" "}
                Cliente: <span className="font-medium text-foreground">{cliente.nombre}</span>.
              </>
            ) : null}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="mt-6 justify-center gap-3">
          <Button
            type="button"
            variant="outline"
            className="rounded-full px-6 font-semibold border-primary/40 text-primary hover:bg-primary-soft"
            onClick={() => onOpenChange(false)}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            variant={cliente?.activo ? "destructive" : "default"}
            disabled={!cliente || isPending}
            onClick={onConfirm}
            className="rounded-full px-6 font-semibold"
          >
            {isPending ? "Guardando…" : "Confirmar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
