import type { Dispatch, SetStateAction } from "react";
import { Info } from "lucide-react";
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
import { cn } from "@/lib/utils";
import type { OrderRouteOption } from "@/domain/orders";
import type { NewOrderFormState } from "@/hooks/useNewOrderDialog";

const selectTriggerClass =
  "h-9 w-full border-border/80 bg-background px-3 text-sm shadow-sm transition-colors hover:bg-muted/50 focus:ring-2 focus:ring-ring focus:ring-offset-0 [&>span]:line-clamp-1 [&>span]:w-full [&>span]:truncate [&>span]:text-left [&>span]:font-semibold [&>span]:text-foreground [&>span[data-placeholder]]:font-normal [&>span[data-placeholder]]:text-muted-foreground";

const orderInputClass =
  "h-9 border-border/80 text-sm font-medium shadow-sm focus-visible:ring-2 focus-visible:ring-ring";

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

type SetForm = Dispatch<SetStateAction<NewOrderFormState>>;

interface Props {
  form: NewOrderFormState;
  setForm: SetForm;
  routeOptions: OrderRouteOption[];
}

const NewOrderDialogForm = ({ form, setForm, routeOptions }: Props) => (
  <>
    <p className="mb-3 text-sm leading-relaxed text-muted-foreground">
      Crea una nueva orden asignándole un ID. Puedes asignarle una ruta. Al crear la orden podrás
      completar opcionalmente los datos de contacto.
    </p>
    <p className="mb-4 text-[11px] leading-snug text-muted-foreground">
      <span className="font-semibold text-primary">*</span> Indica que el campo es obligatorio
    </p>

    <section className="space-y-3">
      <div className="space-y-1.5">
        <Label htmlFor="order-route-date" className="text-xs text-muted-foreground">
          Fecha de ruta <span className="text-primary">*</span>
        </Label>
        <Input
          id="order-route-date"
          type="date"
          value={form.fechaRuta}
          onChange={(e) => setForm((f) => ({ ...f, fechaRuta: e.target.value }))}
          className={cn(orderInputClass, "w-full max-w-[11rem] tabular-nums sm:max-w-none")}
        />
      </div>

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
            <p className="text-[11px] text-muted-foreground">El identificador se generará al guardar.</p>
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
  </>
);

export default NewOrderDialogForm;
