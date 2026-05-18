import { useEffect, useMemo, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import type { OrderProductRow } from "@/domain/orderProducts";
import { mapOrderProductLineDtoToRow } from "@/lib/mapOrderProductLine";
import {
  createEmptyProductLineForm,
  evaluateProductLineForm,
  isDecimalInputFragmentValid,
  normalizeQuantityInputDigits,
  orderProductRowToFormValues,
  weightFieldHasSyntaxError,
  type OrderProductLineFormValues,
} from "@/lib/orderProductLineForm";
import { cn, errorMessageFromUnknown } from "@/lib/utils";
import { ordersApi } from "@/services/orders.api";
import { toast } from "sonner";

const inputClass =
  "h-9 border-border/80 text-sm font-medium shadow-sm focus-visible:ring-2 focus-visible:ring-ring";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orderDisplayId: string;
  onSaved: (row: OrderProductRow) => void;
  editRow?: OrderProductRow | null;
  onUpdated?: (row: OrderProductRow) => void;
}

export default function NewProductDialog({
  open,
  onOpenChange,
  orderDisplayId,
  onSaved,
  editRow = null,
  onUpdated,
}: Props) {
  const [form, setForm] = useState<OrderProductLineFormValues>(() => createEmptyProductLineForm());
  const [saving, setSaving] = useState(false);

  const isEditing = editRow !== null;

  useEffect(() => {
    if (!open) return;
    setForm(isEditing && editRow ? orderProductRowToFormValues(editRow) : createEmptyProductLineForm());
  }, [open, isEditing, editRow?.id]);

  const parsed = useMemo(() => evaluateProductLineForm(form), [form]);

  const weightHasError = weightFieldHasSyntaxError(form.weight);

  const submitDisabled = parsed.ok !== true || saving;

  async function handleSave(): Promise<void> {
    if (parsed.ok !== true) {
      toast.error("Completa los campos obligatorios con valores válidos.");
      return;
    }

    setSaving(true);
    try {
      const dto = isEditing && editRow
        ? await ordersApi.updateProductLine(orderDisplayId, editRow.id, parsed.payload)
        : await ordersApi.createProductLine(orderDisplayId, parsed.payload);

      const mapped = mapOrderProductLineDtoToRow(dto);

      if (isEditing) {
        onUpdated?.(mapped);
        toast.success(`Producto ${mapped.code} actualizado.`);
      } else {
        onSaved(mapped);
        toast.success(`Producto ${mapped.code} añadido a la orden.`);
      }
      onOpenChange(false);
    } catch (error: unknown) {
      toast.error(errorMessageFromUnknown(error, "No se pudo guardar el producto."));
    } finally {
      setSaving(false);
    }
  }

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
              {isEditing ? "Editar producto" : "Nuevo producto"}
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
                    onChange={(e) =>
                      setForm((f) => ({ ...f, code: e.target.value }))
                    }
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
                    onChange={(e) =>
                      setForm((f) => ({ ...f, name: e.target.value }))
                    }
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
                    onChange={(e) => {
                      const val = e.target.value;
                      if (isDecimalInputFragmentValid(val)) {
                        setForm((f) => ({ ...f, price: val }));
                      }
                    }}
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
                        quantity: normalizeQuantityInputDigits(e.target.value),
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
                      if (isDecimalInputFragmentValid(val)) {
                        setForm((f) => ({ ...f, weight: val }));
                      }
                    }}
                    placeholder="kg"
                    className={cn(
                      inputClass,
                      "tabular-nums",
                      weightHasError && "border-destructive focus-visible:ring-destructive",
                    )}
                    autoComplete="off"
                  />
                </div>
                <div className="space-y-1.5 sm:col-span-2">
                  <Label htmlFor="np-custom" className="text-xs text-muted-foreground">
                    Campo personalizado
                  </Label>
                  <Input
                    id="np-custom"
                    value={form.customField}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, customField: e.target.value }))
                    }
                    placeholder="Opcional"
                    className={inputClass}
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
                disabled={submitDisabled}
              >
                {saving ? "Guardando…" : isEditing ? "Actualizar" : "Guardar"}
              </Button>
            </div>
          </footer>
        </div>
      </DialogContent>
    </Dialog>
  );
}
