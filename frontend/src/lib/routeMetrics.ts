import type { RouteStatus } from "@/domain/routes";

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
