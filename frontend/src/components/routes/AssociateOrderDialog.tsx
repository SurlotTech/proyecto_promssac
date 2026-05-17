import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { ordersApi } from "@/services/orders.api";
import { useNavigate } from "react-router-dom";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  rutaId: string;
  fechaRuta: string;
  onCreated?: () => void;
}

const AssociateOrderDialog = ({ open, onOpenChange, rutaId, fechaRuta, onCreated }: Props) => {
  const [orderNumber, setOrderNumber] = useState("");
  const navigate = useNavigate();

  const createMut = useMutation({
    mutationFn: ({ toDetails, orderNum }: { toDetails: boolean; orderNum: string }) => 
      ordersApi.create({
        numeroOrden: orderNum,
        rutaId,
        fechaRuta,
        estado: "in_route"
      }).then(order => ({ order, toDetails, orderNum })),
    onSuccess: ({ order, toDetails, orderNum }) => {
      toast.success(`Orden ${orderNum} creada.`);
      onCreated?.();
      onOpenChange(false);
      setOrderNumber("");
      if (toDetails) {
        // Redirigir a completar orden con los datos necesarios
        navigate("/ordenes/completar", { state: { orderId: order.id, orderNumber: orderNum } });
      }
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const handleSave = (toDetails: boolean) => {
    if (!orderNumber.trim()) {
      toast.error("El número de orden es obligatorio.");
      return;
    }
    createMut.mutate({ toDetails, orderNum: orderNumber });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 sm:max-w-xl overflow-hidden border-none shadow-2xl">
        <div className="flex flex-col h-full bg-white">
          <DialogHeader className="p-6 border-b border-border bg-white">
            <div className="text-left space-y-1">
              <DialogTitle className="text-xl font-bold text-foreground">
                Nueva orden
              </DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground leading-relaxed">
                Crea una nueva orden asignándole un ID. Puedes asignarle un vehículo. Al crear la orden podrás proceder opcionalmente a rellenar los detalles de tu contacto.
              </DialogDescription>
            </div>
          </DialogHeader>

          <div className="p-8 space-y-6">
            <p className="text-[11px] text-muted-foreground italic">
              <span className="text-primary font-bold">*</span> Indica que el campo es obligatorio
            </p>

            <div className="space-y-2">
              <Label htmlFor="order-number" className="text-sm font-semibold text-muted-foreground">
                Número de orden <span className="text-primary">*</span>
              </Label>
              <Input
                id="order-number"
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value)}
                placeholder="Ingresar número de orden"
                className="h-12 bg-zinc-50 border-zinc-200 focus:ring-1 focus:ring-primary/20 text-base"
                autoFocus
              />
            </div>
          </div>

          <DialogFooter className="border-t border-border bg-zinc-50/50 p-6 sm:justify-end gap-3 shrink-0">
            <Button
              variant="outline"
              onClick={() => handleSave(true)}
              disabled={createMut.isPending}
              className="h-11 px-6 font-semibold border-zinc-300 text-zinc-600 hover:bg-white"
            >
              Ingresar datos de contacto
            </Button>
            <Button
              onClick={() => handleSave(false)}
              disabled={createMut.isPending}
              className="h-11 bg-primary hover:bg-primary-hover text-white px-10 font-bold shadow-lg shadow-primary/20 transition-all min-w-[120px]"
            >
              {createMut.isPending ? "Guardando..." : "Guardar"}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AssociateOrderDialog;
