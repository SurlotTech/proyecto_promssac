import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { OrderProductRow } from "@/domain/orderProducts";
import { ordersApi } from "@/services/orders.api";

const inputClass =
  "h-9 border-border/80 text-sm font-medium shadow-sm focus-visible:ring-2 focus-visible:ring-ring";

function emptyForm() {
  return {
    code: "",
    name: "",
    price: "",
    quantity: "",
    weight: "",
  };
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orderDisplayId: string;
  onSaved: (row: OrderProductRow) => void;
}

const NewProductDialog = ({ open, onOpenChange, orderDisplayId, onSaved }: Props) => {
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) {
      setForm(emptyForm());
    }
  }, [open]);

  const priceNum = parseFloat(form.price.replace(",", "."));
  const qtyNum = parseInt(form.quantity, 10);
  const weightNum = form.weight.trim() ? parseFloat(form.weight.replace(",", ".")) : undefined;
  const weightValid = !form.weight.trim() || (!Number.isNaN(weightNum!) && weightNum! >= 0);
  const requiredOk =
    form.code.trim() &&
    form.name.trim() &&
    form.price.trim() &&
    !Number.isNaN(priceNum) &&
    priceNum >= 0 &&
    form.quantity.trim() &&
    !Number.isNaN(qtyNum) &&
    qtyNum > 0 &&
    weightValid;

  const handleSave = async () => {
    if (!requiredOk) {
      toast.error("Completa los campos obligatorios con valores válidos.");
      return;
    }
    setSaving(true);
    try {
      const row = await ordersApi.createProductLine(orderDisplayId, {
        code: form.code.trim(),
        name: form.name.trim(),
        unitPrice: priceNum,
        quantity: qtyNum,
        ...(weightNum !== undefined && { weight: weightNum }),
      });
      const mapped: OrderProductRow = {
        id: row.id,
        code: row.code,
        orderId: row.orderId,
        name: row.name,
        unitPrice: row.unitPrice,
        quantity: row.quantity,
        weight: row.weight,
        customField: row.customField,
        createdAt: row.createdAt,
      };
      onSaved(mapped);
      toast.success(`Producto ${mapped.code} añadido a la orden.`);
      onOpenChange(false);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "No se pudo guardar el producto.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          "max-h-[min(90vh,640px)] gap-0 overflow-hidden p-0 sm:max-w-lg",
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
              aria-label="Cerrar"
            >
              <ArrowLeft className="h-4 w-4" strokeWidth={2} />
            </Button>
            <DialogTitle className="text-lg font-semibold tracking-tight text-foreground">
              Nuevo producto
            </DialogTitle>
          </header>

          <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-5">
            <p className="mb-3 text-sm leading-relaxed text-muted-foreground">
              Ingresa la información pertinente a tu producto para esta orden ({orderDisplayId}).
            </p>
            <p className="mb-4 text-[11px] leading-snug text-muted-foreground">
              <span className="font-semibold text-primary">*</span> Indica que el campo es obligatorio
            </p>

            <section className="space-y-3">
              <div className="flex items-center gap-2">
                <h3 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Datos del producto
                </h3>
                <Separator className="flex-1" />
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="np-code" className="text-xs text-muted-foreground">
                    Código del producto <span className="text-primary">*</span>
                  </Label>
                  <Input
                    id="np-code"
                    value={form.code}
                    onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))}
                    placeholder="Ej: SKU-88421"
                    className={cn(inputClass, "tabular-nums")}
                    autoComplete="off"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="np-name" className="text-xs text-muted-foreground">
                    Producto <span className="text-primary">*</span>
                  </Label>
                  <Input
                    id="np-name"
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    placeholder="Nombre o descripción breve"
                    className={inputClass}
                    autoComplete="off"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="np-price" className="text-xs text-muted-foreground">
                    Precio unitario <span className="text-primary">*</span>
                  </Label>
                  <Input
                    id="np-price"
                    type="text"
                    inputMode="decimal"
                    value={form.price}
                    onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                    placeholder="0.00"
                    className={cn(inputClass, "tabular-nums")}
                    autoComplete="off"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="np-qty" className="text-xs text-muted-foreground">
                    Cantidad <span className="text-primary">*</span>
                  </Label>
                  <Input
                    id="np-qty"
                    type="text"
                    inputMode="numeric"
                    value={form.quantity}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        quantity: e.target.value.replace(/\D/g, ""),
                      }))
                    }
                    placeholder="1"
                    className={cn(inputClass, "tabular-nums")}
                    autoComplete="off"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="np-weight" className="text-xs text-muted-foreground">
                    Peso
                  </Label>
                  <Input
                    id="np-weight"
                    type="text"
                    inputMode="decimal"
                    value={form.weight}
                    onChange={(e) => {
                      const val = e.target.value;
                      // Solo permite dígitos, coma y punto (número decimal positivo)
                      if (/^[\d]*[.,]?[\d]*$/.test(val)) {
                        setForm((f) => ({ ...f, weight: val }));
                      }
                    }}
                    placeholder="kg"
                    className={cn(
                      inputClass,
                      "tabular-nums",
                      form.weight && !weightValid && "border-destructive focus-visible:ring-destructive",
                    )}
                    autoComplete="off"
                  />
                </div>
              </div>
            </section>
          </div>

          <footer className="shrink-0 border-t border-border bg-muted/30 px-4 py-3 sm:px-5">
            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end sm:gap-3">
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
                size="sm"
                className="h-9 w-full bg-primary text-primary-foreground hover:bg-primary-hover sm:w-auto sm:min-w-[140px]"
                onClick={() => void handleSave()}
                disabled={!requiredOk || saving}
              >
                {saving ? "Guardando…" : "Guardar"}
              </Button>
            </div>
          </footer>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NewProductDialog;
