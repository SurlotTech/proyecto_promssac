import { PackageOpen, Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { OrderProductRow } from "@/domain/orderProducts";
import { formatSolAmount } from "@/lib/formatCurrency";

const COLUMN_COUNT = 9;

interface Props {
  loading: boolean;
  rows: OrderProductRow[];
  onAddProduct: () => void;
  onEditProduct: (row: OrderProductRow) => void;
  onDeleteProduct: (row: OrderProductRow) => void | Promise<void>;
}

export default function OrderProductsTable({
  loading,
  rows,
  onAddProduct,
  onEditProduct,
  onDeleteProduct,
}: Props) {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card/40 backdrop-blur-md shadow-sm">
      <div className="overflow-x-auto scrollbar-thin">
        <table className="w-full min-w-[720px] text-sm">
          <thead>
            <tr className="border-b border-border bg-surface-muted text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <th className="px-4 py-3.5 sm:px-5">Código</th>
              <th className="px-4 py-3.5 sm:px-5">Orden</th>
              <th className="px-4 py-3.5 sm:px-5">Producto</th>
              <th className="px-4 py-3.5 sm:px-5 text-right">Precio unitario</th>
              <th className="px-4 py-3.5 sm:px-5 text-right">Cantidad</th>
              <th className="px-4 py-3.5 sm:px-5 text-right">Peso</th>
              <th className="px-4 py-3.5 sm:px-5">Campo personalizado</th>
              <th className="px-4 py-3.5 sm:px-5">Fecha de creación</th>
              <th className="px-4 py-3.5 text-right sm:px-5">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {loading ? (
              <tr>
                <td
                  colSpan={COLUMN_COUNT}
                  className="px-4 py-12 text-center text-sm text-muted-foreground sm:px-5"
                >
                  Cargando productos…
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={COLUMN_COUNT} className="px-4 py-16 sm:px-5 sm:py-20">
                  <EmptyProductLinesState onAddProduct={onAddProduct} />
                </td>
              </tr>
            ) : (
              rows.map((p) => (
                <ProductLineRow
                  key={p.id}
                  row={p}
                  onEdit={onEditProduct}
                  onDelete={onDeleteProduct}
                />
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function EmptyProductLinesState({ onAddProduct }: Pick<Props, "onAddProduct">) {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center text-center">
      <div className="flex size-16 items-center justify-center rounded-full border-2 border-dashed border-primary/35 bg-primary-soft/60 text-primary shadow-inner">
        <PackageOpen className="size-8 stroke-[1.35]" aria-hidden />
      </div>
      <p className="mt-5 text-base font-semibold text-foreground">
        No existen productos para visualizar
      </p>
      <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
        Añade líneas a esta orden para ver el detalle de productos, precios y cantidades en esta
        vista.
      </p>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="mt-6 h-9 gap-2 border-primary/50 text-primary hover:bg-primary-soft"
        onClick={onAddProduct}
      >
        <Plus className="size-4 shrink-0" strokeWidth={2.25} />
        Nuevo producto
      </Button>
    </div>
  );
}

interface RowProps {
  row: OrderProductRow;
  onEdit: (row: OrderProductRow) => void;
  onDelete: (row: OrderProductRow) => void | Promise<void>;
}

function ProductLineRow({ row: p, onEdit, onDelete }: RowProps) {
  const priceFormatted = formatSolAmount(p.unitPrice);

  return (
    <tr className="transition-colors hover:bg-surface-muted/80">
      <td className="px-4 py-3.5 font-medium tabular-nums text-foreground sm:px-5">{p.code}</td>
      <td className="px-4 py-3.5 tabular-nums text-muted-foreground sm:px-5">{p.orderId}</td>
      <td className="px-4 py-3.5 text-foreground sm:px-5">{p.name}</td>
      <td className="px-4 py-3.5 text-right font-medium tabular-nums text-foreground sm:px-5">
        S/ {priceFormatted}
      </td>
      <td className="px-4 py-3.5 text-right tabular-nums text-foreground sm:px-5">{p.quantity}</td>
      <td className="px-4 py-3.5 text-right tabular-nums text-muted-foreground sm:px-5">
        {p.weight != null ? `${p.weight} kg` : <span className="text-muted-foreground/40">—</span>}
      </td>
      <td className="px-4 py-3.5 text-muted-foreground sm:px-5">{p.customField}</td>
      <td className="px-4 py-3.5 text-muted-foreground sm:px-5">{p.createdAt}</td>
      <td className="px-4 py-3.5 text-right sm:px-5">
        <div className="flex justify-end gap-1">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-8 text-muted-foreground hover:text-foreground"
            aria-label={`Editar ${p.code}`}
            onClick={() => onEdit(p)}
          >
            <Pencil className="size-4" strokeWidth={2} />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-8 text-muted-foreground hover:text-destructive"
            aria-label={`Eliminar ${p.code}`}
            onClick={() => void onDelete(p)}
          >
            <Trash2 className="size-4" strokeWidth={2} />
          </Button>
        </div>
      </td>
    </tr>
  );
}
