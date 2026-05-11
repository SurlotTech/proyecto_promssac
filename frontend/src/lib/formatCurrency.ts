/** Formato de moneda para soles en tablas UI (consistente en la app). */
export function formatSolAmount(amount: number, locale = "es-PE"): string {
  return amount.toLocaleString(locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}
