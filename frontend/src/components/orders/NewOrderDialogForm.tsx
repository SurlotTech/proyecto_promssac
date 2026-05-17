import type { Dispatch, SetStateAction } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type { OrderRouteOption } from "@/domain/orders";
import type { NewOrderFormState } from "@/hooks/useNewOrderDialog";

const selectTriggerClass =
  "h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-900 shadow-sm transition-all hover:border-slate-300 focus:border-ring focus:ring-4 focus:ring-ring/20 focus:ring-offset-0 focus-visible:ring-offset-0 [&>span]:line-clamp-1 [&>span]:w-full [&>span]:truncate [&>span]:text-left [&>span[data-placeholder]]:font-normal [&>span[data-placeholder]]:text-slate-400";

const orderInputClass =
  "h-11 rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-900 shadow-sm transition-all placeholder:text-slate-400 hover:border-slate-300 focus-visible:border-ring focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/20 focus-visible:ring-offset-0";

type SetForm = Dispatch<SetStateAction<NewOrderFormState>>;

interface Props {
  form: NewOrderFormState;
  setForm: SetForm;
  routeOptions: OrderRouteOption[];
}

const NewOrderDialogForm = ({ form, setForm, routeOptions }: Props) => (
  <>
    <section className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="order-number" className="text-[0.8rem] font-medium text-slate-700">
          Número de orden <span className="text-red-500">*</span>
        </Label>
        <Input
          id="order-number"
          value={form.orderNumber}
          onChange={(e) => setForm((f) => ({ ...f, orderNumber: e.target.value }))}
          placeholder="Ej: ORD-2604-099"
          className={cn(orderInputClass, "w-full tabular-nums shadow-none")}
          autoComplete="off"
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="order-route-date" className="text-[0.8rem] font-medium text-slate-700">
            Fecha de ruta <span className="text-red-500">*</span>
          </Label>
          <Input
            id="order-route-date"
            type="date"
            value={form.fechaRuta}
            onChange={(e) => setForm((f) => ({ ...f, fechaRuta: e.target.value }))}
            className={cn(orderInputClass, "w-full tabular-nums block shadow-none")}
          />
        </div>

        <div className="space-y-2">
          <Label className="text-[0.8rem] font-medium text-slate-700">Asignar a ruta</Label>
          <Select
            value={form.routeId || undefined}
            onValueChange={(v) => setForm((f) => ({ ...f, routeId: v }))}
          >
            <SelectTrigger className={`${selectTriggerClass} shadow-none`}>
              <SelectValue placeholder="Seleccionar ruta" />
            </SelectTrigger>
            <SelectContent align="start" className="rounded-xl border-slate-200 shadow-lg">
              {routeOptions.map((r) => (
                <SelectItem key={r.id} value={r.id} className="text-sm font-medium text-slate-700 focus:bg-slate-50">
                  {r.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </section>
  </>
);

export default NewOrderDialogForm;
