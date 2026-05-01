export interface OrderCreationDraft {
  displayOrderId: string;
  routeId: string;
  routeLabel: string | null;
  autoCode: boolean;
}

export interface OrderCompletarLocationState {
  orderDraft: OrderCreationDraft;
}

export interface OrderProductsLocationState {
  displayOrderId: string;
}

const STORAGE_KEY = "promssac_order_creation_draft_v1";

export function persistOrderDraft(draft: OrderCreationDraft): void {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
  } catch {
    return;
  }
}

export function readOrderDraft(): OrderCreationDraft | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const o = JSON.parse(raw) as Partial<OrderCreationDraft>;
    if (!o.displayOrderId || typeof o.displayOrderId !== "string") return null;
    return {
      displayOrderId: o.displayOrderId,
      routeId: typeof o.routeId === "string" ? o.routeId : "",
      routeLabel: o.routeLabel ?? null,
      autoCode: Boolean(o.autoCode),
    };
  } catch {
    return null;
  }
}

export function clearOrderDraft(): void {
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    return;
  }
}
