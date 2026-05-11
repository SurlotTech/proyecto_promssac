import type { OrderProductRow } from "@/domain/orderProducts";
import { customFieldEditableValue } from "@/domain/orderProducts";
import type { OrderProductLineCreateInput } from "@/services/orders.api";

export interface OrderProductLineFormValues {
  code: string;
  name: string;
  price: string;
  quantity: string;
  weight: string;
  customField: string;
}

const DECIMAL_COMMA_REGEX = /^[\d]*[.,]?[\d]*$/;

export function createEmptyProductLineForm(): OrderProductLineFormValues {
  return {
    code: "",
    name: "",
    price: "",
    quantity: "",
    weight: "",
    customField: "",
  };
}

export function orderProductRowToFormValues(row: OrderProductRow): OrderProductLineFormValues {
  return {
    code: row.code,
    name: row.name,
    price: String(row.unitPrice),
    quantity: String(row.quantity),
    weight: row.weight != null ? String(row.weight) : "",
    customField: customFieldEditableValue(row.customField),
  };
}

export function normalizeQuantityInputDigits(raw: string): string {
  return raw.replace(/\D/g, "");
}

/** Permite dígitos, coma y punto (decimal positivo mientras escribe). */
export function isDecimalInputFragmentValid(raw: string): boolean {
  return DECIMAL_COMMA_REGEX.test(raw);
}

/** True si hay texto en peso pero no es un decimal ≥ 0 (feedback visual del campo). */
export function weightFieldHasSyntaxError(weightInput: string): boolean {
  const raw = weightInput.trim();
  if (!raw) return false;
  const n = parseFloat(raw.replace(",", "."));
  return Number.isNaN(n) || n < 0;
}

function parseFlexibleDecimal(raw: string): number {
  return parseFloat(raw.replace(",", "."));
}

export type ProductLineValidation =
  | { ok: false }
  | {
      ok: true;
      payload: OrderProductLineCreateInput;
    };

export function evaluateProductLineForm(form: OrderProductLineFormValues): ProductLineValidation {
  const priceNum = parseFlexibleDecimal(form.price);
  const qtyNum = parseInt(form.quantity, 10);
  const weightRaw = form.weight.trim();
  const weightNum = weightRaw ? parseFlexibleDecimal(form.weight) : undefined;

  const weightValid =
    !weightRaw || (!Number.isNaN(weightNum!) && weightNum! >= 0);

  const requiredOk =
    form.code.trim() !== "" &&
    form.name.trim() !== "" &&
    form.price.trim() !== "" &&
    !Number.isNaN(priceNum) &&
    priceNum >= 0 &&
    form.quantity.trim() !== "" &&
    !Number.isNaN(qtyNum) &&
    qtyNum > 0 &&
    weightValid;

  if (!requiredOk) {
    return { ok: false };
  }

  const payload: OrderProductLineCreateInput = {
    code: form.code.trim(),
    name: form.name.trim(),
    unitPrice: priceNum,
    quantity: qtyNum,
    ...(weightRaw && weightNum !== undefined && !Number.isNaN(weightNum)
      ? { weight: weightNum }
      : {}),
    ...(form.customField.trim() ? { customField: form.customField.trim() } : {}),
  };

  return {
    ok: true,
    payload,
  };
}
