import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Info } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  persistOrderDraft,
  clearOrderDraft,
  type OrderCompletarLocationState,
  type OrderCreationDraft,
} from "@/lib/orderCreationDraft";

export type OrderRouteOption = { id: string; label: string };

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  routeOptions: OrderRouteOption[];
}

const selectTriggerClass =
  "h-9 w-full border-border/80 bg-background px-3 text-sm shadow-sm transition-colors hover:bg-muted/50 focus:ring-2 focus:ring-ring focus:ring-offset-0 [&>span]:line-clamp-1 [&>span]:w-full [&>span]:truncate [&>span]:text-left [&>span]:font-semibold [&>span]:text-foreground [&>span[data-placeholder]]:font-normal [&>span[data-placeholder]]:text-muted-foreground";

const orderInputClass =
  "h-9 border-border/80 text-sm font-medium shadow-sm focus-visible:ring-2 focus-visible:ring-ring";

function emptyForm() {
  return {
    orderNumber: "",
    routeId: "",
    autoCode: false,
  };
}

function InfoHint({ text, label }: { text: string; label: string }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          className="inline-flex size-8 shrink-0 items-center justify-center rounded-full text-info hover:bg-info-soft"
          aria-label={label}
        >
          <Info className="size-4" strokeWidth={2} />
        </button>
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-[240px] text-xs leading-snug">
        {text}
      </TooltipContent>
    </Tooltip>
  );
}

const NewOrderDialog = ({ open, onOpenChange, routeOptions }: Props) => {
  const navigate = useNavigate();
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    if (!open) {
      setForm(emptyForm());
    }
  }, [open]);

  const orderOk = form.autoCode || form.orderNumber.trim().length > 0;

  const handleSave = () => {
    if (!orderOk) {
      toast.error("Indica un número de orden o activa código automático.");
      return;
    }
    const id = form.autoCode ? "ORD-AUTO-" + Date.now().toString().slice(-6) : form.orderNumber.trim();
    clearOrderDraft();
    toast.success(`Orden ${id} registrada correctamente.`);
    onOpenChange(false);
  };

  const handleContact = () => {
    if (!orderOk) {
      toast.error("Indica un número de orden o activa código automático.");
      return;
    }
    const displayOrderId = form.autoCode
      ? `ORD-AUTO-${Date.now().toString().slice(-6)}`
      : form.orderNumber.trim();
    const draft: OrderCreationDraft = {
      displayOrderId,
      routeId: form.routeId,
      routeLabel: routeOptions.find((r) => r.id === form.routeId)?.label ?? null,
      autoCode: form.autoCode,
    };
    persistOrderDraft(draft);
    const state: OrderCompletarLocationState = { orderDraft: draft };
    navigate("/ordenes/completar", { state });
    onOpenChange(false);
  };

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
            <p className="mb-3 text-sm leading-relaxed text-muted-foreground">
              Crea una nueva orden asignándole un ID. Puedes asignarle una ruta. Al crear la orden
              podrás completar opcionalmente los datos de contacto.
            </p>
            <p className="mb-4 text-[11px] leading-snug text-muted-foreground">
              <span className="font-semibold text-primary">*</span> Indica que el campo es obligatorio
            </p>

            <section className="space-y-3">

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="order-number" className="text-xs text-muted-foreground">
                    Número de orden <span className="text-primary">*</span>
                  </Label>
                  <Input
                    id="order-number"
                    value={form.orderNumber}
                    onChange={(e) => setForm((f) => ({ ...f, orderNumber: e.target.value }))}
                    placeholder="Ej: ORD-2604-099"
                    disabled={form.autoCode}
                    className={cn(orderInputClass, "tabular-nums")}
                    autoComplete="off"
                  />
                  {form.autoCode ? (
                    <p className="text-[11px] text-muted-foreground">
                      El identificador se generará al guardar.
                    </p>
                  ) : null}
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Asignar a ruta</Label>
                  <div className="flex items-center gap-2">
                    <Select
                      value={form.routeId || undefined}
                      onValueChange={(v) => setForm((f) => ({ ...f, routeId: v }))}
                    >
                      <SelectTrigger className={cn(selectTriggerClass, "min-w-0 flex-1")}>
                        <SelectValue placeholder="Seleccionar ruta" />
                      </SelectTrigger>
                      <SelectContent align="start">
                        {routeOptions.map((r) => (
                          <SelectItem key={r.id} value={r.id} className="text-sm">
                            {r.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <InfoHint
                      label="Información sobre asignar a ruta"
                      text="Opcional. Vincula la orden a una ruta de despacho existente para planificar entregas."
                    />
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 rounded-lg border border-border/80 bg-muted/30 px-3 py-2.5 sm:gap-3">
                <Checkbox
                  id="auto-code"
                  checked={form.autoCode}
                  onCheckedChange={(checked) =>
                    setForm((f) => ({
                      ...f,
                      autoCode: checked === true,
                      orderNumber: checked === true ? "" : f.orderNumber,
                    }))
                  }
                />
                <Label
                  htmlFor="auto-code"
                  className="cursor-pointer text-sm font-medium leading-none text-foreground peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Código automático
                </Label>
                <InfoHint
                  label="Información sobre código automático"
                  text="Si está activo, el sistema asignará un identificador de orden automáticamente al guardar."
                />
              </div>
            </section>
          </div>

          <footer className="shrink-0 border-t border-border bg-muted/30 px-4 py-3 sm:px-5">
            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:flex-wrap sm:justify-end sm:gap-3">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-9 w-full sm:w-auto sm:min-w-[120px]"
                onClick={() => onOpenChange(false)}
              >
                Cancelar
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-9 w-full border-primary/40 text-primary hover:bg-primary-soft sm:w-auto sm:min-w-[200px]"
                onClick={handleContact}
                disabled={!orderOk}
              >
                Ingresar datos de contacto
              </Button>
              <Button
                type="button"
                size="sm"
                className="h-9 w-full bg-primary text-primary-foreground hover:bg-primary-hover sm:w-auto sm:min-w-[140px]"
                onClick={handleSave}
                disabled={!orderOk}
              >
                Guardar
              </Button>
            </div>
          </footer>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NewOrderDialog;
