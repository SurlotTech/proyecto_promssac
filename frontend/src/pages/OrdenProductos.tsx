import { ArrowLeft, Plus } from "lucide-react";
import { Link } from "react-router-dom";
import NewProductDialog from "@/components/orders/NewProductDialog";
import OrderProductsTable from "@/components/orders/OrderProductsTable";
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
            onClick={actions.openCreateDialog}
          >
            <Plus className="size-4 shrink-0" strokeWidth={2.25} />
            Nuevo producto
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
            onDeleteProduct={actions.deleteProduct}
          />

          <div className="mt-4 flex justify-end">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-10 gap-2 border-primary/55 text-primary hover:bg-primary-soft sm:min-w-[260px]"
              onClick={actions.finishAndReturnToCompletar}
            >
              <ArrowLeft className="h-4 w-4" strokeWidth={2.25} />
              Volver a campos personalizados
            </Button>
          </div>
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
    </div>
  );
};

export default OrdenProductos;
