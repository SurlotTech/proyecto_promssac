import type { OrderCreationDraft } from "@/lib/orderCreationDraft";
import { STEP_VALIDATION_LABELS } from "@/lib/completarOrden/constants";
import type { CustomFieldKey } from "@/lib/completarOrden/constants";
import {
  describeContactStepError,
  isContactStepValid,
  isValidPeruMobileNineDigits,
} from "@/lib/completarOrden/contactValidation";

/** Estado necesario para validar cada paso del asistente Completar orden. */
export type CompletarStepContext = {
  draft: OrderCreationDraft | null;
  deliveryFrom: string;
  deliveryTo: string;
  mode: string;
  contactName: string;
  contactIdentifier: string;
  contactPhone: string;
  contactEmail: string;
  idType: string;
  addressLine: string;
  lat: string;
  lng: string;
  customFields: Record<CustomFieldKey, string>;
};

export function describePersonalizadosStepError(_fields: Record<CustomFieldKey, string>): null {
  return null;
}

export function isCompletarStepValid(step: number, c: CompletarStepContext): boolean {
  switch (step) {
    case 0:
      return Boolean(
        c.draft?.displayOrderId?.trim() &&
          c.deliveryFrom.trim() &&
          c.deliveryTo.trim() &&
          c.mode.trim(),
      );
    case 1:
      return isContactStepValid({
        contactName: c.contactName,
        contactIdentifier: c.contactIdentifier,
        contactPhone: c.contactPhone,
        contactEmail: c.contactEmail,
        idType: c.idType,
      });
    case 2: {
      const la = parseFloat(c.lat);
      const lo = parseFloat(c.lng);
      return Boolean(
        c.addressLine.trim() &&
          c.lat.trim() &&
          c.lng.trim() &&
          Number.isFinite(la) &&
          Number.isFinite(lo),
      );
    }
    case 3:
      return describePersonalizadosStepError(c.customFields) === null;
    default:
      return false;
  }
}

/** Primer paso entre 0–2 que bloquea guardar o continuar (steps obligatorios antes del último). */
export function firstBlockingStepAmong012(c: CompletarStepContext): 0 | 1 | 2 | null {
  if (!isCompletarStepValid(0, c)) return 0;
  if (!isCompletarStepValid(1, c)) return 1;
  if (!isCompletarStepValid(2, c)) return 2;
  return null;
}

export function messageForBlockingStepAmong012(step: 0 | 1 | 2, c: CompletarStepContext): string {
  switch (step) {
    case 0:
      return "Completa datos de orden y ventana de entrega.";
    case 1:
      return (
        describeContactStepError({
          contactName: c.contactName,
          contactIdentifier: c.contactIdentifier,
          contactPhone: c.contactPhone,
          contactEmail: c.contactEmail,
          idType: c.idType,
        }) ?? "Revisa los datos de contacto."
      );
    case 2:
      return "Completa la dirección y la ubicación en el mapa.";
    default:
      return "Revisa los datos del paso actual.";
  }
}

/** Mensaje al pulsar Siguiente cuando el paso actual no cumple reglas. */
export function messageWhenCurrentStepInvalid(currentStep: number, c: CompletarStepContext): string {
  if (currentStep === 1) {
    return (
      describeContactStepError({
        contactName: c.contactName,
        contactIdentifier: c.contactIdentifier,
        contactPhone: c.contactPhone,
        contactEmail: c.contactEmail,
        idType: c.idType,
      }) ?? "Revisa los datos de contacto."
    );
  }
  if (currentStep === 3) {
    return describePersonalizadosStepError(c.customFields) ?? "Revisa los campos personalizados.";
  }
  const label = STEP_VALIDATION_LABELS[currentStep];
  if (label) {
    return `Completa los campos obligatorios de ${label}.`;
  }
  return "Completa los campos obligatorios.";
}

export function canProceedWizardThroughAddress(c: CompletarStepContext): boolean {
  return firstBlockingStepAmong012(c) === null;
}

/** Incluye validación del paso «Personalizados» (Teléfono Director). */
export function canFinalizeCompletarOrdenWizard(c: CompletarStepContext): boolean {
  return canProceedWizardThroughAddress(c) && describePersonalizadosStepError(c.customFields) === null;
}
