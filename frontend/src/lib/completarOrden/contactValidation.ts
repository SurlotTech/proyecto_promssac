/** Celular Perú: exactamente 9 dígitos numéricos. */
export const PERU_PHONE_DIGIT_COUNT = 9;

export function isValidPeruMobileNineDigits(phone: string): boolean {
  return /^\d{9}$/.test(phone.trim());
}

/** Validación práctica de correo (no RFC exhaustivo). */
export function isValidEmailLocalPartFormat(email: string): boolean {
  const t = email.trim();
  if (!t) return false;
  // usuario@dominio.tld mínimo
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(t);
}

/** Email opcional: vacío es válido; si hay texto debe cumplir formato. */
export function isOptionalEmailValid(email: string): boolean {
  const t = email.trim();
  if (!t) return true;
  return isValidEmailLocalPartFormat(t);
}

export type ContactIdType = "dni" | "ruc" | "otro";

export function describeContactStepError(params: {
  contactName: string;
  contactIdentifier: string;
  contactPhone: string;
  contactEmail: string;
  idType: string;
}): string | null {
  const { contactName, contactIdentifier, contactPhone, contactEmail, idType } = params;
  if (!contactName.trim()) {
    return "Indica el nombre del contacto.";
  }
  const id = contactIdentifier.trim();
  if (!id) {
    return "Indica el número de documento o identificador.";
  }
  if (idType === "dni") {
    if (!/^\d{8}$/.test(id)) {
      return "El DNI debe tener exactamente 8 dígitos.";
    }
  } else if (idType === "ruc") {
    if (!/^\d{11}$/.test(id)) {
      return "El RUC debe tener exactamente 11 dígitos.";
    }
  }

  if (!isValidPeruMobileNineDigits(contactPhone)) {
    return "El teléfono debe tener exactamente 9 dígitos (solo números).";
  }

  if (!isOptionalEmailValid(contactEmail)) {
    return "Correo electrónico no válido.";
  }

  return null;
}

export function isContactStepValid(params: {
  contactName: string;
  contactIdentifier: string;
  contactPhone: string;
  contactEmail: string;
  idType: string;
}): boolean {
  return describeContactStepError(params) === null;
}
