import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
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
  fechaRuta: string;
  autoCode: boolean;
}

function emptyForm(): NewOrderFormState {
  return {
    orderNumber: "",
    routeId: "",
    fechaRuta: format(new Date(), "yyyy-MM-dd"),
    autoCode: false,
  };
}

function validateForm(form: NewOrderFormState): string | null {
  if (!(form.autoCode || form.orderNumber.trim().length > 0)) {
    return "Indica un número de orden o activa código automático.";
  }
  if (!form.fechaRuta?.trim()) {
    return "Indica la fecha de ruta.";
  }
  return null;
}

function buildCreateInput(form: NewOrderFormState): OrderCreateInput {
  const numero = form.autoCode
    ? `ORD-AUTO-${Date.now().toString(36).toUpperCase()}`
    : form.orderNumber.trim();
  return {
    numeroOrden: numero,
    fechaRuta: form.fechaRuta,
    ...(form.routeId ? { rutaId: form.routeId } : {}),
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
  const fechaOk = Boolean(form.fechaRuta?.trim());
  const canSubmit = orderOk && fechaOk;

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
    orderOk,
    fechaOk,
    canSubmit,
    isPending: createMutation.isPending,
    saveOnly,
    saveAndGoToContact,
  };
}
