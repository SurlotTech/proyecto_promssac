export interface OrderProductRow {
  id: string;
  code: string;
  orderId: string;
  name: string;
  unitPrice: number;
  quantity: number;
  weight?: number;
  customField: string;
  createdAt: string;
}

/** Etiqueta que usa el backend/UI cuando no hay texto en campo personalizado. */
export const ORDER_PRODUCT_CUSTOM_FIELD_PLACEHOLDER = "—";

export function customFieldEditableValue(display: string): string {
  return display === ORDER_PRODUCT_CUSTOM_FIELD_PLACEHOLDER ? "" : display;
}
