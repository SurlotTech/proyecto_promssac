import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { Client } from "@/domain/clients";

type Props = {
  cliente: Client | null;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  isPending: boolean;
};

export default function ClienteActivoConfirmDialog({ cliente, onOpenChange, onConfirm, isPending }: Props) {
  return (
    <Dialog open={cliente != null} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>{cliente?.activo ? "Desactivar cliente" : "Reactivar cliente"}</DialogTitle>
          <DialogDescription>
            La desactivación no borra el registro: deja de mostrarse en listas estándar y puede reactivarse después.
            {cliente?.nombre ? (
              <>
                {" "}
                Cliente: <span className="font-medium text-foreground">{cliente.nombre}</span>.
              </>
            ) : null}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            type="button"
            variant={cliente?.activo ? "destructive" : "default"}
            disabled={!cliente || isPending}
            onClick={onConfirm}
          >
            Confirmar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
