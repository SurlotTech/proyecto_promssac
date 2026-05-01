import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { PackageOpen, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { toast } from "sonner";
import NewProductDialog from "@/components/orders/NewProductDialog";
import type { OrderProductRow } from "@/domain/orderProducts";
import {
  readOrderDraft,
  type OrderProductsLocationState,
} from "@/lib/orderCreationDraft";

const OrdenProductos = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [displayOrderId, setDisplayOrderId] = useState<string | null>(null);
  const [products, setProducts] = useState<OrderProductRow[]>([]);
  const [newProductOpen, setNewProductOpen] = useState(false);

  useEffect(() => {
    const state = location.state as OrderProductsLocationState | null;
    const fromNav = state?.displayOrderId?.trim();
    const fromDraft = readOrderDraft()?.displayOrderId?.trim();
    const id = fromNav || fromDraft;
    if (!id) {
      toast.error("No hay una orden en contexto. Vuelve a completar la orden.");
      navigate("/ordenes", { replace: true });
      return;
    }
    setDisplayOrderId(id);
  }, [location.state, navigate]);

  const subtitle = useMemo(
    () => (displayOrderId ? `Líneas de la orden ${displayOrderId}` : ""),
    [displayOrderId],
  );

  const handleNewProduct = () => setNewProductOpen(true);

  if (!displayOrderId) {
    return (
      <div className="flex flex-1 items-center justify-center p-8 text-sm text-muted-foreground">
        Cargando…
      </div>
    );
  }

  return (
    <div className="animate-fade-in flex min-h-0 flex-1 flex-col bg-background">
      <div className="border-b border-border px-4 py-4 sm:px-6 lg:px-8">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/ordenes" className="font-medium">
                  Órdenes
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/ordenes/completar" className="font-medium">
                  Completar orden
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Productos</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-[28px]">
              Productos
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
          </div>
          <Button
            type="button"
            size="sm"
            className="h-9 w-full shrink-0 gap-2 bg-primary shadow-glow hover:bg-primary-hover sm:w-auto"
            onClick={handleNewProduct}
          >
            <Plus className="size-4 shrink-0" strokeWidth={2.25} />
            Nuevo producto
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-6xl">
          <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
            <div className="overflow-x-auto scrollbar-thin">
              <table className="w-full min-w-[720px] text-sm">
                <thead>
                  <tr className="border-b border-border bg-surface-muted text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    <th className="px-4 py-3.5 sm:px-5">Código</th>
                    <th className="px-4 py-3.5 sm:px-5">Orden</th>
                    <th className="px-4 py-3.5 sm:px-5">Producto</th>
                    <th className="px-4 py-3.5 sm:px-5 text-right">Precio unitario</th>
                    <th className="px-4 py-3.5 sm:px-5 text-right">Cantidad</th>
                    <th className="px-4 py-3.5 sm:px-5">Campo personalizado</th>
                    <th className="px-4 py-3.5 sm:px-5">Fecha de creación</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {products.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-16 sm:px-5 sm:py-20">
                        <div className="mx-auto flex max-w-md flex-col items-center text-center">
                          <div className="flex size-16 items-center justify-center rounded-full border-2 border-dashed border-primary/35 bg-primary-soft/60 text-primary shadow-inner">
                            <PackageOpen className="size-8 stroke-[1.35]" aria-hidden />
                          </div>
                          <p className="mt-5 text-base font-semibold text-foreground">
                            No existen productos para visualizar
                          </p>
                          <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                            Añade líneas a esta orden para ver el detalle de productos, precios y cantidades
                            en esta vista.
                          </p>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="mt-6 h-9 gap-2 border-primary/50 text-primary hover:bg-primary-soft"
                            onClick={handleNewProduct}
                          >
                            <Plus className="size-4 shrink-0" strokeWidth={2.25} />
                            Nuevo producto
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    products.map((p) => (
                      <tr key={p.id} className="transition-colors hover:bg-surface-muted/80">
                        <td className="px-4 py-3.5 font-medium tabular-nums text-foreground sm:px-5">
                          {p.code}
                        </td>
                        <td className="px-4 py-3.5 tabular-nums text-muted-foreground sm:px-5">{p.orderId}</td>
                        <td className="px-4 py-3.5 text-foreground sm:px-5">{p.name}</td>
                        <td className="px-4 py-3.5 text-right font-medium tabular-nums text-foreground sm:px-5">
                          S/ {p.unitPrice.toLocaleString("es-PE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                        <td className="px-4 py-3.5 text-right tabular-nums text-foreground sm:px-5">{p.quantity}</td>
                        <td className="px-4 py-3.5 text-muted-foreground sm:px-5">{p.customField}</td>
                        <td className="px-4 py-3.5 text-muted-foreground sm:px-5">{p.createdAt}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <NewProductDialog
        open={newProductOpen}
        onOpenChange={setNewProductOpen}
        orderDisplayId={displayOrderId}
        onSaved={(row) => setProducts((prev) => [...prev, row])}
      />
    </div>
  );
};

export default OrdenProductos;
