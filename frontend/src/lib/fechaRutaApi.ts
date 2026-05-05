import { routeDeliveryUiToIso } from "@/domain/routes";

const ISO_LOCAL_DATE = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Convierte la fecha de ruta al formato ISO (`yyyy-MM-dd`) que espera el backend (`LocalDate`).
 * Acepta ISO ya normalizado o texto UI `dd/MM/yyyy` (p. ej. desde catálogo de rutas).
 */
export function normalizeFechaRutaForApi(raw: string): string {
  const t = raw.trim();
  if (ISO_LOCAL_DATE.test(t)) return t;
  const desdeUi = routeDeliveryUiToIso(t);
  return desdeUi || t;
}
