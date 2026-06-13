import { ArrowLeft, Plus } from "lucide-react";
import { Link } from "react-router-dom";
import NewProductDialog from "@/components/orders/NewProductDialog";
import OrderProductsTable from "@/components/orders/OrderProductsTable";
import ConfirmDeleteDialog from "@/components/ui/ConfirmDeleteDialog";
import { Button } from "@/components/ui/button";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { useOrderProductosPage } from "@/hooks/useOrderProductosPage";
import type { OrderProductRow } from "@/domain/orderProducts";
import { useState } from "react";

const OrdenProductos = () => {
  const {
    displayOrderId,
    products,
    productsLoading,
    subtitle,
    completarPersonalizadosState,
    dialog,
    actions,
  } = useOrderProductosPage();

  const [productToDelete, setProductToDelete] = useState<OrderProductRow | null>(null);
  const [deleteProductPending, setDeleteProductPending] = useState(false);

  if (!displayOrderId) {
    return (
      <div className="flex flex-1 items-center justify-center p-8 text-sm text-muted-foreground">
        Cargando…
      </div>
    );
  }

  return (
    <div className="animate-fade-in flex min-h-0 flex-1 flex-col bg-transparent">
      <header className="border-b border-border px-4 py-4 sm:px-6 lg:px-8">
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
                <Link
                  to="/ordenes/completar"
                  className="font-medium"
                  {...(completarPersonalizadosState
                    ? { state: completarPersonalizadosState }
                    : {})}
                >
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
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={actions.finishAndReturnToCompletar}
              className="flex size-10 shrink-0 items-center justify-center rounded-lg text-destructive"
            >
              <ArrowLeft className="size-5" strokeWidth={2.25} />
            </button>
            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-[28px]">
              {displayOrderId}
            </h1>
          </div>
          <Button
            type="button"
            size="sm"
            className="h-12 w-full shrink-0 gap-1.5 text-base font-normal bg-primary hover:bg-primary text-white px-6 shadow-md transition-all hover:scale-105 active:scale-95 sm:w-auto"
            onClick={actions.openCreateDialog}
          >
            <Plus className="size-5 shrink-0" />
            Nuevo
          </Button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-6xl">
          <OrderProductsTable
            loading={productsLoading}
            rows={products}
            onAddProduct={actions.openCreateDialog}
            onEditProduct={actions.openEditDialog}
            onDeleteProduct={(row) => setProductToDelete(row)}
          />
        </div>
      </div>

      <NewProductDialog
        open={dialog.open}
        onOpenChange={dialog.onOpenChange}
        orderDisplayId={dialog.orderDisplayId}
        editRow={dialog.editingProduct}
        onSaved={dialog.onProductCreated}
        onUpdated={dialog.onProductUpdated}
      />
      <ConfirmDeleteDialog
        open={productToDelete != null}
        onOpenChange={(open) => {
          if (!open) setProductToDelete(null);
        }}
        title="Eliminar producto"
        description={
          productToDelete
            ? `¿Eliminar el producto «${productToDelete.code}» de esta orden? Esta acción no se puede deshacer.`
            : ""
        }
        confirmLabel="Eliminar producto"
        isPending={deleteProductPending}
        onConfirm={async () => {
          if (!productToDelete) return;
          setDeleteProductPending(true);
          try {
            await actions.deleteProduct(productToDelete);
            setProductToDelete(null);
          } finally {
            setDeleteProductPending(false);
          }
        }}
      />
    </div>
  );
};

export default OrdenProductos;
