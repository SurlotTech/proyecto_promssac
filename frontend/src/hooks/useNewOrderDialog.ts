import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { OrderRouteOption } from "@/domain/orders";
import { errorMessageFromUnknown } from "@/lib/utils";
import {
  persistOrderDraft,
  clearOrderDraft,
  type OrderCompletarLocationState,
  type OrderCreationDraft,
} from "@/lib/orderCreationDraft";
import { ordersApi, type OrderCreateInput } from "@/services/orders.api";

export interface NewOrderFormState {
  orderNumber: string;
  routeId: string;
  autoCode: boolean;
}

function emptyForm(): NewOrderFormState {
  return {
    orderNumber: `ORD-${Date.now().toString(36).toUpperCase()}`,
    routeId: "",
    autoCode: true,
  };
}

function validateForm(form: NewOrderFormState): string | null {
  if (!(form.autoCode || form.orderNumber.trim().length > 0)) {
    return "Indica un número de orden o activa código automático.";
  }
  return null;
}

function buildCreateInput(form: NewOrderFormState): OrderCreateInput {
  const numero = form.autoCode
    ? form.orderNumber.trim()
    : form.orderNumber.trim();
  return {
    numeroOrden: numero,
    rutaId: form.routeId,
  };
}

export function useNewOrderDialog(open: boolean) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [form, setForm] = useState<NewOrderFormState>(emptyForm);

  useEffect(() => {
    if (!open) {
      setForm(emptyForm());
    }
  }, [open]);

  const orderOk = form.autoCode || form.orderNumber.trim().length > 0;
  const canSubmit = orderOk && form.routeId.trim().length > 0;

  const createMutation = useMutation({
    mutationFn: (input: OrderCreateInput) => ordersApi.create(input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["ordenes"] });
    },
  });

  const runValidatedCreate = useCallback(async () => {
    const msg = validateForm(form);
    if (msg) {
      toast.error(msg);
      return null;
    }
    try {
      return await createMutation.mutateAsync(buildCreateInput(form));
    } catch (e) {
      toast.error(errorMessageFromUnknown(e, "No se pudo crear la orden."));
      return null;
    }
  }, [createMutation, form]);

  const saveOnly = useCallback(
    async (onClose: () => void) => {
      const created = await runValidatedCreate();
      if (!created) return;
      clearOrderDraft();
      toast.success(`Orden ${created.id} registrada correctamente.`);
      onClose();
    },
    [runValidatedCreate],
  );

  const saveAndGoToContact = useCallback(
    async (routeOptions: OrderRouteOption[], onClose: () => void) => {
      const created = await runValidatedCreate();
      if (!created) return;
      const draft: OrderCreationDraft = {
        displayOrderId: created.id,
        routeId: form.routeId,
        routeLabel: routeOptions.find((r) => r.id === form.routeId)?.label ?? null,
        autoCode: form.autoCode,
      };
      persistOrderDraft(draft);
      const state: OrderCompletarLocationState = { orderDraft: draft };
      navigate("/ordenes/completar", { state });
      onClose();
    },
    [form.autoCode, form.routeId, navigate, runValidatedCreate],
  );

  return {
    form,
    setForm,
    canSubmit,
    isPending: createMutation.isPending,
    saveOnly,
    saveAndGoToContact,
  };
}
