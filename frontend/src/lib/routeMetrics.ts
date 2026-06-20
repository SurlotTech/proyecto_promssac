import type { RouteStatus } from "@/domain/routes";

const MESES_CORTOS = [
  "ene", "feb", "mar", "abr", "may", "jun",
  "jul", "ago", "sep", "oct", "nov", "dic",
];

/** Extrae HH:mm de un string datetime (dd/MM/yyyy HH:mm o ISO). */
export function formatTimeShort(raw: string): string {
  if (!raw) return "";
  if (raw.includes("T")) {
    const match = raw.match(/T(\d{2}:\d{2})/);
    return match ? match[1] : "";
  }
  const parts = raw.split(" ");
  return parts.length === 2 ? parts[1].slice(0, 5) : "";
}

/** Convierte fecha (ISO yyyy-MM-dd o dd/MM/yyyy) a formato legible: "d MMM aaaa" (ej. 30 may 2026). */
export function formatDateShort(raw: string): string {
  const parsed = parseDate(raw);
  if (!parsed) return raw || "—";
  const [y, m, d] = parsed;
  return `${d} ${MESES_CORTOS[m - 1] || "?"} ${y}`;
}

export function formatRouteCurrency(amount: number): string {
  return new Intl.NumberFormat("es-PE", {
    style: "currency",
    currency: "PEN",
  }).format(amount);
}

export function collectionPercent(current: number, total: number): number {
  if (total <= 0) return 0;
  return Math.round((current / total) * 100);
}

export function dispatchPercent(completed: number, total: number): number {
  if (total <= 0) return 0;
  return Math.round((completed / total) * 100);
}

/** Barra de despachos en tabla: por umbral de avance */
export function dispatchBarFillClass(pct: number): string {
  if (pct <= 0) return "";
  if (pct >= 100) return "bg-success";
  if (pct < 35) return "bg-warning";
  return "bg-info";
}

/**
 * Mock de fecha fin para una ruta.
 * Mientras no se guarde en BD, suma 1-5 días a la fecha de inicio
 * basándose en el código de la ruta para que sea determinista.
 */
function parseDate(raw: string): [number, number, number] | null {
  if (!raw) return null;
  const datePart = raw.split(" ")[0].split("T")[0];
  let parts: string[];
  if (datePart.includes("/")) {
    const [d, m, y] = datePart.split("/");
    parts = [y, m, d];
  } else if (datePart.includes("-")) {
    parts = datePart.split("-");
  } else {
    return null;
  }
  if (parts.length !== 3) return null;
  const [y, m, d] = parts.map(Number);
  if (isNaN(y) || isNaN(m) || isNaN(d)) return null;
  return [y, m, d];
}

export function mockFechaFin(deliveryDate: string, code: string): string {
  const parsed = parseDate(deliveryDate);
  if (!parsed) return "—";
  const [y, m, d] = parsed;
  const base = new Date(y, m - 1, d);
  const dias = (code.length + d + m) % 5 + 1;
  base.setDate(base.getDate() + dias);
  const yy = base.getFullYear();
  const mm = String(base.getMonth() + 1).padStart(2, "0");
  const dd = String(base.getDate()).padStart(2, "0");
  return `${yy}-${mm}-${dd}`;
}

/** Barra en tarjetas: tono alineado al estado operativo */
export function dispatchBarClassByStatus(status: RouteStatus, pct: number): string {
  if (pct <= 0) return "";
  switch (status) {
    case "completed":
      return "bg-success";
    case "delayed":
      return "bg-warning";
    case "scheduled":
      return "bg-info";
    case "in_progress":
      return "bg-primary";
    case "cancelled":
      return "bg-muted-foreground/50";
  }
}
