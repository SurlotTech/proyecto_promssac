import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import type { OrderProductRow } from "@/domain/orderProducts";
import { COMPLETAR_STEP_PERSONALIZADOS_INDEX } from "@/lib/completarOrden/constants";
import {
  readOrderDraft,
  type OrderCompletarLocationState,
  type OrderProductsLocationState,
} from "@/lib/orderCreationDraft";
import { mapOrderProductLineDtoToRow } from "@/lib/mapOrderProductLine";
import { errorMessageFromUnknown } from "@/lib/utils";
import { ordersApi } from "@/services/orders.api";

export function useOrderProductosPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const [displayOrderId, setDisplayOrderId] = useState<string | null>(null);
  const [products, setProducts] = useState<OrderProductRow[]>([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<OrderProductRow | null>(null);

  useEffect(() => {
    const state = location.state as OrderProductsLocationState | null;
    const fromNav = state?.displayOrderId?.trim();
    const fromDraft = readOrderDraft()?.displayOrderId?.trim();
    const id = fromNav ?? fromDraft;
    if (!id) {
      toast.error("No hay una orden en contexto. Vuelve a completar la orden.");
      navigate("/ordenes", { replace: true });
      return;
    }
    setDisplayOrderId(id);
  }, [location.state, navigate]);

  useEffect(() => {
    if (!displayOrderId) return;

    let cancelled = false;
    setProductsLoading(true);

    ordersApi
      .listProductLines(displayOrderId)
      .then((rows) => {
        if (!cancelled) {
          setProducts(rows.map(mapOrderProductLineDtoToRow));
        }
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          toast.error(
            errorMessageFromUnknown(error, "No se pudieron cargar los productos."),
          );
        }
      })
      .finally(() => {
        if (!cancelled) setProductsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [displayOrderId]);

  const subtitle = useMemo(
    () => (displayOrderId ? `Líneas de la orden ${displayOrderId}` : ""),
    [displayOrderId],
  );

  /** Estado para `Link`/`navigate` hacia «Completar orden» en el paso Personalizados. */
  const completarPersonalizadosState = useMemo((): OrderCompletarLocationState | null => {
    const d = readOrderDraft();
    const id = displayOrderId?.trim();
    const draftId = d?.displayOrderId?.trim();
    if (!id || !draftId || id !== draftId) return null;
    return {
      orderDraft: d,
      resumeStep: COMPLETAR_STEP_PERSONALIZADOS_INDEX,
    };
  }, [displayOrderId]);

  const openCreateDialog = useCallback(() => {
    setEditingProduct(null);
    setDialogOpen(true);
  }, []);

  const openEditDialog = useCallback((row: OrderProductRow) => {
    setEditingProduct(row);
    setDialogOpen(true);
  }, []);

  const closeDialog = useCallback((open: boolean) => {
    setDialogOpen(open);
    if (!open) setEditingProduct(null);
  }, []);

  const appendProduct = useCallback((row: OrderProductRow) => {
    setProducts((prev) => [...prev, row]);
  }, []);

  const replaceProduct = useCallback((row: OrderProductRow) => {
    setProducts((prev) => prev.map((p) => (p.id === row.id ? row : p)));
  }, []);

  const removeProductLocally = useCallback((id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const deleteProduct = useCallback(
    async (row: OrderProductRow) => {
      if (!displayOrderId) return;

      const confirmed = window.confirm(
        `¿Eliminar el producto «${row.code}» de esta orden?`,
      );
      if (!confirmed) return;

      try {
        await ordersApi.deleteProductLine(displayOrderId, row.id);
        removeProductLocally(row.id);
        toast.success("Producto eliminado.");
      } catch (error: unknown) {
        toast.error(
          errorMessageFromUnknown(error, "No se pudo eliminar el producto."),
        );
      }
    },
    [displayOrderId, removeProductLocally],
  );

  const finishAndReturnToCompletar = useCallback(() => {
    if (!displayOrderId) return;
    const draft = readOrderDraft();
    const draftId = draft?.displayOrderId?.trim();
    if (!draftId || draftId !== displayOrderId.trim()) {
      toast.error("No se encontró el borrador de la orden. Vuelve desde Completar orden.");
      navigate("/ordenes", { replace: true });
      return;
    }
    const n = products.length;
    const plural = n !== 1 ? "s" : "";
    toast.success(
      n > 0
        ? `Listo: ${n} línea${plural} registrada${plural}. Continúa con los datos de la orden.`
        : `Volvimos al asistente. Puedes seguir editando los campos personalizados.`,
    );
    navigate("/ordenes/completar", {
      state: {
        orderDraft: draft,
        resumeStep: COMPLETAR_STEP_PERSONALIZADOS_INDEX,
      },
    });
  }, [displayOrderId, navigate, products.length]);

  return {
    displayOrderId,
    products,
    productsLoading,
    subtitle,
    /** Para breadcrumb/link «Completar orden»: si es null el link va sin estado (solo borrador). */
    completarPersonalizadosState,
    dialog: {
      open: dialogOpen,
      onOpenChange: closeDialog,
      editingProduct,
      orderDisplayId: displayOrderId ?? "",
      onProductCreated: appendProduct,
      onProductUpdated: replaceProduct,
    },
    actions: {
      openCreateDialog,
      openEditDialog,
      deleteProduct,
      finishAndReturnToCompletar,
    },
  };
}
